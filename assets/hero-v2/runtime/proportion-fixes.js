/* V1's existing UI components, mounted into the supplied V2 scene containers. */
(()=>{
 const scenes={
  'not fun':'row-vocab','value shift':'row-fluency','trust':'flow',
  'comment main':'row-pron','comment 0':'row-teach','comment 1':'row-vocab','comment 2':'row-fluency',
  'hashtags main':'grid-topics','hashtags comments':'grid-nudges',
  'reddit main':'row-pron','reddit comment':'grid-phrases','craves img':'hold',
  'resale':'row-vocab','resale small':'row-teach','queue culture':'grid-topics','queue culture small':'grid-nudges',
  'micro communities':'grid-phrases','quiet slow':'grid-bank','dark retail':'grid-bank',
  'community creators':'grid-phrases','supporting creators':'grid-nudges',
  'search right':'flow','search left':'hold','search message':'grid-bank',
  'ai tools':'grid-topics','conclusion':'film','friction':'row-fluency','tangible':'grid-bank'
 };
 function create(container,key){
  let view=container.querySelector(':scope > talkvela-v1');
  if(!view){view=document.createElement('talkvela-v1');view.setAttribute('component',key);view.className='tv-v1-visual';container.classList.add('tv-proportional-slot');container.append(view);}
  return view;
 }
 window.TalkVelaProportions={create(options,asset){
  if(!options.container||/\.mp4$/.test(asset))return null;
  const view=create(options.container,scenes[options.assetId]||'grid-phrases');
  return {
   get progress(){return Number(view.style.opacity||1)},set progress(n){view.style.opacity=String(n)},
   get alpha(){return Number(view.style.opacity||1)},set alpha(n){view.style.opacity=String(n)},
   setVisible(n){view.hidden=!n},setScale(n){if(Number.isFinite(n))view.style.scale=String(n)},setPosition(){}
  };
 }};
 function scan(){
  document.querySelectorAll('img[src*="/images/body_woman"],img[src*="/images/bag1"]').forEach(img=>{
   if(img.dataset.v1Mounted)return;
   img.dataset.v1Mounted='true';img.classList.add('tv-v1-placeholder');
   const view=create(img.parentElement,img.src.includes('body_woman')?'flow':'hold');
   view.classList.add('tv-v1-primary');
  });
 }
 let pending=false;
 const mo=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;scan();});}});
 document.addEventListener('DOMContentLoaded',()=>{scan();mo.observe(document.body,{childList:true,subtree:true});});
})();
