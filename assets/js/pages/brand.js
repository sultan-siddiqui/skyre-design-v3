/* SKY RE — The Brand Story
   Reached only through the star on Home. The visitor arrives out of a burst of light,
   reads the six chapters of the symbol, and returns home through the star again. */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, clamp } = SKY;
  const TAU = Math.PI * 2;
  const html = document.documentElement;
  const reduce = SKY.reduce;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const wrapG = (list) => { list = [].concat(list); const g = document.createElementNS(NS, 'g'); list[0].parentNode.insertBefore(g, list[0]); list.forEach((e) => g.appendChild(e)); return g; };
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeIn = (t) => t * t * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const bz = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  let smx = -9999, smy = -9999;
  addEventListener('pointermove', (e) => { smx = e.clientX; smy = e.clientY; }, { passive: true });
  document.addEventListener('mouseleave', () => { smx = smy = -9999; });

  /* ---------- the inner sky: drifting stars that warp on arrival and on leaving ---------- */
  const Sky = (() => {
    const cv = $('#bsSky');
    if (!cv) return { start() {}, warpOut() {} };
    const ctx = cv.getContext('2d');
    let W = 1, H = 1, stars = [], raf = 0, dir = 1, w0 = -1e9, last = 0;
    function size() {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * d; cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(clamp((W * H) / 5600, 50, 300));
      if (Math.abs(stars.length - n) > n * 0.2) stars = Array.from({ length: n }, () => { const z = Math.random(); return { x: Math.random() * W, y: Math.random() * H, r: z < 0.6 ? 0.3 + Math.random() * 0.4 : 0.7 + Math.random() * 0.8, a: 0.2 + Math.random() * 0.6, w: TAU / (4000 + Math.random() * 9000), p: Math.random() * TAU, sp: 0.002 + Math.random() * 0.004, g: Math.random() < 0.15, gl: 0 }; });
    }
    function draw(t) {
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      ctx.clearRect(0, 0, W, H);
      const c = { x: W / 2, y: H * 0.42 };
      let w = 0;
      if (dir === 1) w = t - w0 < 1500 ? easeOut(Math.max(0, 1 - (t - w0) / 1500)) : 0;
      else w = easeIn(Math.min(1, (t - w0) / 950));
      for (const s of stars) {
        if (!reduce) { s.x -= s.sp * dt * 0.6; s.y -= s.sp * dt * 0.22; if (s.x < -4) s.x += W + 8; if (s.y < -4) s.y += H + 8; }
        let a = s.a * (0.65 + 0.35 * Math.sin(t * s.w + s.p));
        const qx = s.x - smx, qy = s.y - smy, q2 = qx * qx + qy * qy, f = q2 < 19600 ? 1 - q2 / 19600 : 0;
        s.gl += (f * f - s.gl) * 0.08;
        a += (1 - a) * 0.5 * s.gl;
        let x = s.x, y = s.y, x2 = x, y2 = y;
        if (w > 0) {
          const dx = x - c.x, dy = y - c.y;
          if (dir === 1) { x2 = x + dx * 0.38 * w * w; y2 = y + dy * 0.38 * w * w; }
          else { const k = 1 - 0.62 * w; x = c.x + dx * k; y = c.y + dy * k; x2 = x + dx * 0.25 * w; y2 = y + dy * 0.25 * w; }
        }
        const col = s.g ? 'rgba(231,211,166,' : 'rgba(223,233,245,';
        const al = Math.min(1, a);
        if (w > 0.02) { ctx.strokeStyle = col + al + ')'; ctx.lineWidth = s.r; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); }
        ctx.fillStyle = col + al + ')';
        ctx.beginPath(); ctx.arc(x, y, s.r * (1 + 0.7 * s.gl), 0, TAU); ctx.fill();
      }
    }
    function loop(t) { raf = 0; draw(t); if (!reduce && !document.hidden) raf = requestAnimationFrame(loop); }
    addEventListener('resize', () => { size(); if (reduce) draw(performance.now()); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(loop); });
    return {
      start(warp) { size(); dir = 1; w0 = warp && !reduce ? performance.now() : -1e9; last = 0; if (!raf) raf = requestAnimationFrame(loop); },
      warpOut() { dir = -1; w0 = performance.now(); },
    };
  })();

  /* ---------- arrival: out of the light that opened from the star ---------- */
  const arriving = html.classList.contains('bs-in');
  Sky.start(arriving);
  if (arriving && !reduce) {
    html.classList.add('bs-arrive');
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('bs-in-go')));
    setTimeout(() => html.classList.remove('bs-in', 'bs-in-go'), 1100);
    setTimeout(() => html.classList.remove('bs-arrive'), 1800);
  } else html.classList.remove('bs-in');

  /* ---------- return: back through the star to Home ---------- */
  const view = $('.bsp');
  let leaving = false;
  function goHome() {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem('sky-bs-back', '1'); } catch (e) {}
    if (reduce) { location.href = 'index.html'; return; }
    SKY.lenis && SKY.lenis.stop();
    view.classList.add('bs-leave');
    Sky.warpOut();
    const x = innerWidth / 2, y = innerHeight / 2;
    setTimeout(() => SKY.iris({ mode: 'out', x, y, from: SKY.irisReach(x, y), to: 0, dur: 1.1, ease: easeIn, keep: true, done: () => (location.href = 'index.html') }), 380);
  }
  $$('[data-bs-return]').forEach((b) => b.addEventListener('click', goHome));
  addEventListener('pageshow', (e) => {
    if (!e.persisted || !leaving) return;
    leaving = false;
    view.classList.remove('bs-leave');
    $$('.iris').forEach((c) => c.remove());
    SKY.lenis && SKY.lenis.start();
  });

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('.bsp .rv, #geoArt').forEach((el) => io.observe(el));

  /* ---------- 02 · the symbol: each step sets the stage ---------- */
  const stage = $('#stage');
  const steps = $$('.bsp .step');
  const so = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    steps.forEach((s) => s.classList.toggle('on', s === e.target));
    stage.dataset.step = e.target.dataset.step;
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => so.observe(s));

  /* ---------- 06 · foundations: the list highlights a meaning in the mark ---------- */
  const fArt = $('#fArt'), fItems = $$('.f-item');
  let fIdx = 0, fAuto = true, fTimer = 0;
  const fSet = (i) => { fIdx = i; fItems.forEach((b, j) => b.classList.toggle('on', j === i)); fArt.dataset.hl = fItems[i].dataset.hl; };
  fItems.forEach((b, i) => { b.addEventListener('click', () => { fAuto = false; fSet(i); }); b.addEventListener('mouseenter', () => { fAuto = false; fSet(i); }); });
  new IntersectionObserver((es) => es.forEach((e) => { clearInterval(fTimer); if (e.isIntersecting) fTimer = setInterval(() => fAuto && fSet((fIdx + 1) % fItems.length), 3800); }), { threshold: 0.3 }).observe(fArt);

  /* ---------- chapter rail ---------- */
  const dots = $$('.bs-dot'), chBtns = $$('.bs-ch'), countEl = $('.bs-count');
  const chapters = ['#philosophy', '#dimensions', '#geometry', '#foundations'].map((id) => $(id));
  const go = (el) => SKY.scrollTo(el, { offset: -20 });
  dots.forEach((d, i) => d.addEventListener('click', () => go(steps[i])));
  chBtns.forEach((b) => b.addEventListener('click', () => go($(b.dataset.bsGo))));
  function rail() {
    const mid = innerHeight * 0.5;
    let ch = -1;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < mid) ch = i; });
    const step = +stage.dataset.step || 0;
    dots.forEach((d, i) => d.classList.toggle('on', ch < 0 && i === step));
    chBtns.forEach((b, i) => b.classList.toggle('on', i === ch));
    countEl.textContent = ch < 0 ? `0${step + 1} / 06` : `0${ch + 3} / 06`;
  }
  addEventListener('scroll', rail, { passive: true });
  new MutationObserver(rail).observe(stage, { attributes: true, attributeFilter: ['data-step'] });
  rail();

  /* ---------- 05 · the emergent star: born from the downward crescent ---------- */
  const stSvg = stage.querySelector('svg'), labS = stage.querySelector('.labS');
  labS.classList.add('star-label');
  {
    const defs = mk('defs', {}, null);
    stSvg.insertBefore(defs, stSvg.firstChild);
    const lg = mk('linearGradient', { id: 'emFlare' }, defs);
    [['0', '#fff', '0'], ['.5', '#fff', '.95'], ['1', '#fff', '0']].forEach((s) => mk('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, lg));
  }
  let emState = 0, emRAF = 0, emNodes = [], emTimers = [];
  function emClean() {
    cancelAnimationFrame(emRAF); emTimers.forEach(clearTimeout); emTimers = [];
    emNodes.forEach((n) => n.remove()); emNodes = [];
    stage.classList.remove('emerging', 'lab-wait', 'handoff');
  }
  function emStart() {
    emClean(); emState = 1; stage.classList.add('emerging', 'lab-wait'); labS.classList.remove('revealed');
    const C = { x: 271.06, y: 275.36 }, heart = { x: 420, y: 420 };
    const GLOW = 900, HOLD = 200, TR = 2400, t0 = performance.now();
    // the pointer nudges the birthplace along the crescent's diagonal
    let birthX = heart.x, birthY = heart.y;
    if (smx > 0 && smy > 0) {
      const m = stSvg.getScreenCTM();
      if (m) {
        const p = stSvg.createSVGPoint(); p.x = smx; p.y = smy;
        const cs = p.matrixTransform(m.inverse());
        const ax = C.x - heart.x, ay = C.y - heart.y, al = Math.hypot(ax, ay) || 1, nx = ax / al, ny = ay / al;
        const proj = clamp((cs.x - heart.x) * nx + (cs.y - heart.y) * ny, -30, 30);
        birthX += nx * proj * 0.25; birthY += ny * proj * 0.25;
      }
    }
    const trailG = mk('g', { style: 'pointer-events:none' }, stSvg);
    const segs = Array.from({ length: 12 }, (_, i) => mk('line', { stroke: i < 4 ? '#ffffff' : '#c2a56f', 'stroke-linecap': 'round', opacity: 0 }, trailG));
    const trav = mk('use', { href: '#sr-star', fill: '#fff', filter: 'url(#sr-glow)', opacity: 0 }, stSvg);
    const innerGlow = mk('circle', { cx: birthX, cy: birthY, r: 18, fill: 'url(#sr-halo)', opacity: 0, style: `pointer-events:none;transform-box:view-box;transform-origin:${birthX.toFixed(1)}px ${birthY.toFixed(1)}px` }, stSvg);
    emNodes.push(trailG, trav, innerGlow);
    const dx = C.x - birthX, dy = C.y - birthY, L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L;
    if (nx < 0) { nx = -nx; ny = -ny; }
    const P1 = { x: birthX + dx * 0.28 + nx * L * 0.18, y: birthY + dy * 0.28 + ny * L * 0.18 };
    const P2 = { x: birthX + dx * 0.72 + nx * L * 0.06, y: birthY + dy * 0.72 + ny * L * 0.06 };
    const PIERCE = 0.3;
    let pierced = false;
    const hist = [];
    function frame(now) {
      const t = now - t0;
      if (t < GLOW + HOLD) {
        // golden energy gathers inside the crescent
        const g = easeIO(clamp(t / GLOW, 0, 1));
        innerGlow.setAttribute('opacity', (g * 0.65).toFixed(3));
        innerGlow.setAttribute('r', (14 + g * 24).toFixed(1));
        trav.setAttribute('opacity', (g * 0.35).toFixed(3));
        trav.setAttribute('transform', `translate(${birthX} ${birthY}) scale(${(0.02 + g * 0.05).toFixed(4)}) translate(-271.06 -275.36)`);
        emRAF = requestAnimationFrame(frame);
        return;
      }
      // the star travels to the centre
      const u = clamp((t - GLOW - HOLD) / TR, 0, 1), e = easeIO(u);
      const x = bz(e, birthX, P1.x, P2.x, C.x), y = bz(e, birthY, P1.y, P2.y, C.y);
      const sc = 0.05 + (0.82 - 0.05) * Math.pow(e, 1.8), rot = -40 * (1 - e);
      trav.setAttribute('transform', `translate(${x} ${y}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(4)}) translate(-271.06 -275.36)`);
      trav.setAttribute('opacity', Math.min(1, 0.45 + u * 0.65).toFixed(3));
      innerGlow.setAttribute('opacity', Math.max(0, 0.65 * (1 - u * 2.5)).toFixed(3));
      if (!pierced && u >= PIERCE) {
        // a golden flash as it breaks through the crescent's edge
        pierced = true;
        const px = bz(PIERCE, birthX, P1.x, P2.x, C.x), py = bz(PIERCE, birthY, P1.y, P2.y, C.y);
        const flash = mk('circle', { cx: px.toFixed(1), cy: py.toFixed(1), r: 10, fill: '#c2a56f', opacity: 0, style: `pointer-events:none;transform-box:view-box;transform-origin:${px.toFixed(1)}px ${py.toFixed(1)}px` }, stSvg);
        emNodes.push(flash);
        flash.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 0.65, offset: 0.2 }, { transform: 'scale(3.5)', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
        const gBi = stage.querySelector('.gB .i');
        gBi && gBi.animate([{ filter: 'drop-shadow(0 0 0 rgba(194,165,111,0))' }, { filter: 'drop-shadow(0 0 22px rgba(194,165,111,.7))', offset: 0.25 }, { filter: 'drop-shadow(0 0 0 rgba(194,165,111,0))' }], { duration: 1400, easing: 'ease-out' });
      }
      hist.unshift([x, y]); if (hist.length > 13) hist.pop();
      const fade = 1 - Math.pow(u, 3.2);
      segs.forEach((l, i) => {
        const a = hist[i], b = hist[i + 1];
        if (!b) { l.setAttribute('opacity', 0); return; }
        l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]);
        l.setAttribute('stroke-width', (2.2 * (1 - i / 12)).toFixed(2)); l.setAttribute('opacity', (0.4 * (1 - i / 12) * fade).toFixed(3));
      });
      if (u < 1) emRAF = requestAnimationFrame(frame); else emArrive(trav, trailG);
    }
    emRAF = requestAnimationFrame(frame);
  }
  function emArrive(trav, trailG) {
    // hand over to the real star, without a visible jump
    stage.classList.add('handoff'); stage.classList.remove('emerging'); trav.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('handoff')));
    trailG.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' });
    const o = { 'pointer-events': 'none' };
    const fx = [
      [mk('circle', Object.assign({ cx: 271.06, cy: 275.36, r: 60, fill: 'url(#sr-halo)' }, o), stSvg), [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.5)', opacity: 0.85, offset: 0.25 }, { transform: 'scale(2.6)', opacity: 0 }], 2300],
      [mk('circle', Object.assign({ cx: 271.06, cy: 275.36, r: 40, fill: 'none', stroke: '#c2a56f', 'stroke-width': 1.2 }, o), stSvg), [{ transform: 'scale(.6)', opacity: 0 }, { opacity: 0.7, offset: 0.15 }, { transform: 'scale(4.2)', opacity: 0 }], 2700],
      [mk('ellipse', Object.assign({ cx: 271.06, cy: 275.36, rx: 250, ry: 1.4, fill: 'url(#emFlare)' }, o), stSvg), [{ transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 0.7, offset: 0.3 }, { transform: 'scaleX(1.12)', opacity: 0 }], 2000],
    ];
    fx.forEach(([n, k, d]) => { n.style.transformBox = 'view-box'; n.style.transformOrigin = '271.06px 275.36px'; emNodes.push(n); n.animate(k, { duration: d, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }); });
    emTimers.push(setTimeout(() => { stage.classList.remove('lab-wait'); labS.classList.add('revealed'); }, 750));
    emTimers.push(setTimeout(() => { emNodes.forEach((n) => n.remove()); emNodes = []; emState = 2; }, 3200));
  }
  new MutationObserver(() => {
    const s = +stage.dataset.step;
    if (reduce) { labS.classList.toggle('revealed', s >= 4); return; }
    if (s === 4 && emState === 0) emStart();
    else if (s === 5 && emState === 0) { labS.classList.add('revealed'); emState = 2; }
    else if (s < 4 && emState !== 0) { emClean(); emState = 0; labS.classList.remove('revealed'); }
  }).observe(stage, { attributes: true, attributeFilter: ['data-step'] });

  /* ---------- 04 · deeper dimensions: each illustration answers the pointer ---------- */
  if (!reduce) {
    const dims = [];
    let dRAF = 0, dLast = 0;
    function dTick(now) {
      const dt = Math.min(50, dLast ? now - dLast : 16);
      dLast = now;
      let busy = false;
      for (const d of dims) if (d.step(dt)) busy = true;
      if (busy) dRAF = requestAnimationFrame(dTick); else { dRAF = 0; dLast = 0; }
    }
    const kick = () => { if (!dRAF) dRAF = requestAnimationFrame(dTick); };
    function addDim(svg, cfg) {
      const card = svg.closest('.dim'), d = { on: false, p: { x: 0, y: 0 }, cur: Object.assign({}, cfg.rest), tgt: Object.assign({}, cfg.rest) };
      const loc = (e) => { const m = svg.getScreenCTM(); if (!m) return; const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const r = q.matrixTransform(m.inverse()); d.p.x = r.x; d.p.y = r.y; };
      card.addEventListener('pointermove', (e) => { loc(e); if (!d.on) { d.on = true; cfg.enter && cfg.enter(d); } kick(); });
      const off = () => { d.on = false; kick(); };
      card.addEventListener('pointerleave', off);
      card.addEventListener('pointercancel', off);
      d.step = (dt) => {
        cfg.target(d);
        const f = 1 - Math.pow(1 - (cfg.ease || 0.07), dt / 16.7);
        let moving = false;
        for (const k in d.tgt) { const v = d.tgt[k] - d.cur[k]; if (Math.abs(v) > 0.0015) { d.cur[k] += v * f; moving = true; } else d.cur[k] = d.tgt[k]; }
        const extra = cfg.tick ? cfg.tick(d, dt) : false;
        cfg.apply(d.cur, d);
        return moving || d.on || extra;
      };
      dims.push(d);
      return d;
    }

    // 01 · joining: the crescents draw together as the pointer nears the joining point
    const mJ = $('.m-join');
    if (mJ) {
      const a = mJ.querySelector('.a'), b = mJ.querySelector('.b'), wa = wrapG(a), wb = wrapG(b), ws = wrapG(mJ.querySelector('.st'));
      const jg = mk('circle', { cx: 271.06, cy: 275.36, r: 70, fill: 'url(#sr-halo)', opacity: 0, style: 'pointer-events:none' });
      mJ.insertBefore(jg, ws);
      const tx = (el) => { const m = getComputedStyle(el).transform; if (!m || m === 'none') return 0; const v = m.match(/matrix\(([^)]+)\)/); return v ? parseFloat(v[1].split(',')[4]) || 0 : 0; };
      addDim(mJ, {
        rest: { pull: 0, gap: 0 },
        target(d) { if (!d.on) { d.tgt.pull = 0; d.tgt.gap = 0; return; } const dist = Math.hypot(d.p.x - 271.06, d.p.y - 275.36) / 400, p = clamp(1 - dist, 0, 1); d.tgt.pull = p * p; d.tgt.gap = (1 - p) * 10; },
        apply(c) {
          const k = -tx(a) * c.pull * 0.88 - c.gap;
          wa.setAttribute('transform', `translate(${k} ${k})`); wb.setAttribute('transform', `translate(${-k} ${-k})`);
          jg.setAttribute('opacity', (c.pull * 0.9).toFixed(3));
          ws.setAttribute('transform', `translate(271.06 275.36) scale(${1 + c.pull * 0.22}) translate(-271.06 -275.36)`);
        },
        tick(d) { return d.cur.pull > 0.001; },
      });
    }
    // 02 · canopy + elevation: growth rises toward the pointer; the canopy stays stable
    const mC = $('.m-canopy');
    if (mC) {
      const wr = wrapG([...mC.querySelectorAll('.rise')]), wd = wrapG(mC.querySelector('.dome'));
      addDim(mC, {
        rest: { lx: 0, ly: 0, rot: 0 },
        target(d) { if (!d.on) { d.tgt.lx = 0; d.tgt.ly = 0; d.tgt.rot = 0; return; } const lift = clamp((128 - d.p.y) / 70, -0.3, 1), hx = clamp((d.p.x - 100) / 80, -1, 1); d.tgt.ly = -lift * 15; d.tgt.lx = hx * 6; d.tgt.rot = hx * 4; },
        apply(c) { wr.setAttribute('transform', `translate(${c.lx} ${c.ly})`); wd.setAttribute('transform', `translate(0 ${c.ly * 0.18}) rotate(${c.rot} 100 128)`); },
      });
    }
    // 03 · sharing risks & rewards: the weight shifts toward the side the pointer nears
    const mS = $('.m-share');
    if (mS) {
      const beam = mS.querySelector('.beam'), wb = wrapG(beam);
      let ang = 0, vel = 0, idle = true;
      addDim(mS, {
        rest: {},
        enter() { if (!idle) return; const m = getComputedStyle(beam).transform, v = m && m.match(/matrix\(([^)]+)\)/); if (v) { const q = v[1].split(',').map(parseFloat); ang = (Math.atan2(q[1], q[0]) * 180) / Math.PI; } beam.style.animation = 'none'; vel = 0; idle = false; },
        target() {},
        tick(d, dt) {
          if (idle) return false;
          let tg = 0;
          if (d.on) { let s = clamp((d.p.x - 100) / 66, -1, 1); s = Math.abs(s) < 0.15 ? 0 : (Math.sign(s) * (Math.abs(s) - 0.15)) / 0.85; tg = s * 11; }
          const f = dt / 16.7;
          vel += (tg - ang) * 0.035 * f; vel *= Math.pow(0.77, f); ang += vel * f;
          const settled = !d.on && Math.abs(ang) < 0.03 && Math.abs(vel) < 0.003;
          if (settled) { ang = 0; vel = 0; idle = true; beam.style.animation = 'beam 5s ease-in-out -2.9s infinite'; }
          return !settled;
        },
        apply() { wb.setAttribute('transform', `rotate(${ang.toFixed(3)} 100 100)`); },
      });
    }
    // 04 · emergent guidance: the light wakes as you approach; the rays lean toward you
    const mG = $('.m-guide');
    if (mG) {
      const rays = mG.querySelector('.rays'), wr = wrapG(rays), ws = wrapG(mG.querySelector('.gs').parentNode);
      const halo = mk('circle', { cx: 100, cy: 100, r: 34, fill: 'url(#sr-halo)', opacity: 0, style: 'pointer-events:none' });
      mG.insertBefore(halo, ws);
      const lines = [...rays.querySelectorAll('line')].map((l) => { const x = (+l.getAttribute('x1') + +l.getAttribute('x2')) / 2 - 100, y = (+l.getAttribute('y1') + +l.getAttribute('y2')) / 2 - 100; return { l, a: Math.atan2(y, x) }; });
      const rest = { px: 0, py: 0, pr: 0 };
      lines.forEach((_, i) => (rest['w' + i] = 0));
      addDim(mG, {
        rest,
        target(d) {
          const T = d.tgt;
          if (!d.on) { for (const k in T) T[k] = 0; return; }
          const dx = d.p.x - 100, dy = d.p.y - 100, dist = Math.hypot(dx, dy) || 1, pr = clamp(1 - dist / 110, 0, 1), ca = Math.atan2(dy, dx), reach = Math.min(1, dist / 60);
          T.pr = pr; T.px = (dx / dist) * 6 * reach; T.py = (dy / dist) * 6 * reach;
          lines.forEach((o, i) => (T['w' + i] = Math.pow(Math.max(0, Math.cos(o.a - ca)), 4) * reach));
        },
        apply(c) {
          wr.setAttribute('transform', `translate(${c.px} ${c.py}) translate(100 100) scale(${1 + c.pr * 0.12}) translate(-100 -100)`);
          ws.setAttribute('transform', `translate(100 100) scale(${1 + c.pr * 0.18}) translate(-100 -100)`);
          ws.style.filter = c.pr > 0.01 ? `drop-shadow(0 0 ${(c.pr * 9).toFixed(1)}px rgba(255,255,255,${(c.pr * 0.75).toFixed(2)}))` : '';
          halo.setAttribute('opacity', (c.pr * 0.75).toFixed(3));
          lines.forEach((o, i) => (o.l.style.strokeWidth = (1.6 + c['w' + i] * 1.4).toFixed(2)));
        },
      });
    }
    // 05 · optical pathway: a point of light enters from the nearest corner, meets the centre, flows on
    const mP = $('.m-path');
    if (mP) {
      const corners = [[20, 20], [180, 20], [180, 180], [20, 180]], dot = mP.querySelector('circle[r="5"]'), wdot = wrapG(dot);
      const trailG = mk('g', { style: 'pointer-events:none' }, mP), segs = Array.from({ length: 8 }, () => mk('line', { stroke: '#e9dcc0', 'stroke-linecap': 'round', opacity: 0 }, trailG));
      const pt = mk('circle', { r: 2.8, fill: '#fff', opacity: 0, style: 'filter:drop-shadow(0 0 4px rgba(255,255,255,.9)) drop-shadow(0 0 8px rgba(194,165,111,.8));pointer-events:none' }, mP);
      let trip = null, wait = 0;
      const hist = [];
      const pulse = () => {
        const r = mk('circle', { cx: 100, cy: 100, r: 6, fill: 'none', stroke: '#c2a56f', 'stroke-width': 1.2, style: 'pointer-events:none;transform-box:view-box;transform-origin:100px 100px' }, mP);
        r.animate([{ transform: 'scale(1)', opacity: 0.9 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1300, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => r.remove();
        wdot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.9)' }, { transform: 'scale(1)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
      wdot.style.transformBox = 'view-box'; wdot.style.transformOrigin = '100px 100px';
      addDim(mP, {
        rest: { glow: 0 },
        target(d) { if (!d.on) { d.tgt.glow = 0; return; } d.tgt.glow = clamp(1 - Math.hypot(d.p.x - 100, d.p.y - 100) / 90, 0, 1); },
        tick(d, dt) {
          if (!trip && d.on) {
            wait -= dt;
            if (wait <= 0) { let bi = 0, bd = 1e9; corners.forEach((c, i) => { const q = Math.hypot(d.p.x - c[0], d.p.y - c[1]); if (q < bd) { bd = q; bi = i; } }); trip = { from: corners[bi], to: corners[(bi + 2) % 4], t: 0, pulsed: false }; hist.length = 0; }
          }
          if (trip) {
            trip.t += dt;
            const IN = 1050, OUT = 1150;
            let x, y, op;
            if (trip.t < IN) { const e = trip.t / IN, k = e * e * (3 - 2 * e); x = trip.from[0] + (100 - trip.from[0]) * k; y = trip.from[1] + (100 - trip.from[1]) * k; op = Math.min(1, e * 4); }
            else { if (!trip.pulsed) { trip.pulsed = true; pulse(); } const e = Math.min(1, (trip.t - IN) / OUT), k = 1 - Math.pow(1 - e, 3); x = 100 + (trip.to[0] - 100) * k; y = 100 + (trip.to[1] - 100) * k; op = 1 - e * e; }
            pt.setAttribute('cx', x); pt.setAttribute('cy', y); pt.setAttribute('opacity', op.toFixed(3));
            hist.unshift([x, y]); if (hist.length > 9) hist.pop();
            segs.forEach((l, i) => { const a = hist[i], b = hist[i + 1]; if (!b) { l.setAttribute('opacity', 0); return; } l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); l.setAttribute('stroke-width', (2.2 * (1 - i / 8)).toFixed(2)); l.setAttribute('opacity', (0.6 * (1 - i / 8) * op).toFixed(3)); });
            if (trip.t >= IN + OUT) { trip = null; wait = 350; pt.setAttribute('opacity', 0); segs.forEach((l) => l.setAttribute('opacity', 0)); }
          }
          return !!trip;
        },
        apply(c) { wdot.style.filter = c.glow > 0.01 ? `drop-shadow(0 0 ${(3 + c.glow * 7).toFixed(1)}px rgba(194,165,111,${(0.4 + c.glow * 0.5).toFixed(2)}))` : ''; },
      });
    }
    // 06 · pattern of restraint: it moves, but never past its boundary
    const mR = $('.m-restraint');
    if (mR) {
      const arc = mR.querySelector('.arc'), wa = wrapG(arc), rect = mR.querySelector('rect'), wl = wrapG([...mR.querySelectorAll('line')]);
      addDim(mR, {
        rest: { rot: 0, sx: 0, sy: 0, s: 1, edge: 0 },
        ease: 0.06,
        target(d) {
          const T = d.tgt;
          if (!d.on) { T.rot = 0; T.sx = 0; T.sy = 0; T.s = 1; T.edge = 0; return; }
          const dx = d.p.x - 100, dy = d.p.y - 100, hx = Math.tanh(dx / 55), hy = Math.tanh(dy / 55);
          T.rot = hx * 22; T.sx = hx * 4; T.sy = hy * 4; T.s = 1 + 0.04 * Math.tanh((Math.hypot(dx, dy) - 62) / 40); T.edge = Math.pow(Math.max(Math.abs(hx), Math.abs(hy)), 3);
        },
        apply(c) {
          wa.setAttribute('transform', `rotate(${c.rot} 100 100) translate(100 100) scale(${c.s}) translate(-100 -100)`);
          wl.setAttribute('transform', `translate(${c.sx} ${c.sy})`);
          rect.style.opacity = (0.25 + c.edge * 0.35).toFixed(3);
        },
      });
    }
  }
})();
