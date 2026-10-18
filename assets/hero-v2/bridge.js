/* Bridge viewport height and page scrolling; V2 keeps its complete rendering. */
(()=>{
 if(window.TalkVelaPatternOnly)return;
 let ready=false,lastHeight=0,pending=0;
 const send=message=>parent.postMessage({type:'talkvela-native-hero',...message},location.origin);
 function sync(){
  pending=0;
  const hero=document.querySelector('.hero-gl');
  if(!hero)return;
  const height=Math.ceil(hero.getBoundingClientRect().height);
  if(height!==lastHeight){lastHeight=height;send({height});}
  // Hero entrance and preloader exit overlap. Wait for the loading face's
  // actual removal, rather than treating hero opacity as the loading signal.
  const preloader=document.querySelector('.fixed[class*="z-[9999]"]');
  if(!ready&&!preloader&&document.querySelector('canvas')&&getComputedStyle(hero).opacity>.8){
   ready=true;send({ready:true,loaderGone:true,height});
  }
 }
 // Animation changes styles continuously. Throttle instead of debouncing, which
 // could postpone the readiness message forever while the renderer is running.
 function schedule(){if(!pending)pending=setTimeout(sync,80);}
 const observer=new MutationObserver(schedule);
 function start(){
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
  new ResizeObserver(schedule).observe(document.documentElement);
  document.fonts?.ready.then(schedule);
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('pageshow',schedule,{passive:true});
 // Desktop wheel events from the interactive iframe scroll the outer V1 page.
 // Touch devices pass gestures directly through the iframe via parent CSS.
 window.addEventListener('wheel',event=>{
  if(event.ctrlKey)return;
  const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
  send({scrollY:event.deltaY*unit,scrollX:event.deltaX*unit});
  event.preventDefault();event.stopImmediatePropagation();
 },{capture:true,passive:false});
})();
