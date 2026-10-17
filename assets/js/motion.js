
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Hero entrance: y 80 -> 0, fade, 1.33s expo.out, stagger 0.2 */
  var hero = $('.module-coverStacked');
  if (hero) {
    var parts = [$('h1', hero), $('.paragraph', hero), $('.cta-wrapper', hero), $('.module-coverStacked-media', hero)].filter(Boolean);
    gsap.from(parts, { y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', stagger: .2, force3D: true, clearProps: 'transform,opacity,visibility', delay: .1 });
    /* nav pill grows in like their preload state */
    var nav = $('.ba--header .header-nav');
    if (nav) gsap.from(nav, { y: -20, autoAlpha: 0, duration: 1, ease: 'expo.out' });

    /* 2. Hero text on scroll: scale 1.025, fade out, y 80 (scrubbed) while the media rises over it */
    var tb = $('.module-coverStacked-textBlock', hero);
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: function () { return '+=' + tb.offsetHeight * 1.2; }, scrub: true } })
      .to(tb, { scale: 1.025, autoAlpha: 0, y: 80, force3D: true });
  }

  /* 3. Section text blocks rise in when they enter (their textBlock entrance values) */
  $$('.module-centeredHeadline .headline, .module-featuresTimed-textBlock, .module-mediaFilterGrid-textBlock, .module-download-inner > *, .module-quotes-inner').forEach(function (el) {
    gsap.from(el, { y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', force3D: true,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* same feel for the featuresTimed media frame */
  $$('.module-featuresTimed-media').forEach(function (m) {
    gsap.fromTo(m, { y: isMobile ? 80 : 160, autoAlpha: .8 }, { y: 0, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: m, start: 'top 100%', end: 'top 40%', scrub: true } });
  });


  /* 6. featuresTimed, scroll-gated: the block pins and each scroll step advances one item;
        the page only moves on after the last item has played */
  $$('.module-featuresTimed').forEach(function (mod) {
    var content = $('.module-featuresTimed-content', mod);
    var items = $$('.module-featuresTimed-list-item', mod), medias = $$('.module-featuresTimed-media-item', mod);
    var n = items.length; if (!content || !n) return;
    var pause = $('.module-featuresTimed-pause-wrapper', mod); if (pause) pause.style.display = 'none';
    var pin = document.createElement('div'); pin.className = 'tv-ft-pin';
    content.parentNode.insertBefore(pin, content); pin.appendChild(content);
    var STEP = isMobile ? 70 : 80;                     /* vh of scroll per item */
    function layout() {
      var ch = content.offsetHeight, vh = window.innerHeight;
      var top = Math.max(isMobile ? 70 : 90, (vh - ch) / 2);
      content.style.position = 'sticky'; content.style.top = top + 'px';
      pin.style.height = (ch + n * STEP * vh / 100) + 'px';
    }
    layout();
    var cur = -1;
    function setActive(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (it, k) {
        it.classList.toggle('is-active', k === i);
        var p = $('.progress', it); if (p) { p.style.opacity = k === i ? 1 : 0; if (k !== i) p.style.transform = 'translate(0%, -100%)'; }
      });
      medias.forEach(function (m, k) { m.classList.toggle('is-active', k === i); });
    }
    setActive(0);
    var st = ScrollTrigger.create({ trigger: pin, start: function () { return 'top ' + content.style.top; }, end: 'bottom bottom',
      invalidateOnRefresh: true, onRefresh: layout,
      onUpdate: function (self) {
        var x = self.progress * n, i = Math.min(n - 1, Math.floor(x)), local = i === n - 1 && self.progress >= 1 ? 1 : x - i;
        setActive(i);
        if (window.tvLevel) window.tvLevel(i < n - 1 ? 0 : local);
        var bar = $('.progress', items[i]); if (bar) bar.style.transform = 'translate(0%, ' + (-100 + local * 100) + '%)';
      } });
    items.forEach(function (it, k) {
      it.style.cursor = 'pointer';
      it.addEventListener('click', function () { window.scrollTo({ top: st.start + (st.end - st.start) * (k + .02) / n, behavior: 'smooth' }); });
    });
  });

  
  var rise = function (els, opts) {
    els.forEach(function (el) {
      gsap.from(el, Object.assign({ y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', force3D: true,
        clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }, opts || {}));
    });
  };
  /* demo cards: left then right */
  $$('#how-it-works').forEach(function (sec) {
    var cards = $$('.css-rx9q6s, .css-cjq8fg', sec);
    gsap.from(cards, { y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', stagger: .2, force3D: true,
      clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: sec, start: 'top 80%', once: true } });
  });
  /* skills: heading, then each row (text + image with a small offset), then the 2x2 grid with stagger */
  $$('#skills').forEach(function (sec) {
    rise([$('h2', sec)]);
    $$('.css-11bf70m', sec).forEach(function (row) {
      var kids = Array.prototype.slice.call(row.children);
      gsap.from(kids, { y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', stagger: .15, force3D: true,
        clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
      
      var pic = kids[0];
      if (pic) gsap.fromTo(pic, { backgroundPositionY: '40%' }, { backgroundPositionY: '60%', ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var cards = $$('.css-1ykgmly', sec);
    if (cards.length) gsap.from(cards, { y: isMobile ? 40 : 80, autoAlpha: 0, duration: 1.33, ease: 'expo.out', stagger: .15, force3D: true,
      clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: cards[0], start: 'top 88%', once: true } });
  });

  /* 5. Footer curtain: the page slides up and uncovers the footer (their sticky footer) */
  ScrollTrigger.refresh();
})();
