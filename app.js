
const $=s=>document.querySelector(s);let posts=[];try{posts=JSON.parse(localStorage.getItem('rwmSocialDrafts')||'[]');if(!Array.isArray(posts))posts=[]}catch{}let photoData={};let month=new Date();month.setDate(1);const names={overview:'Overview',compose:'Create a post',calendar:'Content calendar',jobs:'RWM OPS jobs',accounts:'Social accounts',analytics:'Analytics'};
function go(p){document.querySelectorAll('.section').forEach(e=>e.classList.toggle('active',e.id===p));document.querySelectorAll('nav button').forEach(e=>e.classList.toggle('active',e.dataset.page===p));$('#title').textContent=names[p];if(p==='calendar')renderCalendar()}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));$('#newPost').onclick=()=>go('compose');function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500)}
['postTitle','caption'].forEach(id=>$('#'+id).oninput=()=>{$('#previewTitle').textContent=$('#postTitle').value||'Your next transformation';$('#previewCaption').textContent=$('#caption').value||'Your caption will appear here.'});['before','after'].forEach(id=>$('#'+id).onchange=()=>{const f=$('#'+id).files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>3*1024*1024){toast('Please use a JPG, PNG or WEBP photo under 3 MB.');$('#'+id).value='';return}const r=new FileReader();r.onload=()=>{photoData[id]=r.result;$('#'+id+'Preview').src=r.result;$('#'+id+'Preview').hidden=false};r.readAsDataURL(f)});
$('#suggest').onclick=()=>{$('#caption').value=`Another ${$('#service').value.toLowerCase()} project complete. Take a look at the before and after!\n\n${$('#postTitle').value||'A fresh transformation, with attention to every detail.'}\n\nReady to give your property some attention? Get in touch to discuss your next project.\n\n#RWMGroup #BeforeAndAfter`;$('#caption').dispatchEvent(new Event('input'))};$('#postForm').onsubmit=async e=>{
 e.preventDefault();if(!$('#postForm').reportValidity()||saving)return;
 const p={id:editingId||crypto.randomUUID(),title:$('#postTitle').value,caption:$('#caption').value,service:$('#service').value,business:$('#business').value,status:'draft',platform:$('#platform').value,at:$('#plannedAt').value,photos:{...photoData},photoPaths:{...editingPhotoPaths},sourceJobId:editingSourceJobId,consent:$('#permission').checked};
 const next=editingId?posts.map(x=>x.id===editingId?p:x):[p,...posts];
 if(await persistQueue(next)){resetComposer();setQueueFilter({business:'all',status:'all',date:''});toast(cloudMode?'Draft saved to your company.':'Draft saved on this browser.');go('overview')}
};
$('#prev').onclick=()=>{month.setMonth(month.getMonth()-1);renderCalendar()};$('#next').onclick=()=>{month.setMonth(month.getMonth()+1);renderCalendar()};['Facebook','Instagram','LinkedIn','TikTok','YouTube','Google Business Profile','X','Pinterest'].forEach(n=>{const d=document.createElement('div');d.className='post';const t=document.createElement('strong');t.textContent=n;const p=document.createElement('p');p.textContent='Not connected · account linking not enabled yet';d.append(t,p);$('#accountList').append(d)});

