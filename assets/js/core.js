/* ==========================================================================
   SKY RE — core motion engine
   Smooth scroll · page transitions · loader · starfield · cursor · reveals
   ========================================================================== */
(function () {
  'use strict';

  const SKY = (window.SKY = window.SKY || {});
  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  SKY.reduce = reduce;
  SKY.fine = fine;
  SKY.$ = $;
  SKY.$$ = $$;
  SKY.clamp = clamp;
  SKY.lerp = lerp;
  SKY.pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false };
  SKY.vel = 0;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 1.2 });

  /* ---------------- Ready orchestration ---------------- */
  let readyResolve;
  let isReady = false;
  SKY.ready = new Promise((r) => (readyResolve = r));
  SKY.onReady = (fn) => (isReady ? fn() : SKY.ready.then(fn));
  function markReady() {
    if (isReady) return;
    isReady = true;
    readyResolve();
    html.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('sky:ready'));
  }

  /* ---------------- Logo geometry helpers ---------------- */
  const PATH_IDS = ['s0', 's1', 's2', 's3', 'star'];
  SKY.paths = {};
  PATH_IDS.forEach((id) => {
    const el = document.getElementById('sr-' + id);
    if (el) SKY.paths[id] = el.getAttribute('d');
  });
  SKY.STAR_C = { x: 271.06, y: 275.36 };
  SKY.LOGO = 543.4;
  SKY.path2d = (id) => new Path2D(SKY.paths[id]);
  SKY.COLORS = { night: '#00141f', indigo: '#091d3c', gold: '#947b4c', goldL: '#c2a56f', goldXL: '#e2cfa5', sky: '#87a7c6', cloud: '#f3ead9' };

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', (e) => {
      SKY.vel = e.velocity || 0;
      ScrollTrigger.update();
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let last = scrollY;
    addEventListener('scroll', () => {
      SKY.vel = scrollY - last;
      last = scrollY;
    }, { passive: true });
  }
  SKY.lenis = lenis;
  // velocity decays when using native scrolling
  gsap.ticker.add(() => {
    if (!lenis) SKY.vel *= 0.9;
  });

  const hdrH = () => ($('.hdr') ? $('.hdr').offsetHeight : 0);
  SKY.scrollTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? $(target) : target;
    const offset = opts.offset != null ? opts.offset : -hdrH() + 1;
    if (lenis) lenis.scrollTo(el != null ? el : target, { offset, duration: opts.duration || 1.6, immediate: !!opts.immediate });
    else {
      const y = typeof target === 'number' ? target : el.getBoundingClientRect().top + scrollY + offset;
      scrollTo({ top: y, behavior: opts.immediate || reduce ? 'auto' : 'smooth' });
    }
  };

  // in-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    SKY.scrollTo(el);
    history.replaceState(null, '', url.hash);
  });

  /* ---------------- Header ---------------- */
  const hdr = $('.hdr');
  if (hdr) {
    const page = body.dataset.page;
    $$('[data-nav]', hdr).forEach((a) => {
      if (a.dataset.nav.split(' ').includes(page)) a.setAttribute('aria-current', 'page');
    });
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('#menu a').forEach((a) => a.getAttribute('href') === file && a.setAttribute('aria-current', 'page'));
    /* Hide after a deliberate scroll down, return after a deliberate scroll up.
       The header remembers the furthest point reached in the current direction
       (a high/low-water mark), so easing tails and small jitters never flip it;
       each change is also held briefly before it can reverse. */
    const TOP = 160, HIDE_AFTER = 120, SHOW_AFTER = 80, HOLD = 450;
    let hidden = false, mark = scrollY, heldUntil = 0;
    const setHidden = (v) => {
      if (v === hidden) return;
      hidden = v;
      mark = scrollY;
      hdr.classList.toggle('is-hidden', v);
      heldUntil = performance.now() + HOLD;
    };
    SKY.showHeader = () => setHidden(false);
    const kbFocus = (el) => { try { return el.matches(':focus-visible'); } catch (e) { return false; } };
    const onScroll = () => {
      const y = Math.max(0, scrollY);
      hdr.classList.toggle('is-solid', y > 40);
      if (y < TOP || body.classList.contains('menu-open') || (document.activeElement && hdr.contains(document.activeElement) && kbFocus(document.activeElement))) { setHidden(false); mark = y; return; }
      // visible: mark is the highest point since shown; hidden: the lowest since hidden
      mark = hidden ? Math.max(mark, y) : Math.min(mark, y);
      if (performance.now() < heldUntil) return;
      if (!hidden && y - mark > HIDE_AFTER) setHidden(true);
      else if (hidden && mark - y > SHOW_AFTER) setHidden(false);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // a mouse heading for the top edge brings the header back
    addEventListener('pointermove', (e) => { if (hidden && e.pointerType === 'mouse' && e.clientY < 24) SKY.showHeader(); }, { passive: true });
    hdr.addEventListener('focusin', (e) => kbFocus(e.target) && SKY.showHeader());
    $$('.has-mega', hdr).forEach((li) => {
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          li.classList.remove('open');
          li.querySelector('.nav-a').focus();
        }
      });
      li.addEventListener('mouseleave', () => li.classList.remove('open'));
    });
  }

  /* ---------------- Full-screen menu ---------------- */
  const burger = $('.burger');
  const menu = $('#menu');
  let menuTl = null;
  function openMenu() {
    if (!menu) return;
    body.classList.add('menu-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    lenis && lenis.stop();
    menuTl && menuTl.kill();
    menuTl = gsap.timeline()
      .fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 1.1, ease: 'expo.inOut' })
      .fromTo($$('.menu__list a', menu), { yPercent: 110 }, { yPercent: 0, stagger: 0.05, duration: 1.1 }, 0.35)
      .fromTo($('.menu__orbit', menu), { rotate: -40, scale: 0.8, opacity: 0 }, { rotate: 0, scale: 1, opacity: 0.5, duration: 1.8 }, 0.3)
      .fromTo($('.menu__foot', menu), { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.7);
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menuTl && menuTl.kill();
    menuTl = gsap.timeline({
      onComplete() {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        body.classList.remove('menu-open');
        lenis && lenis.start();
      },
    }).to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.8, ease: 'expo.inOut' });
  }
  SKY.closeMenu = closeMenu;
  burger && burger.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
  addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

  /* ---------------- Pointer ---------------- */
  addEventListener('pointermove', (e) => {
    const p = SKY.pointer;
    p.x = e.clientX;
    p.y = e.clientY;
    p.nx = (e.clientX / innerWidth) * 2 - 1;
    p.ny = (e.clientY / innerHeight) * 2 - 1;
    p.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => (SKY.pointer.active = false));

  /* ---------------- Custom cursor ---------------- */
  const cur = $('.cur');
  if (cur && fine && !reduce) {
    html.classList.add('has-cursor');
    const ring = $('.cur__ring', cur);
    const dot = $('.cur__dot', cur);
    const lbl = $('.cur__lbl', cur);
    const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
    const lx = gsap.quickTo(lbl, 'x', { duration: 0.55, ease: 'power3' });
    const ly = gsap.quickTo(lbl, 'y', { duration: 0.55, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      rx(e.clientX); ry(e.clientY); lx(e.clientX); ly(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, [role="tab"], label, summary, input, textarea, select');
      cur.classList.remove('is-link', 'is-label');
      if (!t) return;
      if (t.dataset.cursor) {
        lbl.textContent = t.dataset.cursor;
        cur.classList.add('is-label');
      } else if (!t.matches('input, textarea, select')) cur.classList.add('is-link');
    });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.3 }));
    document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.3 }));
  }

  /* ---------------- Magnetic ---------------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach((el) => {
      const s = parseFloat(el.dataset.magnetic) || 0.28;
      const qx = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, .45)' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, .45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * s);
        qy((e.clientY - (r.top + r.height / 2)) * s);
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------------- Canvas loop helper ---------------- */
  // SKY.canvas(canvas, draw(ctx, w, h, t, dt, state), opts) -> state
  SKY.canvas = function (cv, draw, opts = {}) {
    const ctx = cv.getContext('2d');
    const st = { ctx, w: 0, h: 0, dpr: 1, t: 0, visible: false, p: { x: -9999, y: -9999, inside: false, sx: -9999, sy: -9999 }, cv };
    const dprMax = opts.dpr || 2;
    function size() {
      const r = cv.getBoundingClientRect();
      st.dpr = Math.min(devicePixelRatio || 1, dprMax);
      st.w = Math.max(1, r.width);
      st.h = Math.max(1, r.height);
      cv.width = Math.round(st.w * st.dpr);
      cv.height = Math.round(st.h * st.dpr);
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      opts.resize && opts.resize(st);
      if (reduce || !st.visible) draw(ctx, st.w, st.h, st.t, 0, st);
    }
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const host = opts.pointerHost || cv;
    host.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      st.p.x = e.clientX - r.left;
      st.p.y = e.clientY - r.top;
      st.p.inside = true;
    }, { passive: true });
    host.addEventListener('pointerleave', () => (st.p.inside = false));
    const io = new IntersectionObserver(([en]) => (st.visible = en.isIntersecting), { rootMargin: '120px' });
    io.observe(cv);
    (SKY._observers = SKY._observers || []).push(io, ro);
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (st.visible && !document.hidden && !reduce) {
        st.t += dt;
        // smoothed pointer
        if (st.p.inside) {
          if (st.p.sx < -999) { st.p.sx = st.p.x; st.p.sy = st.p.y; }
          st.p.sx = lerp(st.p.sx, st.p.x, 0.12);
          st.p.sy = lerp(st.p.sy, st.p.y, 0.12);
        }
        ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
        draw(ctx, st.w, st.h, st.t, dt, st);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    size();
    st.redraw = () => draw(ctx, st.w, st.h, st.t, 0, st);
    return st;
  };

  /* ---------------- Background starfield ---------------- */
  (function starfield() {
    const cv = $('#sky');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, stars = [], shooters = [], nextShoot = 3;
    const cols = ['243,234,217', '185,205,224', '135,167,198', '226,207,165'];
    function build() {
      dpr = Math.min(devicePixelRatio || 1, 1.75);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      const n = clamp(Math.round((W * H) / 2300), 220, 900);
      stars = [];
      for (let i = 0; i < n; i++) {
        const z = Math.pow(Math.random(), 1.8) * 0.9 + 0.1;
        stars.push({
          x: Math.random() * W, y: Math.random() * H, z,
          r: 0.25 + z * 1.25 * (Math.random() < 0.04 ? 1.8 : 1),
          ph: Math.random() * Math.PI * 2, sp: 0.4 + Math.random() * 1.6,
          c: cols[Math.random() < 0.06 ? 3 : Math.random() < 0.4 ? 1 + ((Math.random() * 2) | 0) : 0],
        });
      }
    }
    build();
    addEventListener('resize', build);
    let t = 0, last = performance.now(), sy0 = scrollY, mx = 0, my = 0, warp = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        t += dt;
        const p = SKY.pointer;
        mx = lerp(mx, p.nx, 0.04);
        my = lerp(my, p.ny, 0.04);
        warp = lerp(warp, clamp(SKY.vel, -60, 60), 0.12);
        const sy = scrollY;
        const dy = sy - sy0;
        sy0 = sy;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const near = [];
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.y -= dy * s.z * 0.18;
          if (s.y < -10) s.y += H + 20;
          else if (s.y > H + 10) s.y -= H + 20;
          const x = s.x + mx * s.z * 26;
          const y = s.y + my * s.z * 18;
          const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
          const a = (0.25 + s.z * 0.75) * tw;
          const streak = warp * s.z * 0.9;
          if (Math.abs(streak) > 1.2 && !reduce) {
            ctx.strokeStyle = `rgba(${s.c},${a * 0.8})`;
            ctx.lineWidth = s.r * 1.1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + streak);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(${s.c},${a})`;
            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, 6.2832);
            ctx.fill();
            if (s.r > 1.5) {
              ctx.fillStyle = `rgba(${s.c},${a * 0.12})`;
              ctx.beginPath();
              ctx.arc(x, y, s.r * 4, 0, 6.2832);
              ctx.fill();
            }
          }
          if (p.active && fine && s.z > 0.35) {
            const d = Math.hypot(x - p.x, y - p.y);
            if (d < 150) near.push([x, y, d]);
          }
        }
        // constellation cursor
        if (near.length && !body.classList.contains('menu-open')) {
          near.sort((a, b) => a[2] - b[2]);
          const pts = near.slice(0, 6);
          ctx.lineWidth = 0.6;
          for (let i = 0; i < pts.length; i++) {
            const [x, y, d] = pts[i];
            ctx.strokeStyle = `rgba(194,165,111,${(1 - d / 150) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(SKY.pointer.x, SKY.pointer.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            if (i) {
              ctx.strokeStyle = `rgba(135,167,198,${(1 - d / 150) * 0.25})`;
              ctx.beginPath();
              ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
          }
        }
        // shooting stars
        nextShoot -= dt;
        if (nextShoot < 0 && !reduce) {
          nextShoot = 5 + Math.random() * 9;
          const ang = Math.PI * (0.15 + Math.random() * 0.12);
          shooters.push({ x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900, life: 0, max: 0.9 + Math.random() * 0.5 });
        }
        shooters = shooters.filter((s) => {
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const k = s.life / s.max;
          if (k >= 1) return false;
          const a = Math.sin(k * Math.PI);
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.12, s.y - s.vy * 0.12);
          g.addColorStop(0, `rgba(243,234,217,${a * 0.9})`);
          g.addColorStop(1, 'rgba(243,234,217,0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12);
          ctx.stroke();
          return true;
        });
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------------- Page transitions ---------------- */
  const tr = $('.tr');
  const TR = {};
  if (tr) {
    const svg = $('svg', tr);
    const els = {
      bg: $('.tr__bg', tr), mrect: $('.tr__mrect', tr), holeG: $('.tr__holeG', tr),
      coverG: $('.tr__coverG', tr), markG: $('.tr__markG', tr), mark: $('.tr__mark', tr),
      gA: $('.tr__gA', tr), gB: $('.tr__gB', tr), label: $('.tr__label', tr),
    };
    TR.els = els;
    // star groups are driven through proxies so the scale stays centred on the star
    const S = { hole: 0, cover: 0 };
    const apply = () => {
      els.holeG.setAttribute('transform', `translate(${TR.cx} ${TR.cy}) scale(${S.hole})`);
      els.coverG.setAttribute('transform', `translate(${TR.cx} ${TR.cy}) scale(${S.cover})`);
      els.markG.setAttribute('transform', `translate(${TR.cx} ${TR.cy}) scale(${TR.mk})`);
    };
    const size = () => {
      const w = innerWidth, h = innerHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      [els.bg, els.mrect].forEach((r) => { r.setAttribute('width', w); r.setAttribute('height', h); });
      TR.cx = w / 2; TR.cy = h / 2;
      // scale at which the star's concave core (r≈24) covers the whole viewport
      TR.big = (Math.hypot(w, h) / 2) / 22;
      TR.mk = (Math.min(w, h) * 0.2) / 543.4;
      apply();
    };
    size();
    addEventListener('resize', size);
    TR.S = S;
    TR.apply = apply;

    const NAMES = { 'index.html': 'Home', 'about.html': 'About Sky Re', 'portfolios.html': 'Portfolios', 'brand-story.html': 'The Brand Story', 'partners.html': 'Partners', 'team.html': 'Leadership & Team', 'resources.html': 'Resources', 'contact.html': 'Contact', 'legal.html': 'Legal & Regulatory', 'news.html': 'News & Insights', 'broker.html': 'Broker Information', 'claims.html': 'Claims Information', 'careers.html': 'Careers', 'property.html': 'Property', 'engineering.html': 'Engineering', 'casualty.html': 'Casualty', 'marine.html': 'Marine Cargo', 'energy.html': 'Energy', 'treaty.html': 'Treaty Reinsurance' };

    TR.leave = (href) => {
      const file = new URL(href, location.href).pathname.split('/').pop() || 'index.html';
      els.label.textContent = NAMES[file] || '';
      tr.style.visibility = 'visible';
      tr.classList.add('is-set');
      gsap.set(els.bg, { opacity: 0 });
      gsap.set(els.mark, { opacity: 1 });
      gsap.set(els.gA, { x: -170, y: -170, opacity: 0 });
      gsap.set(els.gB, { x: 170, y: 170, opacity: 0 });
      gsap.timeline({
        onComplete() {
          try { sessionStorage.setItem('sky-tr', '1'); } catch (e) {}
          location.href = href;
        },
      })
        .to(S, { cover: TR.big, duration: 0.85, ease: 'expo.in', onUpdate: apply })
        .to([els.gA, els.gB], { x: 0, y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.45)
        .to(els.label, { opacity: 1, duration: 0.4 }, 0.6)
        .set({}, {}, 1.05);
    };

    TR.enter = () => {
      tr.classList.add('is-set');
      tr.style.visibility = 'visible';
      gsap.set(els.bg, { opacity: 1 });
      S.cover = 0;
      S.hole = 0;
      apply();
      gsap.set(els.mark, { opacity: 1 });
      gsap.set([els.gA, els.gB], { x: 0, y: 0, opacity: 1 });
      return gsap.timeline({
        onComplete() {
          tr.style.visibility = 'hidden';
          html.classList.remove('tr-in');
          tr.classList.remove('is-set');
          gsap.set(els.label, { opacity: 0 });
        },
      })
        .to(els.gA, { x: -120, y: -120, opacity: 0, duration: 1.1, ease: 'expo.inOut' }, 0.05)
        .to(els.gB, { x: 120, y: 120, opacity: 0, duration: 1.1, ease: 'expo.inOut' }, 0.05)
        .to(S, { hole: TR.big, duration: 1.25, ease: 'expo.inOut', onUpdate: apply }, 0.15)
        .add(markReady, 0.6);
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.dataset.noTransition != null) return;
      const url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // same page (hash handled above)
      if (reduce) return;
      e.preventDefault();
      closeMenu();
      TR.leave(url.href);
    });

    addEventListener('pageshow', (e) => {
      if (e.persisted) {
        tr.style.visibility = 'hidden';
        html.classList.remove('tr-in');
        S.cover = 0;
        apply();
      }
    });
  }
  SKY.transition = TR;

  /* ---------------- Loader (home, once per session) ---------------- */
  function runLoader() {
    const ld = $('.loader');
    if (!ld || html.classList.contains('no-loader')) return false;
    lenis && lenis.stop();
    const mark = $('.loader__mark', ld);
    const wm = $('.loader__wm', ld);
    const src = document.getElementById('sr-wm-en');
    if (wm && src) $$('path', src).forEach((p) => wm.appendChild(p.cloneNode()));
    const letters = wm ? $$('path', wm) : [];
    const pct = $('.loader__pct span', ld);
    const bar = $('.loader__bar', ld);
    const counter = { v: 0 };
    gsap.set($('.gA', mark), { x: -320, y: -320, opacity: 0 });
    gsap.set($('.gB', mark), { x: 320, y: 320, opacity: 0 });
    gsap.set($('.ld-star', mark), { scale: 0, transformOrigin: '50% 50%', opacity: 0 });
    gsap.set($('.ld-halo', mark), { scale: 0, transformOrigin: '50% 50%', opacity: 0 });
    gsap.set(letters, { opacity: 0, y: 14 });
    const tl = gsap.timeline({
      onComplete() {
        try { sessionStorage.setItem('sky-seen', '1'); } catch (e) {}
        lenis && lenis.start();
        ld.remove();
      },
    });
    tl.to(counter, { v: 100, duration: 2.9, ease: 'power2.inOut', onUpdate: () => { pct.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0)
      .to(bar, { scaleX: 1, duration: 2.9, ease: 'power2.inOut' }, 0)
      .to($('.gA', mark), { x: 0, y: 0, opacity: 1, duration: 1.9, ease: 'expo.out' }, 0.2)
      .to($('.gB', mark), { x: 0, y: 0, opacity: 1, duration: 1.9, ease: 'expo.out' }, 0.2)
      .to($('.ld-halo', mark), { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' }, 1.25)
      .to($('.ld-star', mark), { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(3)' }, 1.3)
      .to($('.loader__flare', ld), { scaleX: 1, opacity: 1, duration: 0.6, ease: 'expo.out' }, 1.3)
      .to($('.loader__flare', ld), { opacity: 0, duration: 0.8 }, 1.9)
      .to(letters, { opacity: 1, y: 0, stagger: 0.06, duration: 0.9 }, 1.5)
      .to($('.loader__stage', ld), { scale: 1.25, opacity: 0, duration: 1, ease: 'expo.in' }, 3.0)
      .to($('.loader__meta', ld), { opacity: 0, duration: 0.5 }, 3.0)
      .add(markReady, 3.55)
      .to(ld, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 3.6);
    const skip = $('.loader__skip', ld);
    skip && skip.addEventListener('click', () => tl.progress(1));
    return true;
  }

  /* ---------------- Reveals ---------------- */
  // fire once when an element enters the viewport (also when it is already in view on load)
  const observers = (SKY._observers = SKY._observers || []); // hold references so observers are never garbage-collected
  SKY.inView = (els, fn, margin = '0px 0px -10% 0px') => {
    const io = new IntersectionObserver((entries) => {
      const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      hits.forEach((el) => io.unobserve(el));
      if (hits.length) fn(hits);
    }, { rootMargin: margin });
    (els.length != null ? Array.from(els) : [els]).forEach((el) => io.observe(el));
    observers.push(io);
    return io;
  };

  function initReveals() {
    // fade/translate reveals, staggered per batch of elements entering together
    SKY.inView($$('[data-reveal]'), (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, stagger: 0.09, duration: 1.4, delay: 0.05, overwrite: true }));

    // photographs open through the Sky Re star (see .ph in pages.css)
    const photos = $$('.ph').filter((el) => !el.closest('.modal'));
    if (reduce) photos.forEach((el) => el.style.setProperty('--s', 220));
    else SKY.inView(photos, (b) => gsap.to(b, { '--s': 220, duration: 1.8, stagger: 0.12, ease: 'expo.out' }), '0px 0px -8% 0px');

    // split headline lines
    if (window.SplitText) {
      $$('[data-split]').forEach((el) => {
        const mode = el.dataset.split || 'lines';
        const split = new SplitText(el, mode === 'chars' ? { type: 'lines,chars', mask: 'lines', linesClass: 'split-line' } : { type: 'lines', mask: 'lines', linesClass: 'split-line' });
        el.style.visibility = 'visible';
        const targets = mode === 'chars' ? split.chars : split.lines;
        gsap.set(targets, { yPercent: 115 });
        const play = () => gsap.to(targets, { yPercent: 0, stagger: mode === 'chars' ? 0.018 : 0.11, duration: 1.5, delay: parseFloat(el.dataset.delay || 0) });
        if (el.hasAttribute('data-now')) play();
        else SKY.inView(el, play, '0px 0px -6% 0px');
      });

      // word-by-word illumination on scroll
      $$('[data-words]').forEach((el) => {
        const split = new SplitText(el, { type: 'words', wordsClass: 'w' });
        el.classList.add('words-dim');
        const light = el.closest('.light');
        gsap.to(split.words, {
          color: light ? '#091d3c' : '#f3ead9',
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 },
        });
      });
    } else {
      $$('[data-split]').forEach((el) => (el.style.visibility = 'visible'));
    }

    // counters
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const pad = parseInt(el.dataset.pad || '0', 10);
      const o = { v: parseFloat(el.dataset.from || 0) };
      SKY.inView(el, () => gsap.to(o, { v: end, duration: 2.4, ease: 'expo.out', onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(pad, '0')) }));
    });

    // parallax
    $$('[data-parallax]').forEach((el) => {
      const k = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: -k * 100 }, { yPercent: k * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // SVG stroke drawing
    $$('[data-draw]').forEach((svg) => {
      const paths = $$('path, circle, line, rect, ellipse, polyline', svg).filter((p) => !p.closest('[data-nodraw]'));
      paths.forEach((p) => { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
      SKY.inView(svg, () => gsap.to(paths, { strokeDashoffset: 0, duration: 2.2, stagger: 0.06, ease: 'power2.inOut' }));
    });

    // footer giant wordmark
    const giant = $('.ftr__giant');
    if (giant) {
      const wmPaths = $$('.wm path', giant).length ? $$('.wm path', giant) : null;
      gsap.fromTo(giant, { yPercent: 30, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } });
      void wmPaths;
    }
  }

  /* ---------------- Marquee ---------------- */
  function initMarquees() {
    $$('.marq').forEach((m) => {
      const track = $('.marq__track', m);
      if (!track) return;
      const dur = parseFloat(m.dataset.speed || 38);
      const tw = gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });
      if (m.dataset.reverse != null) tw.reversed(true), tw.progress(1);
      let ts = 1;
      gsap.ticker.add(() => {
        const target = 1 + Math.min(Math.abs(SKY.vel) / 4, 7);
        ts = lerp(ts, target, 0.08);
        tw.timeScale(ts * (SKY.vel < -0.5 ? -1 : 1) * (m.dataset.reverse != null ? -1 : 1));
      });
    });
  }

  /* ---------------- Tabs ---------------- */
  SKY.tabs = function (root) {
    const tabs = $$('[role="tab"]', root);
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(x.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (on && !reduce) gsap.fromTo(panel.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.8 });
        }
      });
      focus && t.focus();
      root.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: t, index: tabs.indexOf(t) } }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
        }
      });
    });
    return { select: (i) => select(tabs[i]) };
  };
  $$('[data-tabs]').forEach((r) => SKY.tabs(r));

  /* ---------------- Progress ring / back to top ---------------- */
  const prog = $('.prog');
  if (prog) {
    const c = $('circle', prog);
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const k = max > 0 ? scrollY / max : 0;
      c.style.strokeDashoffset = String(1 - k);
      prog.classList.toggle('on', scrollY > 500);
    };
    addEventListener('scroll', upd, { passive: true });
    upd();
    prog.addEventListener('click', () => SKY.scrollTo(0, { offset: 0, duration: 2 }));
  }
  $$('[data-top]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); SKY.scrollTo(0, { offset: 0, duration: 2 }); }));

  /* ---------------- Toast ---------------- */
  const toast = $('.toast');
  let toastT;
  SKY.toast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('on'), 2600);
  };

  // copy-to-clipboard
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => SKY.toast('Copied ' + b.dataset.copy));
  });

  $$('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));

  /* ---------------- Generated celestial glyphs ---------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent && parent.appendChild(el);
    return el;
  };
  SKY.svg = mk;

  // radiant star: the Sky Re star at the centre with `total` rays, `lit` of them glowing
  // (or only ray `only`). Used wherever a sequence or a ranking is shown.
  SKY.rays = (svg, total, lit, only) => {
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.innerHTML = '';
    mk('circle', { class: 'ring', cx: 50, cy: 50, r: 46 }, svg);
    for (let i = 0; i < total; i++) {
      const a = -Math.PI / 2 + (i / total) * Math.PI * 2;
      const on = only != null ? i === only : i < lit;
      const r0 = 17, r1 = on ? 44 : 34;
      mk('line', { class: 'ray' + (on ? ' on' : ''), x1: 50 + Math.cos(a) * r0, y1: 50 + Math.sin(a) * r0, x2: 50 + Math.cos(a) * r1, y2: 50 + Math.sin(a) * r1 }, svg);
      if (on) mk('circle', { class: 'tip', cx: 50 + Math.cos(a) * r1, cy: 50 + Math.sin(a) * r1, r: 2.2 }, svg);
    }
    mk('path', { class: 'core', d: 'M50 32C52 44 56 48 68 50C56 52 52 56 50 68C48 56 44 52 32 50C44 48 48 44 50 32Z' }, svg);
  };
  $$('[data-rays]').forEach((s) => {
    const [lit, total] = s.dataset.rays.split('/').map(Number);
    SKY.rays(s, total, lit, s.dataset.only != null ? +s.dataset.only : null);
  });

  // a deterministic constellation drawn from a person's name
  SKY.avatar = (svg, name) => {
    let h = 2166136261;
    for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.innerHTML = '';
    mk('circle', { class: 'ring', cx: 50, cy: 50, r: 48 }, svg);
    const n = 6 + Math.floor(rnd() * 3);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.8;
      const r = 12 + rnd() * 24;
      pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
    }
    // an open chain around the centre, with one spur, reads like a real asterism
    mk('polyline', { class: 'ln', points: pts.slice(0, n - 1).map((p) => p.join(',')).join(' ') }, svg);
    const hub = 1 + Math.floor(rnd() * (n - 3));
    mk('line', { class: 'ln', x1: pts[hub][0], y1: pts[hub][1], x2: pts[n - 1][0], y2: pts[n - 1][1], opacity: 0.6 }, svg);
    pts.forEach((p, i) => mk('circle', { class: 'st' + (i % 3 === 0 ? ' st--b' : ''), cx: p[0], cy: p[1], r: i % 3 === 0 ? 2.4 : 1.5 }, svg));
    const ini = name.split(/\s+/).filter(Boolean);
    svg.setAttribute('data-initials', (ini[0][0] + (ini.length > 1 ? ini[ini.length - 1][0] : '')).toUpperCase());
  };
  $$('[data-avatar]').forEach((s) => SKY.avatar(s, s.dataset.avatar));

  /* ---------------- Boot ---------------- */
  function boot() {
    // never let a slow web-font request hold the experience hostage
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const fontsReady = Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]);
    initMarquees();
    // wait for every page script to run, so elements they create are revealed too
    const domReady = new Promise((r) => (document.readyState === 'loading' ? addEventListener('DOMContentLoaded', r) : r()));
    Promise.all([SKY.ready, fontsReady, domReady]).then(() => {
      initReveals();
      ScrollTrigger.refresh();
      // honour an incoming hash once layout settled
      if (location.hash) {
        const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) setTimeout(() => SKY.scrollTo(el, { immediate: true }), 60);
      }
      fonts.then(() => ScrollTrigger.refresh());
    });
    if (runLoader()) return;
    if (html.classList.contains('tr-in') && SKY.transition.enter) SKY.transition.enter();
    else markReady();
  }
  boot();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
