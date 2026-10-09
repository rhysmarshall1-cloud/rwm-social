const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const company='11111111-1111-4111-8111-111111111111',business='22222222-2222-4222-8222-222222222222';let rows=[],requests=[];
 const response=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
 const mockFetch=async(url,options={})=>{
  if(url.startsWith('data:'))return fetch(url);
  requests.push({url,options});const body=options.body&&typeof options.body==='string'?JSON.parse(options.body):null;
  if(url.includes('/auth/v1/token'))return response({access_token:'test-access',refresh_token:'test-refresh',expires_in:3600,user:{id:'owner'}});
  if(url.includes('/company_members?'))return response([{company_id:company}]);
  if(url.includes('/companies?'))return response([{id:company,name:'Test company'}]);
  if(url.includes('/social_businesses?'))return response([{id:business,company_id:company,slug:'landscaping'},{id:'solar-business',company_id:company,slug:'solar'}]);
  if(url.includes('/storage/v1/object/sign/'))return response({signedURL:'/object/sign/social-media/preview.jpg?token=test'});
  if(url.includes('/storage/v1/object/social-media/'))return response({Key:'uploaded'});
  if(url.includes('/social_posts')){
   if(options.method==='POST'){const row={...body,updated_at:'2026-10-09T00:00:00Z'};rows.push(row);return response([row])}
   if(options.method==='PATCH'){if(url.includes('updated_at=eq.stale'))return response([]);const row={...body,updated_at:'2026-10-09T00:01:00Z'};rows=[row];return response([row])}
   if(options.method==='DELETE'){const deleted=rows;rows=[];return response(deleted)}
   return response(rows);
  }
  if(url.includes('/jobs?'))return response([{id:42,service:'Mowing'}]);
  if(url.includes('/job_photos?'))return response([{photo_type:'before',storage_path:company+'/42/before.jpg'}]);
  throw Error('Unexpected request '+url);
 };
 const window={SOCIAL_CONFIG:{url:'https://test.supabase.co',publishableKey:'public-test'}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../cloud.js'),'utf8'),{window,fetch:mockFetch,AbortSignal,URL,location:{href:'https://social.test'},crypto:require('node:crypto').webcrypto,Date});const cloud=window.SocialCloud;
 assert.equal((await cloud.signIn('owner@test.invalid','test-password')).length,1);await cloud.selectCompany({id:company,name:'Test'});
 const saved=await cloud.savePost({id:'post-1',business:'landscaping',title:'Transformation',caption:'Completed',platform:'Facebook + Instagram',status:'draft',consent:true,photos:{before:'data:image/jpeg;base64,/9j/'}},null);
 assert.equal(saved.photoPaths.before.startsWith(company+'/'+business+'/'),true);assert.equal(saved.photos.before.startsWith('https://test.supabase.co/storage/v1/object/sign/'),true);assert.deepEqual(rows[0].destinations,['facebook','instagram']);
 assert(requests.filter(r=>r.url.includes('/rest/v1/')).every(r=>r.options.headers.Authorization==='Bearer test-access'));
 assert(!requests.find(r=>r.url.includes('/auth/v1/token')).options.headers.Authorization);
 await assert.rejects(()=>cloud.savePost({...saved,title:'Changed'},{...saved,updatedAt:'stale'}),/another device/);
 await assert.rejects(()=>cloud.savePost({...saved,business:'solar'},saved),/another business/);
 assert.equal((await cloud.jobs())[0].id,42);assert((await cloud.jobPhotos(42)).before);
 await cloud.remove(saved);assert.equal(rows.length,0);await cloud.signOut().catch(()=>{});await assert.rejects(()=>cloud.load(),/Choose a company/);
 console.log('PASS: owner login, company lookup, private uploads, signed previews, destination mapping, stale-update rejection, business guard and OPS reads');
})().catch(e=>{console.error(e);process.exit(1)});