let editingId=null;let editingSourceJobId=null;let editingPhotoPaths={};let cloudMode=false;let saving=false;
function editPost(p){editingId=p.id;editingSourceJobId=p.sourceJobId||null;editingPhotoPaths={...p.photoPaths};$('#business').disabled=cloudMode;$('#postTitle').value=p.title;$('#caption').value=p.caption||'';$('#business').value=p.business||'landscaping';$('#service').value=p.service||(p.business==='solar'?'Solar':'Landscaping');$('#platform').value=p.platform||'Facebook + Instagram';$('#plannedAt').value=p.at||'';photoData={...p.photos};['before','after'].forEach(k=>{const e=$('#'+k+'Preview');e.hidden=!photoData[k];if(photoData[k])e.src=photoData[k]});$('#permission').checked=!!p.consent;$('#caption').dispatchEvent(new Event('input'));go('compose')}
function resetComposer(){editingId=null;editingSourceJobId=null;editingPhotoPaths={};$('#business').disabled=false;$('#postForm').reset();photoData={};['before','after'].forEach(k=>{ $('#'+k).value='';$('#'+k+'Preview').hidden=true;$('#'+k+'Preview').src=''; });$('#caption').dispatchEvent(new Event('input'))}
$('#newPost').onclick=()=>{resetComposer();go('compose')};
document.querySelectorAll('[data-go="compose"]').forEach(b=>b.onclick=()=>{resetComposer();go('compose')});
$('#business').onchange=()=>{$('#service').value=$('#business').value==='solar'?'Solar':'Landscaping'};
$('#ideaForm').onsubmit=async e=>{e.preventDefault();if(saving)return;const n=Number($('#ideaCount').value);if(!Number.isInteger(n)||n<1||n>20)return;const next=[...posts];for(let i=0;i<n;i++)next.push({id:crypto.randomUUID(),business:$('#ideaBusiness').value,title:($('#ideaBusiness').value==='solar'?'Solar':'Landscaping')+' post to write',caption:'',platform:'Facebook + Instagram',status:'to_write',at:$('#ideaDate').value+'T12:00',photos:{}});if(await persistQueue(next)){renderCalendar();toast('Planned posts added.')}};
$('#accountList').replaceChildren();for(const [name,fb,ig] of [['RWM Landscaping','https://www.facebook.com/RWMlandscaping','https://www.instagram.com/rwmlandscaping/'],['RWM Solar (Facebook currently The Solar Brit)','https://www.facebook.com/profile.php?id=61583112135543','https://www.instagram.com/thesolarbritnj/']]){const d=document.createElement('div');d.className='post';const t=document.createElement('strong');t.textContent=name;d.append(t);for(const [label,url] of [['Facebook',fb],['Instagram',ig]]){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=label+' ↗ ';d.append(a)}const p=document.createElement('p');p.textContent='Identified for setup · not authorized or connected';d.append(p);$('#accountList').append(d)}
const info=document.createElement('p');info.className='notice';info.textContent='Connection requires the RWM SOCIAL Meta developer app, a secure authorization callback and your Facebook approval. No access tokens are stored in this browser.';$('#accountList').append(info);

