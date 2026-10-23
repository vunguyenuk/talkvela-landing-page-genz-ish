/* Decode the next visual before its scroll entrance, without fetching every
   below-the-fold portrait and illustration during the hero's startup. */
(() => {
  'use strict';
  const selectors = '.module-featuresTimed-media, .partner-rail, .tv-inline, #skills .css-11bf70m, #skills .css-1ykgmly, .module-mediaFilterGrid';
  if (!('IntersectionObserver' in window)) return; // Native image loading still works.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      for (const image of entry.target.querySelectorAll('img[loading="lazy"]')) {
        image.loading = 'eager';
        if (image.decode) image.decode().catch(() => {});
      }
    }
  }, { rootMargin: '1400px 0px' });
  document.querySelectorAll(selectors).forEach(section => observer.observe(section));
})();
