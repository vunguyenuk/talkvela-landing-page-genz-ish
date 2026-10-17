/* TalkVela landing page: small vanilla behaviours replacing the original framework JS. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCROLLED = !!(window.gsap && window.ScrollTrigger) && !reduce;   /* scroll-driven versions are wired in scrub.js */
  window.tvScrub = {};
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- CTA buttons + anchor scrolling ---------- */
  document.querySelectorAll('[data-href]').forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-href')); });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href');
      if (h.length < 2) return;
      e.preventDefault();
      if(a.hasAttribute('data-situation'))selectSituation(a.getAttribute('data-situation'));
      go(h); closeMenu();
    });
  });
  function go(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - (hash === '#top' ? 0 : 72);
    window.scrollTo({ top: hash === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('app-header-menu-button');
  var menu = document.getElementById('app-header--popper-menu-list');
  function closeMenu() { if (menu) { menu.classList.remove('is-open'); menuBtn.classList.remove('is-open'); } }
  if (menuBtn && menu) {
    menuBtn.setAttribute('aria-label', 'Menu');
    menuBtn.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open); menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  
  function selectSituation(index) {
    document.querySelectorAll('.module-mediaFilterGrid-group').forEach(function (group) {
      group.classList.toggle('is-active', group.getAttribute('data-group') === index);
    });
    if(window.ScrollTrigger)ScrollTrigger.refresh();
  }

  /* ---------- demo cards: tap-to-speak (left) vs continuous conversation (right) ---------- */
  var cl01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var hold = document.querySelector('[data-demo="hold"]');
  if (hold) {
    var cap = hold.querySelector('[data-cap]'), capLast = '';
    window.tvScrub.hold = function (p) {
      var rec = p >= .28 && p < .72, st = p < .28 ? 'Tap to speak' : rec ? 'Recording… tap to stop' : p < .86 ? 'Sending…' : 'Tap to speak';
      hold.classList.toggle('is-rec', rec); hold.classList.toggle('is-wait', p >= .72 && p < .86);
      if (st !== capLast) { cap.textContent = st; capLast = st; }
    };
    if (SCROLLED || reduce) window.tvScrub.hold(0);
    else { var hgo = function (now) { window.tvScrub.hold((now / 6000) % 1); requestAnimationFrame(hgo); }; requestAnimationFrame(hgo); }
  }
  var flow = document.querySelector('[data-demo="flow"]');
  if (flow) {
    /* Seven short conversation previews, one per supported learning language. */
    var S = [
      ['English','What are you studying?','I’m studying design, and I’d love to work abroad.'],
      ['日本語','何を勉強していますか？','デザインを勉強しています。'],
      ['한국어','어떤 일을 하고 싶어요?','디자이너로 일하고 싶어요.'],
      ['中文','你为什么想学中文？','我想和新朋友聊天。'],
      ['Español','¿Qué te gusta hacer?','Me gusta viajar y conocer gente.'],
      ['Français','Pourquoi apprends-tu le français ?','J’aimerais étudier en France.'],
      ['Deutsch','Was möchtest du lernen?','Ich möchte sicherer sprechen.']
    ];
    var vela = flow.querySelector('[data-vela]'), me = flow.querySelector('[data-me]'), cnt = flow.querySelector('[data-count]'), lng = flow.querySelector('[data-lang]');
    var segs = flow.querySelectorAll('.tv-p__prog i'), flowLast = '';
    var toks = function (t) { return /[぀-ヿ一-鿿가-힯]/.test(t) ? t.split('') : t.split(' '); };
    window.tvScrub.flow = function (p) {
      var N = S.length, k = Math.min(N - 1, Math.floor(p * N)), local = cl01(p * N - k), ws = toks(S[k][2]);
      var n = Math.min(ws.length, Math.max(3, Math.round(cl01((local - .12) / .7) * ws.length))), key = k + ':' + n;
      segs.forEach(function (s, i) { s.style.width = (i < k ? 100 : i === k ? Math.round(local * 100) : 0) + '%'; });
      if (key === flowLast) return; flowLast = key;
      vela.textContent = S[k][1]; lng.textContent = S[k][0]; cnt.textContent = (k + 1) + ' / ' + N;
      me.textContent = ws.slice(0, n).join(/[぀-ヿ一-鿿가-힯]/.test(S[k][2]) ? '' : ' ');
      flow.classList.toggle('is-done', n === ws.length);
    };
    if (SCROLLED || reduce) window.tvScrub.flow(reduce ? .45 : 0);
    else { var fgo = function (now) { window.tvScrub.flow((now / 12000) % 1); requestAnimationFrame(fgo); }; requestAnimationFrame(fgo); }
  }

  /* hero film: one practice card — Vela asks, you answer, Vela checks that same sentence, corrects it, then sums up */
  var film = document.querySelector('[data-film]');
  if (film && !reduce) {
    var scenes = film.querySelectorAll('.tv-film__scene');
    var app = film.querySelector('[data-scene="app"]');
    var typed = film.querySelector('[data-typed]'), Q = typed.textContent;
    var ansW = film.querySelectorAll('.tv-film__ans .tv-film__w');
    var checks = film.querySelectorAll('.tv-film__chk');
    var status = film.querySelector('[data-status]');
    var showScene = function (name) { scenes.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-scene') === name); }); };
    var cl = function (x) { return Math.max(0, Math.min(1, x)); };
    var filmLast = '', stLast = '';
    window.tvScrub.film = function (p) {
      var name = p < .82 ? 'app' : 'doc';
      if (name !== filmLast) { showScene(name); filmLast = name; }
      typed.textContent = Q;
      var n = Math.round(cl((p - .2) / .16) * ansW.length);
      ansW.forEach(function (w, i) { w.classList.toggle('is-in', i < n); });
      var ck = p < .42 ? -1 : Math.min(checks.length - 1, Math.floor((p - .42) / .05));
      var focus = ck >= 0 ? checks[ck].getAttribute('data-c') : '';
      checks.forEach(function (c, i) { c.classList.toggle('is-in', i <= ck); c.classList.toggle('is-on', i === ck); });
      ansW.forEach(function (w) { var k = w.getAttribute('data-w'); w.classList.toggle('is-focus', !!k && k === focus); });
      var ask = p < .19, fix = p >= .64, chk = p >= .4 && !fix;
      app.classList.toggle('is-ask', ask); app.classList.toggle('is-talk', !ask);
      app.classList.toggle('is-checks', chk); app.classList.toggle('is-fix', fix); app.classList.toggle('is-flu', focus === 'flu');
      app.classList.toggle('is-live', !ask && p < .38);
      var st = ask ? 'Vela is asking…' : p < .38 ? 'Listening… just keep talking' : !fix ? 'Checking your answer…' : 'Ready when you are';
      if (st !== stLast) { status.textContent = st; stLast = st; }
    };
    if (SCROLLED) window.tvScrub.film(0);
    else { var go = function (now) { window.tvScrub.film((now / 15000) % 1); raf(go); }; raf(go); }
  }

  /* level scale that follows the language: CEFR -> JLPT -> TOPIK as the last method step is scrolled */
  var lvl = document.querySelector('[data-lvl]');
  if (lvl) {
    var lchips = lvl.querySelectorAll('.tv-lvl__chips span'), lscales = lvl.querySelectorAll('.tv-lvl__scale'), lsys = lvl.querySelector('[data-sys]');
    var SYS = ['CEFR'], lcur = -1;
    var showLvl = function (k) {
      if (k === lcur) return; lcur = k;
      lchips.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      lscales.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      lsys.textContent = SYS[k];
    };
    window.tvLevel = function (p) { showLvl(Math.min(SYS.length - 1, Math.floor(p * SYS.length * .999))); };
    showLvl(0);
    if (!SCROLLED && !reduce) { var lk = 0; setInterval(function () { lk = (lk + 1) % SYS.length; showLvl(lk); }, 2600); }
  }

  /* footer: rotating typed headline */
  var rot = document.querySelector('[data-rotate]');
  if (rot && !reduce) {
    var phrases = rot.getAttribute('data-rotate').split('|').map(function (p) { var d = document.createElement('div'); d.innerHTML = p; return d.textContent; });
    var footLoop = async function () {
      for (var n = 0; ; n++) {
        var ph = phrases[n % phrases.length];
        for (var c = 1; c <= ph.length; c++) { rot.textContent = ph.slice(0, c); await wait(65); }
        await wait(2200);
        for (var d = ph.length; d >= 0; d--) { rot.textContent = ph.slice(0, d); await wait(28); }
        await wait(300);
      }
    };
    footLoop();
  }

})();
