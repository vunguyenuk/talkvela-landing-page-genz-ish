/* Orchestrated identity scenes; original scroll/card engines remain in place. */
(() => {
  'use strict';
  if (!document.body.classList.contains('tags-video')) return;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const gs = window.gsap;
  const coinMarkup = () => `<span class="tags-coin">${Array.from({length:28},(_,i)=>`<i class="tags-coin-layer" style="transform:translateZ(${-28+i}px)"></i>`).join('')}<i class="tags-coin-layer tags-coin-face"><i class="tags-coin-inset"><i class="tags-coin-eye"></i><i class="tags-coin-eye"></i><i class="tags-coin-mouth"></i></i></i></span>`;
  const coins = [...document.querySelectorAll('.skin-pixel')].map(el=>{el.innerHTML=coinMarkup();return el.firstElementChild;});
  // Profiles belong to Discover, rather than the acid logo/coin scene.
  document.querySelectorAll('.skin-portrait').forEach(el=>el.remove());
  const positions=[[-630,-360,60],[-240,-420,-80],[260,-420,100],[650,-300,-60],[-680,20,80],[690,40,-100],[-570,360,50],[-170,440,-70],[270,440,90],[650,360,-80],[-920,-260,-100],[920,-210,60],[-970,300,90],[980,330,-70],[-380,-700,40],[440,720,-60]];
  const people = [
    {name:'Mia',goal:'Everyday conversations',theme:'mint'},
    {name:'Nia',goal:'Interview practice',theme:'peach'},
    {name:'Jun',goal:'Campus conversations',theme:'aqua'},
    {name:'Alex',goal:'Languages for travel',theme:'lilac'}
  ];
  const profileMarkup=(n,{featured=false}={})=>{
    const person=people[n];
    return `<div class="tags-profile tags-profile--${person.theme}${featured?' tags-profile--featured':''}">
      <div class="tags-profile-portrait"><div class="tags-person tags-person--${n}"><img src="assets/img/genz-voices.webp" width="1536" height="1024" alt="" loading="lazy"></div>${featured?'<span class="tags-profile-sticker">Speak</span><span class="tags-profile-sticker tags-profile-sticker--second">Grow</span>':''}</div>
      <b class="tags-profile-name">#${person.name.toLowerCase()}<i class="tags-profile-spark" aria-hidden="true">✦</i></b><small class="tags-profile-handle">@${person.name.toLowerCase()}.speaks</small><span class="tags-profile-action">Let’s practice</span>
    </div>`;
  };
  // Small portrait signatures add a second scale, as in the identity-film reference.
  // These four people are distinct from the four large-card portraits.
  const signatures=[
    {name:'MINH',handle:'@minh.speaks',image:'goal',position:'50% 12%',size:'205%'},
    {name:'SANA',handle:'@sana.speaks',image:'grow',position:'50% 11%',size:'210%'},
    {name:'JAY',handle:'@jay.speaks',image:'fix',position:'50% 4%',size:'155%'},
    {name:'ZOE',handle:'@zoe.speaks',image:'talk',position:'50% 0%',size:'190%'}
  ];
  const signatureMarkup=n=>{const person=signatures[n];return `<div class="tags-signature"><div class="tags-signature-portrait"><img src="assets/img/lesson-${person.image}.webp" alt="" loading="lazy" width="900" height="1100" style="--portrait-position:${person.position};--portrait-size:${person.size}"></div><b>${person.name}<i aria-hidden="true">✦</i></b><small>${person.handle}</small></div>`;};
  const practiceCards=[
    ['PRONUNCIATION','Think.','A little air for the “th” sound.'],
    ['FRANÇAIS · YOUR PHRASE BANK','Enchanté !','Nice to meet you.'],
    ['한국어 · YOUR NEXT STEP','TOPIK 2 → 3','One conversation at a time.'],
    ['A SMALL CORRECTION','I went yesterday.','Past tense, made simple.'],
    ['日本語 · CAMPUS LIFE','一緒に勉強しませんか？','Would you like to study together?'],
    ['INTERVIEW PRACTICE','Tell me about yourself.','Try your answer out loud.'],
    ['ESPAÑOL · EVERYDAY LIFE','¿Me puedes ayudar?','Could you help me?'],
    ['KEEP THE CONVERSATION GOING','What do you think?','There’s room for your voice.'],
    ['SPEAKING PRACTICE','Take your time.','Pause, think, and try again.'],
    ['DEUTSCH · SOUND NATURAL','Sehr gerne.','I’d love to.'],
    ['中文 · TRAVEL','几号站台？','Which platform?'],
    ['YOUR OWN WORDS','Here’s my idea.','Make yourself heard.'],
    ['LISTEN & REPLY','Could you say that again?','It’s okay to ask.'],
    ['A BETTER SENTENCE','For two years.','Use “for” with a length of time.'],
    ['FIRST-DAY INTRO','Hi, I’m Minh.','A simple place to start.'],
    ['CELEBRATE PROGRESS','You said it.','Keep building your confidence.']
  ];
  const practiceMarkup=n=>{const [label,phrase,note]=practiceCards[n%practiceCards.length];return `<div class="tags-practice-card tags-practice-card--${n%4}"><span>${label}</span><b>${phrase}</b><small>${note}</small></div>`;};
  const scene = document.querySelector('.tv-inline');
  // The original orbit contains learning UI, rather than repeated people.
  if(!scene.classList.contains('has-speaking-orbit')) scene.querySelectorAll('.hero-img-inner').forEach((inner,i)=>{
    ['xpos','ypos','zpos'].forEach((attr,k)=>inner.parentElement.setAttribute(attr,positions[i%positions.length][k]));
    inner.innerHTML=practiceMarkup(i);
  });
  // People are real image assets; learning UI remains selectable, responsive HTML.
  const lessonWave = '<span class="lesson-wave" aria-hidden="true">'+Array.from({length:13},(_,i)=>`<i style="--bar:${i};--height:${[22,38,65,42,86,58,100,65,38,72,45,28,16][i]}%"></i>`).join('')+'</span>';
  // Preserve the newer Gen Z set; each lesson has its own portrait.
  const lessonPortraits={
    goal:['assets/img/genz-r47/real-talk-blue.png','A young woman in a blue jacket practicing with her phone'],
    talk:['assets/img/genz-r47/first-reply-orange.png','A young woman in an orange jacket gesturing as she speaks'],
    fix:['assets/img/genz-r47/try-again-red.png','A young man in a red polo mid-conversation'],
    grow:['assets/img/genz-r56/progress-varsity.png','A young man in a blue varsity jacket celebrating his progress']
  };
  const lessonPerson=name=>{const [src,alt]=lessonPortraits[name];return `<img class="lesson-person" src="${src}" width="1024" height="1536" alt="${alt}" loading="lazy" decoding="async">`;};
  const lessonPanels=[
    `<div class="lesson-scene lesson-scene--goal"><div class="lesson-pixel" aria-hidden="true"></div><header><span class="lesson-eyebrow">01 / YOUR LANGUAGE, YOUR WAY</span><h4>A big moment.<br>Your own words.</h4></header>${lessonPerson('goal','A young woman holding her phone and smiling')}<span class="lesson-sticker">My next chapter ↗</span><div class="lesson-ui lesson-goal"><div class="lesson-ui-top"><span class="lesson-avatar">v</span><span>LET’S MAKE IT PERSONAL</span></div><h5>What are you practicing for?</h5><div class="lesson-choice is-selected"><span>✓</span> My first internship interview</div><div class="lesson-choice">Meeting new people</div><div class="lesson-choice">Everyday conversations</div><div class="lesson-language-options" aria-label="Language examples"><span>English</span><span lang="ja">日本語</span><span>+5 languages</span></div></div><span class="lesson-caption">A practice plan that starts with you.</span></div>`,
    `<div class="lesson-scene lesson-scene--talk"><div class="lesson-pixel" aria-hidden="true"></div><header><span class="lesson-eyebrow">02 / FIND YOUR FLOW</span><h4>Less pressure.<br>More talking.</h4></header>${lessonPerson('talk','A young woman wearing headphones, smiling and speaking')}<div class="lesson-prompt lesson-ui"><div class="lesson-ui-top"><span class="lesson-avatar">v</span><span>VELA ASKS</span></div><p lang="ja">何を勉強していますか？</p><small>What are you studying?</small></div><div class="lesson-reply lesson-ui"><small>YOUR TURN · 日本語</small><p lang="ja">デザインを勉強しています。</p><small>I’m studying design.</small></div><div class="lesson-audio lesson-ui">${lessonWave}<span><b>Room to find your words.</b><small>Vela listens as you speak.</small></span><span class="lesson-mic" aria-hidden="true">${glyphMic()}</span></div><span class="lesson-caption">Conversation preview · 日本語</span></div>`,
    `<div class="lesson-scene lesson-scene--fix"><div class="lesson-pixel" aria-hidden="true"></div><header><span class="lesson-eyebrow">03 / TRY IT A LITTLE DIFFERENTLY</span><h4>A small fix.<br>A clearer you.</h4></header>${lessonPerson('fix','A young man reviewing a sentence on his phone')}<span class="lesson-sticker">Oh, got it!</span><div class="lesson-ui lesson-correction"><div class="lesson-ui-top"><span class="lesson-avatar">v</span><span>A LITTLE FEEDBACK</span></div><small>YOU SAID</small><p class="lesson-before">I live here <s>since</s> two years.</p><div class="lesson-after"><small>TRY THIS</small><p>I’ve lived here <mark>for</mark> two years.</p><span>Use “for” with a length of time.</span></div><div class="lesson-retry">${lessonWave}<b>Say it again. Make it yours.</b></div></div><span class="lesson-caption">Useful feedback. Still your voice.</span></div>`,
    `<div class="lesson-scene lesson-scene--grow"><div class="lesson-pixel" aria-hidden="true"></div><header><span class="lesson-eyebrow">04 / KEEP MOVING FORWARD</span><h4>Your next step.<br>Within reach.</h4></header>${lessonPerson('grow','A young woman holding a notebook and celebrating her progress')}<span class="lesson-sticker">You’ve got this ✦</span><div class="lesson-ui lesson-progress"><div class="lesson-ui-top"><span class="lesson-avatar">v</span><span>YOUR LEARNING PATH · 한국어</span></div><div class="lesson-level"><b>2급</b><span aria-hidden="true">↗</span><b>3급</b></div><p>Build on what you know.</p><div class="lesson-path" aria-hidden="true"><i>✓</i><span></span><i>✓</i><span></span><i class="is-next">↗</i></div><div class="lesson-next"><small>YOUR NEXT CHALLENGE</small><b>Tell the story behind your idea.</b><span>Practice giving a longer answer.</span></div></div></div>`
  ];
  function glyphMic(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/></svg>';}
  const lessonSection=document.querySelector('#method');
  lessonSection.querySelectorAll('.module-featuresTimed-media-item').forEach((item,i)=>{item.querySelector('.media').innerHTML=lessonPanels[i];});
  // Only the visible step animates. Static content remains complete without motion.
  let lessonInView=false;
  const syncLessons=()=>{lessonSection.classList.toggle('lesson-motion-running',lessonInView&&!mq.matches&&!document.hidden);};
  new IntersectionObserver(entries=>{lessonInView=entries[0].isIntersecting;syncLessons();}).observe(lessonSection.querySelector('.module-featuresTimed-media'));
  document.addEventListener('visibilitychange',syncLessons);mq.addEventListener('change',syncLessons);syncLessons();
  // Keep a clear center during the poster lockup, then hand over to the original orbit.
  const cast=document.createElement('div');cast.className='tags-discover-cast';cast.setAttribute('aria-hidden','true');
  const castContent=[profileMarkup(0),signatureMarkup(0),profileMarkup(1),signatureMarkup(1),profileMarkup(2,{featured:true}),signatureMarkup(2),profileMarkup(3),signatureMarkup(3)];
  cast.innerHTML=castContent.map((html,i)=>`<div class="tags-cast-card tags-cast-card--${i}">${html}</div>`).join('');scene.querySelector('.tv-inline__sticky').append(cast);
  const castCards=[...cast.children];
  const lockup=scene.querySelector('.tags-scene-lockup'),stage=scene.querySelector('.tv-inline__stage'),wave=scene.querySelector('.tv-wave');
  // Preserve the original eight detailed product UI illustrations in Who it’s for.
  // Silhouette and front are separate surfaces, extruded in real CSS 3D space.
  const glyphs={
    globe:'<ellipse cx="35" cy="35" rx="12" ry="26"/><path d="M9 28h52M9 43h52M35 9v52"/>',
    mic:'<rect x="29" y="17" width="12" height="24" rx="6"/><path d="M23 34a12 12 0 0 0 24 0M35 46v8M27 54h16"/>',
    chat:'<path d="M23 31h2m9 0h2m9 0h2" stroke-width="5"/>',
    wave:'<path d="M18 30v10M26 23v24M35 16v38M44 23v24M52 30v10" stroke-width="4"/>',
    star:'<path d="m35 14 6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1Z" fill="#111114" stroke="none"/>',
    aa:'<text x="35" y="44" text-anchor="middle" font-size="26" font-weight="600" fill="#111114" stroke="none">Aa</text>',
    ja:'<text x="35" y="45" text-anchor="middle" font-size="29" fill="#111114" stroke="none">あ</text>',
    zh:'<text x="35" y="45" text-anchor="middle" font-size="29" fill="#111114" stroke="none">中</text>'
  };
  const shapes={chat:'<path d="M13 12h44v35H40L25 60V47H13Z"/>',wave:'<rect x="9" y="9" width="52" height="52" rx="12"/>',star:'<path d="m35 4 9 18 21 3-15 15 4 22-19-10-19 10 4-22L5 25l21-3Z"/>'};
  const sprite=document.createElementNS('http://www.w3.org/2000/svg','svg');sprite.classList.add('tags-symbols');sprite.setAttribute('aria-hidden','true');
  sprite.innerHTML=Object.entries(glyphs).map(([name,glyph])=>`<symbol id="tags-shape-${name}" viewBox="0 0 70 70"><g fill="currentColor">${shapes[name]||'<circle cx="35" cy="35" r="27"/>'}</g></symbol><symbol id="tags-front-${name}" viewBox="0 0 70 70"><g fill="currentColor" stroke="#111114" stroke-width="1.3">${shapes[name]||'<circle cx="35" cy="35" r="27"/>'}</g><g fill="none" stroke="#111114" stroke-width="2" stroke-linecap="round">${name==='star'?'':glyph}</g></symbol>`).join('');document.body.prepend(sprite);
  const cta=document.querySelector('.module-download-inner');
  const ring=document.createElement('div');ring.className='tags-token-ring';ring.setAttribute('aria-hidden','true');
  const names=['globe','ja','chat','wave','aa','star','zh','mic','globe','chat','ja','star','wave','aa','mic','zh'];
  ring.innerHTML=names.map(name=>`<span class="tags-token"><span class="tags-token-object">${Array.from({length:12},(_,i)=>`<svg class="tags-token-depth" viewBox="0 0 70 70" style="transform:translateZ(${-12+i}px)"><use href="#tags-shape-${name}"/></svg>`).join('')}<svg class="tags-token-front" viewBox="0 0 70 70"><use href="#tags-front-${name}"/></svg></span></span>`).join('');cta.prepend(ring);
  const tokens=[...ring.children];
  let animations=[],typeTimeline,inView=false,heroInView=true,ringTween;
  const state={angle:0};
  function renderRing(){
    const w=cta.clientWidth,h=cta.clientHeight;
    // Restore the compact orbit, keeping the existing section clip and motion.
    const rx=w<768?w*.56:Math.min(w*.39,365),ry=Math.min(h*.38,345);
    tokens.forEach((el,i)=>{
      const a=(state.angle+i*360/tokens.length)*Math.PI/180;
      const scale=.82+.18*(Math.sin(a)+1)/2;
      el.style.transform=`translate3d(${Math.cos(a)*rx}px,${Math.sin(a)*ry}px,0) rotateZ(${Math.sin(a)*20}deg) scale(${scale})`;
    });
  }
  renderRing();new ResizeObserver(renderRing).observe(cta);
  function sync(){
    if(ringTween)ringTween.paused(!inView||mq.matches||document.hidden);
    animations.forEach(t=>t.paused(!heroInView||document.hidden));
  }
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.05}).observe(cta);
  new IntersectionObserver(entries=>{heroInView=entries[0].isIntersecting;sync();}).observe(document.querySelector('#top .textBlock'));
  document.addEventListener('visibilitychange',sync);
  function motion(){
    animations.forEach(t=>t.kill());animations=[];ringTween?.kill();typeTimeline?.scrollTrigger?.kill();typeTimeline?.kill();
    if(!gs)return;
    gs.set([lockup,...coins],{clearProps:'opacity,visibility,transform'});
    gs.set([stage,wave,cast,...castCards].filter(Boolean),{clearProps:'opacity,visibility'});
    gs.set(castCards,{clearProps:'transform'});
    if(mq.matches)return;
    coins.forEach((coin,i)=>animations.push(gs.timeline({delay:.15+i*.18}).fromTo(coin,{y:-140,rotationX:45,rotationY:-75,rotationZ:-25,opacity:0},{y:0,rotationX:18,rotationY:-28,rotationZ:0,opacity:1,duration:1.4,ease:'expo.out'}).to(coin,{y:i?12:-10,rotationX:i?-12:30,rotationY:i?22:-48,rotationZ:i?-8:8,duration:3.5+i*.5,repeat:-1,yoyo:true,ease:'sine.inOut'})));
    // Match the original text fade. The original engine alone unfolds the image stage.
    // Never hide the stage: its rotation already communicates the scroll progression.
    if(!scene.classList.contains('has-partner-intros')) typeTimeline=gs.timeline({scrollTrigger:{trigger:scene,start:'top top',end:()=>`+=${innerHeight}`,scrub:true,invalidateOnRefresh:true}})
      .to(cast,{opacity:0,y:80,scale:1.025,duration:.5,ease:'none'}).add(()=>{},1.75);
    ringTween=gs.to(state,{angle:360,duration:14,repeat:-1,ease:'none',paused:true,onUpdate:renderRing});sync();
  }
  mq.addEventListener('change',motion);motion();
  // Make the original click-to-seek method controls keyboard-operable.
  document.querySelectorAll('.module-featuresTimed-list-item').forEach((el,i)=>{
    el.removeAttribute('aria-hidden');el.setAttribute('role','button');el.tabIndex=0;
    const expanded=()=>el.setAttribute('aria-expanded',String(el.classList.contains('is-active')));expanded();new MutationObserver(expanded).observe(el,{attributes:true,attributeFilter:['class']});
    el.setAttribute('aria-label',`Step ${i+1}: ${el.querySelector('.title').textContent}`);
    el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();el.click();}});
  });
  document.querySelectorAll('.module-featuresTimed-media-item').forEach(el=>{const accessible=()=>el.setAttribute('aria-hidden',String(!el.classList.contains('is-active')));accessible();new MutationObserver(accessible).observe(el,{attributes:true,attributeFilter:['class']});});
  const quotes=[...document.querySelectorAll('.module-quotes-item')];
  quotes.forEach((el,i)=>el.setAttribute('aria-hidden',String(i!==0)));
  const quoteControls=[...document.querySelectorAll('.module-quotes-nav-item')];
  quoteControls.forEach((el,i)=>{
    el.setAttribute('aria-pressed',String(i===0));
    el.setAttribute('aria-label',`Show principle ${i+1}: ${quotes[i].querySelector('.name').textContent}`);
    const choose=()=>{
      // Reuse the original scroll-driven quote renderer at the selected step.
      if(window.tvScrub?.quotes)window.tvScrub.quotes((i+.2)/quotes.length);
      else quotes.forEach((q,n)=>{q.classList.toggle('is-active',n===i);q.setAttribute('aria-hidden',String(n!==i));});
      quoteControls.forEach((q,n)=>{q.classList.toggle('is-active',n===i);q.setAttribute('aria-pressed',String(n===i));});
    };
    el.addEventListener('click',choose);el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}});
  });
  window.ScrollTrigger?.refresh();
})();
