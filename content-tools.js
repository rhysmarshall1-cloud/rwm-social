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
 caption(business,service,title){
  const solar=business==='solar';
  return (solar?'Another solar project completed by RWM Solar.':'Another '+service.toLowerCase()+' project completed by RWM Landscaping.')+'\n\n'+(title.trim()||'Take a look at the transformation and the care behind our work.')+'\n\n'+(solar?'Interested in solar for your property? Contact RWM Solar to discuss an assessment.':'Contact RWM Landscaping to discuss the care and improvements your property needs.')+'\n\n'+(solar?'#RWMSolar #SolarEnergy':'#RWMLandscaping #PropertyCare');
 }
};
