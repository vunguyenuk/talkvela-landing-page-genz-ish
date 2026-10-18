/* Mount V2's existing circular assets and original uP trail routine in the hero. */
(()=>{
 'use strict';
 if(window.TalkVelaPatternOnly)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const assetRoot='/assets/hero-v2/runtime/__external/www.genzbrokethefunnelwhatnow.com/english-assets/cursor/';
 let mounted=false,attempts=0;
 function mount(){
  if(mounted)return;
  const hero=document.querySelector('.hero-gl');
  const chunks=window.webpackChunk_N_E;
  if(!hero||getComputedStyle(hero).opacity<.8||!chunks||chunks.push===Array.prototype.push){retry();return;}
  let trail=null;
  // Reuse the original exported effect rather than approximating its easing.
  chunks.push([[57000+attempts],{},require=>{if(require.m[463])trail=require(463).uP;}]);
  if(typeof trail!=='function'){retry();return;}
  mounted=true;
  const layer=document.createElement('div');
  layer.className='hero-cursor-trail';layer.setAttribute('aria-hidden','true');
  const images=[7,6,5,1,2,3,4,8].map(index=>{
   const image=document.createElement('img');
   image.src=assetRoot+index+'.png';image.alt='';image.width=100;image.height=100;
   image.draggable=false;layer.append(image);return image;
  });
  document.body.append(layer);
  let stop=null;
  const pointerEvents=new EventTarget();
  const clear=()=>{
   stop?.();stop=null;
   for(const image of images){image.style.opacity='0';image.style.transform='scale(0)';}
  };
  const start=()=>{
   if(stop||reduce.matches||!fine.matches||document.hidden)return;
   stop=trail(pointerEvents,images,{threshold:100,imgWidth:100,imgHeight:100});
  };
  // Listen above the render layer, but forward only positions inside the hero.
  // The exported routine needs only an EventTarget with mousemove coordinates.
  document.addEventListener('mousemove',event=>{
   const bounds=hero.getBoundingClientRect();
   if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom){clear();return;}
   start();
   if(stop)pointerEvents.dispatchEvent(new MouseEvent('mousemove',{clientX:event.clientX,clientY:event.clientY}));
  },{capture:true,passive:true});
  document.documentElement.addEventListener('mouseleave',clear);
  window.addEventListener('blur',clear);
  reduce.addEventListener('change',clear);fine.addEventListener('change',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  new IntersectionObserver(records=>{if(!records[0].isIntersecting)clear();}).observe(hero);
  window.addEventListener('pagehide',clear);
 }
 function retry(){if(++attempts<=200)setTimeout(mount,150);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
