/* SKY RE — Brand Story page */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$ } = SKY;

  /* ---------- The story of the symbol: six pinned chapters ---------- */
  const story = $('.sym-story');
  if (story) {
    const q = (s) => $(s, story);
    const chs = $$('.ch', story);
    const bars = $$('.ss__prog i', story);
    const gA = q('.ss-gA'), gB = q('.ss-gB'), star = q('.ss-star');
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      chs.forEach((c, j) => {
        if (j === i) gsap.fromTo(c, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, overwrite: true });
        else gsap.to(c, { autoAlpha: 0, y: j < i ? -30 : 30, duration: 0.5, overwrite: true });
      });
      bars.forEach((b, j) => b.classList.toggle('on', j === i));
    };
    show(0);
    gsap.set(star, { transformOrigin: '50% 50%', opacity: 0.25 });
    gsap.set(q('.ss-rings'), { transformOrigin: '271px 275px' });

    if (SKY.reduce) {
      story.style.height = 'auto';
      chs.forEach((c) => { c.style.position = 'relative'; c.style.marginBottom = '40px'; gsap.set(c, { autoAlpha: 1, y: 0 }); });
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: {
        trigger: story, start: 'top top', end: '+=520%', pin: true, scrub: 1,
        onUpdate: (st) => show(Math.min(5, Math.floor(st.progress * 6 * 0.999))),
      },
    });
    // 01 · the form — the star waits faintly in the negative space
    tl.to(star, { opacity: 0.45, duration: 1 }, 0)
      // 02 · upper crescent: global reach
      .to(gB, { opacity: 0.12 }, 1)
      .to(q('.ss-reach'), { opacity: 1 }, 1)
      .to(q('.ss-tA'), { opacity: 1 }, 1.2)
      .to(gA, { x: -18, y: -18 }, 1)
      // 03 · downward crescent: local authority & canopy
      .to(gA, { opacity: 0.12, x: 0, y: 0 }, 2)
      .to(gB, { opacity: 1, x: 18, y: 18 }, 2)
      .to([q('.ss-reach'), q('.ss-tA')], { opacity: 0 }, 2)
      .to(q('.ss-canopy'), { opacity: 1 }, 2)
      .to(q('.ss-tB'), { opacity: 1 }, 2.2)
      // 04 · the moment of joining
      .to([q('.ss-canopy'), q('.ss-tB')], { opacity: 0, duration: 0.5 }, 3)
      .to(gA, { opacity: 1, x: -110, y: -110, duration: 0.5 }, 3)
      .to(gB, { opacity: 1, x: 110, y: 110, duration: 0.5 }, 3)
      .to(star, { opacity: 0, duration: 0.3 }, 3)
      .to([gA, gB], { x: 0, y: 0, duration: 0.5, ease: 'power3.in' }, 3.5)
      // 05 · the emergent star
      .to(star, { opacity: 1, scale: 1.35, duration: 0.35, ease: 'back.out(3)' }, 4)
      .to(q('.ss-halo'), { opacity: 1, duration: 0.6 }, 4)
      .to(star, { scale: 1, duration: 0.6 }, 4.4)
      // 06 · the optical pathway
      .to(q('.ss-path'), { opacity: 1, duration: 0.5 }, 5)
      .fromTo($$('.ss-path path', story), { strokeDashoffset: 160 }, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 5)
      .to(q('.ss-rings'), { opacity: 1, duration: 0.4 }, 5.2)
      .fromTo(q('.ss-rings'), { scale: 0.6 }, { scale: 1.05, duration: 0.8 }, 5.2)
      .to(q('.ss-halo'), { opacity: 0.55, duration: 0.6 }, 5.4);
  }

  /* ---------- Geometry: construct, then let the visitor isolate each idea ---------- */
  const geo = $('#geoMain');
  if (geo) {
    const groups = { arcs: $('.gg-arcs', geo), star: $('.gg-star', geo), horizon: $('.gg-horizon', geo), square: $('.gg-square', geo) };
    const mark = $('.g-mark', geo), starFill = $('.gg-starfill', geo);
    const lines = $$('.g-line', geo);
    lines.forEach((l) => { l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1'; l.style.strokeDashoffset = SKY.reduce ? '0' : '1'; });
    if (!SKY.reduce) {
      gsap.set(mark, { opacity: 0 });
      gsap.set($$('.g-dot', geo), { scale: 0, transformOrigin: '50% 50%' });
      SKY.onReady(() => {
        SKY.inView(geo, () => gsap.timeline()
            .to(lines, { strokeDashoffset: 0, duration: 1.8, stagger: 0.07, ease: 'power2.inOut' })
            .to($$('.g-dot', geo), { scale: 1, stagger: 0.05, duration: 0.5, ease: 'back.out(3)' }, 0.8)
            .to(mark, { opacity: 0.92, duration: 1.4 }, 1.4), '0px 0px -20% 0px');
      });
    }
    const tabs = $$('.geo-tab');
    const pick = (key) => {
      tabs.forEach((t) => t.setAttribute('aria-pressed', t.dataset.g === key));
      Object.entries(groups).forEach(([k, g]) => gsap.to(g, { opacity: !key || k === key ? 1 : 0.12, duration: 0.6 }));
      gsap.to(mark, { opacity: key ? (key === 'arcs' ? 0.75 : 0.35) : 0.92, duration: 0.6 });
      gsap.to(starFill, { opacity: key === 'star' ? 1 : 0, duration: 0.6 });
    };
    tabs.forEach((t) => t.addEventListener('click', () => pick(t.getAttribute('aria-pressed') === 'true' ? null : t.dataset.g)));
  }

  /* ---------- Foundations: the sticky mark answers each value ---------- */
  const fa = $('.found__art');
  if (fa) {
    const A = $('.fa-gA', fa), B = $('.fa-gB', fa), S = $('.fa-star', fa), H = $('.fa-halo', fa);
    gsap.set(S, { transformOrigin: '50% 50%' });
    const states = {
      star: () => [gsap.to([A, B], { opacity: 0.35, x: 0, y: 0 }), gsap.to(S, { opacity: 1, scale: 1.3 }), gsap.to(H, { opacity: 1 })],
      both: () => [gsap.to(A, { opacity: 1, x: -26, y: -26 }), gsap.to(B, { opacity: 1, x: 26, y: 26 }), gsap.to(S, { opacity: 0.1, scale: 1 }), gsap.to(H, { opacity: 0.15 })],
      join: () => [gsap.to([A, B], { opacity: 1, x: 0, y: 0, ease: 'power3.in', duration: 0.7 }), gsap.to(S, { opacity: 1, scale: 1, delay: 0.5 }), gsap.to(H, { opacity: 0.7, delay: 0.5 })],
      b: () => [gsap.to(A, { opacity: 0.15, x: 0, y: 0 }), gsap.to(B, { opacity: 1, x: 0, y: 0 }), gsap.to(S, { opacity: 0.2, scale: 1 }), gsap.to(H, { opacity: 0.1 })],
    };
    SKY.onReady(() => {
      $$('.found__list li').forEach((li) => {
        ScrollTrigger.create({
          trigger: li, start: 'top 60%', end: 'bottom 60%',
          onToggle: (st) => {
            li.style.opacity = st.isActive ? 1 : 0.4;
            if (st.isActive) states[li.dataset.f]();
          },
        });
        li.style.opacity = 0.4;
        li.style.transition = 'opacity .5s';
      });
    });
  }
})();
