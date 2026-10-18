window.TalkVelaV1State=function(document){var state={},SCROLLED=true,reduce=false;
  var cl01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var hold = document.querySelector('[data-demo="hold"]');
  if (hold) {
    var cap = hold.querySelector('[data-cap]'), capLast = '';
    state.hold = function (p) {
      var rec = p >= .28 && p < .72, st = p < .28 ? 'Tap to speak' : rec ? 'Recording… tap to stop' : p < .86 ? 'Sending…' : 'Tap to speak';
      hold.classList.toggle('is-rec', rec); hold.classList.toggle('is-wait', p >= .72 && p < .86);
      if (st !== capLast) { cap.textContent = st; capLast = st; }
    };
    if (SCROLLED || reduce) state.hold(0);
    else { var hgo = function (now) { state.hold((now / 6000) % 1); requestAnimationFrame(hgo); }; requestAnimationFrame(hgo); }
  }
  var flow = document.querySelector('[data-demo="flow"]');
  if (flow) {
    /* Seven short conversation previews, one per supported learning language. */
    var S = [['English','What are you studying?','I’m studying design, and I’d love to work abroad.']];
    var vela = flow.querySelector('[data-vela]'), me = flow.querySelector('[data-me]'), cnt = flow.querySelector('[data-count]'), lng = flow.querySelector('[data-lang]');
    var segs = flow.querySelectorAll('.tv-p__prog i'), flowLast = '';
    var toks = function (t) { return /[぀-ヿ一-鿿가-힯]/.test(t) ? t.split('') : t.split(' '); };
    state.flow = function (p) {
      var N = S.length, k = Math.min(N - 1, Math.floor(p * N)), local = cl01(p * N - k), ws = toks(S[k][2]);
      var n = Math.min(ws.length, Math.max(3, Math.round(cl01((local - .12) / .7) * ws.length))), key = k + ':' + n;
      segs.forEach(function (s, i) { s.style.width = (i < k ? 100 : i === k ? Math.round(local * 100) : 0) + '%'; });
      if (key === flowLast) return; flowLast = key;
      vela.textContent = S[k][1]; lng.textContent = S[k][0]; cnt.textContent = 'B1';
      me.textContent = ws.slice(0, n).join(/[぀-ヿ一-鿿가-힯]/.test(S[k][2]) ? '' : ' ');
      flow.classList.toggle('is-done', n === ws.length);
    };
    if (SCROLLED || reduce) state.flow(reduce ? .45 : 0);
    else { var fgo = function (now) { state.flow((now / 12000) % 1); requestAnimationFrame(fgo); }; requestAnimationFrame(fgo); }
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
    state.film = function (p) {
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
    if (SCROLLED) state.film(0);
    else { var go = function (now) { state.film((now / 15000) % 1); raf(go); }; raf(go); }
  }

return state;};
