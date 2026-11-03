/* SKY RE — News & Insights: category filter, article reading progress and share */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$ } = SKY;

  const filter = $('#newsFilter');
  if (filter) {
    const tabs = $$('[role="tab"]', filter);
    const cards = $$('#newsGrid .ncard');
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        tabs.forEach((x) => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; });
        const f = t.dataset.f;
        gsap.to(cards, {
          opacity: 0, y: 16, duration: 0.25, onComplete: () => {
            cards.forEach((c) => c.classList.toggle('is-out', f !== 'all' && c.dataset.cat !== f));
            const shown = cards.filter((c) => !c.classList.contains('is-out'));
            shown.forEach((c) => $('.ph', c).style.setProperty('--s', 0));
            gsap.to(shown, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 });
            gsap.to(shown.map((c) => $('.ph', c)), { '--s': 220, stagger: 0.08, duration: 1.6, ease: 'expo.out' });
            ScrollTrigger.refresh();
          },
        });
      });
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click(); }
      });
    });
  }

  // reading progress across the article
  const bar = $('.read-prog i');
  const body = $('.art-body');
  if (bar && body) {
    const upd = () => {
      const r = body.getBoundingClientRect();
      const k = SKY.clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1);
      bar.style.transform = `scaleX(${k})`;
    };
    addEventListener('scroll', upd, { passive: true });
    upd();
  }

  // hero photograph drifts slower than the page
  const hero = $('[data-parallax-img] img');
  if (hero && !SKY.reduce) {
    gsap.fromTo(hero, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: hero.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  $$('[data-copy-url]').forEach((b) => b.addEventListener('click', () => {
    navigator.clipboard && navigator.clipboard.writeText(location.href).then(() => SKY.toast('Link copied'));
  }));
})();
