/* User access tokens stay in memory. Every database/storage request is checked by RLS. */
window.SocialCloud=(()=>{
 const config=window.SOCIAL_CONFIG;let session=null,refreshing=null,company=null,businesses=[];
 const filter=value=>encodeURIComponent(value);
 async function raw(path,options={}){
  const response=await fetch(config.url+path,{...options,signal:AbortSignal.timeout(20000),headers:{apikey:config.publishableKey,...(session&&!path.startsWith('/auth/v1/token')?{Authorization:'Bearer '+session.access_token}:{}),...options.headers}});
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.msg||data?.message||data?.error_description||data?.error||'Request failed ('+response.status+').');return data;
 }
 async function request(path,options={}){
  if(!session)throw Error('Sign in to your RWM OPS owner account first.');
  if(session.expires_at*1000<Date.now()+60000){
   if(!refreshing)refreshing=raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})}).then(s=>{session={...s,expires_at:Math.floor(Date.now()/1000)+s.expires_in}}).finally(()=>{refreshing=null});
   await refreshing;
  }
  return raw(path,options);
 }
 const jsonOptions=(method,body)=>({method,headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
 async function signIn(email,password){session=await raw('/auth/v1/token?grant_type=password',jsonOptions('POST',{email,password}));session.expires_at=Math.floor(Date.now()/1000)+session.expires_in;
  const members=await request('/rest/v1/company_members?select=company_id&user_id=eq.'+filter(session.user.id)+'&role=eq.owner&status=eq.active');
  if(!members.length){session=null;throw Error('An active company owner account is required.');}
  return request('/rest/v1/companies?select=id,name,timezone&id=in.('+members.map(m=>m.company_id).join(',')+')&order=name');
 }
 async function signOut(){try{if(session)await raw('/auth/v1/logout?scope=local',{method:'POST'})}finally{session=null;company=null;businesses=[]}}
 async function selectCompany(selected){company=selected;businesses=await request('/rest/v1/social_businesses?company_id=eq.'+filter(company.id)+'&select=*');
  for(const slug of ['landscaping','solar'])if(!businesses.some(b=>b.slug===slug)){
   try{await request('/rest/v1/social_businesses',jsonOptions('POST',{company_id:company.id,slug,name:slug==='solar'?'Solar':'Landscaping'}))}catch(e){if(!e.message.includes('duplicate'))throw e}
  }
  businesses=await request('/rest/v1/social_businesses?company_id=eq.'+filter(company.id)+'&select=*');return load();
 }
 function localDate(iso){if(!iso)return '';const d=new Date(iso);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')+'T'+[String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0')].join(':')}
 async function signed(bucket,path){const result=await request('/storage/v1/object/sign/'+bucket+'/'+path.split('/').map(filter).join('/'),jsonOptions('POST',{expiresIn:1800}));return config.url+'/storage/v1'+result.signedURL}
 async function fromRow(row){const photos={},photoWarnings=[];for(const [kind,path] of Object.entries(row.photo_paths||{})){try{photos[kind]=await signed('social-media',path)}catch{photoWarnings.push(kind+' photo preview is unavailable. Reload the queue or replace the photo.')}}
  return {id:row.id,title:row.title,caption:row.caption,business:businesses.find(b=>b.id===row.business_id)?.slug,service:row.service,status:row.status,at:localDate(row.planned_at),platform:row.destinations.length===2?'Facebook + Instagram':row.destinations[0]==='facebook'?'Facebook':'Instagram',consent:row.marketing_consent,photos,photoWarnings,photoPaths:row.photo_paths,updatedAt:row.updated_at,sourceJobId:row.source_job_id};
 }
 async function load(){if(!company)throw Error('Choose a company first.');const rows=await request('/rest/v1/social_posts?select=*&company_id=eq.'+filter(company.id)+'&order=created_at.desc');return Promise.all(rows.map(fromRow))}
 async function upload(businessId,url){
  const origin=new URL(url,location.href);if(!url.startsWith('data:image/')&&origin.origin!==config.url)throw Error('Only uploaded photos and authorized OPS photos can be used.');
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Photo link expired. Reload the job photos.');const blob=await response.blob();
  const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[blob.type];if(!extension||blob.size>3145728)throw Error('Photos must be JPG, PNG or WEBP and under 3 MB.');
  const path=company.id+'/'+businessId+'/'+crypto.randomUUID()+'.'+extension;
  await request('/storage/v1/object/social-media/'+path,{method:'POST',headers:{'Content-Type':blob.type,'x-upsert':'false'},body:blob});return path;
 }
 async function savePost(post,previous){
  const business=businesses.find(b=>b.slug===post.business);if(!business)throw Error('Unknown business.');if(previous&&previous.business!==post.business)throw Error('Create a new post to move content to another business.');
  const paths={...post.photoPaths};const uploaded=[];let committed=false;
  try{
   for(const [kind,url] of Object.entries(post.photos||{}))if(!paths[kind]||url.startsWith('data:')){paths[kind]=await upload(business.id,url);uploaded.push(paths[kind])}
   const row={id:post.id,company_id:company.id,business_id:business.id,title:post.title,caption:post.caption||'',service:post.service||(post.business==='solar'?'Solar':'Landscaping'),status:post.status||'draft',planned_at:post.at?new Date(post.at).toISOString():null,destinations:post.platform==='Facebook + Instagram'?['facebook','instagram']:[post.platform.toLowerCase()],marketing_consent:!!post.consent,photo_paths:paths,source_job_id:post.sourceJobId||null};
   let rows;
   if(previous){rows=await request('/rest/v1/social_posts?id=eq.'+filter(post.id)+'&company_id=eq.'+filter(company.id)+'&updated_at=eq.'+filter(previous.updatedAt),jsonOptions('PATCH',row));if(!rows.length)throw Error('This post changed on another device. Reload the queue before editing.');}
   else rows=await request('/rest/v1/social_posts',jsonOptions('POST',row));
   committed=true;return await fromRow(rows[0]);
  }catch(e){if(!committed&&uploaded.length)await request('/storage/v1/object/social-media',jsonOptions('DELETE',{prefixes:uploaded})).catch(()=>{});throw e}
 }
 async function remove(post){const rows=await request('/rest/v1/social_posts?id=eq.'+filter(post.id)+'&company_id=eq.'+filter(company.id)+'&updated_at=eq.'+filter(post.updatedAt),{method:'DELETE',headers:{Prefer:'return=representation'}});if(!rows.length)throw Error('This post changed on another device. Reload the queue.');}
 async function jobs(offset=0){if(!Number.isInteger(offset)||offset<0)throw Error('Invalid job page.');return request('/rest/v1/jobs?select=id,customer_name,service,scheduled_date&company_id=eq.'+filter(company.id)+'&status=eq.completed&order=scheduled_date.desc,id.desc&limit=51&offset='+offset)}
 async function jobPhotos(jobId){const rows=await request('/rest/v1/job_photos?select=photo_type,storage_path&company_id=eq.'+filter(company.id)+'&job_id=eq.'+filter(jobId)+'&order=uploaded_at.desc');const photos={};for(const row of rows)if(['before','after'].includes(row.photo_type)&&!photos[row.photo_type])photos[row.photo_type]=await signed('job-photos',row.storage_path);return photos}
 return {signIn,signOut,selectCompany,load,savePost,remove,jobs,jobPhotos,get company(){return company}};
})();


