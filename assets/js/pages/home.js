/* SKY RE — Home page interactions */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, clamp, lerp } = SKY;
  const TAU = Math.PI * 2;

  /* ---------- Capacity ⇄ Risk field ---------- */
  const flowCv = $('#flowCv');
  if (flowCv) {
    const wrap = flowCv.parentElement;
    const lblL = $('.flow__lbl--l', wrap), lblR = $('.flow__lbl--r', wrap);
    let galaxy = [], ground = [], cap = [], risk = [], bias = 0.5, pulse = 0;
    const bez = (a, c, b, t) => {
      const u = 1 - t;
      return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
    };
    SKY.canvas(flowCv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const m = Math.min(w, h);
      const L = [w * 0.2, h * 0.52], R = [w * 0.8, h * 0.56], C = [w * 0.5, h * 0.5];
      bias = lerp(bias, st.p.inside ? st.p.x / w : 0.5, 0.05);
      const capW = clamp(1.25 - bias, 0.35, 1), riskW = clamp(bias + 0.25, 0.35, 1);
      if (lblL) lblL.style.opacity = 0.45 + capW * 0.55;
      if (lblR) lblR.style.opacity = 0.45 + riskW * 0.55;

      // global capacity — a slow spiral galaxy
      const gr = m * 0.19;
      for (const s of galaxy) {
        const a = s.a + t * 0.08 * (1.2 - s.r);
        const x = L[0] + Math.cos(a) * s.r * gr;
        const y = L[1] + Math.sin(a) * s.r * gr * 0.55;
        ctx.fillStyle = `rgba(185,205,224,${(0.25 + 0.6 * (1 - s.r)) * capW})`;
        ctx.beginPath(); ctx.arc(x, y, s.z, 0, TAU); ctx.fill();
      }
      SKY.glow(ctx, L[0], L[1], gr * 0.7, '135,167,198', 0.22 * capW);

      // local market — the protective canopy over a field of city lights
      const cw = m * 0.2;
      ctx.strokeStyle = `rgba(194,165,111,${0.55 * riskW})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(R[0], R[1] + cw * 0.35, cw, cw * 0.85, 0, Math.PI, TAU); ctx.stroke();
      ctx.strokeStyle = `rgba(194,165,111,${0.18 * riskW})`;
      ctx.beginPath(); ctx.ellipse(R[0], R[1] + cw * 0.35, cw * 1.15, cw, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      for (const g of ground) {
        const x = R[0] + g.x * cw, y = R[1] + cw * 0.35 + g.y * cw * 0.28;
        const tw = 0.5 + 0.5 * Math.sin(t * g.s + g.p);
        ctx.fillStyle = `rgba(226,207,165,${(0.25 + tw * 0.6) * riskW})`;
        ctx.fillRect(x, y - g.h * cw * 0.25, 1.4, g.h * cw * 0.25);
      }

      // flows
      const lane = (o, up) => [C[0], C[1] + (up ? -1 : 1) * m * (0.1 + o * 0.12)];
      const flow = (arr, from, to, up, rgb, weight) => {
        for (const p of arr) {
          p.t += dt * p.s * (0.6 + weight * 0.7);
          if (p.t > 1) { p.t -= 1; p.o = Math.random(); }
          const k = p.t;
          const a = [from[0] + p.dx * m * 0.1, from[1] + p.dy * m * 0.08];
          const b = [to[0] + p.dy * m * 0.08, to[1] + p.dx * m * 0.06];
          const c = lane(p.o, up);
          const q = k < 0.5 ? bez(a, [lerp(a[0], C[0], 0.6), c[1]], C, k * 2) : bez(C, [lerp(C[0], b[0], 0.4), c[1]], b, (k - 0.5) * 2);
          const alpha = Math.sin(k * Math.PI) * weight;
          SKY.glow(ctx, q[0], q[1], 7, rgb, 0.55 * alpha);
          ctx.fillStyle = `rgba(${rgb},${alpha})`;
          ctx.beginPath(); ctx.arc(q[0], q[1], 1.6, 0, TAU); ctx.fill();
          if (Math.abs(k - 0.5) < 0.01) pulse = 1;
        }
      };
      // faint guides
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = 'rgba(135,167,198,.22)';
      ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.quadraticCurveTo(lerp(L[0], C[0], 0.6), C[1] - m * 0.16, C[0], C[1]); ctx.quadraticCurveTo(lerp(C[0], R[0], 0.4), C[1] - m * 0.16, R[0], R[1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(194,165,111,.22)';
      ctx.beginPath(); ctx.moveTo(R[0], R[1]); ctx.quadraticCurveTo(lerp(R[0], C[0], 0.6), C[1] + m * 0.16, C[0], C[1]); ctx.quadraticCurveTo(lerp(C[0], L[0], 0.4), C[1] + m * 0.16, L[0], L[1]); ctx.stroke();
      ctx.setLineDash([]);
      flow(cap, L, R, true, '185,205,224', capW);
      flow(risk, R, L, false, '226,207,165', riskW);

      // Sky Re at the centre
      pulse *= 0.94;
      SKY.glow(ctx, C[0], C[1], m * 0.2, '226,207,165', 0.12 + pulse * 0.1);
      ctx.strokeStyle = 'rgba(194,165,111,.35)';
      ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.arc(C[0], C[1], m * 0.13, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      SKY.drawMark(ctx, C[0], C[1], m * 0.17, { star: 0.55 + pulse * 0.45 });
      ctx.fillStyle = 'rgba(243,234,217,.7)';
      ctx.font = `600 ${Math.max(9, m * 0.018)}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText('SKY RE · MGA', C[0], C[1] + m * 0.17);
    }, {
      resize: () => {
        galaxy = Array.from({ length: 260 }, () => {
          const arm = Math.random() < 0.5 ? 0 : Math.PI;
          const r = Math.pow(Math.random(), 0.7);
          return { r, a: arm + r * 4.2 + (Math.random() - 0.5) * 0.9, z: Math.random() * 1.3 + 0.3 };
        });
        ground = Array.from({ length: 70 }, () => ({ x: (Math.random() - 0.5) * 1.8, y: Math.random(), h: Math.random() * 0.9 + 0.1, s: 1 + Math.random() * 2, p: Math.random() * TAU }));
        const mk = () => ({ t: Math.random(), s: 0.08 + Math.random() * 0.08, o: Math.random(), dx: Math.random() - 0.5, dy: Math.random() - 0.5 });
        cap = Array.from({ length: 60 }, mk);
        risk = Array.from({ length: 60 }, mk);
      },
      pointerHost: wrap,
    });
  }

  /* ---------- Portfolio orbit ---------- */
  const orb = $('#orbSvg');
  if (orb) {
    const NS = 'http://www.w3.org/2000/svg';
    const back = $('#orbBack'), front = $('#orbFront');
    const name = $('#orbName'), desc = $('#orbDesc');
    const links = $$('.orb__list a');
    const DATA = [
      ['Property', 'Commercial & industrial assets, power plants and landmark mega-projects.', 'property'],
      ['Engineering', 'Construction, erection, machinery breakdown and renewable energy projects.', 'engineering'],
      ['Casualty', 'CGL (Energy & Non-Energy), third-party, cyber, project liability and PI.', 'casualty'],
      ['Marine Cargo', 'Annual or single transit, project cargo and Delay in Start-Up.', 'marine'],
      ['Energy', 'Upstream and downstream property damage, BI and machinery breakdown.', 'energy'],
      ['Treaty', 'Quota Share, Surplus, Risk XL, Catastrophe XL and Aggregate XL.', 'treaty'],
    ];
    const defs = SKY.svg('defs', {}, orb);
    [['pgG', '#e2cfa5', '#5d4b2a'], ['pgS', '#dbe6f0', '#2b4a6c']].forEach(([id, a, b]) => {
      const g = SKY.svg('radialGradient', { id, cx: '35%', cy: '30%', r: '75%' }, defs);
      SKY.svg('stop', { offset: '0', 'stop-color': a }, g);
      SKY.svg('stop', { offset: '1', 'stop-color': b }, g);
    });
    const planets = DATA.map((d, i) => {
      const a = SKY.svg('a', { class: 'planet', href: d[2] + '.html', 'aria-label': d[0] });
      const g = SKY.svg('g', {}, a);
      SKY.svg('circle', { r: 38, fill: 'url(#sr-halo)', opacity: 0.25 }, g);
      if (i === 5) SKY.svg('ellipse', { rx: 34, ry: 9, fill: 'none', stroke: 'rgba(226,207,165,.7)', 'stroke-width': 1.4, transform: 'rotate(-18)' }, g);
      SKY.svg('circle', { class: 'body', r: i === 5 ? 18 : 14, fill: `url(#${i % 2 ? 'pgS' : 'pgG'})` }, g);
      const k = SKY.svg('text', { class: 'k', y: -30, 'text-anchor': 'middle' }, g);
      k.textContent = '0' + (i + 1);
      const tx = SKY.svg('text', { y: 44, 'text-anchor': 'middle' }, g);
      tx.textContent = d[0];
      a.addEventListener('pointerenter', () => focus(i));
      a.addEventListener('pointerleave', () => focus(-1));
      return { a, g, i };
    });
    let base = 0, speed = 0.08, target = null, active = -1;
    function focus(i) {
      active = i;
      links.forEach((l, j) => l.classList.toggle('is-on', j === i));
      if (i < 0) { target = null; name.textContent = 'Six portfolios'; desc.textContent = 'Hover a portfolio to bring it into focus.'; return; }
      name.textContent = DATA[i][0];
      desc.textContent = DATA[i][1];
      // bring the chosen planet to the front of the orbit (angle π/2)
      const want = Math.PI / 2 - (i / 6) * TAU;
      let diff = ((want - base) % TAU + TAU) % TAU;
      if (diff > Math.PI) diff -= TAU;
      target = base + diff;
    }
    links.forEach((l, i) => {
      l.addEventListener('pointerenter', () => focus(i));
      l.addEventListener('focus', () => focus(i));
      l.addEventListener('pointerleave', () => focus(-1));
      l.addEventListener('blur', () => focus(-1));
    });
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(orb);
    SKY._observers.push(io);
    let last = performance.now();
    (function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !SKY.reduce) {
        if (target != null) base = lerp(base, target, 0.06);
        else base += dt * speed;
      }
      planets.forEach((p) => {
        const ang = base + (p.i / 6) * TAU;
        const z = Math.sin(ang);
        const x = 400 + Math.cos(ang) * 300, y = 400 + z * 118;
        const s = (0.72 + 0.28 * (z + 1) / 2) * (p.i === active ? 1.3 : 1);
        p.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
        p.a.style.opacity = (0.45 + 0.55 * (z + 1) / 2).toFixed(2);
        const host = z < 0 ? back : front;
        if (p.a.parentNode !== host) host.appendChild(p.a);
      });
      requestAnimationFrame(tick);
    })(last);
  }

  /* ---------- Proof points: one illustration per fact ---------- */
  const STAR = 'M0 -1C.12 -.3 .3 -.12 1 0C.3 .12 .12 .3 0 1C-.12 .3 -.3 .12 -1 0C-.3 -.12 -.12 -.3 0 -1Z';
  const el = SKY.svg;
  const star = (g, x, y, r, cls = 'st') => el('path', { class: cls, d: STAR, transform: `translate(${x} ${y}) scale(${r})` }, g);
  const MX = {
    // six portfolios: six stars in one orbit around the mark
    orbit(svg, card) {
      el('ellipse', { class: 'l', cx: 110, cy: 65, rx: 96, ry: 36 }, svg);
      const mark = el('g', { transform: 'translate(110 65) scale(.1) translate(-271.06 -275.36)', style: '--o:#f3ead9;--i:#947b4c' }, svg);
      el('use', { href: '#sr-symbol' }, mark);
      const names = ['PROP', 'ENG', 'CAS', 'MAR', 'ENR', 'TRT'];
      const stars = names.map((n, i) => {
        const g = el('g', {}, svg);
        star(g, 0, 0, 6, i === 5 ? 'st-g' : 'st');
        const t = el('text', { y: -11, 'text-anchor': 'middle' }, g);
        t.textContent = n;
        return { g, t };
      });
      let a = 0, speed = 0.25, s = 0;
      gsap.set(stars.map((x) => x.g), { opacity: 0 });
      const go = () => gsap.to(stars.map((x) => x.g), { opacity: 1, stagger: 0.12, duration: 0.8 });
      const tick = () => {
        a += 0.016 * speed;
        s = lerp(s, card.matches(':hover, :focus-visible') ? 1 : 0, 0.08);
        speed = 0.25 + s * 1.2;
        stars.forEach((x, i) => {
          const ang = a + (i / 6) * TAU;
          const z = (Math.sin(ang) + 1) / 2;
          x.g.setAttribute('transform', `translate(${(110 + Math.cos(ang) * 96).toFixed(1)} ${(65 + Math.sin(ang) * 36).toFixed(1)}) scale(${(0.7 + z * 0.5).toFixed(2)})`);
          x.t.style.opacity = s * z;
        });
      };
      return { go, tick };
    },
    // five D&F lines: risk-by-risk paths converging into one star
    converge(svg) {
      const names = ['PROPERTY', 'ENGINEERING', 'CASUALTY', 'MARINE', 'ENERGY'];
      const paths = names.map((n, i) => {
        const y = 12 + i * 26;
        const d = `M8 ${y} C 90 ${y}, 120 65, 186 65`;
        el('path', { class: 'l', d }, svg);
        const p = el('path', { class: 'flow', d }, svg);
        const t = el('text', { x: 8, y: y - 4 }, svg);
        t.textContent = n;
        return p;
      });
      el('circle', { cx: 190, cy: 65, r: 16, fill: 'url(#sr-halo)', opacity: 0.6 }, svg);
      star(svg, 190, 65, 11, 'st-g');
      gsap.set(paths, { opacity: 0 });
      return { go: () => gsap.to(paths, { opacity: 0.8, stagger: 0.15, duration: 0.6 }) };
    },
    // five treaty structures: a layered programme; a loss rises through it on hover
    layers(svg, card) {
      const names = ['QUOTA SHARE', 'SURPLUS', 'RISK XL', 'CAT XL', 'AGG XL'];
      const rects = names.map((n, i) => {
        const w = 200 - i * 26, y = 104 - i * 24;
        const r = el('rect', { class: 'lay', x: 110 - w / 2, y, width: w, height: 18, rx: 3 }, svg);
        const t = el('text', { x: 110, y: y + 12.5, 'text-anchor': 'middle' }, svg);
        t.textContent = n;
        return { r, t, y };
      });
      const loss = el('line', { class: 'lg', x1: 4, x2: 216, y1: 124, y2: 124 }, svg);
      gsap.set(rects.map((x) => x.r), { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set(loss, { opacity: 0 });
      let tl;
      const rise = () => {
        tl && tl.kill();
        tl = gsap.timeline()
          .set(loss, { opacity: 1, attr: { y1: 124, y2: 124 } })
          .to(loss, { attr: { y1: 6, y2: 6 }, duration: 1.6, ease: 'power2.inOut', onUpdate() {
            const y = +loss.getAttribute('y1');
            rects.forEach((x) => { const hit = y < x.y + 18; x.r.classList.toggle('hit', hit); x.t.classList.toggle('on', hit); });
          } })
          .to(loss, { opacity: 0, duration: 0.4 })
          .add(() => rects.forEach((x) => { x.r.classList.remove('hit'); x.t.classList.remove('on'); }), '+=0.6');
      };
      card.addEventListener('pointerenter', rise);
      card.addEventListener('focus', rise);
      return { go: () => gsap.to(rects.map((x) => x.r), { scaleX: 1, stagger: 0.12, duration: 0.9, onComplete: rise }) };
    },
    // eight ways: eight rays of one star
    radiant(svg, card) {
      const g = el('g', { transform: 'translate(110 65)' }, svg);
      const rays = [];
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i / 8) * TAU;
        const r = el('line', { class: 'lg', x1: Math.cos(a) * 16, y1: Math.sin(a) * 16, x2: Math.cos(a) * 54, y2: Math.sin(a) * 54 }, g);
        const t = el('text', { x: Math.cos(a) * 64, y: Math.sin(a) * 64 + 3, 'text-anchor': 'middle' }, g);
        t.textContent = '0' + (i + 1);
        rays.push(r, t);
      }
      el('circle', { r: 20, fill: 'url(#sr-halo)', opacity: 0.6 }, g);
      star(g, 0, 0, 13, 'st-g');
      gsap.set(rays, { opacity: 0 });
      let rot = 0, s = 0;
      return {
        go: () => gsap.to(rays, { opacity: 1, stagger: 0.09, duration: 0.5 }),
        tick: () => { s = lerp(s, card.matches(':hover, :focus-visible') ? 1 : 0, 0.06); rot += 0.1 + s * 0.6; g.setAttribute('transform', `translate(110 65) rotate(${rot.toFixed(2)})`); },
      };
    },
    // vision 2030: a star travelling the horizon from 2026 to 2030
    horizon(svg, card) {
      const d = 'M10 118 Q110 -10 210 118';
      el('path', { class: 'l', d }, svg);
      const trail = el('path', { class: 'lg', d }, svg);
      const path = el('path', { d, fill: 'none', stroke: 'none' }, svg);
      const L = path.getTotalLength();
      trail.style.strokeDasharray = L;
      trail.style.strokeDashoffset = L;
      [2026, 2027, 2028, 2029, 2030].forEach((yr, i) => {
        const p = path.getPointAtLength((L * i) / 4);
        el('circle', { cx: p.x, cy: p.y, r: 2, class: 'st' }, svg);
        const t = el('text', { x: p.x, y: p.y + (i === 0 || i === 4 ? -8 : -10), 'text-anchor': 'middle', class: i === 4 ? 'on' : '' }, svg);
        t.textContent = yr;
      });
      const g = el('g', {}, svg);
      el('circle', { r: 14, fill: 'url(#sr-halo)', opacity: 0.7 }, g);
      star(g, 0, 0, 9, 'st-g');
      const o = { k: 0 };
      const place = () => { const p = path.getPointAtLength(L * o.k); g.setAttribute('transform', `translate(${p.x} ${p.y})`); trail.style.strokeDashoffset = L * (1 - o.k); };
      place();
      const fly = () => gsap.fromTo(o, { k: 0 }, { k: 1, duration: 2.6, ease: 'power2.inOut', onUpdate: place });
      card.addEventListener('pointerenter', fly);
      return { go: fly };
    },
    // one HQ: an onshore anchor pulsing over Riyadh
    radar(svg) {
      [56, 40, 24].forEach((r) => el('circle', { class: 'l', cx: 110, cy: 65, r }, svg));
      el('line', { class: 'l', x1: 40, y1: 65, x2: 180, y2: 65 }, svg);
      el('line', { class: 'l', x1: 110, y1: 2, x2: 110, y2: 128 }, svg);
      [0, 1, 2].forEach(() => el('circle', { class: 'pulse', cx: 110, cy: 65, r: 56 }, svg));
      const sw = el('g', { class: 'sweep' }, svg);
      el('path', { d: 'M110 65 L110 9 A56 56 0 0 1 150 25 Z', fill: 'rgba(194,165,111,.14)' }, sw);
      el('line', { class: 'lg', x1: 110, y1: 65, x2: 110, y2: 9 }, sw);
      star(svg, 110, 65, 9, 'st-g');
      const t = el('text', { x: 172, y: 120, 'text-anchor': 'middle', class: 'on' }, svg);
      t.textContent = '24.71°N 46.68°E';
      return {};
    },
  };
  const ticks = [];
  $$('.mx[data-mx]').forEach((svg) => {
    svg.setAttribute('viewBox', '0 0 220 130');
    const card = svg.closest('.metric');
    const api = MX[svg.dataset.mx](svg, card);
    if (api.tick) ticks.push({ fn: api.tick, svg });
    if (api.go) SKY.onReady(() => SKY.inView(svg, () => (SKY.reduce ? null : api.go())));
    if (SKY.reduce && api.go) api.go();
  });
  if (ticks.length && !SKY.reduce) {
    const vis = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target))));
    ticks.forEach((t) => io.observe(t.svg));
    SKY._observers.push(io);
    gsap.ticker.add(() => ticks.forEach((t) => vis.has(t.svg) && t.fn()));
  }

  /* ---------- Geometry teaser: the mark constructs itself ---------- */
  const geo = $('#geoTeaser');
  if (geo && !SKY.reduce) {
    const lines = $$('.g-cons > *', geo);
    lines.forEach((l) => { l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1'; l.style.strokeDashoffset = '1'; });
    const dots = $$('.g-dot', geo);
    const mark = $('.g-mark', geo);
    gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(mark, { opacity: 0 });
    SKY.onReady(() => {
      gsap.timeline({ scrollTrigger: { trigger: geo, start: 'top 80%', end: 'center 40%', scrub: 1 } })
        .to(lines, { strokeDashoffset: 0, stagger: 0.08, duration: 1, ease: 'none' })
        .to(dots, { scale: 1, stagger: 0.05, duration: 0.3, ease: 'back.out(3)' }, 0.4)
        .to(mark, { opacity: 1, duration: 0.6 }, 0.9)
        .to(lines, { opacity: 0.45, duration: 0.5 }, 1.1);
    });
  }
})();
