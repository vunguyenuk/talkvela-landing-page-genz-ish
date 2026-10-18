/* Use the existing V2 provider, ornament mesh and fluid simulation unchanged. */
(()=>{
 if(!window.TalkVelaPatternOnly)return;
 const hostOrigin=location.origin;
 const settings={ornament:'hero',color:'#8cff00',highlight:'#d9c5ff',scale:1};
 let ready=false,configured=false,shape=null,slot=null,attempt=0;
 const send=data=>parent.postMessage({type:'talkvela-native-pattern',...data},hostOrigin);
 function sync(){
  const api=window.TalkVelaPatternAPI,root=window.TalkVelaPatternRoot;
  if(!configured||!api?.isLoaded||!root){if(attempt++<240)setTimeout(sync,100);else send({error:'pattern-renderer-unavailable'});return;}
  if(!slot){slot=document.createElement('div');slot.className='tv-pattern-slot';slot.setAttribute('aria-hidden','true');document.body.append(slot);}
  if(!shape){
   shape=api.createVAppearOrnament({id:'v1-background-pattern',container:slot,ornamentId:settings.ornament,color:settings.color,highlightColor:settings.highlight,scale:settings.scale,depth:1});
   shape.progress=1;
  }
  root.refresh();
  if(!ready){ready=true;requestAnimationFrame(()=>requestAnimationFrame(()=>send({ready:true})));}
 }
 window.addEventListener('message',event=>{
  if(event.origin!==hostOrigin||event.source!==parent||event.data?.type!=='talkvela-pattern-input')return;
  const data=event.data;
  if(data.config&&!shape){Object.assign(settings,data.config);configured=true;sync();}
  if(data.pointer&&Number.isFinite(data.pointer.x)&&Number.isFinite(data.pointer.y)){
   document.body.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:data.pointer.x,clientY:data.pointer.y}));
  }
 });
 window.addEventListener('resize',()=>{if(ready)window.TalkVelaPatternRoot?.refresh();},{passive:true});
 document.addEventListener('webglcontextlost',()=>send({error:'webgl-context-lost'}),true);
 send({listening:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
