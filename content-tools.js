/* Pure content helpers shared by the queue and regression checks. */
window.SocialTools={
 filterQueue(posts,filter,search='',sort='newest',undated=false){
  const query=search.trim().toLocaleLowerCase();
  const result=posts.filter(p=>(filter.business==='all'||(p.business||'landscaping')===filter.business)&&(filter.status==='all'||(p.status||'draft')===filter.status)&&(!filter.date||(p.at||'').slice(0,10)===filter.date)&&(!undated||!p.at)&&(!query||((p.title||'')+' '+(p.caption||'')).toLocaleLowerCase().includes(query)));
  if(sort==='title')result.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  if(sort==='planned')result.sort((a,b)=>a.at&&b.at?a.at.localeCompare(b.at):a.at?-1:b.at?1:0);
  return result;
 },
 caption(business,service,title){
  const solar=business==='solar';
  return (solar?'Another solar project completed by RWM Solar.':'Another '+service.toLowerCase()+' project completed by RWM Landscaping.')+'\n\n'+(title.trim()||'Take a look at the transformation and the care behind our work.')+'\n\n'+(solar?'Interested in solar for your property? Contact RWM Solar to discuss an assessment.':'Contact RWM Landscaping to discuss the care and improvements your property needs.')+'\n\n'+(solar?'#RWMSolar #SolarEnergy':'#RWMLandscaping #PropertyCare');
 }
};
