/* SKY RE — About page */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, clamp, lerp } = SKY;
  const TAU = Math.PI * 2;
  const D2R = Math.PI / 180;

  /* ---------- Who we are: a dotted globe, capacity arcing into Riyadh ---------- */
  const whoCv = $('#whoCv');
  if (whoCv) {
    const dots = [];
    for (let lat = -80; lat <= 80; lat += 6) {
      const n = Math.max(6, Math.round(60 * Math.cos(lat * D2R)));
      for (let i = 0; i < n; i++) dots.push([lat * D2R, (i / n) * TAU]);
    }
    const RIY = [24.71 * D2R, 46.68 * D2R];
    const hubs = [[51.5, -0.12], [47.37, 8.54], [40.71, -74], [1.35, 103.8], [25.2, 55.27], [48.85, 2.35], [35.68, 139.7], [50.11, 8.68], [-33.9, 18.4], [19.07, 72.88]].map(([a, b]) => [a * D2R, b * D2R]);
    let rot = -RIY[1] + 0.35, drag = null, vel = 0.0;
    const tiltX = -18 * D2R;
    const proj = (lat, lon, R, cx, cy) => {
      const l = lon + rot;
      let x = Math.cos(lat) * Math.sin(l), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(l);
      const y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX), z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
      return [cx + x * R, cy - y2 * R, z2];
    };
    const slerp = (a, b, t) => {
      // great-circle interpolation between two lat/lon points
      const v = (p) => [Math.cos(p[0]) * Math.cos(p[1]), Math.cos(p[0]) * Math.sin(p[1]), Math.sin(p[0])];
      const A = v(a), B = v(b);
      const d = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
      const s = Math.sin(d) || 1;
      const k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
      const P = [A[0] * k1 + B[0] * k2, A[1] * k1 + B[1] * k2, A[2] * k1 + B[2] * k2];
      return [Math.asin(clamp(P[2], -1, 1)), Math.atan2(P[1], P[0]), d];
    };
    whoCv.addEventListener('pointerdown', (e) => { drag = e.clientX; whoCv.setPointerCapture(e.pointerId); });
    whoCv.addEventListener('pointermove', (e) => { if (drag != null) { vel = (e.clientX - drag) * 0.004; rot += vel; drag = e.clientX; } });
    whoCv.addEventListener('pointerup', () => (drag = null));
    whoCv.style.cursor = 'grab';
    SKY.canvas(whoCv, (ctx, w, h, t, dt) => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
      if (drag == null) { vel *= 0.95; rot += vel + dt * 0.05; }
      SKY.glow(ctx, cx, cy, R * 1.25, '135,167,198', 0.12);
      ctx.strokeStyle = 'rgba(135,167,198,.25)';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(148,123,76,.3)';
      ctx.setLineDash([2, 8]);
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      for (const d of dots) {
        const [x, y, z] = proj(d[0], d[1], R, cx, cy);
        if (z < 0) continue;
        ctx.fillStyle = `rgba(185,205,224,${0.12 + z * 0.55})`;
        ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }
      // capacity arcs converging on Riyadh
      const [rx, ry, rz] = proj(RIY[0], RIY[1], R, cx, cy);
      hubs.forEach((hb, i) => {
        const k = ((t * 0.18 + i * 0.137) % 1);
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 40; s++) {
          const q = slerp(hb, RIY, s / 40);
          const lift = 1 + Math.sin((s / 40) * Math.PI) * 0.18 * Math.min(1, q[2]);
          const [x, y, z] = proj(q[0], q[1], R * lift, cx, cy);
          if (z < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(135,167,198,.28)';
        ctx.lineWidth = 1;
        ctx.stroke();
        const q = slerp(hb, RIY, k);
        const lift = 1 + Math.sin(k * Math.PI) * 0.18 * Math.min(1, q[2]);
        const [x, y, z] = proj(q[0], q[1], R * lift, cx, cy);
        if (z > 0) SKY.glow(ctx, x, y, 7, '226,207,165', 0.9 * Math.sin(k * Math.PI));
        const [hx, hy, hz] = proj(hb[0], hb[1], R, cx, cy);
        if (hz > 0) { ctx.fillStyle = 'rgba(243,234,217,.8)'; ctx.beginPath(); ctx.arc(hx, hy, 2, 0, TAU); ctx.fill(); }
      });
      if (rz > 0) {
        const p = 0.7 + 0.3 * Math.sin(t * 2);
        SKY.glow(ctx, rx, ry, 40, '226,207,165', 0.4 * p);
        SKY.sparkle(ctx, rx, ry, 11 * p, 1);
        ctx.fillStyle = 'rgba(226,207,165,.95)';
        ctx.font = '600 11px Cairo, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('RIYADH', rx + 16, ry + 4);
      }
    });
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
})();