// Queue review and date filters. Publishing status is reserved for provider receipts.
let queueFilter={business:'all',status:'all',date:''};
const statusLabels={to_write:'To write',draft:'Draft',approved:'Approved',posted:'Posted'};
const filterBar=document.createElement('div');filterBar.className='row';filterBar.style.flexWrap='wrap';
filterBar.innerHTML='<select id="queueBusiness" aria-label="Filter business" style="width:auto"><option value="all">All businesses</option><option value="solar">RWM Solar</option><option value="landscaping">RWM Landscaping</option></select><select id="queueStatus" aria-label="Filter status" style="width:auto"><option value="all">All statuses</option><option value="to_write">To write</option><option value="draft">Drafts</option><option value="approved">Approved</option><option value="posted">Posted</option></select><input id="queueDate" type="date" aria-label="Filter planned day" style="width:auto"><button id="clearQueueFilter" class="btn secondary">Clear filters</button>';
$('#queue').before(filterBar);
function plannedDay(post){return (post.at||'').slice(0,10)}
async function persistQueue(next){
 if(saving)return false;saving=true;
 try{
  if(cloudMode){const saved=[];for(const p of next){const previous=posts.find(x=>x.id===p.id);saved.push(!previous||JSON.stringify(previous)!==JSON.stringify(p)?await SocialCloud.savePost(p,previous):p)}for(const old of posts)if(!next.some(p=>p.id===old.id))await SocialCloud.remove(old);posts=saved;}
  else{localStorage.setItem('rwmSocialDrafts',JSON.stringify(next));posts=next}
  render();return true;
 }catch(error){toast(error.message);if(cloudMode){try{posts=await SocialCloud.load();render()}catch{}}return false}finally{saving=false}
}
function setQueueFilter(filter){queueFilter=filter;$('#queueBusiness').value=filter.business;$('#queueStatus').value=filter.status;$('#queueDate').value=filter.date;render()}
['queueBusiness','queueStatus','queueDate'].forEach(id=>$('#'+id).onchange=()=>setQueueFilter({business:$('#queueBusiness').value,status:$('#queueStatus').value,date:$('#queueDate').value}));
$('#clearQueueFilter').onclick=()=>setQueueFilter({business:'all',status:'all',date:''});
function render(){
 $('#draftCount').textContent=posts.filter(p=>(p.status||'draft')==='draft').length;
 $('#plannedCount').textContent=posts.filter(p=>p.at&&p.status!=='posted').length;
 $('#queue').replaceChildren();
 const filtered=posts.filter(p=>(queueFilter.business==='all'||(p.business||'landscaping')===queueFilter.business)&&(queueFilter.status==='all'||(p.status||'draft')===queueFilter.status)&&(!queueFilter.date||plannedDay(p)===queueFilter.date));
 if(!filtered.length){const e=document.createElement('p');e.className='empty';e.textContent=posts.length?'No content matches these filters.':'Create a draft or add a post to write from the calendar.';$('#queue').append(e)}
 for(const p of filtered){
  const card=document.createElement('div');card.className='post';
  const title=document.createElement('strong');title.textContent=p.title;
  const meta=document.createElement('p');meta.textContent=(p.business==='solar'?'RWM Solar':'RWM Landscaping')+' · '+statusLabels[p.status||'draft']+' · '+p.platform+' · '+(p.at?new Date(p.at).toLocaleString():'No planned date');
  const caption=document.createElement('p');caption.textContent=p.caption||'Caption awaiting preparation.';
  const edit=document.createElement('button');edit.className='btn secondary';edit.textContent='Edit / review';edit.onclick=()=>editPost(p);
  card.append(title,meta,caption,edit);
  if((p.status||'draft')==='draft'){
   const approve=document.createElement('button');approve.className='btn';approve.textContent='Approve draft';
   approve.onclick=async()=>{if(!p.consent||!(p.caption||'').trim()){toast('Add a caption and confirm photo permission before approving.');return}if(p.platform.includes('Instagram')&&!p.photos?.before&&!p.photos?.after){toast('Add a photo before approving an Instagram post.');return}if(await persistQueue(posts.map(x=>x.id===p.id?{...x,status:'approved',approvedAt:new Date().toISOString()}:x)))toast('Approved for your queue. Publishing is not connected yet.')};card.append(approve);
  }
  if(p.status==='approved'){const unapprove=document.createElement('button');unapprove.className='btn secondary';unapprove.textContent='Return to draft';unapprove.onclick=async()=>persistQueue(posts.map(x=>x.id===p.id?{...x,status:'draft',approvedAt:null}:x));card.append(unapprove)}
  const remove=document.createElement('button');remove.className='btn secondary';remove.textContent='Delete';remove.onclick=async()=>{if(confirm('Delete this content item?'))await persistQueue(posts.filter(x=>x.id!==p.id))};card.append(remove);$('#queue').append(card);
 }
};
function renderCalendar(){
 $('#monthLabel').textContent=month.toLocaleDateString(undefined,{month:'long',year:'numeric'});$('#month').replaceChildren();
 for(const label of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']){const b=document.createElement('b');b.textContent=label;$('#month').append(b)}
 for(let i=0;i<month.getDay();i++)$('#month').append(document.createElement('div'));
 const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 for(let day=1;day<=count;day++){
  const cell=document.createElement('div');cell.className='day';const label=document.createElement('b');label.textContent=day;cell.append(label);
  const date=[month.getFullYear(),String(month.getMonth()+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');
  for(const business of ['solar','landscaping']){
   const matching=posts.filter(p=>(p.business||'landscaping')===business&&plannedDay(p)===date);if(!matching.length)continue;
   const heading=document.createElement('strong');heading.textContent=business==='solar'?'Solar':'Landscaping';cell.append(heading);
   for(const [status,text] of Object.entries(statusLabels)){
    const n=matching.filter(p=>(p.status||'draft')===status).length;if(!n)continue;
    const button=document.createElement('button');button.className='calendar-count';button.textContent=n+' '+(status==='draft'?'Drafts':text);
    button.onclick=()=>{setQueueFilter({business,status,date});go('overview')};cell.append(button);
   }
  }
  $('#month').append(cell);
 }
};
render();

let ownerCompanies=[];
function cloudNotice(message){$('#cloudStatus').textContent=message}
function localPosts(){try{const p=JSON.parse(localStorage.getItem('rwmSocialDrafts')||'[]');return Array.isArray(p)?p:[]}catch{return []}}
$('#showCloudPassword').onclick=()=>{const visible=$('#cloudPassword').type==='password';$('#cloudPassword').type=visible?'text':'password';$('#showCloudPassword').textContent=visible?'Hide password':'Show password';$('#showCloudPassword').setAttribute('aria-pressed',String(visible))};
$('#cloudLogin').onsubmit=async e=>{
 e.preventDefault();if(saving)return;saving=true;
 const button=$('#cloudLogin button');button.disabled=true;cloudNotice('Signing in…');
 try{ownerCompanies=await SocialCloud.signIn($('#cloudEmail').value.trim(),$('#cloudPassword').value);$('#cloudPassword').value='';$('#cloudCompany').replaceChildren();
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose your company';$('#cloudCompany').append(placeholder);
  for(const c of ownerCompanies){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;$('#cloudCompany').append(option)}
  $('#cloudLogin').hidden=true;$('#cloudWorkspace').hidden=false;cloudNotice('Choose a company to open its private content queue.');
 }catch(error){cloudNotice(error.message)}finally{saving=false;button.disabled=false}
};
$('#cloudCompany').onchange=async()=>{
 if(saving){$('#cloudCompany').value=SocialCloud.company?.id||'';return}const selected=ownerCompanies.find(c=>c.id===$('#cloudCompany').value);if(!selected)return;saving=true;cloudNotice('Loading company content…');
 try{posts=await SocialCloud.selectCompany(selected);cloudMode=true;resetComposer();setQueueFilter({business:'all',status:'all',date:''});$('#storageMode').textContent='Saved to your company';$('#opsJobList').replaceChildren();cloudNotice('Connected to '+selected.name+'. Dates and times are shown in your device’s timezone.');}
 catch(error){cloudMode=false;posts=localPosts();render();$('#storageMode').textContent='On this browser';cloudNotice(error.message)}finally{saving=false}
};
$('#cloudReload').onclick=async()=>{if(saving||!cloudMode)return;saving=true;try{posts=await SocialCloud.load();render();renderCalendar();cloudNotice('Queue refreshed. Photo preview links are valid for 30 minutes.')}catch(e){cloudNotice(e.message)}finally{saving=false}};
$('#cloudImport').onclick=async()=>{
 if(saving||!cloudMode)return;const local=localPosts();if(!local.length){toast('No local drafts to import.');return}
 if(!confirm('Copy '+local.length+' local content items into this company? Check that each item belongs to this company.'))return;
 const next=[...posts,...local.filter(p=>!posts.some(x=>x.id===p.id)).map(p=>({...p,id:p.id,status:p.status==='to_write'?'to_write':'draft',photoPaths:{},updatedAt:null,sourceJobId:null}))];
 if(await persistQueue(next)){localStorage.removeItem('rwmSocialDrafts');toast('Local drafts imported and cleared from this browser.')}
};
$('#cloudLogout').onclick=async()=>{
 if(saving)return;saving=true;try{await SocialCloud.signOut()}catch{}finally{cloudMode=false;posts=localPosts();resetComposer();setQueueFilter({business:'all',status:'all',date:''});$('#cloudWorkspace').hidden=true;$('#cloudLogin').hidden=false;$('#opsJobList').replaceChildren();$('#storageMode').textContent='On this browser';cloudNotice('Signed out. Local planning mode.');saving=false}
};
$('#loadOpsJobs').onclick=async()=>{
 if(!cloudMode){toast('Sign in and choose a company first.');go('overview');return}if(saving)return;saving=true;$('#opsJobList').textContent='Loading completed jobs…';
 try{const jobs=await SocialCloud.jobs();$('#opsJobList').replaceChildren();if(!jobs.length)$('#opsJobList').textContent='No completed jobs found.';
  for(const job of jobs){const card=document.createElement('div');card.className='post';const name=document.createElement('strong');name.textContent=job.customer_name;const meta=document.createElement('p');meta.textContent=job.service+' · '+job.scheduled_date;const prepare=document.createElement('button');prepare.className='btn secondary';prepare.textContent='Prepare post';
   prepare.onclick=async()=>{if(saving)return;saving=true;prepare.disabled=true;const business=$('#jobBusiness').value;
    try{const photos=await SocialCloud.jobPhotos(job.id);resetComposer();editingSourceJobId=job.id;photoData=photos;$('#business').value=business;$('#service').value=Array.from($('#service').options).some(o=>o.value===job.service)?job.service:(business==='solar'?'Solar':'Landscaping');$('#postTitle').value=$('#service').value+' transformation';
     for(const kind of ['before','after']){$('#'+kind+'Preview').hidden=!photos[kind];if(photos[kind])$('#'+kind+'Preview').src=photos[kind]}$('#permission').checked=false;$('#suggest').click();go('compose');toast(Object.keys(photos).length?'Review these photos and confirm marketing permission.':'This job has no before/after photos yet. Add photos before approving.')
    }catch(error){toast(error.message)}finally{prepare.disabled=false;saving=false}
   };card.append(name,meta,prepare);$('#opsJobList').append(card)
  }
 }catch(error){$('#opsJobList').textContent=error.message}finally{saving=false}
};
