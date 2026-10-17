/* Four concise speaking examples; one demonstration per card. */
(() => {
  'use strict';
  const section=document.querySelector('#who-its-for');
  if(!section||!document.body.classList.contains('tags-video'))return;
  section.classList.add('situation-stories');
  const wave='<span class="story-wave" aria-hidden="true">'+[12,22,32,42,28,18,30,16,10].map(h=>`<i style="height:${h}px"></i>`).join('')+'</span>';
  const numberBadge=number=>`<span class="story-step" aria-hidden="true">${number}</span>`;
  const badge=text=>`<span class="story-badge">${text}</span>`;
  const feature=(abroad=false)=>`<div class="story-art story-art--conversation${abroad?' is-abroad':''}">${numberBadge('01')}<div class="story-workspace">${badge(abroad?'中文 · EVERYDAY LIFE':'ENGLISH · CAMPUS LIFE')}<h4>${abroad?'Find the words.':'Share your idea.'}</h4><div class="story-chat"><div class="story-prompt"><small>VELA</small><p>${abroad?'What would you like the doctor to know?':'What could we do differently?'}</p></div><div class="story-reply"><small>YOU</small><p ${abroad?'lang="zh"':''}>${abroad?'我从昨天开始头痛。':'Could we try a simpler approach?'}</p></div></div></div></div>`;
  const tones=[
    {label:'ENGLISH · YOUR FIRST JOB',title:'Find your tone.',prompt:'Ask for a little more time.',options:['I need more time.','Could I have a little more time?'],notes:['This is clear, but it can sound abrupt. Try making it a question.','Clear and polite. A little room for the other person to respond.']},
    {label:'ESPAÑOL · FINDING A PLACE',title:'Before you move in.',prompt:'Ask whether bills are included.',options:['Dime si los gastos están incluidos.','¿Están incluidos los gastos?'],notes:['Understandable, but quite direct. A question sounds friendlier.','“Are bills included?” Clear, complete and easy to answer.']}
  ];
  const tone=i=>{const d=tones[i];return `<div class="story-art story-art--tone">${numberBadge('02')}<div class="story-workspace">${badge(d.label)}<h4>${d.title}</h4><p class="story-task">${d.prompt}</p><div class="story-options" role="group" aria-label="Choose how to phrase your request">${d.options.map((t,n)=>`<button type="button" class="story-option${n===1?' is-chosen':''}" aria-pressed="${n===1}" data-tone="${n}" ${i?'lang="es"':''}><span class="story-radio" aria-hidden="true">${n===1?'✓':''}</span><span>${t}</span></button>`).join('')}</div><p class="story-tone-feedback" aria-live="polite">${d.notes[1]}</p></div></div>`;};
  const questions=[
    [{q:'Tell me about a project you’re proud of.',tip:'Start with what you did. Then share what you learned.'},{q:'What would you like to learn in this internship?',tip:'Name one skill, and explain why it matters to you.'},{q:'How do you approach a new challenge?',tip:'Give a real example. Keep your answer in your own words.'}],
    [{q:'On prend un café ?',tip:'Would you like to grab a coffee? A small invitation is a friendly start.'},{q:'Qu’est-ce que tu aimes faire le week-end ?',tip:'What do you like doing at the weekend? Find something you have in common.'},{q:'Tu connais un bon café près d’ici ?',tip:'Do you know a good café nearby? Ask a follow-up and keep the chat going.'}]
  ];
  const interview=i=>`<div class="story-art story-art--interview${i?' is-friends':''}">${numberBadge('03')}<div class="story-workspace">${badge(i?'FRANÇAIS · MEETING PEOPLE':'ENGLISH · INTERVIEW PRACTICE')}<h4>${i?'Start with hello.':'Tell your story.'}</h4><div class="story-question"><small>${i?'A CONVERSATION STARTER':'YOUR PRACTICE QUESTION'}</small><p aria-live="polite" ${i?'lang="fr"':''}>${questions[i][0].q}</p></div><div class="story-coach"><p>${questions[i][0].tip}</p></div><button type="button" class="story-next-question">${i?'Another conversation':'Another question'} <span aria-hidden="true">↗</span></button></div></div>`;
  const answers=[
    {label:'ENGLISH · PRESENTATIONS & Q&A',title:'Keep your cool.',q:'What if the budget is cut by 20%?',before:'We could, um… prioritise the core features.',after:'We’d protect the core features.',note:'A short pause sounds calmer than filling the silence.',photo:'talk'},
    {label:'DEUTSCH · GETTING SETTLED',title:'Ask with clarity.',q:'Ask which documents you need.',before:'Welche Unterlagen brauche ich?',after:'Könnten Sie mir sagen, welche Unterlagen ich brauche?',note:'A polite way to ask: “Could you tell me which documents I need?”',photo:'fix'}
  ];
  const answer=i=>{const d=answers[i];return `<div class="story-art story-art--answer${i?' is-paperwork':''}">${numberBadge('04')}<div class="story-workspace">${badge(d.label)}<h4>${d.title}</h4><div class="story-listening"><small>${i?'YOUR NEXT QUESTION':'VELA ASKS'}</small><p>${d.q}</p></div><div class="story-answer-box"><div class="story-answer-top">${wave}<span>${i?'YOUR QUESTION':'YOUR ANSWER'}</span></div><p class="story-answer-text" ${i?'lang="de"':''}>${d.before}</p></div><button type="button" class="story-refine" aria-pressed="false">${i?'Make it more polite':'Make it clearer'} <span aria-hidden="true">↗</span></button><p class="story-answer-note" aria-live="polite"></p></div></div>`;};
  const templates=[feature(),tone(0),interview(0),answer(0),feature(true),tone(1),interview(1),answer(1)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const previews=[];
  let timer=null,activePreview=null,remainingPreviewSeconds=4;
  const animateContent=(el,delay=0)=>{
    if(!el||reduced.matches)return;
    el.getAnimations().forEach(a=>a.cancel());
    el.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'});
  };
  const eligible=p=>!!p&&p.visible&&!p.manual&&!p.hovered&&!p.focused&&p.elapsed<4&&remainingPreviewSeconds>0&&!reduced.matches&&!document.hidden&&p.group.classList.contains('is-active');
  const canRun=p=>p===activePreview&&eligible(p);
  function sync(){
    // Keep only one moving example, preferring the speaking card when visible.
    activePreview=previews.find(p=>p.kind===3&&eligible(p))||previews.find(eligible)||null;
    previews.forEach(p=>{
      const running=canRun(p);
      p.art.classList.toggle('is-story-running',running);
      if(running){
        p.art.classList.add('has-story-motion');
        if(p.kind===0&&!p.entered){
          p.entered=true;
          animateContent(p.art.querySelector('.story-prompt'));
          animateContent(p.art.querySelector('.story-reply'),350);
        }
      }
      p.art.getAnimations({subtree:true}).filter(a=>!a.animationName).forEach(a=>running?a.play():a.finish());
    });
    const running=previews.some(canRun);
    if(running&&!timer)timer=setInterval(tick,1000);
    if(!running&&timer){clearInterval(timer);timer=null;}
  }
  function tick(){
    previews.forEach(p=>{
      if(!canRun(p))return;
      p.elapsed++;
      if(p.kind===1){
        if(p.elapsed===2)p.setTone(0,false);
        if(p.elapsed===4)p.setTone(1,false);
      }
      if(p.kind===2&&p.elapsed===3)p.nextQuestion(false);
      if(p.kind===3){
        if(p.elapsed===3)p.setRefined(true,false);
      }
    });
    remainingPreviewSeconds--;
    sync();
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const p=previews.find(p=>p.art===entry.target);
      p.visible=entry.isIntersecting&&entry.intersectionRatio>=.2;
    });sync();
  },{threshold:[0,.2]});
  section.querySelectorAll('.module-mediaFilterGrid-group').forEach((group,g)=>{
    new MutationObserver(sync).observe(group,{attributes:true,attributeFilter:['class']});
    group.querySelectorAll('.module-mediaFilterGrid-media').forEach((tile,n)=>{
      tile.classList.add('story-tile',`story-tile--${n}`);
      const media=tile.querySelector('.bento-style-after');
      const label=tile.querySelector('.bentoText-heading').textContent;
      const art=document.createElement('div');art.className='story-art-wrap';art.innerHTML=templates[g*4+n];
      media.querySelector('img').replaceWith(art);
      media.querySelector('.bentoText-after')?.remove();
      const preview={art:art.firstElementChild,group,kind:n,visible:false,elapsed:0,manual:false,hovered:false,focused:false};
      preview.art.setAttribute('aria-label',label);
      previews.push(preview);
      const manual=()=>{preview.manual=true;sync();};
      preview.art.addEventListener('pointerenter',()=>{preview.hovered=true;sync();});
      preview.art.addEventListener('pointerleave',()=>{preview.hovered=false;sync();});
      preview.art.addEventListener('focusin',()=>{preview.focused=true;sync();});
      preview.art.addEventListener('focusout',event=>{if(!preview.art.contains(event.relatedTarget)){preview.focused=false;sync();}});
      if(n===1){
        const options=[...art.querySelectorAll('.story-option')],feedback=art.querySelector('.story-tone-feedback');
        preview.setTone=(b,user)=>{
          feedback.setAttribute('aria-live',user?'polite':'off');
          options.forEach((el,i)=>{const on=i===b;el.classList.toggle('is-chosen',on);el.setAttribute('aria-pressed',String(on));el.querySelector('.story-radio').textContent=on?'✓':'';});
          feedback.textContent=tones[g].notes[b];animateContent(feedback);animateContent(options[b]);
        };
        feedback.setAttribute('aria-live','off');
        options.forEach((button,b)=>button.addEventListener('click',()=>{manual();preview.setTone(b,true);}));
      }
      if(n===2){
        let q=0;
        const question=art.querySelector('.story-question p'),coach=art.querySelector('.story-coach p');
        question.setAttribute('aria-live','off');
        preview.nextQuestion=user=>{q=(q+1)%questions[g].length;question.setAttribute('aria-live',user?'polite':'off');question.textContent=questions[g][q].q;coach.textContent=questions[g][q].tip;animateContent(art.querySelector('.story-question'));animateContent(coach);};
        art.querySelector('.story-next-question').addEventListener('click',()=>{manual();preview.nextQuestion(true);});
      }
      if(n===3){
        let refined=false;
        const box=art.querySelector('.story-answer-box'),note=art.querySelector('.story-answer-note'),button=art.querySelector('.story-refine');
        note.setAttribute('aria-live','off');
        preview.setRefined=(next,user)=>{
          refined=next;note.setAttribute('aria-live',user?'polite':'off');
          art.querySelector('.story-answer-text').textContent=refined?answers[g].after:answers[g].before;
          box.classList.toggle('is-refined',refined);button.setAttribute('aria-pressed',String(refined));
          note.textContent=refined?answers[g].note:'';
          button.textContent=refined?'Show the first version ↶':(g?'Make it more polite ↗':'Make it clearer ↗');
          animateContent(art.querySelector('.story-answer-text'));animateContent(note);
        };
        button.addEventListener('click',()=>{manual();preview.setRefined(!refined,true);});
      }
      observer.observe(preview.art);
    });
  });
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{
    if(reduced.matches)previews.forEach(p=>{p.art.getAnimations({subtree:true}).forEach(a=>a.cancel());});
    sync();
  });
  sync();
})();
