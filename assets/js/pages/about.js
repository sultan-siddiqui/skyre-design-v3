/* SKY RE — About page */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, clamp, lerp } = SKY;
  const TAU = Math.PI * 2;

  /* ---------- Who we are: the bridge — global capacity, Sky Re, local expertise ----------
     Global reinsurers turn on a globe (left), the local market is a geometric lattice (right),
     and capacity (gold) and risk (sky) flow between them through the mark. The pointer leans
     the scene toward a side; on touch screens the scroll position sweeps it instead. */
  const who = $('.who-stage');
  if (who) {
    const cvW = $('.who-cv', who), sym = $('.who-sym', who);
    const gAel = sym && $('.wA', sym), gBel = sym && $('.wB', sym);
    const ctx = cvW.getContext('2d');
    const reduce = SKY.reduce;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const PAL = { ink: '243,234,217', gl: '194,165,111', sky: '135,167,198' };
    const col = (k, a) => `rgba(${PAL[k]},${clamp(a, 0, 1).toFixed(3)})`;
    const sm = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
    const rng = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
    const dot = (X, Y, r, c) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); };
    const ring = (X, Y, r, c, lw = 1) => { ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); };
    const seg = (a, b, c2, d, c, lw = 1) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); };
    const glow = (X, Y, r, k, a) => { if (a <= 0.004) return; const g = ctx.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col(k, a)); g.addColorStop(1, col(k, 0)); ctx.fillStyle = g; ctx.fillRect(X - r, Y - r, r * 2, r * 2); };
    // a quadratic between two points, bowed along its normal (keeps the two lanes apart)
    const qpt = (p0, p1, bend, u, o) => {
      const dx = p1.x - p0.x, dy = p1.y - p0.y, cx = (p0.x + p1.x) / 2 - dy * bend, cy = (p0.y + p1.y) / 2 + dx * bend, iu = 1 - u;
      o.x = iu * iu * p0.x + 2 * iu * u * cx + u * u * p1.x; o.y = iu * iu * p0.y + 2 * iu * u * cy + u * u * p1.y; return o;
    };
    const qcurve = (p0, p1, bend) => { const dx = p1.x - p0.x, dy = p1.y - p0.y; ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo((p0.x + p1.x) / 2 - dy * bend, (p0.y + p1.y) / 2 + dx * bend, p1.x, p1.y); };

    const it = { w: 0, h: 0, dpr: 1, vis: false, on: 0, px: 0, py: 0, tx: 0, ty: 0, ptr: 0, foc: 0, fresh: 1, tm: 0, d: { lay: 0 } };
    const prox = (X, Y, rad) => { const dx = it.px - X, dy = it.py - Y; return it.on * Math.exp(-(dx * dx + dy * dy) / (2 * rad * rad)); };
    const tmp = { x: 0, y: 0 }, tmp2 = { x: 0, y: 0 };
    let raf = 0, last = 0, T = 0;
    const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };

    function size() {
      const r = cvW.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      if (r.width < 2 || r.height < 2) return;
      it.w = r.width; it.h = r.height; it.dpr = d;
      cvW.width = Math.round(r.width * d); cvW.height = Math.round(r.height * d);
      it.d.lay = 0; it.fresh = 1; kick();
    }
    const loc = (e) => { const r = cvW.getBoundingClientRect(); it.tx = e.clientX - r.left; it.ty = e.clientY - r.top; };
    const release = () => { clearTimeout(it.tm); it.tm = setTimeout(() => { it.ptr = 0; kick(); }, 1500); };
    who.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { loc(e); it.ptr = 1; kick(); } });
    who.addEventListener('pointermove', (e) => { loc(e); it.ptr = 1; if (e.pointerType !== 'mouse') clearTimeout(it.tm); kick(); });
    who.addEventListener('pointerdown', (e) => { loc(e); it.ptr = 1; clearTimeout(it.tm); kick(); });
    who.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { it.ptr = 0; kick(); } else release(); });
    who.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') release(); });
    who.addEventListener('pointercancel', release);
    who.addEventListener('focus', () => { let fv = true; try { fv = who.matches(':focus-visible'); } catch (e) {} if (fv) { it.foc = 1; kick(); } });
    who.addEventListener('blur', () => { it.foc = 0; kick(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = 0; kick(); } });
    const ro = new ResizeObserver(size);
    ro.observe(cvW);
    const io = new IntersectionObserver(([en]) => { it.vis = en.isIntersecting; kick(); }, { rootMargin: '120px 0px' });
    io.observe(cvW);
    (SKY._observers = SKY._observers || []).push(ro, io);

    function layout() {
      const w = it.w, h = it.h, d = it.d, por = w / h < 1, r = rng(11);
      d.por = por; who.classList.toggle('portrait', por);
      if (por) { d.C = { x: w * 0.5, y: h * 0.5 }; d.G = { x: w * 0.3, y: h * 0.21 }; d.Lc = { x: w * 0.7, y: h * 0.79 }; d.R = Math.min(w * 0.22, h * 0.115); }
      else { d.C = { x: w * 0.5, y: h * 0.46 }; d.G = { x: w * 0.2, y: h * 0.42 }; d.Lc = { x: w * 0.8, y: h * 0.42 }; d.R = Math.min(w * 0.12, h * 0.2); }
      d.symR = sym ? sym.getBoundingClientRect().width / 2 : 90;
      d.stars = []; for (let i = 0; i < (w < 600 ? 44 : 80); i++) d.stars.push({ x: r() * w, y: r() * h, s: r() * 1 + 0.3, p: r() * TAU, v: 0.0006 + r() * 0.0012 });
      d.gn = []; for (let i = 0; i < 12; i++) d.gn.push({ lon: r() * TAU, lat: (r() - 0.5) * 2.1, s: 1.5 + r() * 1.5, x: 0, y: 0, z: 0 });
      const a = d.R * 0.6, lat = [[0, 0], [1, 0], [-1, 0], [0, 1], [-1, 1], [0, -1], [1, -1], [1, 1], [-1, -1]];
      d.ln = lat.map((q) => ({ bx: d.Lc.x + a * (q[0] + q[1] * 0.5) + (r() - 0.5) * a * 0.25, by: d.Lc.y + a * q[1] * 0.866 + (r() - 0.5) * a * 0.25, s: 1.6 + r() * 1.3, p: r() * TAU, x: 0, y: 0 }));
      d.a = a;
      const nCap = w < 600 ? 30 : 48, nRisk = w < 600 ? 20 : 32;
      d.parts = []; for (let i = 0; i < nCap + nRisk; i++) d.parts.push({ t: i < nCap ? 0 : 1, a: Math.floor(r() * d.gn.length), b: Math.floor(r() * d.ln.length), s: r(), v: 0.000085 + r() * 0.00007 });
      d.rng = r; d.rot = d.rot || 0; d.lay = 1;
    }

    function draw(dtA) {
      const d = it.d; if (!d.lay) layout();
      const { C, G, Lc, R } = d, w = it.w, h = it.h, on = it.on;
      const b = d.por ? (it.py / h - 0.5) * 2 : (it.px / w - 0.5) * 2;
      const gA = on * sm((-b - 0.1) / 0.55), lA = on * sm((b - 0.1) / 0.55), cz = on * (1 - sm(Math.abs(b) / 0.3));
      let i, n;
      // starfield
      for (const st of d.stars) dot(st.x, st.y, st.s, col('ink', 0.1 + 0.16 * (0.5 + 0.5 * Math.sin(T * st.v + st.p))));
      // halos
      ctx.globalCompositeOperation = 'lighter';
      glow(G.x, G.y, R * 2.3, 'gl', 0.05 + gA * 0.2);
      glow(Lc.x, Lc.y, R * 2.1, 'gl', 0.04 + lA * 0.2);
      ctx.globalCompositeOperation = 'source-over';
      // GLOBAL: a turning globe of international reinsurers, with its orbit (the superior network)
      d.rot += dtA * (0.00011 + gA * 0.00035);
      const ga = 0.13 + gA * 0.32 - lA * 0.05;
      ring(G.x, G.y, R, col('ink', ga));
      for (i = 0; i < 6; i++) { const lo = (i * Math.PI) / 6 + d.rot, rx = Math.abs(Math.sin(lo)) * R; ctx.beginPath(); ctx.ellipse(G.x, G.y, Math.max(0.1, rx), R, 0, 0, TAU); ctx.strokeStyle = col('ink', ga * 0.55); ctx.lineWidth = 0.8; ctx.stroke(); }
      for (i = -1; i <= 1; i++) { const la = i * 0.62, yy = G.y - R * Math.sin(la), rr = R * Math.cos(la); ctx.beginPath(); ctx.ellipse(G.x, yy, rr, rr * 0.17, 0, 0, TAU); ctx.strokeStyle = col('ink', ga * 0.5); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(G.x, G.y, R * 1.42, R * 0.44, -0.32, 0, TAU); ctx.strokeStyle = col('gl', 0.16 + gA * 0.4); ctx.lineWidth = 1; ctx.stroke();
      const oa = T * 0.00035 + d.rot * 2, ox = Math.cos(oa) * R * 1.42, oy = Math.sin(oa) * R * 0.44, cs = Math.cos(-0.32), sn = Math.sin(-0.32);
      dot(G.x + ox * cs - oy * sn, G.y + ox * sn + oy * cs, 2.4, col('gl', 0.6 + gA * 0.4));
      for (n of d.gn) {
        const l2 = n.lon + d.rot;
        n.z = Math.cos(n.lat) * Math.cos(l2);
        n.x = G.x + R * Math.cos(n.lat) * Math.sin(l2);
        n.y = G.y - R * Math.sin(n.lat) + n.z * R * 0.06;
        const pk = prox(n.x, n.y, R * 1.1) * 10, dx = it.px - n.x, dy = it.py - n.y, dl = Math.hypot(dx, dy) || 1;
        n.x += (dx / dl) * pk; n.y += (dy / dl) * pk;
      }
      // LOCAL: a Saudi-geometric lattice with an eight-point star
      const la2 = 0.07 + lA * 0.18 - gA * 0.02;
      ctx.save(); ctx.beginPath(); ctx.arc(Lc.x, Lc.y, R * 1.2, 0, TAU); ctx.clip();
      ctx.strokeStyle = col('ink', la2); ctx.lineWidth = 0.8; ctx.beginPath();
      const sp = d.a * 0.5;
      for (let k = -8; k <= 8; k++) { const o2 = k * sp * 1.414; ctx.moveTo(Lc.x + o2 - R * 1.3, Lc.y - R * 1.3); ctx.lineTo(Lc.x + o2 + R * 1.3, Lc.y + R * 1.3); ctx.moveTo(Lc.x + o2 + R * 1.3, Lc.y - R * 1.3); ctx.lineTo(Lc.x + o2 - R * 1.3, Lc.y + R * 1.3); }
      ctx.stroke(); ctx.restore();
      const oc = R * 1.02, br = 1 + 0.02 * Math.sin(T * 0.0009);
      ctx.save(); ctx.translate(Lc.x, Lc.y); ctx.strokeStyle = col('gl', 0.13 + lA * 0.38); ctx.lineWidth = 1;
      ctx.strokeRect(-oc * 0.7 * br, -oc * 0.7 * br, oc * 1.4 * br, oc * 1.4 * br); ctx.rotate(Math.PI / 4); ctx.strokeRect(-oc * 0.7 * br, -oc * 0.7 * br, oc * 1.4 * br, oc * 1.4 * br); ctx.restore();
      for (n of d.ln) {
        n.x = n.bx + Math.sin(T * 0.0007 + n.p) * 2; n.y = n.by + Math.cos(T * 0.0006 + n.p) * 2;
        const pk = prox(n.x, n.y, R) * 8, ex = it.px - n.x, ey = it.py - n.y, el = Math.hypot(ex, ey) || 1;
        n.x += (ex / el) * pk; n.y += (ey / el) * pk;
      }
      ctx.beginPath();
      for (i = 0; i < d.ln.length; i++) for (let j = i + 1; j < d.ln.length; j++) { const A = d.ln[i], B = d.ln[j]; if (Math.hypot(A.x - B.x, A.y - B.y) < d.a * 1.18) { ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); } }
      ctx.strokeStyle = col('ink', 0.12 + lA * 0.3); ctx.lineWidth = 0.9; ctx.stroke();
      // links: capacity (gold) and risk (sky) through Sky Re
      ctx.lineWidth = 0.8;
      ctx.beginPath(); d.gn.forEach((g) => qcurve(g, C, 0.16)); ctx.strokeStyle = col('gl', 0.06 + gA * 0.2 + cz * 0.14); ctx.stroke();
      ctx.beginPath(); d.ln.forEach((l) => qcurve(C, l, 0.16)); ctx.strokeStyle = col('gl', 0.05 + lA * 0.16 + cz * 0.14); ctx.stroke();
      ctx.beginPath(); d.ln.forEach((l) => qcurve(l, C, 0.16)); ctx.strokeStyle = col('sky', 0.04 + lA * 0.14 + cz * 0.1); ctx.stroke();
      ctx.beginPath(); d.gn.forEach((g) => qcurve(C, g, 0.16)); ctx.strokeStyle = col('sky', 0.035 + gA * 0.12 + cz * 0.1); ctx.stroke();
      // nodes
      d.gn.forEach((g, k) => {
        const fz = 0.35 + 0.65 * (g.z * 0.5 + 0.5), na = (0.35 + gA * 0.6) * fz;
        if (gA > 0.05 && g.z > 0) ring(g.x, g.y, g.s + 4 + 2 * Math.sin(T * 0.003 + k), col('gl', gA * 0.35 * fz), 0.8);
        dot(g.x, g.y, g.s * (0.8 + 0.3 * fz), col(g.z > 0 ? 'gl' : 'ink', na));
      });
      for (n of d.ln) { const ph = (T * 0.0005 + n.p / TAU) % 1; ring(n.x, n.y, n.s + ph * 9, col('gl', (1 - ph) * (0.12 + lA * 0.4)), 0.8); dot(n.x, n.y, n.s, col('ink', 0.5 + lA * 0.45)); }
      // particles
      const vC = 1 + 2.2 * gA + 2.6 * cz + 0.5 * lA, vR = 1 + 2.2 * lA + 2.6 * cz + 0.5 * gA;
      ctx.globalCompositeOperation = 'lighter';
      for (const p of d.parts) {
        p.s += dtA * p.v * (p.t ? vR : vC);
        if (p.s >= 1) { p.s -= 1; p.a = Math.floor(d.rng() * d.gn.length); p.b = Math.floor(d.rng() * d.ln.length); }
        const s0 = p.s, s1 = Math.max(0, p.s - 0.035), src = p.t ? d.ln[p.b] : d.gn[p.a], dst = p.t ? d.gn[p.a] : d.ln[p.b];
        if (s0 < 0.5) qpt(src, C, 0.16, s0 * 2, tmp); else qpt(C, dst, 0.16, (s0 - 0.5) * 2, tmp);
        if (s1 < 0.5) qpt(src, C, 0.16, s1 * 2, tmp2); else qpt(C, dst, 0.16, (s1 - 0.5) * 2, tmp2);
        const fade = Math.min(1, s0 * 8, (1 - s0) * 8), emph = p.t ? lA * 0.5 + cz * 0.4 : gA * 0.5 + cz * 0.4, pa = (0.4 + emph) * fade, k2 = p.t ? 'sky' : 'gl';
        seg(tmp2.x, tmp2.y, tmp.x, tmp.y, col(k2, pa * 0.55), 1.1);
        dot(tmp.x, tmp.y, p.t ? 1.3 : 1.6, col(k2, pa));
      }
      ctx.globalCompositeOperation = 'source-over';
      // the joining point
      const ph2 = (T * 0.0005) % 1;
      ring(C.x, C.y, d.symR * (0.95 + ph2 * 0.7), col('gl', (1 - ph2) * (0.06 + cz * 0.4)));
      if (cz > 0.02) { const ph3 = (T * 0.0005 + 0.5) % 1; ring(C.x, C.y, d.symR * (0.95 + ph3 * 0.7), col('gl', (1 - ph3) * cz * 0.35)); }
      ring(C.x, C.y, d.symR * 1.18, col('ink', 0.06 + cz * 0.12), 0.8);
      // the mark: only the two crescents translate (it is never rotated or altered)
      const amb = reduce ? 0 : Math.sin(T * 0.0007) * 2.2;
      const ax = (-gA * 10 + cz * 4 - amb).toFixed(2), bx = (lA * 10 - cz * 4 + amb).toFixed(2);
      if (gAel && d.tA !== ax) { d.tA = ax; gAel.style.transform = `translate(${ax}px,${ax}px)`; }
      if (gBel && d.tB !== bx) { d.tB = bx; gBel.style.transform = `translate(${bx}px,${bx}px)`; }
      const z = on < 0.22 ? '' : cz > gA && cz > lA ? 'c' : gA > lA ? 'g' : 'l';
      if (d.z !== z) { d.z = z; z ? who.setAttribute('data-zone', z) : who.removeAttribute('data-zone'); }
    }

    function frame(now) {
      raf = 0;
      if (document.hidden) return;
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      if (!reduce) T += dt;
      if (!it.vis || !it.w) return;
      // target: pointer > keyboard focus > (touch) scroll sweep
      let aut = 0, vx, vy;
      if (it.ptr) { vx = it.tx; vy = it.ty; }
      else {
        vx = it.w * (0.5 + 0.34 * Math.sin(T * 0.00058 + 3 * 1.7));
        vy = it.h * (0.5 + 0.3 * Math.sin(T * 0.00087 + 3 * 2.3));
        if (!reduce) {
          if (it.foc) aut = 1;
          else if (!fine) {
            const vh = innerHeight || 800, r = who.getBoundingClientRect(), p = clamp((vh - r.top) / (vh + r.height), 0, 1), u = clamp((p - 0.18) / 0.64, 0, 1);
            aut = sm(Math.min(p, 1 - p) * 6) * 0.9;
            if (it.d.por) { vx = it.w * 0.5; vy = it.h * u; } else { vx = it.w * u; vy = it.h * 0.46; }
          }
        }
      }
      const tgt = Math.max(it.ptr, aut), f = 1 - Math.pow(1 - 0.065, dt / 16.7), g = 1 - Math.pow(1 - 0.13, dt / 16.7);
      if (it.fresh) { it.px = vx; it.py = vy; it.fresh = 0; }
      it.on += (tgt - it.on) * f; it.px += (vx - it.px) * g; it.py += (vy - it.py) * g;
      const busy = Math.abs(tgt - it.on) > 0.003 || Math.abs(vx - it.px) > 0.4 || Math.abs(vy - it.py) > 0.4;
      ctx.setTransform(it.dpr, 0, 0, it.dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, it.w, it.h);
      draw(reduce ? 0 : dt);
      if (!reduce || busy) kick();
    }
    size();
  }

  /* ---------- MGA mandate diagram ---------- */
  const mCv = $('#mandateCv');
  const pillars = $$('.pillar');
  if (mCv) {
    let stage = 0, auto = true, stageT = 0;
    const setStage = (i, user) => {
      stage = i;
      if (user) auto = false;
      pillars.forEach((p, j) => p.setAttribute('aria-pressed', j === i));
    };
    pillars.forEach((p, i) => p.addEventListener('click', () => setStage(i, true)));
    let risks = [], caps = [];
    const emph = [1, 1, 1];
    SKY.canvas(mCv, (ctx, w, h, t, dt) => {
      ctx.clearRect(0, 0, w, h);
      if (auto) { stageT += dt; if (stageT > 6) { stageT = 0; setStage((stage + 1) % 3); } }
      for (let i = 0; i < 3; i++) emph[i] = lerp(emph[i], stage === i ? 1 : 0.35, 0.05);
      const cx = w / 2, cy = h * 0.5;
      const ring = Math.min(w, h) * 0.2;
      const topY = h * 0.2, botY = h * 0.8;
      const nRe = 5, nCe = 6;
      const reX = (i) => cx + (i - (nRe - 1) / 2) * Math.min(w * 0.16, 150);
      const ceX = (i) => cx + (i - (nCe - 1) / 2) * Math.min(w * 0.13, 120);

      // delegated authority: a dotted cone from the reinsurers to the mandate ring
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = `rgba(243,234,217,${0.15 + emph[0] * 0.35})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < nRe; i++) {
        ctx.beginPath(); ctx.moveTo(reX(i), topY + 14);
        const a = -Math.PI / 2 + (i - (nRe - 1) / 2) * 0.35;
        ctx.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); ctx.stroke();
      }
      ctx.setLineDash([]);

      // mandate ring (limits & guidelines)
      ctx.strokeStyle = `rgba(194,165,111,${0.3 + emph[0] * 0.5})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -t * 10;
      ctx.beginPath(); ctx.arc(cx, cy, ring, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(135,167,198,.15)';
      ctx.beginPath(); ctx.arc(cx, cy, ring * 1.45, 0, TAU); ctx.stroke();
      // assessment ticks
      const words = ['ASSESS', 'PRICE', 'BIND', 'SERVICE'];
      ctx.font = `600 ${Math.max(9, w * 0.0085)}px Cairo, sans-serif`;
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'center';
      words.forEach((wd, i) => {
        const a = -Math.PI * 0.85 + i * (Math.PI * 0.56);
        const x = cx + Math.cos(a) * ring * 1.45, y = cy + Math.sin(a) * ring * 1.45;
        ctx.fillStyle = `rgba(226,207,165,${0.35 + emph[1] * 0.6})`;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
        ctx.fillText(wd, x + Math.cos(a) * 34, y + Math.sin(a) * 18 + 4);
      });

      // reinsurers (top) and cedants (bottom)
      for (let i = 0; i < nRe; i++) {
        SKY.glow(ctx, reX(i), topY, 26, '135,167,198', 0.25);
        ctx.strokeStyle = 'rgba(185,205,224,.7)';
        ctx.beginPath(); ctx.arc(reX(i), topY, 9, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(185,205,224,.9)';
        ctx.beginPath(); ctx.arc(reX(i), topY, 3, 0, TAU); ctx.fill();
      }
      for (let i = 0; i < nCe; i++) {
        ctx.strokeStyle = 'rgba(226,207,165,.65)';
        ctx.strokeRect(ceX(i) - 7, botY - 7, 14, 14);
        ctx.fillStyle = 'rgba(226,207,165,.9)';
        ctx.fillRect(ceX(i) - 2, botY - 2, 4, 4);
      }

      // risk: rises from cedants, circles the mandate (assessment), then is bound to reinsurers
      for (const r of risks) {
        r.t += dt * r.s;
        if (r.t > 1) { r.t = 0; r.c = (Math.random() * nCe) | 0; r.r = (Math.random() * nRe) | 0; r.ph = Math.random() * TAU; }
        let x, y, a = 1;
        const sx = ceX(r.c), sy = botY;
        if (r.t < 0.35) {
          const k = r.t / 0.35;
          const ex = cx + Math.cos(Math.PI / 2 + (r.c - 2.5) * 0.18) * ring, ey = cy + ring * 0.98;
          x = lerp(sx, ex, k); y = lerp(sy, ey, k * k * (3 - 2 * k));
        } else if (r.t < 0.65) {
          const k = (r.t - 0.35) / 0.3;
          const a0 = Math.PI / 2 + (r.c - 2.5) * 0.18;
          const ang = a0 + k * Math.PI * (1 + emph[1] * 0.6) * (r.ph > Math.PI ? 1 : -1);
          x = cx + Math.cos(ang) * ring; y = cy + Math.sin(ang) * ring;
          a = 0.6 + emph[1] * 0.4;
        } else {
          const k = (r.t - 0.65) / 0.35;
          const a0 = Math.PI / 2 + (r.c - 2.5) * 0.18 + Math.PI * (1 + emph[1] * 0.6) * (r.ph > Math.PI ? 1 : -1);
          const bx = cx + Math.cos(a0) * ring, by = cy + Math.sin(a0) * ring;
          const tx = reX(r.r), ty = topY;
          x = lerp(bx, tx, k); y = lerp(by, ty, k);
          a = 0.5 + emph[2] * 0.5;
          if (k < 0.08) SKY.glow(ctx, bx, by, 14, '255,248,234', 0.6 * (1 - k / 0.08));
        }
        SKY.glow(ctx, x, y, 8, '226,207,165', 0.6 * a);
        ctx.fillStyle = `rgba(226,207,165,${a})`;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
      }
      // capacity & protection: descends from reinsurers, through Sky Re, to the market
      for (const c of caps) {
        c.t += dt * c.s;
        if (c.t > 1) { c.t = 0; c.r = (Math.random() * nRe) | 0; c.c = (Math.random() * nCe) | 0; }
        const k = c.t;
        const sx = reX(c.r) + 16, sy = topY;
        const ex = ceX(c.c) + 14, ey = botY;
        let x, y;
        if (k < 0.5) { const q = k / 0.5; x = lerp(sx, cx + 18, q); y = lerp(sy, cy, q); }
        else { const q = (k - 0.5) / 0.5; x = lerp(cx + 18, ex, q); y = lerp(cy, ey, q); }
        const a = Math.sin(k * Math.PI) * (0.4 + emph[2] * 0.4);
        SKY.glow(ctx, x, y, 7, '135,167,198', 0.7 * a);
      }
      // Sky Re
      SKY.glow(ctx, cx, cy, ring * 0.9, '226,207,165', 0.15);
      SKY.drawMark(ctx, cx, cy, ring * 0.95, { star: 0.6 + 0.4 * Math.sin(t * 1.4) ** 2 });
    }, {
      resize: () => {
        risks = Array.from({ length: 34 }, () => ({ t: Math.random(), s: 0.09 + Math.random() * 0.05, c: (Math.random() * 6) | 0, r: (Math.random() * 5) | 0, ph: Math.random() * TAU }));
        caps = Array.from({ length: 40 }, () => ({ t: Math.random(), s: 0.1 + Math.random() * 0.06, c: (Math.random() * 6) | 0, r: (Math.random() * 5) | 0 }));
      },
    });
  }

  /* ---------- Value proposition: horizontal journey, one more ray per card ---------- */
  const pin = $('.hz__pin');
  if (pin && !SKY.reduce) {
    const track = $('.hz__track', pin);
    const bar = $('.hz__bar i', pin);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin, start: 'center center', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      tl.to(track, { x: () => -dist(), ease: 'none' }, 0).to(bar, { scaleX: 1, ease: 'none' }, 0);
      $$('.vcard', track).forEach((c) => {
        gsap.fromTo($('.rays', c), { rotate: -45, scale: 0.7 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tl, start: 'left 95%', end: 'left 45%', scrub: true } });
      });
      return () => tl.kill();
    });
  }

  /* ---------- Vision 2030: "20" holds while the year rolls from 15 to 30 ---------- */
  const yr = $('[data-vision-yr]');
  if (yr && !SKY.reduce) {
    const n = { v: 15 };
    yr.textContent = '15';
    SKY.inView(yr.closest('.vision__yr'), () => gsap.to(n, {
      v: 30, duration: 2.6, delay: 0.25, ease: 'power2.out',
      onUpdate: () => (yr.textContent = String(Math.round(n.v))),
    }), '0px 0px -20% 0px');
  }
})();
