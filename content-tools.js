/* Pure content helpers shared by the queue and regression checks. */
window.SocialTools={
 filterQueue(posts,filter,search='',sort='newest',undated=false,overdue=false,now=new Date()){
  const query=search.trim().toLocaleLowerCase();
  const result=posts.filter(p=>(filter.business==='all'||(p.business||'landscaping')===filter.business)&&(filter.status==='all'||(p.status||'draft')===filter.status)&&(!filter.date||(p.at||'').slice(0,10)===filter.date)&&(!undated||!p.at)&&(!overdue||(p.at&&p.status!=='posted'&&new Date(p.at)<now))&&(!query||((p.title||'')+' '+(p.caption||'')).toLocaleLowerCase().includes(query)));
  if(sort==='title')result.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  if(sort==='planned')result.sort((a,b)=>a.at&&b.at?a.at.localeCompare(b.at):a.at?-1:b.at?1:0);
  return result;
 },
 readiness(p,now=new Date()){
  const flags=[];const caption=(p.caption||'').trim();
  if(!caption)flags.push('Add a caption');if(!p.consent)flags.push('Confirm marketing permission');
  if((p.platform||'').includes('Instagram')){if(!p.photos?.before&&!p.photos?.after&&!p.photoPaths?.before&&!p.photoPaths?.after)flags.push('Add an Instagram photo');if(caption.length>2200)flags.push('Shorten the Instagram caption to 2,200 characters');}
  if(!['Facebook','Instagram','Facebook + Instagram'].includes(p.platform))flags.push('Choose Facebook or Instagram');
  if(!p.at)flags.push('Choose a planned date');else if(new Date(p.at)<now&&p.status!=='posted')flags.push('Planned date has passed');
  return flags;
 },
 summary(posts,business,now=new Date()){
  const matching=posts.filter(p=>(p.business||'landscaping')===business);return {to_write:matching.filter(p=>p.status==='to_write').length,draft:matching.filter(p=>(p.status||'draft')==='draft').length,approved:matching.filter(p=>p.status==='approved').length,overdue:matching.filter(p=>p.at&&p.status!=='posted'&&new Date(p.at)<now).length};
 },
 csv(posts){
  const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'};
  const rows=[['Business','Title','Caption','Status','Planned date (device local)','Destinations'],...posts.map(p=>[p.business==='solar'?'RWM Solar':'RWM Landscaping',p.title,p.caption,p.status||'draft',p.at||'',p.platform])];return rows.map(row=>row.map(cell).join(',')).join('\r\n');
 },
 validDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return false;const d=new Date(value);return !Number.isNaN(d.getTime())&&d.getFullYear()===Number(value.slice(0,4))&&d.getMonth()+1===Number(value.slice(5,7))&&d.getDate()===Number(value.slice(8,10))&&d.getHours()===Number(value.slice(11,13))&&d.getMinutes()===Number(value.slice(14,16));
 },
 weekStart(value){const d=new Date(value+'T12:00');if(Number.isNaN(d.getTime()))throw Error('Choose a valid week.');d.setDate(d.getDate()-d.getDay());return d},
 dayString(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')},
 bulk(posts,ids,action,at=''){
  if(!['move','clear','draft'].includes(action))throw Error('Unknown bulk action.');if(action==='move'&&!this.validDate(at))throw Error('Choose a valid planned date and time.');
  return posts.map(p=>{if(!ids.has(p.id)||p.status==='posted')return p;if(action==='draft')return p.status==='approved'?{...p,status:'draft',approvedAt:null}:p;const date=action==='clear'?'':at;if((p.at||'')===date)return p;return {...p,at:date,status:p.status==='approved'?'draft':p.status,approvedAt:null}});
 },
 backup(posts,companyId=null){
  if(posts.length>500)throw Error('Text plan backups support up to 500 items. Export the queue to CSV for larger lists.');const backup={format:'rwm-social-text-plan',version:1,companyId,createdAt:new Date().toISOString(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,posts:posts.map(p=>({id:/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)?p.id:crypto.randomUUID(),business:p.business||'landscaping',title:p.title||'',caption:p.caption||'',service:p.service||(p.business==='solar'?'Solar':'Landscaping'),status:p.status||'draft',at:p.at||'',platform:p.platform||'Facebook + Instagram'}))};this.restore(backup,companyId);return backup;
 },
 restore(data,companyId=null){
  if(!data||data.format!=='rwm-social-text-plan'||data.version!==1||!Array.isArray(data.posts)||data.posts.length>500)throw Error('Choose a valid RWM SOCIAL text-plan backup with no more than 500 items.');
  if(data.companyId!==null&&data.companyId!==companyId)throw Error('This backup belongs to a different company. Sign in and select its company first.');
  const ids=new Set();return data.posts.map(p=>{
   if(!p||typeof p.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)||ids.has(p.id))throw Error('Backup contains invalid or duplicate content IDs.');ids.add(p.id);
   if(!['solar','landscaping'].includes(p.business)||!['to_write','draft','approved','posted'].includes(p.status)||!['Facebook','Instagram','Facebook + Instagram'].includes(p.platform))throw Error('Backup contains an unsupported business, status or destination.');
   if(typeof p.title!=='string'||!p.title.trim()||p.title.length>120||typeof p.caption!=='string'||p.caption.length>5000||typeof p.service!=='string'||p.service.length>100||typeof p.at!=='string'||(p.at&&!this.validDate(p.at)))throw Error('Backup contains invalid text or dates.');
   return {id:p.id,business:p.business,title:p.title,caption:p.caption,service:p.service,at:p.at,platform:p.platform,status:p.status==='to_write'?'to_write':'draft',photos:{},photoPaths:{},consent:false,sourceJobId:null};
  });
 },
 caption(business,service,title){
  const solar=business==='solar';
  return (solar?'Another solar project completed by RWM Solar.':'Another '+service.toLowerCase()+' project completed by RWM Landscaping.')+'\n\n'+(title.trim()||'Take a look at the transformation and the care behind our work.')+'\n\n'+(solar?'Interested in solar for your property? Contact RWM Solar to discuss an assessment.':'Contact RWM Landscaping to discuss the care and improvements your property needs.')+'\n\n'+(solar?'#RWMSolar #SolarEnergy':'#RWMLandscaping #PropertyCare');
 }
};
