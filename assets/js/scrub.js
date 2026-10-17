/* Scroll-gated sections: each block pins in place and its animation is driven by scroll;
   the page only continues once the animation has played through. */
(function () {
  'use strict';
  var gsap = window.gsap, ST = window.ScrollTrigger, S = window.tvScrub;
  if (!gsap || !ST || !S) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NAV = 84;                                     /* keep pinned blocks clear of the floating nav */

  /* pin `el` for `len` viewport-heights and report progress 0..1 */
  function pin(el, len, onProgress, opts) {
    opts = opts || {};
    if (!el) return null;
    var vh = window.innerHeight, h = el.offsetHeight;
    if (h > vh - NAV - 8 && !opts.force) return null;
    var spacer = document.createElement('div'); spacer.className = 'tv-pin';
    el.parentNode.insertBefore(spacer, el); spacer.appendChild(el);
    var top = Math.max(NAV, Math.round((vh - h) / 2 + (opts.offset || 0)));
    el.style.position = 'sticky'; el.style.top = top + 'px';
    spacer.style.height = (h + len * vh / 100) + 'px';
    var proxy = { p: 0 };
    gsap.to(proxy, { p: 1, ease: 'none', onUpdate: function () { onProgress(proxy.p); },
      scrollTrigger: { trigger: spacer, start: 'top ' + top + 'px', end: 'bottom ' + (top + h) + 'px', scrub: .5 } });
    onProgress(0);
    return spacer;
  }

  /* 1. hero film: 4 scenes play as you scroll past the cover media */
  if (S.film) {
    var coverMedia = $('.module-coverStacked-media-wrapper');
    if (!pin(coverMedia, 260, S.film)) ST.create({ trigger: coverMedia, start: 'top 80%', end: 'bottom 20%', scrub: .5, onUpdate: function (st) { S.film(st.progress); } });
  }

  /* 2. hold-to-speak vs continuous: both demos are scrubbed together */
  if (S.hold && S.flow) {
    var comparison = $('#how-it-works .css-1n748jd');
    var comparisonProgress = function (p) { S.hold(p); S.flow(p); };
    if (!pin(comparison, 240, comparisonProgress)) ST.create({ trigger: comparison, start: 'top 80%', end: 'bottom 20%', scrub: .5, onUpdate: function (st) { comparisonProgress(st.progress); } });
  }

  /* 3. skills rows and the 2x2 cards: each chat story plays fully while its block is pinned */
  var cards = S.cards || [];
  var scrubCards = function (list) { return function (p) { list.forEach(function (c) { c.tl.time(p * c.end, false); }); }; };
  $$('#skills .css-11bf70m').forEach(function (row) {
    var list = cards.filter(function (c) { return row.contains(c.el); });
    if (list.length) {
      if (!pin(row, 110, scrubCards(list))) {
        ST.create({ trigger: row, start: 'top 85%', end: 'bottom 30%', scrub: .5,
          onUpdate: function (st) { scrubCards(list)(st.progress); } });
      }
    }
  });
  $$('#skills .tv-gridpair').forEach(function (pair) {
    var list = cards.filter(function (c) { return pair.contains(c.el); });
    if (!list.length) return;
    if (!pin(pair, 130, scrubCards(list))) {
      /* pair taller than the screen (mobile): pin each card on its own */
      $$('.css-1ykgmly', pair).forEach(function (card) {
        var one = list.filter(function (c) { return card.contains(c.el); });
        if (one.length && !pin(card, 100, scrubCards(one))) {
          ST.create({ trigger: card, start: 'top 85%', end: 'bottom 40%', scrub: .5, onUpdate: function (s) { scrubCards(one)(s.progress); } });
        }
      });
    }
  });

  /* 4. principles: Trust -> Challenge -> Teach, one per scroll step */
  if (S.quotes) pin($('.module-quotes'), 210, S.quotes);

  /* 5. who it's for: cards rise in, then the tab flips to "Newcomers abroad" */
  var icp = $('.module-mediaFilterGrid');
  if (icp && !icp.classList.contains('situation-stories')) {
    var tabs = $$('.module-mediaFilterGrid-filters-tag', icp), cur = 0;
    var rise = function (grp, p) {
      $$('.module-mediaFilterGrid-media', grp).forEach(function (m, i) {
        var k = Math.min(1, Math.max(0, p * 1.6 - i * .12));
        m.style.transform = 'translateY(' + ((1 - k) * 160) + 'px)'; m.style.opacity = .4 + .6 * k;
      });
    };
    pin(icp, 170, function (p) {
      var want = p < .55 ? 0 : 1;
      if (want !== cur && tabs[want]) { cur = want; tabs[want].click(); }
      var grp = $('.module-mediaFilterGrid-group.is-active', icp);
      if (grp) rise(grp, cur === 0 ? p / .4 : 1);
    });
  }

  ST.refresh();
})();
