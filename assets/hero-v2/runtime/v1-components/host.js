/* Actual V1 markup and original animation functions in isolated component roots. */
(()=>{
 const revision=new URL(document.currentScript.src).search||'?v=49';
 const ready=Promise.all(['components.json','original.css','mobile.css','host.css'].map(name=>fetch('/assets/hero-v2/runtime/v1-components/'+name+revision).then(r=>name.endsWith('.json')?r.json():r.text())));
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const active=new Set();let clock=0;
 function tick(now){
  for(const view of active){
   if(view.state){let p=(now-view.started)%15000/15000;for(const fn of Object.values(view.state))if(typeof fn==='function')fn(p);}
  }
  clock=active.size?requestAnimationFrame(tick):0;
 }
 const io=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(isIntersecting&&!reduce.matches){target.started=performance.now();active.add(target);target.timelines?.forEach(t=>t.play());if(!clock)clock=requestAnimationFrame(tick);}
  else{active.delete(target);target.timelines?.forEach(t=>t.pause());}
 }),{threshold:.12});
 class V1Visual extends HTMLElement{
  async connectedCallback(){
   if(this.shadowRoot)return;
   const root=this.attachShadow({mode:'open'});
   const [components,css,mobile,host]=await ready;
   const key=this.getAttribute('component')||'flow';
   this.dataset.component=key;
   const style=document.createElement('style');style.textContent=css+'\n'+mobile+'\n'+host;
   const canvas=document.createElement('div');canvas.className='v1-canvas';canvas.innerHTML=components[key]||components.flow;
   root.append(style,canvas);
   const native=canvas.querySelector('.tvx__stage');
   const w=native?Number(native.dataset.w):key==='film'?960:400;
   const h=native?Number(native.dataset.h):key==='film'?600:620;
   canvas.style.width=w+'px';canvas.style.height=h+'px';
   const fit=()=>{
    const bw=this.clientWidth,bh=this.clientHeight;
    const responsive=!!native&&bw<=540&&bh>=250;
    this.toggleAttribute('data-responsive',responsive);
    const k=Math.min(bw/w,bh/h);
    canvas.style.transform=`translate(${(bw-w*k)/2}px,${(bh-h*k)/2}px) scale(${k})`;
   };
   this.resize=new ResizeObserver(fit);this.resize.observe(this);fit();
   if(!this.hasAttribute('static')&&!reduce.matches){
    this.timelines=window.TalkVelaV1Live?.(root)||[];
    this.state=window.TalkVelaV1State?.(root);
    io.observe(this);
   }
   if(this.hasAttribute('static')){const state=window.TalkVelaV1State?.(root);if(state)for(const fn of Object.values(state))if(typeof fn==='function')fn(.76);}
   this.classList.add('is-rendered');
   this.dispatchEvent(new CustomEvent('v1-rendered'));
  }
  disconnectedCallback(){io.unobserve(this);active.delete(this);this.resize?.disconnect();this.timelines?.forEach(t=>t.kill());}
 }
 customElements.define('talkvela-v1',V1Visual);
})();
