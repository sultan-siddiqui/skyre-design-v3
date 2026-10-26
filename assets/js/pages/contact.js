/* SKY RE — Contact: a Riyadh astrolabe and a mail composer */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, clamp, lerp } = SKY;
  const TAU = Math.PI * 2;

  /* ---------- Astrolabe: rings turn with the visitor; the rete keeps Riyadh time ---------- */
  const cv = $('#astroCv');
  if (cv) {
    const timeEl = $('#astroTime');
    let rot = 0, vr = 0.02, drag = null;
    const riyadh = () => {
      const d = new Date();
      const utc = d.getTime() + d.getTimezoneOffset() * 60000;
      return new Date(utc + 3 * 3600000);
    };
    cv.addEventListener('pointerdown', (e) => { drag = e.clientX; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => { if (drag != null) { vr = (e.clientX - drag) * 0.002; rot += vr; drag = e.clientX; } });
    cv.addEventListener('pointerup', () => (drag = null));
    cv.style.cursor = 'grab';
    let lastMin = -1;
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.47;
      if (drag == null) { vr = lerp(vr, st.p.inside ? (st.p.sx / w - 0.5) * 0.02 : 0.004, 0.03); rot += vr * dt * 30; }
      const now = riyadh();
      if (now.getMinutes() !== lastMin && timeEl) {
        lastMin = now.getMinutes();
        timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} AST · 24.79° N 46.64° E`;
      }
      SKY.glow(ctx, cx, cy, R * 1.1, '9,29,60', 0.8);
      // limb with degree scale
      ctx.strokeStyle = 'rgba(135,167,198,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, 0, TAU); ctx.stroke();
      for (let i = 0; i < 360; i += 2) {
        const a = (i * Math.PI) / 180 + rot;
        const long = i % 30 === 0, mid = i % 10 === 0;
        const r0 = R * (long ? 0.9 : mid ? 0.93 : 0.96);
        ctx.strokeStyle = long ? 'rgba(226,207,165,.8)' : 'rgba(135,167,198,.35)';
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      }
      // compass bearings on the inner ring
      ctx.font = '600 10px Cairo, sans-serif'; ctx.letterSpacing = '2px'; ctx.textAlign = 'center';
      ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach((n, i) => {
        const a = -Math.PI / 2 + (i * TAU) / 8 - rot * 0.6;
        ctx.fillStyle = i % 2 ? 'rgba(243,234,217,.4)' : 'rgba(226,207,165,.9)';
        ctx.fillText(n, cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8 + 4);
      });
      // tympan: almucantars (circles of altitude) for Riyadh's latitude
      ctx.strokeStyle = 'rgba(135,167,198,.14)';
      for (let k = 1; k <= 6; k++) { ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.06 * k, R * (0.68 - k * 0.09), R * (0.6 - k * 0.085), 0, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(cx - R * 0.7, cy); ctx.lineTo(cx + R * 0.7, cy); ctx.moveTo(cx, cy - R * 0.7); ctx.lineTo(cx, cy + R * 0.7); ctx.stroke();
      // the rete: an open star map that turns with sidereal time
      const sid = ((now.getHours() * 60 + now.getMinutes()) / 1440) * TAU + rot * 1.4;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(sid);
      ctx.strokeStyle = 'rgba(194,165,111,.55)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(R * 0.12, 0, R * 0.5, 0, TAU); ctx.stroke(); // ecliptic
      const pointers = [[0.62, 0.3], [0.55, 1.4], [0.48, 2.3], [0.66, 3.4], [0.4, 4.2], [0.58, 5.2]];
      pointers.forEach(([r, a]) => {
        const x = Math.cos(a) * R * r, y = Math.sin(a) * R * r;
        ctx.beginPath(); ctx.moveTo(x * 0.55, y * 0.55); ctx.quadraticCurveTo(x * 0.8 + y * 0.1, y * 0.8 - x * 0.1, x, y); ctx.stroke();
        SKY.sparkle(ctx, x, y, 6, 0.95);
      });
      ctx.restore();
      // hour hand (Riyadh time)
      const ha = ((now.getHours() % 12) + now.getMinutes() / 60) / 12 * TAU - Math.PI / 2;
      ctx.strokeStyle = 'rgba(243,234,217,.7)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * R * 0.86, cy + Math.sin(ha) * R * 0.86); ctx.stroke();
      SKY.glow(ctx, cx + Math.cos(ha) * R * 0.86, cy + Math.sin(ha) * R * 0.86, 10, '226,207,165', 0.9);
      // centre: the mark
      SKY.glow(ctx, cx, cy, R * 0.3, '226,207,165', 0.2);
      SKY.drawMark(ctx, cx, cy - R * 0.02, R * 0.26, { star: 0.6 + 0.4 * Math.sin(t * 1.3) ** 2, alpha: 0.9 });
    });
  }

  /* ---------- Find us: the mark scatters, its star falls on Al Mugheb Tower ---------- */
  const lc = $('#locCv');
  if (lc && window.SKY_GEO) {
    const stage = $('#locStage');
    const card = $('#locCard');
    const hud = $('#locHud'), geo = $('#locGeo');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const RAD = Math.PI / 180;
    const KX = Math.cos(24.7 * RAD);
    const P = (lon, lat) => [lon * KX, -lat];
    const OFFICE = P(46.6366, 24.7892);
    const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

    // map data in projected units
    const LANDS = Object.keys(window.SKY_GEO).map((k) => ({
      home: k === 'SAU',
      rings: window.SKY_GEO[k].map((r) => { const a = []; for (let i = 0; i < r.length; i += 2) a.push(P(r[i], r[i + 1])); return a; }),
    }));
    // [name, lon, lat, label side]: Jeddah and Makkah sit close, so their labels part ways
    const CITIES = [['RIYADH', 46.68, 24.71, 0], ['JEDDAH', 39.17, 21.54, -1], ['MAKKAH', 39.83, 21.42, 1], ['MADINAH', 39.61, 24.47, 0], ['DAMMAM', 50.1, 26.43, 0], ['TABUK', 36.57, 28.38, 0], ['ABHA', 42.5, 18.22, 0]].map((c) => [c[0], P(c[1], c[2]), c[3]]);
    const SEAS = [['RED SEA', P(37.5, 23.3), 1.02], ['ARABIAN GULF', P(51.6, 26.9), -0.62]];
    const line = (pts) => { const a = []; for (let i = 0; i < pts.length; i += 2) a.push(P(pts[i], pts[i + 1])); let L = 0; const acc = [0]; for (let i = 1; i < a.length; i++) { L += Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); acc.push(L); } return { a, acc, L }; };
    // simplified arterial roads of Riyadh (lon, lat pairs)
    const ROADS = [
      ['King Fahd Rd', 1.6, [46.735, 24.6, 46.712, 24.64, 46.6853, 24.6905, 46.6744, 24.7114, 46.66, 24.738, 46.6455, 24.765, 46.634, 24.789, 46.622, 24.815, 46.605, 24.85]],
      ['Olaya St', 0.9, [46.716, 24.65, 46.691, 24.695, 46.681, 24.715, 46.668, 24.74, 46.656, 24.765, 46.645, 24.785]],
      ['Northern Ring Rd', 1.4, [46.56, 24.74, 46.6, 24.752, 46.645, 24.758, 46.7, 24.77, 46.75, 24.776, 46.8, 24.772, 46.84, 24.76]],
      ['Eastern Ring Rd', 1.4, [46.8, 24.772, 46.805, 24.73, 46.8, 24.69, 46.79, 24.65, 46.775, 24.6]],
      ['Southern Ring Rd', 1.2, [46.775, 24.6, 46.735, 24.585, 46.69, 24.58, 46.64, 24.59, 46.6, 24.61]],
      ['King Abdullah Rd', 1.1, [46.59, 24.725, 46.64, 24.73, 46.7, 24.732, 46.76, 24.738, 46.805, 24.742]],
      ['Makkah Rd', 1.1, [46.58, 24.66, 46.64, 24.672, 46.7, 24.685, 46.76, 24.7]],
      ['King Salman Rd', 1.2, [46.56, 24.815, 46.62, 24.814, 46.7, 24.812, 46.78, 24.808, 46.84, 24.8]],
      ['Airport Rd', 1.1, [46.7, 24.77, 46.705, 24.83, 46.71, 24.9]],
    ].map(([n, wgt, pts]) => Object.assign(line(pts), { n, wgt }));
    const WADI = line([46.57, 24.86, 46.585, 24.8, 46.575, 24.76, 46.59, 24.72, 46.605, 24.69, 46.615, 24.65, 46.63, 24.61, 46.645, 24.56]);
    const LMK = [['KINGDOM CENTRE', 46.6744, 24.7114], ['AL FAISALIAH', 46.6853, 24.6905], ['KAFD', 46.64, 24.7636], ['DIRIYAH', 46.575, 24.734]].map((l) => [l[0], P(l[1], l[2])]);
    // city lights: a seeded scatter, densest around the centre and the north corridor
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += rnd(); return (u - 2) / 2; };
    const LIGHTS = Array.from({ length: 900 }, (_, i) => {
      const north = i % 3 === 0;
      const lon = (north ? 46.65 : 46.69) + gauss() * (north ? 0.05 : 0.11);
      const lat = (north ? 24.78 : 24.7) + gauss() * (north ? 0.04 : 0.09);
      return { p: P(lon, lat), r: 0.5 + rnd() * 1.1, ph: rnd() * TAU, gold: rnd() < 0.3 };
    });
    // a fine street grid aligned with King Fahd Road, faded by distance
    const GRID = [];
    {
      const c = P(46.68, 24.72), ang = -0.47, cs = Math.cos(ang), sn = Math.sin(ang), step = 0.011;
      for (let i = -16; i <= 16; i++) for (let j = -16; j <= 16; j++) {
        const u = i * step, v = j * step;
        const d = Math.hypot(u, v) / (16 * step);
        if (d > 1 || rnd() < 0.18) continue;
        const pt = (uu, vv) => [c[0] + uu * cs - vv * sn, c[1] + uu * sn + vv * cs];
        GRID.push([pt(u, v), pt(u + step, v), 1 - d], [pt(u, v), pt(u, v + step), 1 - d]);
      }
    }

    // pieces of the mark scatter in their own directions
    const PIECES = [['s0', -1, -0.55, -0.7], ['s1', -0.35, -1, -0.4], ['s2', 1, 0.55, 0.7], ['s3', 0.35, 1, 0.4]].map(([id, dx, dy, rot]) => ({ p: SKY.path2d(id), dx, dy, rot, fill: id === 's0' || id === 's2' ? '#f3ead9' : '#947b4c' }));
    const STAR = SKY.path2d('star');

    const S = { logo: 0, scatter: 0, map: 0, z: 0, fall: 0, impact: 0, roads: 0, lmk: 0, card: 0 };
    let trail = [];
    let cardBox = null;
    const measureCard = () => {
      const sr = stage.getBoundingClientRect(), cr = card.getBoundingClientRect();
      cardBox = cr.top < sr.bottom - 4 ? { x: cr.left - sr.left, y: cr.top - sr.top, w: cr.width, h: cr.height } : null;
    };
    const say = (a, b) => () => { hud.textContent = a; geo.textContent = b; };

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
      .call(say('Sky Re', 'The mark'), null, 0)
      .to(S, { logo: 1, duration: 1.1, ease: 'expo.out' }, 0)
      .to(S, { scatter: 1, duration: 1.4, ease: 'power3.in' }, 1.2)
      .to(S, { map: 1, duration: 1, ease: 'power1.out' }, 1.8)
      .call(say('Kingdom of Saudi Arabia', '24.0° N · 45.0° E'), null, 2.1)
      .to(S, { fall: 1, duration: 3.3, ease: 'power2.in' }, 2.3)
      .to(S, { z: 1, duration: 2.6, ease: 'power3.inOut' }, 3)
      .call(say('Riyadh', '24.71° N · 46.68° E'), null, 4.3)
      .call(say('Al Mugheb Tower · North Riyadh', '24.7892° N · 46.6366° E'), null, 5.6)
      .to(S, { impact: 1, duration: 1.8, ease: 'none' }, 5.6)
      .to(S, { roads: 1, duration: 2.2, ease: 'power2.out' }, 5.6)
      .to(S, { lmk: 1, duration: 1, ease: 'power1.out' }, 6.2)
      .fromTo(card, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', immediateRender: true }, 6)
      .to(S, { card: 1, duration: 0.8, ease: 'power1.out', onStart: measureCard }, 6.2);

    let overlay = true;
    const camera = (w, h) => {
      const narrow = w < 560;
      const sC = Math.min(w / (narrow ? 20 : 23), h / 19);
      const sF = Math.min(w / (narrow ? 0.2 : 0.3), (h * 1.3) / 0.3);
      const cC = P(45.2, 23.9);
      // keep the tower clear of the overlaid card
      const anchor = overlay ? [clamp(Math.max(0.62, 470 / w), 0, 0.78), 0.4] : [0.5, 0.42];
      const cF = [OFFICE[0] - (anchor[0] - 0.5) * w / sF, OFFICE[1] - (anchor[1] - 0.5) * h / sF];
      const s = Math.exp(lerp(Math.log(sC), Math.log(sF), S.z));
      const f = (1 / sC - 1 / s) / (1 / sC - 1 / sF);
      return { s, c: [lerp(cC[0], cF[0], f), lerp(cC[1], cF[1], f)] };
    };
    const label = (ctx, txt, x, y, col, size = 10, align = 'center') => {
      ctx.font = `600 ${size}px Cairo, sans-serif`;
      ctx.letterSpacing = '2px';
      ctx.textAlign = align;
      ctx.fillStyle = col;
      ctx.fillText(txt, x, y);
    };
    let pan = [0, 0];

    const st = SKY.canvas(lc, (ctx, w, h, t, dt, s) => {
      ctx.clearRect(0, 0, w, h);
      const cam = camera(w, h);
      // gentle pointer parallax once the star has landed
      pan[0] = lerp(pan[0], s.p.inside && S.impact > 0.5 ? (s.p.sx / w - 0.5) * -24 : 0, 0.05);
      pan[1] = lerp(pan[1], s.p.inside && S.impact > 0.5 ? (s.p.sy / h - 0.5) * -16 : 0, 0.05);
      const X = (p) => (p[0] - cam.c[0]) * cam.s + w / 2 + pan[0];
      const Y = (p) => (p[1] - cam.c[1]) * cam.s + h / 2 + pan[1];
      const cityA = smooth(0.55, 0.95, S.z);

      if (S.map > 0) {
        ctx.save();
        ctx.globalAlpha = S.map;
        // graticule, spaced to the current zoom
        const stepDeg = [10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02].find((d) => d * cam.s < 220) || 0.02;
        ctx.strokeStyle = 'rgba(135,167,198,.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const lon0 = (cam.c[0] - w / 2 / cam.s) / KX, lon1 = (cam.c[0] + w / 2 / cam.s) / KX;
        const lat0 = -(cam.c[1] + h / 2 / cam.s), lat1 = -(cam.c[1] - h / 2 / cam.s);
        for (let lo = Math.floor(lon0 / stepDeg) * stepDeg; lo <= lon1; lo += stepDeg) { const x = X(P(lo, 0)); ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let la = Math.floor(lat0 / stepDeg) * stepDeg; la <= lat1; la += stepDeg) { const y = Y(P(0, la)); ctx.moveTo(0, y); ctx.lineTo(w, y); }
        ctx.stroke();
        // land
        const landA = 1 - smooth(0.7, 1, S.z) * 0.6;
        LANDS.forEach((L) => {
          ctx.beginPath();
          L.rings.forEach((r) => { r.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p)))); ctx.closePath(); });
          ctx.fillStyle = L.home ? `rgba(9,29,60,${0.75 * landA})` : `rgba(9,29,60,${0.3 * landA})`;
          ctx.fill();
          ctx.strokeStyle = L.home ? `rgba(194,165,111,${0.55 * landA})` : `rgba(135,167,198,${0.2 * landA})`;
          ctx.lineWidth = L.home ? 1.2 : 0.8;
          ctx.stroke();
        });
        // country-scale cities and seas
        const cA = 1 - smooth(0.25, 0.55, S.z);
        if (cA > 0.01) {
          CITIES.forEach(([n, p, side], i) => {
            const x = X(p), y = Y(p);
            ctx.fillStyle = i ? `rgba(243,234,217,${0.7 * cA})` : `rgba(226,207,165,${cA})`;
            ctx.beginPath(); ctx.arc(x, y, i ? 2.2 : 3.2, 0, TAU); ctx.fill();
            const col = i ? `rgba(243,234,217,${0.55 * cA})` : `rgba(226,207,165,${0.95 * cA})`;
            if (side) label(ctx, n, x + side * 8, y + 3, col, 9, side < 0 ? 'right' : 'left');
            else label(ctx, n, x, y - 10, col, i ? 9 : 10);
          });
          SEAS.forEach(([n, p, a]) => { ctx.save(); ctx.translate(X(p), Y(p)); ctx.rotate(a); label(ctx, n, 0, 0, `rgba(135,167,198,${0.45 * cA})`, 10); ctx.restore(); });
        }
        ctx.restore();
      }

      // the city at night
      if (cityA > 0.01) {
        ctx.save();
        ctx.globalAlpha = cityA;
        ctx.lineWidth = 1;
        for (let b = 0; b < 4; b++) {
          ctx.beginPath();
          GRID.forEach(([a, c, k]) => { if (Math.min(3, Math.floor(k * 4)) !== b) return; ctx.moveTo(X(a), Y(a)); ctx.lineTo(X(c), Y(c)); });
          ctx.strokeStyle = `rgba(135,167,198,${0.03 + b * 0.03})`;
          ctx.stroke();
        }
        // Wadi Hanifa
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); WADI.a.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))));
        ctx.strokeStyle = 'rgba(135,167,198,.07)'; ctx.lineWidth = Math.max(6, cam.s * 0.004); ctx.stroke();
        ctx.strokeStyle = 'rgba(135,167,198,.22)'; ctx.lineWidth = 1; ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);
        // lights
        LIGHTS.forEach((l) => {
          const x = X(l.p), y = Y(l.p);
          if (x < -4 || y < -4 || x > w + 4 || y > h + 4) return;
          const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + l.ph));
          ctx.fillStyle = l.gold ? `rgba(226,207,165,${a})` : `rgba(185,205,224,${a * 0.8})`;
          ctx.fillRect(x, y, l.r, l.r);
        });
        // arterial roads draw in after impact, then carry traffic
        const rk = Math.max(S.roads, reduce ? 1 : 0);
        ROADS.forEach((r, ri) => {
          const upto = r.L * rk;
          ctx.beginPath();
          for (let i = 0; i < r.a.length; i++) {
            if (r.acc[i] <= upto) { const p = r.a[i]; i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p)); continue; }
            const k = (upto - r.acc[i - 1]) / (r.acc[i] - r.acc[i - 1]);
            const p = [lerp(r.a[i - 1][0], r.a[i][0], k), lerp(r.a[i - 1][1], r.a[i][1], k)];
            ctx.lineTo(X(p), Y(p));
            break;
          }
          ctx.strokeStyle = ri === 0 ? 'rgba(226,207,165,.6)' : 'rgba(185,205,224,.38)';
          ctx.lineWidth = r.wgt;
          ctx.stroke();
          if (rk < 1) return;
          for (let c = 0; c < 3; c++) {
            let d = ((t * 0.012 * (ri % 2 ? 1 : -1) + c / 3 + ri * 0.13) % 1 + 1) % 1 * r.L;
            let i = 1; while (i < r.acc.length - 1 && r.acc[i] < d) i++;
            const k = (d - r.acc[i - 1]) / (r.acc[i] - r.acc[i - 1]);
            const p = [lerp(r.a[i - 1][0], r.a[i][0], k), lerp(r.a[i - 1][1], r.a[i][1], k)];
            SKY.glow(ctx, X(p), Y(p), 6, ri === 0 ? '226,207,165' : '185,205,224', 0.7);
          }
        });
        // landmarks
        if (S.lmk > 0) LMK.forEach(([n, p]) => {
          const x = X(p), y = Y(p);
          SKY.sparkle(ctx, x, y, 4, 0.8 * S.lmk, '185,205,224');
          // flip to the left of the point rather than run off the edge
          ctx.font = '600 9px Cairo, sans-serif';
          const flip = x + 9 + ctx.measureText(n).width + n.length * 2 > w - 10;
          label(ctx, n, x + (flip ? -9 : 9), y + 3, `rgba(243,234,217,${0.5 * S.lmk})`, 9, flip ? 'right' : 'left');
        });
        ctx.restore();
      }

      // the falling star, from the heart of the mark to the tower
      const cx = w / 2, cy = h / 2;
      const L = Math.min(w, h) * 0.46;
      const tx = X(OFFICE), ty = Y(OFFICE);
      const fe = S.fall;
      const ctrl = [lerp(cx, tx, 0.2) - w * 0.08, Math.min(cy, ty) - h * 0.32];
      const u = 1 - fe;
      const sx = u * u * cx + 2 * u * fe * ctrl[0] + fe * fe * tx;
      const sy = u * u * cy + 2 * u * fe * ctrl[1] + fe * fe * ty;
      if (fe > 0 && fe < 1) { trail.push([sx, sy]); if (trail.length > 28) trail.shift(); }
      else if (trail.length) trail.shift();
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const k = i / trail.length;
          ctx.strokeStyle = `rgba(226,207,165,${k * 0.8})`;
          ctx.lineWidth = k * 3.2;
          ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
        }
      }

      // the mark: crescents fly apart and zoom past the viewer
      if (S.logo > 0 && S.scatter < 1) {
        const k = (L / SKY.LOGO) * (0.86 + 0.14 * S.logo) * (1 + S.scatter * 1.6);
        const sc = Math.pow(S.scatter, 1.5);
        SKY.glow(ctx, cx, cy, L * 0.9, '9,29,60', 0.7 * S.logo * (1 - S.scatter));
        PIECES.forEach((pc) => {
          ctx.save();
          ctx.globalAlpha = S.logo * (1 - smooth(0.35, 1, S.scatter));
          ctx.translate(cx + pc.dx * sc * w * 0.7, cy + pc.dy * sc * h * 0.7);
          ctx.rotate(pc.rot * sc + (1 - S.logo) * -0.3);
          ctx.scale(k, k);
          ctx.translate(-SKY.STAR_C.x, -SKY.STAR_C.y);
          ctx.fillStyle = pc.fill;
          ctx.fill(pc.p);
          ctx.restore();
        });
      }
      if (S.logo > 0) {
        // the star itself shrinks to a point of light as it begins to fall
        const landed = S.impact > 0;
        const size = landed ? 9 + 2 * Math.sin(t * 2.2) : lerp(L * 0.19 * (0.86 + 0.14 * S.logo), 12, smooth(0, 0.8, S.scatter + fe * 0.5));
        const x = landed ? tx : sx, y = landed ? ty : sy;
        SKY.glow(ctx, x, y, size * 3.2, '226,207,165', 0.35 * S.logo);
        ctx.save();
        ctx.globalAlpha = S.logo;
        ctx.translate(x, y);
        ctx.rotate(fe * TAU * 0.5);
        const ks = size / 104.7;
        ctx.scale(ks, ks);
        ctx.translate(-SKY.STAR_C.x, -SKY.STAR_C.y);
        ctx.shadowColor = 'rgba(226,207,165,.95)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#fffaf0';
        ctx.fill(STAR);
        ctx.restore();
      }

      // impact: a flash, three rings and a column of light
      if (S.impact > 0) {
        const ik = S.impact;
        if (ik < 1) SKY.glow(ctx, tx, ty, 40 + ik * 220, '255,248,234', 0.55 * (1 - ik) ** 2);
        for (let r = 0; r < 3; r++) {
          const k = clamp(ik * 1.4 - r * 0.18, 0, 1);
          if (k <= 0 || k >= 1) continue;
          ctx.strokeStyle = `rgba(226,207,165,${(1 - k) * 0.8})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.ellipse(tx, ty, k * Math.min(w, h) * 0.32, k * Math.min(w, h) * 0.2, 0, 0, TAU); ctx.stroke();
        }
        // resting beacon
        const beat = (t * 0.6) % 1;
        ctx.strokeStyle = `rgba(226,207,165,${0.6 * (1 - beat) * ik})`;
        ctx.beginPath(); ctx.ellipse(tx, ty, 10 + beat * 34, 6 + beat * 20, 0, 0, TAU); ctx.stroke();
        ctx.save();
        ctx.setLineDash([2, 6]); ctx.lineDashOffset = -t * 10;
        ctx.strokeStyle = `rgba(185,205,224,${0.45 * ik})`;
        ctx.beginPath(); ctx.arc(tx, ty, 22, 0, TAU); ctx.stroke();
        ctx.restore();
        const g = ctx.createLinearGradient(tx, 0, tx, ty);
        g.addColorStop(0, 'rgba(226,207,165,0)');
        g.addColorStop(1, `rgba(226,207,165,${0.35 * ik})`);
        ctx.fillStyle = g;
        ctx.fillRect(tx - 0.75, 0, 1.5, ty - 12);
      }

      // leader from the beacon to the card
      if (S.card > 0 && cardBox) {
        const ex = cardBox.x + cardBox.w, ey = cardBox.y + 26;
        const mx = lerp(ex, tx, 0.5);
        const len = S.card;
        ctx.strokeStyle = 'rgba(194,165,111,.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        const p1 = [lerp(tx, mx, Math.min(1, len * 2)), lerp(ty, ey, Math.min(1, len * 2))];
        ctx.lineTo(p1[0], p1[1]);
        if (len > 0.5) ctx.lineTo(lerp(mx, ex, (len - 0.5) * 2), ey);
        ctx.stroke();
      }

      // scale bar and north arrow (map phases only)
      if (S.map > 0.3) {
        const kmPx = 111.32 / cam.s;
        const km = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((v) => v / kmPx > 70) || 500;
        const bw = km / kmPx;
        const bx = w - 24 - bw, by = h - 26;
        ctx.globalAlpha = S.map;
        ctx.strokeStyle = 'rgba(243,234,217,.55)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by - 4); ctx.stroke();
        label(ctx, `${km} KM`, bx + bw / 2, by - 9, 'rgba(243,234,217,.6)', 9);
        const nx = w - 30, ny = h - 66;
        ctx.fillStyle = 'rgba(226,207,165,.8)';
        ctx.beginPath(); ctx.moveTo(nx, ny - 12); ctx.lineTo(nx + 5, ny + 4); ctx.lineTo(nx, ny); ctx.lineTo(nx - 5, ny + 4); ctx.closePath(); ctx.fill();
        label(ctx, 'N', nx, ny + 18, 'rgba(243,234,217,.6)', 9);
        ctx.globalAlpha = 1;
      }
    }, { pointerHost: stage, resize: () => { overlay = getComputedStyle(card).position === 'absolute'; } });

    addEventListener('resize', () => S.card > 0 && measureCard(), { passive: true });
    const play = () => { trail = []; tl.restart(); };
    if (reduce) { tl.progress(1); measureCard(); st.redraw(); }
    else SKY.inView(stage, play, '0px 0px -30% 0px');
    $('#locReplay').addEventListener('click', () => (reduce ? null : play()));
  }

  /* ---------- Enquiry composer (mailto; nothing is stored) ---------- */
  const form = $('#enqForm');
  if (form) {
    const note = $('#formNote');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const msg = (fd.get('message') || '').trim();
      const bad = [];
      if (!name) bad.push('#f-name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('#f-mail');
      if (!msg) bad.push('#f-msg');
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      if (bad.length) {
        bad.forEach((s) => $(s).setAttribute('aria-invalid', 'true'));
        $(bad[0]).focus();
        note.textContent = 'Please complete your name, a valid email and a message.';
        gsap.fromTo(bad.map((s) => $(s)), { x: -6 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, .3)' });
        return;
      }
      const type = fd.get('type');
      const pf = fd.get('portfolio');
      const to = type === 'Underwriting' || type === 'Broker' ? 'underwriting@skyre.com.sa' : 'info@skyre.com.sa';
      const subject = `${type} enquiry${pf ? ' · ' + pf : ''} · ${fd.get('company') || name}`;
      const body = `${msg}\n\n—\n${name}${fd.get('company') ? '\n' + fd.get('company') : ''}\n${email}`;
      note.textContent = `Opening your email app to send this to ${to}.`;
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
