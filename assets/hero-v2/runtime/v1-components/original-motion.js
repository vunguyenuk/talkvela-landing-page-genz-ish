/* Live chat visuals for "Every skill, one conversation" (GSAP). Each card plays a short story that matches its design. */
window.TalkVelaV1Live=function(document){
 var timelines=[];
  'use strict';
  var gsap = window.gsap; if (!gsap) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* fit the fixed-size stage into its frame (cover by width, centred vertically) */
  $$('.tvx').forEach(function (box) {
    var st = box.querySelector('.tvx__stage'), w = +st.dataset.w, h = +st.dataset.h;
    var fit = function () {
      var bw = box.clientWidth, bh = box.clientHeight, k = Math.min(bw / w, bh / h);
      st.style.transform = 'translate(' + (bw - w * k) / 2 + 'px,' + (bh - h * k) / 2 + 'px) scale(' + k + ')';
    };
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(box); else window.addEventListener('resize', fit);
  });
  if (reduce) return;

  /* split text nodes into word spans (keeps .hl / s / u wrappers intact) */
  function words(el) {
    var out = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), f = document.ownerDocument.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.ownerDocument.createTextNode(p)); return; }
            var s = document.ownerDocument.createElement('span'); s.className = 'tvx-w'; s.textContent = p; s.style.display = 'inline-block'; f.appendChild(s); out.push(s);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    return out;
  }

  var SCROLLED = false;
  window.tvScrub = window.tvScrub || {}; window.tvScrub.cards = [];
  /* scroll mode: the story is scrubbed by scroll.js-style pins (up to the 'done' label); otherwise it loops in view */
  function register(el,tl){tl.repeat(-1);tl.pause(0);timelines.push(tl);}
  function whenVisible(el, tl) {
    tl.pause(0);
    if (window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', end: 'bottom 10%',
        onEnter: function () { tl.play(); }, onEnterBack: function () { tl.play(); },
        onLeave: function () { tl.pause(); }, onLeaveBack: function () { tl.pause(); } });
    } else tl.play();
  }

  /* ---------- rows: you speak -> mistakes light up & get struck -> Vela's card answers ---------- */
  $$('.tvx[data-k^="row-"]').forEach(function (box) {
    var bubble = box.querySelector('.bubble'), card = box.querySelector('.card');
    var bars = $$('.wv rect', bubble), hls = $$('.hl', bubble), strikes = $$('.hl s', bubble);
    var lab = card.querySelector('.lab'), main = $$('.card p:not(.lab)', box), us = $$('u', card);
    var hlColor = hls.length ? getComputedStyle(hls[0]).backgroundColor : 'transparent';
    var uColor = us.length ? getComputedStyle(us[0]).textDecorationColor : 'transparent';
    var bw = words(bubble.querySelector('p')), cw = [];
    main.forEach(function (p) { cw = cw.concat(words(p)); });

    var tl = gsap.timeline({ repeat: -1, repeatDelay: .6, defaults: { ease: 'power2.out' } });
    tl.set(bubble, { autoAlpha: SCROLLED ? 1 : 0, y: 26, scale: .97, transformOrigin: '20% 100%' })
      .set(card, { autoAlpha: SCROLLED ? 1 : 0, y: -34 })
      .set(bw.concat(cw), { autoAlpha: SCROLLED ? 1 : 0, y: 6 })
      .set(hls, { backgroundColor: 'rgba(0,0,0,0)' })
      .set(strikes, { textDecorationColor: 'rgba(17,17,17,0)' })
      .set(us, { textDecorationColor: 'rgba(0,0,0,0)' });
    if (lab) tl.set(lab, { autoAlpha: SCROLLED ? 1 : 0 });
    // 1. the learner speaks: bubble pops, waveform bounces, words stream in
    tl.to(bubble, { autoAlpha: 1, y: 0, scale: 1, duration: .55, ease: 'power3.out' })
      .to(bars, { scaleY: .35, transformOrigin: '50% 50%', duration: .16, ease: 'sine.inOut', yoyo: true, repeat: 9, stagger: { each: .05, from: 'center' } }, '<')
      .to(bw, { autoAlpha: 1, y: 0, duration: .22, stagger: .07 }, '<.1')
      // 2. Vela notices: the slips light up, then get struck through
      .to(hls, { backgroundColor: hlColor, duration: .35, stagger: .3 }, '+=.35')
      .to(strikes, { textDecorationColor: 'rgba(17,17,17,1)', duration: .25, stagger: .3 }, '<.2')
      // 3. the better version slides out from under the bubble
      .to(card, { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' }, '+=.25');
    if (lab) tl.to(lab, { autoAlpha: 1, duration: .3 }, '<.15');
    tl.to(cw, { autoAlpha: 1, y: 0, duration: .22, stagger: .04 }, '<.1')
      .to(us, { textDecorationColor: uColor, duration: .4, stagger: .2 }, '-=.1')
      .addLabel('done', '+=.3')
      // hold, then clear for the next take
      .to([bubble, card], { autoAlpha: SCROLLED ? 1 : 0, y: -10, duration: .45, ease: 'power2.in' }, '+=2.6');
    register(box, tl);
  });

  /* ---------- topics: today's picked topic builds up, other topics slide in ---------- */
  $$('.tvx[data-k="grid-topics"]').forEach(function (box) {
    var today = box.querySelector('.today'), head = $$('.today .pick, .today h3', box), ask = box.querySelector('.ask');
    var aw = words(ask.querySelector('p')), chips = $$('.chip', box), btn = box.querySelector('.btn'), side = $$('.tp', box);
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: 'power3.out' } });
    tl.set(today, { autoAlpha: SCROLLED ? 1 : 0, y: 40 }).set(head, { autoAlpha: SCROLLED ? 1 : 0, y: 14 }).set(ask, { autoAlpha: SCROLLED ? 1 : 0, scale: .96, transformOrigin: '0% 50%' })
      .set(aw, { autoAlpha: SCROLLED ? 1 : 0, y: 6 }).set(chips, { autoAlpha: SCROLLED ? 1 : 0, scale: .8 }).set(btn, { autoAlpha: SCROLLED ? 1 : 0, y: 14 }).set(side, { autoAlpha: SCROLLED ? 1 : 0, x: 60 })
      .to(today, { autoAlpha: 1, y: 0, duration: .6 })
      .to(head, { autoAlpha: 1, y: 0, duration: .45, stagger: .12 }, '<.15')
      .to(side, { autoAlpha: 1, x: 0, duration: .55, stagger: .12 }, '<.1')
      .to(ask, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power3.out' }, '-=.1')
      .to(aw, { autoAlpha: 1, y: 0, duration: .2, stagger: .06 }, '<.1')
      .to(chips, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power3.out', stagger: .12 }, '+=.15')
      .to(btn, { autoAlpha: 1, y: 0, duration: .45 }, '+=.1')
      .to(btn, { scale: 1.05, duration: .25, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      .addLabel('done', '+=.2')
      .to([today].concat(side), { autoAlpha: SCROLLED ? 1 : 0, y: -12, duration: .4, ease: 'power2.in', stagger: .04 }, '+=1.8');
    register(box, tl);
  });

  /* ---------- nudges: notifications arrive one by one, filter flips All -> Work -> Life ---------- */
  $$('.tvx[data-k="grid-nudges"]').forEach(function (box) {
    var items = $$('.it', box), tabs = $$('.seg > span', box), icons = $$('.it .ic', box), acts = $$('.acts span', box);
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .8 });
    tl.set(items, { autoAlpha: SCROLLED ? 1 : 0, x: 80 })
      .to(items, { autoAlpha: 1, x: 0, duration: .6, ease: 'power3.out', stagger: .55 })
      .to(icons, { scale: 1.15, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out', stagger: .55 }, '<.35')
      .fromTo(acts, { autoAlpha: SCROLLED ? 1 : 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: .35, ease: 'power3.out', stagger: .1 }, 1);
    tabs.forEach(function (t, i) {
      tl.add(function () { tabs.forEach(function (x, k) { x.classList.toggle('on', k === i); }); }, '+=' + (i ? .9 : .4));
    });
    tl.addLabel('done', '+=.6')
      .add(function () { tabs.forEach(function (x, k) { x.classList.toggle('on', k === 0); }); }, '+=.9')
      .to(items, { autoAlpha: SCROLLED ? 1 : 0, x: -40, duration: .4, ease: 'power2.in', stagger: .06 }, '+=1');
    register(box, tl);
  });

  /* ---------- phrase bank: a flashcard for a phrase you used, with sound, meaning, your own sentence ---------- */
  $$('.tvx[data-k="grid-bank"]').forEach(function (box) {
    var card = box.querySelector('.fc'), ghosts = $$('.ghost', box), h = box.querySelector('.fh h3'), auto = box.querySelector('.auto'), say = box.querySelector('.say');
    var parts = $$('.ipa, .fc > .lab, .mean, .from', box), mark = box.querySelector('.from mark'), dots = $$('.dot', box), on = $$('.dot.on', box), t = box.querySelector('.prog');
    var hw = words(h), markBg = getComputedStyle(mark).backgroundColor, onBg = on.length ? getComputedStyle(on[0]).backgroundColor : '#4f3fae';
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: 'power3.out' } });
    tl.set(card, { autoAlpha: SCROLLED ? 1 : 0, y: 60, rotation: -2, transformOrigin: '50% 100%' }).set(ghosts, { autoAlpha: SCROLLED ? 1 : 0, y: 30 }).set(hw, { autoAlpha: SCROLLED ? 1 : 0, y: 10 })
      .set([auto, say], { autoAlpha: SCROLLED ? 1 : 0, scale: .6 }).set(parts, { autoAlpha: SCROLLED ? 1 : 0, y: 12 }).set(mark, { backgroundColor: 'rgba(0,0,0,0)' })
      .set(t, { autoAlpha: SCROLLED ? 1 : 0 }).set(on, { backgroundColor: '#e4e2dc' })
      .to(ghosts, { autoAlpha: 1, y: 0, duration: .5, stagger: .1 })
      .to(card, { autoAlpha: 1, y: 0, rotation: 0, duration: .7 }, '<.15')
      .to(hw, { autoAlpha: 1, y: 0, duration: .3, stagger: .1 }, '-=.25')
      .to(auto, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power3.out' }, '-=.05')
      .to(say, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power3.out' }, '<.1')
      .to(say, { scale: 1.15, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' })
      .to(parts, { autoAlpha: 1, y: 0, duration: .45, stagger: .14 }, '<')
      .to(mark, { backgroundColor: markBg, duration: .4 })
      .to(t, { autoAlpha: 1, duration: .3 }, '+=.1')
      .to(on, { backgroundColor: onBg, duration: .25, stagger: .18 }, '<')
      .addLabel('done', '+=.2')
      .to([card].concat(ghosts), { autoAlpha: SCROLLED ? 1 : 0, y: -14, duration: .4, ease: 'power2.in' }, '+=1.8');
    register(box, tl);
  });

  /* ---------- real situations: a role-play — landlord speaks, you answer by voice, Vela suggests alternatives ---------- */
  $$('.tvx[data-k="grid-phrases"]').forEach(function (box) {
    var tabs = $$('.seg > span', box), chat = box.querySelector('.chat'), role = box.querySelector('.role'), ms = $$('.m', box);
    var lw = words(ms[0].querySelector('.b')), bars = $$('.wv i', box), tip = box.querySelector('.tip'), alts = $$('.alts span', box);
    var mine = ms[1].querySelector('.b > span:last-child'), yw = words(mine);
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .8, defaults: { ease: 'power3.out' } });
    tl.add(function () { tabs.forEach(function (x, k) { x.classList.toggle('on', k === 0); }); })
      .set(chat, { autoAlpha: SCROLLED ? 1 : 0, y: 40 }).set(role, { autoAlpha: SCROLLED ? 1 : 0 }).set(ms, { autoAlpha: SCROLLED ? 1 : 0, y: 20, scale: .97 })
      .set(lw.concat(yw), { autoAlpha: SCROLLED ? 1 : 0, y: 6 }).set(tip, { autoAlpha: SCROLLED ? 1 : 0, y: 20 }).set(alts, { autoAlpha: SCROLLED ? 1 : 0, scale: .85 });
    tabs.forEach(function (t, i) { if (i) tl.add(function () { tabs.forEach(function (x, k) { x.classList.toggle('on', k === i); }); }, '+=.35'); });
    tl.to(chat, { autoAlpha: 1, y: 0, duration: .6 }, '+=.1')
      .to(role, { autoAlpha: 1, duration: .3 }, '<.2')
      .to(ms[0], { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' })
      .to(lw, { autoAlpha: 1, y: 0, duration: .18, stagger: .05 }, '<.1')
      .to(ms[1], { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' }, '+=.3')
      .fromTo(bars, { scaleY: .3 }, { scaleY: 1, duration: .16, ease: 'sine.inOut', yoyo: true, repeat: 7, stagger: { each: .04, from: 'center' } }, '<')
      .to(yw, { autoAlpha: 1, y: 0, duration: .2, stagger: .08 }, '<.15')
      .to(tip, { autoAlpha: 1, y: 0, duration: .55 }, '+=.3')
      .to(alts, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power3.out', stagger: .15 }, '<.2')
      .addLabel('done', '+=.2')
      .to(chat, { autoAlpha: SCROLLED ? 1 : 0, y: -12, duration: .4, ease: 'power2.in' }, '+=1.8');
    register(box, tl);
  });
return timelines;
};
