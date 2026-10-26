/* ==========================================================================
   SKY RE — shared celestial canvases
   data-fx="horizon | orbits | constellation | eclipse | rays"
   ========================================================================== */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { clamp, lerp } = SKY;
  const TAU = Math.PI * 2;
  const P = {};
  ['s0', 's1', 's2', 's3', 'star'].forEach((k) => (P[k] = SKY.path2d(k)));

  /* Draw the official mark into a 2D context.
     split: distance (in logo units) the two crescent pairs travel apart along the diagonal */
  SKY.drawMark = function (ctx, x, y, size, o = {}) {
    const k = size / SKY.LOGO;
    const split = o.split || 0;
    const d = split * 0.7071;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.translate(-SKY.STAR_C.x, -SKY.STAR_C.y);
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    const outer = o.outer || '#f3ead9';
    const inner = o.inner || '#947b4c';
    ctx.save();
    ctx.translate(-d, -d);
    ctx.globalAlpha *= o.aA == null ? 1 : o.aA;
    ctx.fillStyle = outer; ctx.fill(P.s0);
    ctx.fillStyle = inner; ctx.fill(P.s1);
    ctx.restore();
    ctx.save();
    ctx.translate(d, d);
    ctx.globalAlpha *= o.aB == null ? 1 : o.aB;
    ctx.fillStyle = outer; ctx.fill(P.s2);
    ctx.fillStyle = inner; ctx.fill(P.s3);
    ctx.restore();
    if (o.star) {
      ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * o.star;
      ctx.shadowColor = 'rgba(226,207,165,.9)';
      ctx.shadowBlur = Math.max(6, size * 0.06);
      ctx.fillStyle = '#fffaf0';
      ctx.fill(P.star);
    }
    ctx.restore();
  };

  /* soft glowing point */
  SKY.glow = function (ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };

  /* four-point star sparkle */
  SKY.sparkle = function (ctx, x, y, r, a, rgb = '255,248,234') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0);
    ctx.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
    ctx.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0);
    ctx.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r);
    ctx.fill();
    ctx.restore();
  };

  const makeDust = (n, w, h) => Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + 0.2, p: Math.random() * TAU, s: 0.5 + Math.random() * 1.5 }));
  const drawDust = (ctx, dust, t, a = 0.6) => {
    for (const d of dust) {
      ctx.fillStyle = `rgba(243,234,217,${(0.4 + 0.6 * Math.sin(t * d.s + d.p) ** 2) * a})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fill();
    }
  };

  const FX = {};

  /* ---------- horizon: a planet rim with an atmosphere and a rising star ---------- */
  FX.horizon = (cv) => {
    let dust = [];
    let hx = 0.5;
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, dust, t, 0.55);
      const R = Math.max(w * 1.15, h * 1.4);
      const cx = w / 2;
      const top = h - clamp(h * 0.13, 100, 170);
      const cy = top + R;
      hx = lerp(hx, st.p.inside ? st.p.x / w : 0.5, 0.04);
      // atmosphere
      const atm = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.18);
      atm.addColorStop(0, 'rgba(135,167,198,.32)');
      atm.addColorStop(0.25, 'rgba(135,167,198,.12)');
      atm.addColorStop(1, 'rgba(135,167,198,0)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, TAU);
      ctx.fill();
      // planet body
      const body = ctx.createLinearGradient(0, top, 0, h);
      body.addColorStop(0, '#0b2a4d');
      body.addColorStop(0.25, '#061b33');
      body.addColorStop(1, '#00141f');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      // latitude lines
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();
      ctx.strokeStyle = 'rgba(135,167,198,.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (1 - i * 0.012), R * (1 - i * 0.03), 0, Math.PI, TAU);
        ctx.stroke();
      }
      for (let i = -6; i <= 6; i++) {
        const off = ((i + ((t * 0.02) % 1)) / 6) * w * 0.7;
        ctx.beginPath();
        ctx.moveTo(cx + off * 0.15, top - 2);
        ctx.quadraticCurveTo(cx + off * 0.7, top + h * 0.12, cx + off * 1.4, h + 40);
        ctx.stroke();
      }
      ctx.restore();
      // rim
      const sx = w * (0.3 + hx * 0.4);
      const ang = Math.atan2(top - cy, sx - cx);
      const rim = ctx.createLinearGradient(0, 0, w, 0);
      rim.addColorStop(0, 'rgba(185,205,224,0)');
      rim.addColorStop(clamp(sx / w - 0.25, 0, 1), 'rgba(185,205,224,.25)');
      rim.addColorStop(clamp(sx / w, 0, 1), 'rgba(255,248,234,.95)');
      rim.addColorStop(clamp(sx / w + 0.25, 0, 1), 'rgba(185,205,224,.25)');
      rim.addColorStop(1, 'rgba(185,205,224,0)');
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      // rising star on the rim
      const px = cx + Math.cos(ang) * R;
      const py = cy + Math.sin(ang) * R;
      const pulse = 0.8 + 0.2 * Math.sin(t * 1.6);
      SKY.glow(ctx, px, py, 220, '226,207,165', 0.22 * pulse);
      SKY.glow(ctx, px, py, 60, '255,248,234', 0.55 * pulse);
      ctx.strokeStyle = `rgba(255,248,234,${0.35 * pulse})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 260 * pulse, py);
      ctx.lineTo(px + 260 * pulse, py);
      ctx.stroke();
      SKY.sparkle(ctx, px, py, 16 * pulse, 0.95);
    }, { resize: (st) => (dust = makeDust(Math.round((st.w * st.h) / 9000), st.w, st.h * 0.8)), pointerHost: cv.parentElement });
  };

  /* ---------- orbits: an orrery of capacity around the mark ---------- */
  FX.orbits = (cv) => {
    let nodes = [];
    const rings = [0.2, 0.31, 0.43, 0.56];
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const small = w < 760;
      const cx = small ? w * 0.5 : w * 0.77;
      const cy = small ? h * 0.34 : h * 0.45;
      const S = Math.min(w, h) * (small ? 0.95 : 1.05);
      const tilt = -0.32;
      const px = st.p.inside ? (st.p.sx / w - 0.5) : 0;
      const py = st.p.inside ? (st.p.sy / h - 0.5) : 0;
      const flat = 0.36 + py * 0.12;
      ctx.save();
      ctx.translate(cx + px * 30, cy + py * 20);
      ctx.rotate(tilt + px * 0.1);
      rings.forEach((r, i) => {
        ctx.strokeStyle = i === 1 ? 'rgba(148,123,76,.42)' : 'rgba(135,167,198,.17)';
        ctx.setLineDash(i === 1 ? [2, 8] : []);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, S * r, S * r * flat, 0, 0, TAU);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      const pos = nodes.map((n) => {
        const a = n.a + t * n.s;
        return { x: Math.cos(a) * S * rings[n.r], y: Math.sin(a) * S * rings[n.r] * flat, z: Math.sin(a), n };
      });
      // pulses to the centre
      pos.forEach((p, i) => {
        const k = (t * 0.35 + i * 0.37) % 1;
        if (p.n.link) {
          ctx.strokeStyle = 'rgba(135,167,198,.10)';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(0, 0);
          ctx.stroke();
          SKY.glow(ctx, p.x * (1 - k), p.y * (1 - k), 6, p.n.gold ? '226,207,165' : '185,205,224', 0.8 * Math.sin(k * Math.PI));
        }
      });
      const back = pos.filter((p) => p.z < 0), front = pos.filter((p) => p.z >= 0);
      const dot = (p) => {
        const s = p.n.size * (0.75 + 0.25 * (p.z + 1));
        SKY.glow(ctx, p.x, p.y, s * 4, p.n.gold ? '194,165,111' : '135,167,198', 0.25);
        ctx.fillStyle = p.n.gold ? '#e2cfa5' : '#f3ead9';
        ctx.globalAlpha = 0.5 + 0.5 * (p.z + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      };
      back.forEach(dot);
      ctx.restore();
      SKY.glow(ctx, cx + px * 30, cy + py * 20, S * 0.25, '135,167,198', 0.16);
      SKY.drawMark(ctx, cx + px * 30, cy + py * 20, S * 0.26, { alpha: 0.92, star: 0.6 + 0.4 * Math.sin(t * 1.2) ** 2 });
      ctx.save();
      ctx.translate(cx + px * 30, cy + py * 20);
      ctx.rotate(tilt + px * 0.1);
      front.forEach(dot);
      ctx.restore();
    }, {
      resize: () => {
        nodes = Array.from({ length: 18 }, (_, i) => ({ r: i % 4, a: Math.random() * TAU, s: (0.05 + Math.random() * 0.08) * (i % 2 ? 1 : -1) * (1 / (1 + (i % 4))), size: 1.6 + Math.random() * 2.4, gold: Math.random() < 0.35, link: Math.random() < 0.5 }));
      },
      pointerHost: cv.parentElement,
    });
  };

  /* ---------- constellation: a network that gathers around the pointer ---------- */
  FX.constellation = (cv) => {
    let pts = [];
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const md = Math.min(180, w * 0.16);
      for (const p of pts) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        if (st.p.inside) {
          const dx = st.p.sx - p.x, dy = st.p.sy - p.y, d = Math.hypot(dx, dy);
          if (d < 240) { p.x += (dx / d) * (240 - d) * 0.004; p.y += (dy / d) * (240 - d) * 0.004; }
        }
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < md) {
            ctx.strokeStyle = (a.g || b.g) ? `rgba(194,165,111,${(1 - d / md) * 0.4})` : `rgba(135,167,198,${(1 - d / md) * 0.28})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const tw = 0.6 + 0.4 * Math.sin(t * p.s + p.p);
        if (p.g) SKY.sparkle(ctx, p.x, p.y, 5 * tw + 2, 0.9);
        else { ctx.fillStyle = `rgba(243,234,217,${0.5 + 0.5 * tw})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); }
      }
    }, {
      resize: (st) => {
        const n = clamp(Math.round((st.w * st.h) / 14000), 40, 110);
        pts = Array.from({ length: n }, () => ({ x: Math.random() * st.w, y: Math.random() * st.h, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, r: 0.8 + Math.random() * 1.6, g: Math.random() < 0.1, p: Math.random() * TAU, s: 0.6 + Math.random() * 2 }));
      },
      pointerHost: cv.parentElement,
    });
  };

  /* ---------- eclipse: the visitor joins the two crescents ---------- */
  FX.eclipse = (cv) => {
    let dust = [];
    let sp = 110, star = 0;
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      drawDust(ctx, dust, t, 0.5);
      const small = w < 760;
      const cx = small ? w * 0.5 : w * 0.73, cy = small ? h * 0.36 : h * 0.5;
      const size = Math.min(w, h) * (small ? 0.55 : 0.56);
      let target = 95 + Math.sin(t * 0.5) * 25;
      if (st.p.inside) {
        const d = Math.hypot(st.p.sx - cx, st.p.sy - cy) / (size * 0.8);
        target = Math.pow(clamp(d, 0, 1), 1.3) * 150;
      }
      sp = lerp(sp, target, 0.05);
      const joined = clamp(1 - sp / 45, 0, 1);
      star = lerp(star, joined, 0.08);
      // construction rings
      ctx.strokeStyle = 'rgba(135,167,198,.12)';
      ctx.lineWidth = 1;
      [0.55, 0.75, 0.98].forEach((r) => { ctx.beginPath(); ctx.arc(cx, cy, size * r, 0, TAU); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(148,123,76,.35)';
      ctx.setLineDash([3, 9]);
      ctx.beginPath(); ctx.moveTo(cx - size, cy - size); ctx.lineTo(cx + size, cy + size); ctx.stroke();
      ctx.setLineDash([]);
      SKY.glow(ctx, cx, cy, size * (0.4 + star * 0.5), '226,207,165', 0.05 + star * 0.3);
      SKY.drawMark(ctx, cx, cy, size, { split: sp, alpha: 0.95, star: star });
      if (star > 0.05) {
        ctx.strokeStyle = `rgba(255,248,234,${star * 0.45})`;
        ctx.beginPath(); ctx.moveTo(cx - size * 0.9 * star, cy); ctx.lineTo(cx + size * 0.9 * star, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - size * 0.9 * star); ctx.lineTo(cx, cy + size * 0.9 * star); ctx.stroke();
      }
    }, { resize: (st) => (dust = makeDust(Math.round((st.w * st.h) / 7000), st.w, st.h)), pointerHost: cv.parentElement });
  };

  /* ---------- rays: light converging on the mark (CTA) ---------- */
  FX.rays = (cv) => {
    const anchor = cv.parentElement.querySelector('.cta__sym');
    let rays = [], ripples = 0;
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const cr = cv.getBoundingClientRect();
      let cx = w / 2, cy = h * 0.3;
      if (anchor) { const r = anchor.getBoundingClientRect(); cx = r.left - cr.left + r.width / 2; cy = r.top - cr.top + r.height / 2; }
      const L = Math.hypot(w, h);
      for (const r of rays) {
        const a = r.a + Math.sin(t * 0.1 + r.p) * 0.02;
        const x1 = cx + Math.cos(a) * L, y1 = cy + Math.sin(a) * L;
        const g = ctx.createLinearGradient(x1, y1, cx, cy);
        g.addColorStop(0, 'rgba(135,167,198,0)');
        g.addColorStop(1, r.g ? 'rgba(194,165,111,.22)' : 'rgba(135,167,198,.14)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(cx, cy); ctx.stroke();
        const k = 1 - ((t * r.s + r.p) % 1);
        const px = cx + Math.cos(a) * L * 0.55 * k, py = cy + Math.sin(a) * L * 0.55 * k;
        SKY.glow(ctx, px, py, 5, r.g ? '226,207,165' : '185,205,224', 0.9 * (1 - k));
      }
      ripples = (t * 0.35) % 1;
      for (let i = 0; i < 3; i++) {
        const k = (ripples + i / 3) % 1;
        ctx.strokeStyle = `rgba(226,207,165,${(1 - k) * 0.25})`;
        ctx.beginPath(); ctx.arc(cx, cy, 60 + k * Math.min(w, h) * 0.6, 0, TAU); ctx.stroke();
      }
      SKY.glow(ctx, cx, cy, 240, '226,207,165', 0.12);
    }, { resize: () => (rays = Array.from({ length: 70 }, (_, i) => ({ a: (i / 70) * TAU, p: Math.random(), s: 0.12 + Math.random() * 0.2, g: Math.random() < 0.3 }))) });
  };

  /* ---------- galaxy: an ecosystem spiralling around the mark ---------- */
  FX.galaxy = (cv) => {
    let stars = [];
    let spin = 0, tilt = 0.55;
    SKY.canvas(cv, (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const small = w < 760;
      const cx = small ? w * 0.5 : w * 0.72, cy = small ? h * 0.34 : h * 0.48;
      const R = Math.min(w, h) * (small ? 0.48 : 0.56);
      const tx = st.p.inside ? 0.35 + (st.p.sy / h) * 0.4 : 0.55;
      tilt = lerp(tilt, tx, 0.04);
      spin += dt * (0.05 + (st.p.inside ? Math.abs(st.p.sx / w - 0.5) * 0.15 : 0));
      SKY.glow(ctx, cx, cy, R * 0.9, '9,29,60', 0.6);
      SKY.glow(ctx, cx, cy, R * 0.45, '135,167,198', 0.18);
      for (const s of stars) {
        const a = s.a + spin * (1.4 - s.r);
        const x = cx + Math.cos(a) * s.r * R;
        const y = cy + Math.sin(a) * s.r * R * tilt;
        const tw = 0.6 + 0.4 * Math.sin(t * s.s + s.p);
        ctx.fillStyle = s.g ? `rgba(226,207,165,${0.9 * tw})` : `rgba(200,218,235,${(0.4 + 0.6 * (1 - s.r)) * tw})`;
        ctx.beginPath(); ctx.arc(x, y, s.z, 0, TAU); ctx.fill();
      }
      SKY.glow(ctx, cx, cy, R * 0.2, '226,207,165', 0.35);
      SKY.drawMark(ctx, cx, cy, R * 0.32, { star: 0.7 + 0.3 * Math.sin(t * 1.3) ** 2 });
    }, {
      resize: () => {
        stars = Array.from({ length: 2200 }, () => {
          const arm = Math.floor(Math.random() * 3) * (TAU / 3);
          const r = Math.pow(Math.random(), 0.8) * 0.98 + 0.04;
          return { r, a: arm + r * 5 + (Math.random() - 0.5) * (0.7 + (1 - r) * 0.8), z: Math.random() * 1.2 + 0.25, g: Math.random() < 0.06, s: 0.5 + Math.random() * 2, p: Math.random() * TAU };
        });
      },
      pointerHost: cv.parentElement,
    });
  };

  SKY.FX = FX;
  SKY.$$('[data-fx]').forEach((cv) => FX[cv.dataset.fx] && FX[cv.dataset.fx](cv));
  SKY.$$('.cta__cv').forEach((cv) => !cv.dataset.fx && FX.rays(cv));
})();
