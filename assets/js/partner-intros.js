/* Animated portrait + spoken introductions. No video footage is implied. */
(() => {
  'use strict';
  const scene=document.querySelector('.has-partner-intros');
  if(!scene)return;
  scene.id='meet-partners';
  const sticky=scene.querySelector('.tv-inline__sticky');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 767px)');
  const people=[
    {name:'Nia',language:'English',theme:'peach',image:'talk',focus:'Prepare for your next interview',intro:["Hi, I’m Nia, your AI practice partner for English.","Let’s rehearse your internship interview, tell your story, and practice those tricky follow-up questions.","Bring your ideas. We’ll find the words."]},
    {name:'Minh',language:'中文',theme:'aqua',image:'goal',focus:'Everyday conversations, made easier',intro:["Hi, I’m Minh, your AI practice partner for Chinese.","I’ll help you navigate your first days abroad, from introducing yourself to asking for a little help.","One useful conversation at a time."]},
    {name:'Jay',language:'Español',theme:'lilac',image:'fix',focus:'Speak up at work',intro:["Hi, I’m Jay, your AI practice partner for Spanish.","I’ll help you share an update, ask a question, and explain your ideas at your first job.","We’ll practice sounding clear and natural."]}
  ];
  const portrait=p=>`<img class="partner-film-poster" src="assets/img/lesson-${p.image}.webp" alt="${p.name}, AI practice partner" width="900" height="1100" loading="lazy">`;
  const waves='<span class="partner-wave" aria-hidden="true">'+Array.from({length:9},()=>'<i></i>').join('')+'</span>';
  const rail=document.createElement('section');rail.className='partner-rail';rail.setAttribute('aria-label','Meet your AI practice partners');
  rail.innerHTML=`<header class="partner-header"><div><span class="partner-eyebrow">YOUR AI SPEAKING PARTNERS</span><h2>A conversation<br>starts with hello.</h2></div><p>Meet three of your AI speaking partners. <br>Practice real conversations, get helpful feedback <br>and try again at your own pace.</p></header><div class="partner-viewport" tabindex="0" aria-label="AI partner introductions, scroll horizontally"><div class="partner-track">${people.map((p,i)=>`<article class="partner-card partner-card--${p.theme}" data-partner="${i}" aria-label="${p.name}, ${p.language}"><div class="partner-film-stage">${portrait(p)}<video class="partner-film" playsinline preload="none" aria-label="${p.name} introduction" hidden></video></div><div class="partner-topline"><span>${p.language}</span><small>AI practice partner</small></div><h3 class="partner-topic">${p.focus}</h3><div class="partner-info"><h4>${p.name}</h4></div><div class="partner-caption"><span class="partner-caption-label">MEET ${p.name.toUpperCase()}</span><p>${p.intro[0]}</p></div><div class="partner-progress" aria-hidden="true"><i></i></div><div class="partner-actions"><button type="button" class="partner-play" data-play="${i}" aria-label="Play introduction by ${p.name}" aria-pressed="false"><span class="partner-play-icon" aria-hidden="true">▶</span><span class="partner-play-label">Meet ${p.name}</span>${waves}</button><details class="partner-transcript"><summary><span class="when-closed">Transcript</span><span class="when-open">Close transcript</span></summary><p>${p.intro.join(' ')}</p></details></div></article>`).join('')}</div></div><footer class="partner-navigation"><span class="partner-hint">English + 6 more languages</span><div><button type="button" class="partner-prev" aria-label="Previous practice partner">←</button><span class="partner-counter" aria-live="off">01 / 03</span><button type="button" class="partner-next" aria-label="Next practice partner">→</button></div><span class="partner-demo-note">Introduction previews</span></footer><p class="partner-status" role="status" aria-live="polite"></p>`;
  const openingWave=document.createElement("div");openingWave.className="partner-opening-wave";openingWave.setAttribute("aria-hidden","true");openingWave.innerHTML=waves;sticky.append(openingWave,rail);
  const orbitPause=document.createElement('button');orbitPause.type='button';orbitPause.className='partner-orbit-pause';orbitPause.textContent='Pause motion';orbitPause.setAttribute('aria-pressed','false');orbitPause.hidden=true;sticky.append(orbitPause);
  let orbitPaused=false,orbitInView=false,orbitPhase=false;
  const orbitBars=[...scene.querySelectorAll('.tv-wave rect')];
  function syncOrbitMotion(){
    const run=orbitInView&&orbitPhase&&!orbitPaused&&!reduced.matches&&!document.hidden;
    scene.dataset.orbitPaused=String(!run);
    orbitBars.forEach(bar=>window.gsap?.getTweensOf(bar).forEach(tween=>tween.paused(!run)));
    orbitPause.hidden=!orbitInView||!orbitPhase||reduced.matches;
  }
  function setOrbitPhase(next){if(next!==orbitPhase){orbitPhase=next;syncOrbitMotion();}}
  orbitPause.addEventListener('click',()=>{orbitPaused=!orbitPaused;orbitPause.textContent=orbitPaused?'Resume motion':'Pause motion';orbitPause.setAttribute('aria-pressed',String(orbitPaused));syncOrbitMotion();});
  new IntersectionObserver(entries=>{orbitInView=entries[0].isIntersecting;syncOrbitMotion();},{threshold:.05}).observe(sticky);
  const viewport=rail.querySelector('.partner-viewport'),track=rail.querySelector('.partner-track'),cards=[...rail.querySelectorAll('.partner-card')],buttons=[...rail.querySelectorAll('.partner-play')];
  const status=rail.querySelector('.partner-status');
  const recordings={"nia":{"src":"assets/audio/partners/nia.mp3","duration":14.954,"cues":[{"start":0,"end":4.505,"text":"Hi, I’m Nia, your AI practice partner for English."},{"start":4.505,"end":11.889,"text":"Let’s rehearse your internship interview, tell your story, and practice those tricky follow-up questions."},{"start":11.889,"end":14.954,"text":"Bring your ideas. We’ll find the words."}],"voice":"Tessa"},"minh":{"src":"assets/audio/partners/minh.mp3","duration":15.712,"cues":[{"start":0,"end":4.896,"text":"Hi, I’m Minh, your AI practice partner for Chinese."},{"start":4.896,"end":12.416,"text":"I’ll help you navigate your first days abroad, from introducing yourself to asking for a little help."},{"start":12.416,"end":15.712,"text":"One useful conversation at a time."}],"voice":"Flo (English (US))"},"jay":{"src":"assets/audio/partners/jay.mp3","duration":15.328,"cues":[{"start":0,"end":4.768,"text":"Hi, I’m Jay, your AI practice partner for Spanish."},{"start":4.768,"end":12.0,"text":"I’ll help you share an update, ask a question, and explain your ideas at your first job."},{"start":12.0,"end":15.328,"text":"We’ll practice sounding clear and natural."}],"voice":"Reed (English (US))"}};
  // Filled only when final rendered clips have been supplied. Existing audio
  // introductions stay usable during review, without implying lip synchronization.
  const films=window.TalkVelaPartnerFilms||{};
  people.forEach((p,i)=>{
    const film=films[p.name.toLowerCase()];
    if(!film)return;
    const video=cards[i].querySelector('.partner-film');
    video.dataset.src=film.src;
    if(film.poster)video.poster=film.poster;
    cards[i].classList.add('has-film');
    cards[i].querySelector('.partner-transcript p').textContent=film.cues.map(c=>c.text).join(' ');
  });
  const recordingFor=i=>films[people[i].name.toLowerCase()]||recordings[people[i].name.toLowerCase()];
  const audio=document.createElement("audio");audio.preload="none";audio.hidden=true;audio.className="partner-audio";rail.append(audio);
  let active=-1,generation=0,scrollTrigger=null,player=audio;
  const maxScroll=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  const step=()=>cards[0].offsetWidth+parseFloat(getComputedStyle(track).gap||24);
  function updateNavigation(){
    const index=Math.max(0,Math.min(cards.length-1,Math.round(viewport.scrollLeft/step())));
    const visible=mobile.matches?1:Math.ceil((viewport.clientWidth-2*parseFloat(getComputedStyle(track).paddingLeft))/step());
    const end=Math.min(cards.length,index+visible);
    rail.querySelector('.partner-counter').textContent=(visible===1?String(index+1).padStart(2,'0'):`${String(index+1).padStart(2,'0')}–${String(end).padStart(2,'0')}`)+' / '+String(cards.length).padStart(2,'0');
    rail.querySelector('.partner-prev').disabled=viewport.scrollLeft<4;
    rail.querySelector('.partner-next').disabled=viewport.scrollLeft>maxScroll()-4;
  }
  viewport.addEventListener('scroll',updateNavigation,{passive:true});updateNavigation();
  function seek(direction){
    const target=Math.max(0,Math.min(maxScroll(),viewport.scrollLeft+direction*step()));
    viewport.scrollTo({left:target,behavior:reduced.matches?'auto':'smooth'});
  }
  rail.querySelector('.partner-prev').addEventListener('click',()=>seek(-1));rail.querySelector('.partner-next').addEventListener('click',()=>seek(1));
  viewport.addEventListener('keydown',event=>{if(event.target===viewport&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();seek(event.key==='ArrowRight'?1:-1);}});
  function resetButton(i,label='Meet '+people[i].name){
    buttons[i].setAttribute('aria-pressed','false');buttons[i].setAttribute('aria-label','Play introduction by '+people[i].name);
    buttons[i].querySelector('.partner-play-icon').textContent='▶';buttons[i].querySelector('.partner-play-label').textContent=label;
    cards[i].classList.remove('is-playing','is-paused');
  }
  function stop(){
    generation++;player.pause();if(active>=0)resetButton(active);active=-1;player.currentTime=0;
  }
  function setCaption(i,index){const cues=recordingFor(i).cues;cards[i].querySelector('.partner-caption p').textContent=cues[Math.min(cues.length-1,Math.max(0,index))].text;}
  function renderPlayback(){
    if(active<0)return;
    const recording=recordingFor(active);
    const duration=Number.isFinite(player.duration)?player.duration:recording.duration;
    cards[active].querySelector('.partner-progress i').style.transform=`scaleX(${Math.min(1,player.currentTime/duration)})`;
    const cue=recording.cues.findIndex(c=>player.currentTime>=c.start&&player.currentTime<c.end);if(cue>=0)setCaption(active,cue);
  }
  function failed(){
    if(active<0)return;const i=active;stop();status.textContent='The introduction could not load. Open Transcript to read it.';cards[i].querySelector('details').open=true;
  }
  [audio,...cards.map(c=>c.querySelector('.partner-film'))].forEach(media=>{
  media.addEventListener('timeupdate',()=>{if(player===media)renderPlayback();});
  media.addEventListener('play',()=>{
    if(active<0||player!==media)return;const i=active;cards[i].classList.add('is-playing');cards[i].classList.remove('is-paused');buttons[i].setAttribute('aria-pressed','true');buttons[i].setAttribute('aria-label','Pause introduction by '+people[i].name);buttons[i].querySelector('.partner-play-icon').textContent='Ⅱ';buttons[i].querySelector('.partner-play-label').textContent='Pause intro';status.textContent='Playing '+people[i].name+'’s introduction.';
  });
  media.addEventListener('pause',()=>{
    if(active<0||player!==media)return;const i=active;cards[i].classList.remove('is-playing');cards[i].classList.add('is-paused');buttons[i].setAttribute('aria-pressed','false');buttons[i].setAttribute('aria-label','Resume introduction by '+people[i].name);buttons[i].querySelector('.partner-play-icon').textContent='▶';buttons[i].querySelector('.partner-play-label').textContent='Resume intro';
  });
  media.addEventListener('ended',()=>{
    if(active<0||player!==media)return;const i=active;cards[i].querySelector('.partner-progress i').style.transform='scaleX(1)';setCaption(i,2);resetButton(i,'Play again');active=-1;status.textContent=people[i].name+'’s introduction finished.';
  });
  media.addEventListener('error',()=>{if(player===media)failed();});
  });
  function play(i){
    if(active===i){if(player.paused)player.play().catch(failed);else player.pause();return;}
    stop();active=i;const token=generation;
    cards.forEach(c=>{c.querySelector('details').open=false;c.querySelector('.partner-progress i').style.transform='scaleX(0)';});
    const recording=recordingFor(i),film=films[people[i].name.toLowerCase()];
    player=film?cards[i].querySelector('.partner-film'):audio;
    if(film)player.hidden=false;
    setCaption(i,0);player.src=recording.src;
    player.play().catch(()=>{if(token===generation)failed();});
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>play(i)));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();syncOrbitMotion();});
  // Observe every card so scrolling away always stops the active introduction.
  const cardObserver=new IntersectionObserver(entries=>{if(active>=0&&entries.some(e=>e.target===cards[active]&&e.intersectionRatio<.15))stop();},{root:viewport,threshold:[0,.15]});cards.forEach(c=>cardObserver.observe(c));
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();},{threshold:.05}).observe(sticky);
  function setup(){
    updateNavigation();
    stop();scrollTrigger?.kill();scene.style.setProperty('--partner-scroll',`${innerHeight*4}px`);
    const cast=scene.querySelector('.tags-discover-cast'),stage=scene.querySelector('.tv-inline__stage');
    if(reduced.matches||!window.gsap||!window.ScrollTrigger||scene.dataset.orbitReady!=='true'){scene.classList.add('partner-static');rail.removeAttribute('inert');rail.setAttribute('aria-hidden','false');setOrbitPhase(false);syncOrbitMotion();return;}
    scene.classList.remove('partner-static');
    const gs=window.gsap;gs.set([cast,openingWave],{autoAlpha:1,y:0});gs.set(stage,{autoAlpha:0});gs.set(rail,{autoAlpha:0,y:70});
    const tl=gs.timeline({scrollTrigger:{trigger:scene,start:'top top',end:'bottom bottom',scrub:.35,invalidateOnRefresh:true,onUpdate:self=>{const visible=self.progress>.79;setOrbitPhase(self.progress>.09&&self.progress<.84);rail.inert=!visible;rail.setAttribute('aria-hidden',String(!visible));if(!visible)stop();}}});
    // Statement → unfolding product orbit → introductions. Each handoff overlaps.
    // inline.bundle.js alone owns the original text fade and the 3D orbit geometry.
    tl.to(openingWave,{autoAlpha:0,y:-30,duration:.05,ease:'none'},.04)
      .to(cast,{autoAlpha:0,y:-60,duration:.10,ease:'none'},.05)
      .to(stage,{autoAlpha:1,duration:.09,ease:'none'},.09)
      .to(stage,{autoAlpha:0,duration:.12,ease:'none'},.70)
      .to(rail,{autoAlpha:1,y:0,duration:.13,ease:'none'},.77);
    // All three introductions remain visible together on desktop.
    tl.add(()=>{},1);scrollTrigger=tl.scrollTrigger;rail.inert=true;rail.setAttribute('aria-hidden','true');window.ScrollTrigger.refresh();
  }
  let resizeTimer=0;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setup,180);});reduced.addEventListener('change',setup);
  setup();document.fonts?.ready.then(()=>window.ScrollTrigger?.refresh());
})();
