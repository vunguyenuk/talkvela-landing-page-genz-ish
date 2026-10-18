/* The V2 hero's original face sheets follow pointer direction; V1 owns the page. */
(()=>{
 const hero=document.querySelector('.new-hero');if(!hero)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 // The shipped renderer embeds its scripts, fonts and GPU textures. It runs
 // directly from disk, including the original face springs and circle trail.
 if(!reduce.matches){
  const nativeFrame=document.createElement('iframe');
  nativeFrame.className='new-hero-native';
  nativeFrame.title='TalkVela — Your English era starts here';
  nativeFrame.src='assets/hero-v2/standalone.html';
  nativeFrame.setAttribute('scrolling','no');
  hero.classList.add('has-native-hover');
  hero.append(nativeFrame);
  window.addEventListener('message',event=>{
   // Local files have opaque origins; identify our frame by its window.
   if(event.source!==nativeFrame.contentWindow||event.data?.type!=='talkvela-native-hero')return;
   const {height,ready,scrollY,scrollX}=event.data;
   if(Number.isFinite(height)&&height>=300&&height<=3000){
    const value=height+'px';
    if(hero.style.getPropertyValue('--native-hero-height')!==value){
     hero.style.setProperty('--native-hero-height',value);
     window.ScrollTrigger?.refresh();
    }
   }
   if(ready)hero.dataset.nativeReady='true';
   if(Number.isFinite(scrollY)||Number.isFinite(scrollX))window.scrollBy({top:Math.max(-2000,Math.min(2000,scrollY||0)),left:Math.max(-2000,Math.min(2000,scrollX||0)),behavior:'instant'});
  });
  // The renderer owns its original entrance, face springs and fluid effect.
  return;
 }
 const faces=[...hero.querySelectorAll('.new-hero-face')];
 let frame=0,last={x:innerWidth/2,y:innerHeight/2};
 function draw(){
  frame=0;if(reduce.matches)return;
  for(const face of faces){
   const box=face.getBoundingClientRect();
   const dx=(last.x-(box.left+box.width/2))/Math.max(innerWidth/2,1);
   const dy=(last.y-(box.top+box.height/2))/Math.max(innerHeight/2,1);
   const col=Math.max(0,Math.min(4,Math.round(2+dx*2)));
   const row=Math.max(0,Math.min(4,Math.round(2+dy*2)));
   face.querySelector('.new-hero-sprite').style.backgroundPosition=`${col*25}% ${row*25}%`;
  }
 }
 hero.addEventListener('pointermove',event=>{last={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(draw);},{passive:true});
 hero.addEventListener('pointerleave',()=>faces.forEach(face=>face.querySelector('.new-hero-sprite').style.backgroundPosition='50% 50%'));
 const gsap=window.gsap;
 if(gsap&&!reduce.matches){
  gsap.from(hero.querySelector('.new-hero-label'),{y:20,opacity:0,duration:.8,delay:.2,ease:'power2.out'});
  gsap.from(hero.querySelectorAll('h1>span'),{y:36,opacity:0,duration:.95,delay:.4,stagger:.12,ease:'expo.out'});
  gsap.from(hero.querySelector('.new-hero-signature'),{y:26,opacity:0,duration:.95,delay:.7,ease:'expo.out'});
  gsap.from(faces,{scale:.7,opacity:0,duration:1.2,delay:.55,stagger:.12,ease:'power3.out'});
  if(window.ScrollTrigger){
   faces.forEach((face,index)=>gsap.to(face,{y:-(24+index*9),ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}}));
   gsap.to(hero.querySelector('.new-hero-ambient'),{yPercent:16,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
  }
 }
})();
