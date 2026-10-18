/* A small disclosure menu; all navigation remains ordinary local anchors. */
(()=>{
 'use strict';
 const nav=document.querySelector('.notch-nav');
 const button=nav?.querySelector('.header-menu-toggle');
 if(!button)return;
 function setOpen(open){
  nav.classList.toggle('is-menu-open',open);
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Close navigation':'Open navigation');
 }
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 nav.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false);});
 document.addEventListener('pointerdown',event=>{if(!nav.contains(event.target))setOpen(false);});
 document.addEventListener('focusin',event=>{if(!nav.contains(event.target))setOpen(false);});
 nav.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){
   setOpen(false);button.focus();event.preventDefault();
  }
 });
 matchMedia('(min-width:768px)').addEventListener('change',()=>setOpen(false));
})();
