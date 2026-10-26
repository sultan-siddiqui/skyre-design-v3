/* SKY RE — Portfolios: six living line-art diagrams + treaty explorer */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, clamp, lerp } = SKY;
  const TAU = Math.PI * 2;
  const C = { line: 'rgba(185,205,224,.55)', faint: 'rgba(135,167,198,.18)', gold: 'rgba(226,207,165,.9)', goldA: (a) => `rgba(194,165,111,${a})`, skyA: (a) => `rgba(135,167,198,${a})` };

  const readout = (vis) => {
    const r = $('.pf__readout', vis);
    let last = '';
    return (k, b) => {
      const key = k + b;
      if (key === last) return;
      last = key;
      $('small', r).textContent = k;
      $('b', r).textContent = b;
      gsap.fromTo(r, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 });
    };
  };
  const label = (ctx, txt, x, y, col = 'rgba(243,234,217,.75)', align = 'center', size = 10) => {
    ctx.font = `600 ${size}px Cairo, sans-serif`;
    ctx.letterSpacing = '2px';
    ctx.textAlign = align;
    ctx.fillStyle = col;
    // keep every label inside the canvas, whatever its alignment
    const cw = ctx.canvas.width / (ctx.getTransform().a || 1), tw = ctx.measureText(txt).width + 4;
    const left = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    x += Math.max(0, 6 - left) - Math.max(0, left + tw - (cw - 6));
    ctx.fillText(txt, x, y);
  };
  const ground = (ctx, w, y) => {
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 10); ctx.stroke(); }
  };
  const px = (st, w) => (st.p.inside ? st.p.sx : null);

  const DRAW = {};

  /* ---- 01 · Property: assets under layered domes of protection ---- */
  DRAW.property = (cv, out) => {
    const assets = [
      { k: 'Industrial complex', b: 'Property Damage · BI', x: 0.17, w: 0.16, h: 0.22, type: 'factory' },
      { k: 'Power plant', b: 'PD · BI · Machinery', x: 0.38, w: 0.12, h: 0.3, type: 'tower' },
      { k: 'Mega project', b: 'Mega Projects Coverage · CAT', x: 0.6, w: 0.1, h: 0.46, type: 'spire' },
      { k: 'Logistics & real estate', b: 'PD · Optional terrorism', x: 0.82, w: 0.16, h: 0.18, type: 'block' },
    ];
    let focus = 2, f = assets.map(() => 0);
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const gy = h * 0.8;
      const p = px(st, w);
      if (p != null) { let best = 0, bd = 1e9; assets.forEach((a, i) => { const d = Math.abs(a.x * w - p); if (d < bd) { bd = d; best = i; } }); focus = best; }
      else focus = Math.floor(t / 3.5) % assets.length;
      ground(ctx, w, gy);
      assets.forEach((a, i) => {
        f[i] = lerp(f[i], i === focus ? 1 : 0, 0.07);
        const cx = a.x * w, bw = a.w * w, bh = a.h * h;
        // protective domes
        for (let r = 0; r < 3; r++) {
          const R = Math.max(bw, bh) * (0.75 + r * 0.22) * (0.9 + f[i] * 0.15);
          ctx.strokeStyle = r === 0 ? C.goldA(0.15 + f[i] * 0.6) : C.skyA(0.06 + f[i] * 0.3);
          ctx.setLineDash(r === 1 ? [3, 6] : []);
          ctx.lineDashOffset = -t * 8;
          ctx.beginPath(); ctx.arc(cx, gy, R, Math.PI, TAU); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = i === focus ? 'rgba(243,234,217,.9)' : C.line;
        ctx.lineWidth = 1.2;
        const x0 = cx - bw / 2;
        ctx.beginPath();
        if (a.type === 'factory') {
          ctx.moveTo(x0, gy); ctx.lineTo(x0, gy - bh * 0.6);
          for (let s = 0; s < 3; s++) { const sx = x0 + (bw / 3) * s; ctx.lineTo(sx + bw / 6, gy - bh); ctx.lineTo(sx + bw / 3, gy - bh * 0.6); }
          ctx.lineTo(x0 + bw, gy);
          ctx.moveTo(x0 + bw * 0.8, gy - bh * 0.6); ctx.lineTo(x0 + bw * 0.8, gy - bh * 1.35); ctx.lineTo(x0 + bw * 0.88, gy - bh * 1.35); ctx.lineTo(x0 + bw * 0.88, gy - bh * 0.7);
        } else if (a.type === 'tower') {
          ctx.moveTo(x0, gy); ctx.quadraticCurveTo(x0 + bw * 0.3, gy - bh * 0.5, x0 + bw * 0.12, gy - bh);
          ctx.lineTo(x0 + bw * 0.88, gy - bh); ctx.quadraticCurveTo(x0 + bw * 0.7, gy - bh * 0.5, x0 + bw, gy);
        } else if (a.type === 'spire') {
          ctx.moveTo(x0, gy); ctx.lineTo(x0 + bw * 0.25, gy - bh * 0.85); ctx.lineTo(cx, gy - bh * 1.05); ctx.lineTo(x0 + bw * 0.75, gy - bh * 0.85); ctx.lineTo(x0 + bw, gy);
          for (let k = 1; k < 6; k++) { const yy = gy - (bh * 0.85 * k) / 6; const inset = (bw * 0.25 * k) / 6; ctx.moveTo(x0 + inset, yy); ctx.lineTo(x0 + bw - inset, yy); }
        } else {
          ctx.rect(x0, gy - bh, bw * 0.55, bh); ctx.rect(x0 + bw * 0.6, gy - bh * 0.7, bw * 0.4, bh * 0.7);
        }
        ctx.stroke();
        // windows / lights
        for (let k = 0; k < 6; k++) {
          const lx = x0 + bw * (0.15 + (k % 3) * 0.3), ly = gy - bh * (0.2 + Math.floor(k / 3) * 0.25);
          ctx.fillStyle = `rgba(226,207,165,${(0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + k + i))) * (0.4 + f[i] * 0.6)})`;
          ctx.fillRect(lx, ly, 2, 2);
        }
        if (f[i] > 0.5) label(ctx, 'PROTECTION LAYERS', cx, gy - Math.max(bw, bh) * 1.25 - 8, `rgba(226,207,165,${(f[i] - 0.5) * 2})`);
      });
      out(assets[focus].k, assets[focus].b);
    };
  };

  /* ---- 02 · Engineering: a project timeline from groundworks to operation ---- */
  DRAW.engineering = (cv, out) => {
    const phases = [
      ['Groundworks', "Contractors' All Risks (CAR)"],
      ['Construction', 'CAR · Construction & Installation'],
      ['Plant erection', 'Erection All Risks (EAR)'],
      ['Testing & commissioning', 'EAR · Cold / hot testing'],
      ['Operation', 'Machinery Breakdown · ALOP'],
    ];
    let k = 0;
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const p = px(st, w);
      const target = p != null ? clamp((p - w * 0.1) / (w * 0.8), 0, 1) : (Math.sin(t * 0.35) * 0.5 + 0.5);
      k = lerp(k, target, 0.06);
      const gy = h * 0.72, x0 = w * 0.1, x1 = w * 0.9;
      ground(ctx, w, gy);
      // crane
      const cx = x0 + (x1 - x0) * 0.32, top = h * 0.2;
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx - 8, gy); ctx.lineTo(cx - 8, top); ctx.moveTo(cx + 8, gy); ctx.lineTo(cx + 8, top);
      for (let y = gy; y > top; y -= 18) { ctx.moveTo(cx - 8, y); ctx.lineTo(cx + 8, y - 18); }
      const jib = w * 0.3;
      ctx.moveTo(cx - jib * 0.3, top); ctx.lineTo(cx + jib, top); ctx.moveTo(cx, top - 24); ctx.lineTo(cx + jib, top); ctx.moveTo(cx, top - 24); ctx.lineTo(cx - jib * 0.3, top);
      ctx.stroke();
      const hookX = cx + jib * (0.25 + 0.6 * k);
      const hookY = top + (gy - top) * (0.35 + 0.15 * Math.sin(t));
      ctx.strokeStyle = C.goldA(0.8);
      ctx.beginPath(); ctx.moveTo(hookX, top); ctx.lineTo(hookX, hookY); ctx.stroke();
      ctx.strokeRect(hookX - 16, hookY, 32, 18);
      // structure rising with progress
      const bx = x0 + (x1 - x0) * 0.62, bw = w * 0.18, bh = (gy - h * 0.3) * clamp(k * 1.4, 0.1, 1);
      ctx.strokeStyle = C.line;
      ctx.strokeRect(bx, gy - bh, bw, bh);
      for (let y = gy - 20; y > gy - bh; y -= 20) { ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke(); }
      // turbines / renewables appear at operation
      if (k > 0.75) {
        const a = clamp((k - 0.75) * 4, 0, 1);
        for (let i = 0; i < 2; i++) {
          const tx = x1 - 30 - i * 50, ty = gy - 90;
          ctx.strokeStyle = C.goldA(a * 0.8);
          ctx.beginPath(); ctx.moveTo(tx, gy); ctx.lineTo(tx, ty); ctx.stroke();
          for (let b = 0; b < 3; b++) { const ang = t * 1.5 + (b * TAU) / 3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + Math.cos(ang) * 26, ty + Math.sin(ang) * 26); ctx.stroke(); }
        }
      }
      // timeline
      const ty = h * 0.86;
      ctx.strokeStyle = C.faint; ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
      ctx.strokeStyle = C.goldA(0.9); ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x0 + (x1 - x0) * k, ty); ctx.stroke();
      phases.forEach((ph, i) => {
        const x = x0 + ((x1 - x0) * i) / (phases.length - 1);
        const on = k >= i / (phases.length - 1) - 0.02;
        ctx.fillStyle = on ? '#e2cfa5' : 'rgba(135,167,198,.4)';
        ctx.beginPath(); ctx.arc(x, ty, on ? 4 : 3, 0, TAU); ctx.fill();
      });
      SKY.sparkle(ctx, x0 + (x1 - x0) * k, ty, 9, 1);
      const idx = Math.min(phases.length - 1, Math.round(k * (phases.length - 1)));
      out(phases[idx][0], phases[idx][1]);
    };
  };

  /* ---- 03 · Casualty: an operator at the centre of its third parties ---- */
  DRAW.casualty = (cv, out) => {
    const parties = [
      ['Workforce & operations', 'Commercial General Liability (CGL)', -2.4],
      ['Third parties & property', 'Third-Party Liability', -1.3],
      ['Digital estate', 'Cyber', -0.2],
      ['Clients & advisers', 'Professional Indemnity (PI)', 0.9],
      ['Project consortium', 'Project Liability', 2.0],
    ];
    let focus = 0, f = parties.map(() => 0);
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.52, R = Math.min(w, h) * 0.34;
      const pos = parties.map((p) => [cx + Math.cos(p[2]) * R * 1.15, cy + Math.sin(p[2]) * R * 0.85]);
      if (st.p.inside) { let bd = 1e9; pos.forEach((q, i) => { const d = Math.hypot(q[0] - st.p.sx, q[1] - st.p.sy); if (d < bd) { bd = d; focus = i; } }); }
      else focus = Math.floor(t / 3) % parties.length;
      ctx.strokeStyle = C.faint;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.15, R * 0.85, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.6, R * 0.45, 0, 0, TAU); ctx.stroke();
      pos.forEach((q, i) => {
        f[i] = lerp(f[i], i === focus ? 1 : 0, 0.08);
        ctx.strokeStyle = f[i] > 0.1 ? C.goldA(0.2 + f[i] * 0.7) : 'rgba(135,167,198,.2)';
        ctx.setLineDash(f[i] > 0.1 ? [] : [3, 6]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(q[0], q[1]); ctx.stroke();
        ctx.setLineDash([]);
        // shield arc around the party when covered
        ctx.strokeStyle = C.goldA(f[i] * 0.9);
        ctx.beginPath(); ctx.arc(q[0], q[1], 18 + f[i] * 6, -Math.PI * 0.9, -Math.PI * 0.1); ctx.stroke();
        ctx.fillStyle = f[i] > 0.5 ? '#e2cfa5' : 'rgba(243,234,217,.7)';
        ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, TAU); ctx.fill();
        const k = (t * 0.6 + i * 0.2) % 1;
        if (f[i] > 0.3) SKY.glow(ctx, lerp(cx, q[0], k), lerp(cy, q[1], k), 8, '226,207,165', f[i] * 0.8);
        label(ctx, parties[i][0].toUpperCase(), q[0], q[1] + 34, `rgba(243,234,217,${0.35 + f[i] * 0.6})`, 'center', 9);
      });
      SKY.glow(ctx, cx, cy, R * 0.5, '135,167,198', 0.18);
      SKY.drawMark(ctx, cx, cy, R * 0.45, { star: 0.5 + 0.5 * f[focus] });
      out(parties[focus][0], parties[focus][1]);
    };
  };

  /* ---- 04 · Marine Cargo: a working port, from ocean voyage to start-up ---- */
  DRAW.marine = (cv, out) => {
    const zones = [
      ['Ocean voyage', 'Marine Cargo · Annual or single transit'],
      ['Heavy-lift project cargo', 'Project Cargo Risks Only'],
      ['Air freight', 'Goods in Transit · Air'],
      ['Road & rail onward', 'Goods in Transit · Road & Rail'],
      ['Arrival at site', 'Delay in Start-Up (DSU)'],
    ];
    let focus = 0;
    const f = zones.map(() => 0);
    const box = (ctx, x, y, w, h, fill) => { if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); } ctx.strokeRect(x, y, w, h); };
    // container colours: muted brand tints, fixed per slot
    const tint = ['rgba(148,123,76,.55)', 'rgba(135,167,198,.35)', 'rgba(9,29,60,.9)', 'rgba(226,207,165,.4)', 'rgba(135,167,198,.18)'];
    const slot = (i, j) => tint[(i * 7 + j * 3) % tint.length];
    const hl = (k, base = 0.5) => `rgba(243,234,217,${base + k * (0.95 - base)})`;
    const e3 = (k) => k * k * (3 - 2 * k);
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const wl = h * 0.66, quayX = w * 0.66, quayY = h * 0.62, railY = h * 0.8;
      // focus by pointer region, or a slow tour
      if (st.p.inside) {
        const x = st.p.sx, y = st.p.sy;
        focus = y < h * 0.3 ? (x > w * 0.6 ? 4 : 2) : y > h * 0.74 ? 3 : x < w * 0.56 ? 0 : 1;
      } else focus = Math.floor(t / 3.2) % zones.length;
      zones.forEach((_, i) => (f[i] = lerp(f[i], i === focus ? 1 : 0, 0.08)));

      // the Sky Re star low over the sea, with its reflection
      const sx = w * 0.1, sy = h * 0.4;
      SKY.glow(ctx, sx, sy, 40, '226,207,165', 0.18);
      SKY.sparkle(ctx, sx, sy, 7, 0.85);
      for (let i = 0; i < 7 && wl + 8 + i * 7 < railY - 4; i++) {
        const ww = (14 - i * 1.4) * (0.7 + 0.3 * Math.sin(t * 2 + i));
        ctx.fillStyle = `rgba(226,207,165,${0.28 - i * 0.03})`;
        ctx.fillRect(sx - ww / 2, wl + 8 + i * 7, ww, 1.2);
      }

      // sea: drifting swell lines
      for (let i = 0; i < 6; i++) {
        const y0 = wl + 4 + i * ((railY - wl - 14) / 6), amp = 1.6 + i * 0.5, sp = 0.9 + i * 0.25;
        ctx.strokeStyle = C.skyA(0.28 - i * 0.035);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= quayX; x += 6) { const y = y0 + Math.sin(x * (0.035 - i * 0.003) - t * sp) * amp; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }

      // quay edge with bollards
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(quayX, railY); ctx.lineTo(quayX, quayY); ctx.lineTo(w, quayY); ctx.stroke();
      for (let x = quayX + 12; x < w; x += 34) { ctx.beginPath(); ctx.moveTo(x, quayY); ctx.lineTo(x, quayY - 4); ctx.stroke(); }
      ctx.strokeStyle = C.faint;
      for (let x = quayX + 6; x < w; x += 22) { ctx.beginPath(); ctx.moveTo(x, quayY); ctx.lineTo(x - 8, quayY + 8); ctx.stroke(); }

      // container ship alongside, riding the swell
      const L = w * 0.46, sxc = w * 0.38, H = L * 0.13;
      const bob = Math.sin(t * 1.1) * 2.2, roll = Math.sin(t * 0.9) * 0.012;
      const deck = -H * 0.45, cw = L * 0.058, ch = H * 0.42;
      ctx.save();
      ctx.translate(sxc, wl + bob);
      ctx.rotate(roll);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = hl(f[0], 0.55);
      ctx.fillStyle = 'rgba(0,20,31,.92)';
      ctx.beginPath();
      ctx.moveTo(-L / 2, deck);
      ctx.lineTo(L / 2 + L * 0.05, deck - H * 0.12);
      ctx.quadraticCurveTo(L / 2 - L * 0.01, H * 0.1, L / 2 - L * 0.06, H * 0.32);
      ctx.lineTo(-L / 2 + L * 0.03, H * 0.32);
      ctx.quadraticCurveTo(-L / 2 - L * 0.01, H * 0.1, -L / 2, deck);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.goldA(0.35 + f[0] * 0.5);
      ctx.beginPath(); ctx.moveTo(-L / 2 + L * 0.02, H * 0.08); ctx.lineTo(L / 2 - L * 0.01, H * 0.08); ctx.stroke();
      // bridge and funnel at the stern
      ctx.strokeStyle = hl(f[0], 0.5);
      box(ctx, -L * 0.45, deck - H * 1.5, L * 0.09, H * 1.5, 'rgba(9,29,60,.95)');
      box(ctx, -L * 0.47, deck - H * 1.62, L * 0.13, H * 0.14);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = `rgba(226,207,165,${0.3 + 0.5 * f[0] * (0.5 + 0.5 * Math.sin(t * 2 + r + c))})`; ctx.fillRect(-L * 0.44 + c * L * 0.028, deck - H * 1.35 + r * H * 0.35, 2.2, 2.2); }
      ctx.beginPath(); ctx.moveTo(-L * 0.38, deck - H * 1.5); ctx.lineTo(-L * 0.375, deck - H * 2); ctx.lineTo(-L * 0.35, deck - H * 2); ctx.lineTo(-L * 0.345, deck - H * 1.5); ctx.stroke();
      for (let i = 0; i < 4; i++) { const k = (t * 0.25 + i / 4) % 1; SKY.glow(ctx, -L * 0.36 - k * L * 0.12, deck - H * 2.1 - k * H * 1.2, 6 + k * 10, '185,205,224', 0.18 * (1 - k)); }
      // container stacks; the crane fills the gap in the forward bay
      for (let i = 0; i < 11; i++) {
        const tiers = 2 + ((i * 5) % 3 === 0 ? 1 : 0) + (i > 2 && i < 8 ? 1 : 0);
        for (let j = 0; j < tiers; j++) {
          if (i === 9 && j === tiers - 1) continue;
          ctx.strokeStyle = C.skyA(0.35 + f[0] * 0.4);
          box(ctx, -L * 0.33 + i * cw * 1.04, deck - (j + 1) * ch, cw, ch, slot(i, j));
        }
      }
      ctx.strokeStyle = hl(f[0], 0.4);
      ctx.beginPath(); ctx.moveTo(L * 0.42, deck); ctx.lineTo(L * 0.42, deck - H * 1.1); ctx.stroke();
      SKY.glow(ctx, L * 0.42, deck - H * 1.1, 5, '226,207,165', 0.7);
      ctx.restore();
      // wake curling from the stern
      ctx.strokeStyle = C.skyA(0.3);
      ctx.setLineDash([3, 6]); ctx.lineDashOffset = t * 12;
      for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(sxc - L * 0.5, wl + H * 0.25 + bob); ctx.quadraticCurveTo(sxc - L * 0.62, wl + H * (0.5 + k * 0.4), sxc - L * 0.8 - k * 20, wl + H * (0.4 + k * 0.6)); ctx.stroke(); }
      ctx.setLineDash([]);
      if (f[0] > 0.05) label(ctx, 'SEA FREIGHT', sxc - L * 0.05, wl - H * 2.5, `rgba(226,207,165,${f[0]})`);

      // ship-to-shore crane loading the ship
      const gx = w * 0.84, top = h * 0.3, legW = w * 0.065;
      const boomL = w * 0.5, boomR = w * 0.98;
      ctx.strokeStyle = hl(f[1], 0.45); ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(gx - legW, quayY); ctx.lineTo(gx - legW, top); ctx.moveTo(gx + legW, quayY); ctx.lineTo(gx + legW, top);
      for (let y = quayY - 18; y > top + 8; y -= 22) { ctx.moveTo(gx - legW, y); ctx.lineTo(gx + legW, y - 18); }
      ctx.moveTo(boomL, top); ctx.lineTo(boomR, top);
      ctx.moveTo(gx, top - h * 0.08); ctx.lineTo(boomL + w * 0.04, top); ctx.moveTo(gx, top - h * 0.08); ctx.lineTo(boomR, top);
      ctx.moveTo(gx - legW, top); ctx.lineTo(gx, top - h * 0.08); ctx.lineTo(gx + legW, top);
      ctx.stroke();
      // cycle: lower on the quay, hoist, travel out, lower into the bay, hoist, return
      const cyc = (t / 9) % 1, heavy = Math.floor(t / 9) % 2 === 1;
      const seg = (a, b) => clamp((cyc - a) / (b - a), 0, 1);
      const pickX = gx, dropX = sxc - L * 0.33 + 9 * cw * 1.04 + cw / 2;
      const trolleyX = lerp(lerp(pickX, dropX, e3(seg(0.22, 0.48))), pickX, e3(seg(0.76, 0.96)));
      const lw = heavy ? cw * 1.7 : cw, lh = heavy ? ch * 1.5 : ch;
      const high = top + h * 0.05, low = quayY - lh, shipY = wl + bob + deck - ch * 2 - lh;
      let hookY = high;
      if (cyc < 0.22) hookY = lerp(high, low, e3(seg(0, 0.1)) - e3(seg(0.1, 0.22)));
      else if (cyc > 0.48 && cyc < 0.76) hookY = lerp(high, shipY, e3(seg(0.5, 0.6)) - e3(seg(0.64, 0.76)));
      ctx.strokeStyle = C.goldA(0.5 + f[1] * 0.45);
      box(ctx, trolleyX - 7, top - 3, 14, 6);
      ctx.beginPath(); ctx.moveTo(trolleyX - 3, top + 3); ctx.lineTo(trolleyX - 3, hookY); ctx.moveTo(trolleyX + 3, top + 3); ctx.lineTo(trolleyX + 3, hookY); ctx.stroke();
      // the load waits on the quay, rides the spreader, then settles into the bay
      if (cyc < 0.99) {
        const stowed = cyc >= 0.6;
        const lx = (cyc < 0.1 ? pickX : stowed ? dropX : trolleyX) - lw / 2, ly = cyc < 0.1 ? low : stowed ? shipY : hookY;
        ctx.globalAlpha = 1 - seg(0.9, 0.99);
        ctx.strokeStyle = heavy ? C.goldA(0.75 + f[1] * 0.25) : C.skyA(0.6 + f[1] * 0.4);
        if (heavy) {
          // a project module: a transformer on its skid
          box(ctx, lx, ly + lh * 0.75, lw, lh * 0.25, 'rgba(148,123,76,.35)');
          box(ctx, lx + lw * 0.12, ly + lh * 0.2, lw * 0.76, lh * 0.55, 'rgba(9,29,60,.95)');
          for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(lx + lw * (0.3 + k * 0.2), ly + lh * 0.2); ctx.lineTo(lx + lw * (0.3 + k * 0.2), ly + lh * 0.06); ctx.stroke(); }
          if (f[1] > 0.3) SKY.glow(ctx, lx + lw / 2, ly + lh / 2, lw, '226,207,165', 0.25 * f[1]);
        } else box(ctx, lx, ly, lw, lh, slot(9, 3));
        ctx.globalAlpha = 1;
      }
      if (f[1] > 0.05) label(ctx, heavy ? 'PROJECT CARGO' : 'LOADING', gx, quayY + 20, `rgba(226,207,165,${f[1]})`);

      // shore embankment and the cargo train on its rail spur
      ctx.fillStyle = 'rgba(0,20,31,.85)'; ctx.fillRect(0, railY + 12, w, h - railY);
      ctx.strokeStyle = C.faint; ctx.beginPath(); for (let x = 0; x < w; x += 22) { ctx.moveTo(x, railY + 14); ctx.lineTo(x - 8, railY + 22); } ctx.stroke();
      ctx.strokeStyle = C.skyA(0.35 + f[3] * 0.4);
      ctx.beginPath(); ctx.moveTo(0, railY + 9); ctx.lineTo(w, railY + 9); ctx.moveTo(0, railY + 12); ctx.lineTo(w, railY + 12); ctx.stroke();
      const carW = Math.max(30, w * 0.07), trainX = ((t * 34) % (w + carW * 8)) - carW * 6;
      for (let c = 0; c < 6; c++) {
        const x = trainX + c * (carW + 4);
        if (x > w || x + carW < 0) continue;
        if (c === 5) {
          ctx.strokeStyle = hl(f[3], 0.5);
          ctx.beginPath(); ctx.moveTo(x, railY + 6); ctx.lineTo(x, railY - 10); ctx.lineTo(x + carW * 0.7, railY - 10); ctx.lineTo(x + carW, railY - 2); ctx.lineTo(x + carW, railY + 6); ctx.closePath(); ctx.stroke();
          SKY.glow(ctx, x + carW, railY - 1, 10, '226,207,165', 0.6);
        } else { ctx.strokeStyle = C.skyA(0.4 + f[3] * 0.45); box(ctx, x, railY - 6, carW, 12, slot(c, 1)); }
        ctx.fillStyle = 'rgba(243,234,217,.6)';
        [0.2, 0.8].forEach((k) => { ctx.beginPath(); ctx.arc(x + carW * k, railY + 8, 1.8, 0, TAU); ctx.fill(); });
      }
      if (f[3] > 0.05) label(ctx, 'RAIL · ROAD', w * 0.5, railY - 18, `rgba(226,207,165,${f[3]})`);

      // air freight crossing high above
      const arc = (k) => [lerp(-w * 0.1, w * 1.1, k), h * 0.22 - Math.sin(k * Math.PI) * h * 0.06];
      const ak = (t / 14) % 1, [ax, ay] = arc(ak);
      ctx.strokeStyle = C.skyA(0.15 + f[2] * 0.3); ctx.setLineDash([4, 6]);
      ctx.beginPath(); for (let k = Math.max(0, ak - 0.35), first = true; k <= ak; k += 0.01, first = false) { const q = arc(k); first ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]); } ctx.stroke();
      ctx.setLineDash([]);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(-Math.cos(ak * Math.PI) * 0.12);
      ctx.strokeStyle = hl(f[2], 0.55); ctx.fillStyle = 'rgba(0,20,31,.9)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-14, -3, 12, -2.5); ctx.quadraticCurveTo(18, 0, 12, 2.5); ctx.quadraticCurveTo(-14, 3, -16, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(-6, -11); ctx.lineTo(-2, -11); ctx.lineTo(6, -2); ctx.moveTo(0, 2); ctx.lineTo(-6, 11); ctx.lineTo(-2, 11); ctx.lineTo(6, 2); ctx.moveTo(-14, -1); ctx.lineTo(-17, -7); ctx.lineTo(-13, -7); ctx.lineTo(-10, -2); ctx.stroke();
      ctx.restore();
      SKY.glow(ctx, ax - 16, ay, 5, '226,207,165', 0.8 * (0.5 + 0.5 * Math.sin(t * 6)));
      if (f[2] > 0.05) label(ctx, 'AIR FREIGHT', ax, ay - 20, `rgba(226,207,165,${f[2]})`);

      // start-up schedule: Delay in Start-Up cover waits at the end of the journey
      const narrow = w < 480;
      const bx0 = w * (narrow ? 0.56 : 0.64), bx1 = w * 0.92, by = Math.max(28, h * 0.13);
      const prog = (t / 9) % 1;
      ctx.strokeStyle = C.skyA(0.25 + f[4] * 0.4);
      ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
      ctx.strokeStyle = C.goldA(0.5 + f[4] * 0.5); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(lerp(bx0, bx1, prog), by); ctx.stroke(); ctx.lineWidth = 1;
      ['SHIP', 'ARRIVE', 'START-UP'].forEach((n, i) => {
        const x = lerp(bx0, bx1, i / 2);
        ctx.fillStyle = prog >= i / 2 - 0.01 ? '#e2cfa5' : 'rgba(135,167,198,.45)';
        ctx.beginPath(); ctx.arc(x, by, 3, 0, TAU); ctx.fill();
        if (!(narrow && i === 1)) label(ctx, n, x, by - 9, `rgba(243,234,217,${0.3 + f[4] * 0.6})`, i === 0 ? 'left' : i === 2 ? 'right' : 'center', 8);
      });
      SKY.sparkle(ctx, bx1, by, 6 + f[4] * 6 * (0.6 + 0.4 * Math.sin(t * 3)), 0.5 + f[4] * 0.5);
      if (f[4] > 0.05) label(ctx, 'DSU', bx1, by + 20, `rgba(226,207,165,${f[4]})`, 'right');

      out(zones[focus][0], zones[focus][1]);
    };
  };

  /* ---- 05 · Energy: upstream to downstream value chain ---- */
  DRAW.energy = (cv, out) => {
    const zones = [
      ['Upstream · drilling & production', 'Property Damage · Machinery Breakdown'],
      ['Gas processing & terminals', 'Property Damage · Business Interruption'],
      ['Downstream · refining & petrochemicals', 'PD · BI · Machinery Breakdown'],
    ];
    let k = 0.5;
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const p = px(st, w);
      k = lerp(k, p != null ? p / w : 0.5 + 0.45 * Math.sin(t * 0.3), 0.06);
      const z = Math.min(2, Math.floor(k * 3));
      const gy = h * 0.74;
      // sea on the upstream side
      ctx.strokeStyle = C.skyA(0.25);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let x = 0; x < w * 0.33; x += 6) { const y = gy + 8 + i * 10 + Math.sin(x * 0.05 + t * 1.5 + i) * 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      ground(ctx, w, gy);
      const zoneA = (i) => (z === i ? 1 : 0.35);
      // rig
      ctx.strokeStyle = `rgba(243,234,217,${0.4 + zoneA(0) * 0.5})`;
      ctx.lineWidth = 1.1;
      const rx = w * 0.16;
      ctx.beginPath();
      ctx.moveTo(rx - 40, gy); ctx.lineTo(rx - 40, gy - 30); ctx.lineTo(rx + 40, gy - 30); ctx.lineTo(rx + 40, gy);
      ctx.moveTo(rx - 14, gy - 30); ctx.lineTo(rx, gy - 130); ctx.lineTo(rx + 14, gy - 30);
      for (let y = gy - 50; y > gy - 125; y -= 18) { const s = ((gy - 30 - y) / 100) * 14; ctx.moveTo(rx - 14 + s, y); ctx.lineTo(rx + 14 - s, y - 18); }
      ctx.stroke();
      // flare
      const fl = 6 + Math.sin(t * 9) * 2 + Math.sin(t * 13) * 1.5;
      SKY.glow(ctx, rx + 46, gy - 60, 30, '226,207,165', 0.45 * zoneA(0));
      ctx.fillStyle = `rgba(226,207,165,${0.9 * zoneA(0)})`;
      ctx.beginPath(); ctx.ellipse(rx + 46, gy - 60 - fl, 4, fl, 0, 0, TAU); ctx.fill();
      // pipeline with flowing product
      const py = gy - 12;
      ctx.strokeStyle = C.skyA(0.45);
      ctx.beginPath(); ctx.moveTo(rx + 40, py); ctx.lineTo(w * 0.92, py); ctx.stroke();
      for (let i = 0; i < 14; i++) { const x = rx + 40 + (((t * 40 + i * 50) % (w * 0.76))); SKY.glow(ctx, x, py, 5, '226,207,165', 0.6); }
      // gas processing spheres
      ctx.strokeStyle = `rgba(243,234,217,${0.4 + zoneA(1) * 0.5})`;
      [0.44, 0.52].forEach((x) => { ctx.beginPath(); ctx.arc(w * x, gy - 34, 24, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * x - 16, gy); ctx.lineTo(w * x - 12, gy - 16); ctx.moveTo(w * x + 16, gy); ctx.lineTo(w * x + 12, gy - 16); ctx.stroke(); });
      // refinery columns
      ctx.strokeStyle = `rgba(243,234,217,${0.4 + zoneA(2) * 0.5})`;
      [[0.7, 120], [0.76, 90], [0.82, 140], [0.88, 70]].forEach(([x, hh]) => { ctx.strokeRect(w * x - 8, gy - hh, 16, hh); for (let y = gy - hh + 14; y < gy; y += 14) { ctx.beginPath(); ctx.moveTo(w * x - 8, y); ctx.lineTo(w * x + 8, y); ctx.stroke(); } });
      // zone brackets
      ['UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM'].forEach((n, i) => {
        const x0 = w * (0.04 + i * 0.32), x1 = x0 + w * 0.28;
        ctx.strokeStyle = z === i ? C.goldA(0.9) : C.skyA(0.2);
        ctx.beginPath(); ctx.moveTo(x0, h * 0.86); ctx.lineTo(x0, h * 0.88); ctx.lineTo(x1, h * 0.88); ctx.lineTo(x1, h * 0.86); ctx.stroke();
        label(ctx, n, (x0 + x1) / 2, h * 0.93, z === i ? 'rgba(226,207,165,.95)' : 'rgba(243,234,217,.4)', 'center', 9);
      });
      out(zones[z][0], zones[z][1]);
    };
  };

  /* ---- 06 · Treaty: the layered stack of a reinsurance programme ---- */
  DRAW.treaty = (cv, out) => {
    const layers = [
      ['Cedant retention', 'Net retention kept by the insurer', 0.18, 'sky'],
      ['Quota Share / Surplus', 'Proportional · shares premium & losses', 0.24, 'gold'],
      ['Risk Excess of Loss', 'Non-proportional · per-risk protection', 0.2, 'sky'],
      ['Catastrophe Excess of Loss', 'Non-proportional · per-event protection', 0.2, 'gold'],
      ['Aggregate Excess of Loss', 'Non-proportional · annual aggregate', 0.14, 'sky'],
    ];
    let focus = 1, f = layers.map(() => 0);
    return (ctx, w, h, t, dt, st) => {
      ctx.clearRect(0, 0, w, h);
      const x0 = w * 0.2, x1 = w * 0.8, yb = h * 0.86, yt = h * 0.14;
      const H = yb - yt;
      let y = yb;
      const rects = layers.map((l) => { const hh = H * l[2]; const r = [y - hh, hh]; y -= hh; return r; });
      if (st.p.inside) rects.forEach((r, i) => { if (st.p.sy <= r[0] + r[1] && st.p.sy >= r[0]) focus = i; });
      else focus = Math.floor(t / 2.6) % layers.length;
      rects.forEach((r, i) => {
        f[i] = lerp(f[i], i === focus ? 1 : 0, 0.1);
        const gold = layers[i][3] === 'gold';
        const inset = (1 - f[i]) * 14;
        ctx.fillStyle = gold ? `rgba(148,123,76,${0.12 + f[i] * 0.3})` : `rgba(135,167,198,${0.08 + f[i] * 0.22})`;
        ctx.fillRect(x0 + inset, r[0] + 3, x1 - x0 - inset * 2, r[1] - 6);
        ctx.strokeStyle = gold ? C.goldA(0.4 + f[i] * 0.6) : C.skyA(0.35 + f[i] * 0.55);
        ctx.strokeRect(x0 + inset, r[0] + 3, x1 - x0 - inset * 2, r[1] - 6);
        label(ctx, layers[i][0].toUpperCase(), x0 + inset + 16, r[0] + r[1] / 2 + 4, `rgba(243,234,217,${0.45 + f[i] * 0.55})`, 'left', 9);
        // a few particles of loss flowing through each layer
        for (let p = 0; p < 4; p++) { const k = (t * 0.25 + p / 4 + i * 0.1) % 1; SKY.glow(ctx, lerp(x0 + 30, x1 - 30, k), r[0] + r[1] / 2 + Math.sin(k * 6 + t) * r[1] * 0.2, 5, gold ? '226,207,165' : '185,205,224', 0.5 * f[i] + 0.15); }
      });
      // attachment marker
      const r = rects[focus];
      ctx.strokeStyle = 'rgba(226,207,165,.9)';
      ctx.beginPath(); ctx.moveTo(x1 + 10, r[0] + r[1]); ctx.lineTo(x1 + 30, r[0] + r[1]); ctx.moveTo(x1 + 20, r[0] + r[1]); ctx.lineTo(x1 + 20, r[0]); ctx.moveTo(x1 + 10, r[0]); ctx.lineTo(x1 + 30, r[0]); ctx.stroke();
      label(ctx, focus ? 'ATTACHES' : 'RETAINED', x1 + 38, r[0] + r[1] / 2 + 4, 'rgba(226,207,165,.85)', 'left', 9);
      out(layers[focus][0], layers[focus][1]);
    };
  };

  $$('canvas[data-pf]').forEach((cv) => {
    const vis = cv.parentElement;
    const fn = DRAW[cv.dataset.pf];
    if (fn) SKY.canvas(cv, fn(cv, readout(vis)), { pointerHost: vis });
  });

  /* ---------- filter ---------- */
  const filter = $('#pfFilter');
  if (filter) {
    const tabs = $$('[role="tab"]', filter);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        tabs.forEach((x) => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; });
        const f = t.dataset.f;
        const items = $$('.pf');
        gsap.to(items, {
          opacity: 0, y: 20, duration: 0.3, onComplete: () => {
            items.forEach((a) => a.classList.toggle('is-out', f !== 'all' && a.dataset.group !== f));
            ScrollTrigger.refresh();
            gsap.to(items.filter((a) => !a.classList.contains('is-out')), { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 });
            SKY.scrollTo(filter.closest('.sec'), { offset: -20 });
          },
        });
      });
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); n.click(); }
      });
    });
  }

  /* ---------- Treaty Structure Explorer ---------- */
  const tx = $('#txCv');
  if (tx) {
    const el = (id) => document.getElementById(id);
    const I = { loss: el('txLoss'), q: el('txQ'), si: el('txSI'), r: el('txR'), a: el('txA'), l: el('txL') };
    const O = { loss: el('txLossO'), q: el('txQO'), si: el('txSIO'), r: el('txRO'), a: el('txAO'), l: el('txLO') };
    const DESC = {
      qs: 'Quota Share: the reinsurer takes a fixed percentage of every risk, sharing premium and losses in the same proportion.',
      sp: 'Surplus: the cedant keeps a retention line; the reinsurer takes the surplus above it, up to a number of lines. Each risk is ceded in proportion to its size.',
      xl: 'Excess of Loss: the reinsurer pays the part of a loss above the attachment point, up to the layer limit. Losses beyond the layer return to the cedant.',
    };
    let mode = 'qs';
    const S = { ced: 0, re: 0, over: 0, cession: 0 };
    const V = { ced: 0, re: 0, over: 0 };
    const fmt = (v) => v.toFixed(1);
    function compute() {
      const loss = +I.loss.value;
      let re = 0, over = 0;
      if (mode === 'qs') re = loss * (+I.q.value / 100);
      if (mode === 'sp') {
        const si = +I.si.value, r = +I.r.value, lines = 9;
        const ceded = Math.min(Math.max(si - r, 0), lines * r);
        S.cession = si ? ceded / si : 0;
        const l = Math.min(loss, si);
        re = l * S.cession;
        if (loss > si) over = 0;
      }
      if (mode === 'xl') {
        const a = +I.a.value, l = +I.l.value;
        re = Math.min(Math.max(loss - a, 0), l);
        over = Math.max(loss - a - l, 0);
      }
      S.re = re; S.ced = loss - re; S.over = over;
      Object.keys(O).forEach((k) => { if (O[k]) O[k].textContent = k === 'q' ? I.q.value + '%' : fmt(+I[k].value); });
      if (mode === 'sp') O.r.textContent = fmt(+I.r.value) + ' · 9 lines';
      el('txCed').textContent = fmt(S.ced);
      el('txRe').textContent = fmt(S.re);
      Object.values(I).forEach((inp) => inp.style.setProperty('--v', ((inp.value - inp.min) / (inp.max - inp.min)) * 100 + '%'));
    }
    function setMode(m) {
      mode = m;
      $$('#txTabs [role="tab"]').forEach((t) => { t.setAttribute('aria-selected', t.dataset.s === m); t.tabIndex = t.dataset.s === m ? 0 : -1; });
      $$('.tx__ctl[data-for]').forEach((c) => (c.hidden = c.dataset.for !== m));
      el('txDesc').textContent = DESC[m];
      compute();
    }
    $$('#txTabs [role="tab"]').forEach((t) => t.addEventListener('click', () => setMode(t.dataset.s)));
    Object.values(I).forEach((inp) => inp.addEventListener('input', compute));
    setMode('qs');

    // drag on the chart to set the loss
    let dragging = false;
    const setFromY = (e) => {
      const r = tx.getBoundingClientRect();
      const k = 1 - clamp((e.clientY - r.top - r.height * 0.1) / (r.height * 0.78), 0, 1);
      I.loss.value = Math.max(1, Math.round(k * 100));
      compute();
    };
    tx.addEventListener('pointerdown', (e) => { dragging = true; tx.setPointerCapture(e.pointerId); setFromY(e); });
    tx.addEventListener('pointermove', (e) => dragging && setFromY(e));
    tx.addEventListener('pointerup', () => (dragging = false));

    SKY.canvas(tx, (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      V.ced = lerp(V.ced, S.ced, 0.12); V.re = lerp(V.re, S.re, 0.12); V.over = lerp(V.over, S.over, 0.12);
      const top = h * 0.1, bot = h * 0.88, H = bot - top;
      const y = (v) => bot - (v / 100) * H;
      const ax = w * 0.12;
      // axis
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1;
      for (let v = 0; v <= 100; v += 20) { ctx.beginPath(); ctx.moveTo(ax, y(v)); ctx.lineTo(w * 0.94, y(v)); ctx.stroke(); label(ctx, String(v), ax - 10, y(v) + 3, 'rgba(243,234,217,.4)', 'right', 9); }
      const loss = V.ced + V.re;
      const cx0 = w * 0.3, cw = w * 0.22;
      if (mode === 'xl') {
        const a = +I.a.value, l = +I.l.value;
        ctx.fillStyle = 'rgba(148,123,76,.1)';
        ctx.fillRect(ax, y(Math.min(100, a + l)), w * 0.82, y(a) - y(Math.min(100, a + l)));
        ctx.strokeStyle = C.goldA(0.6); ctx.setLineDash([5, 5]);
        [a, Math.min(100, a + l)].forEach((v) => { ctx.beginPath(); ctx.moveTo(ax, y(v)); ctx.lineTo(w * 0.94, y(v)); ctx.stroke(); });
        ctx.setLineDash([]);
        label(ctx, `LAYER ${l} XS ${a}`, w * 0.92, y(a + l / 2) + 3, 'rgba(226,207,165,.9)', 'right', 10);
        label(ctx, 'ATTACHMENT', w * 0.92, y(a) + 14, 'rgba(226,207,165,.6)', 'right', 9);
        // loss column: retention (bottom), layer (middle), above layer (top, back to cedant)
        const ret = Math.min(loss, a);
        ctx.fillStyle = 'rgba(135,167,198,.55)'; ctx.fillRect(cx0, y(ret), cw, y(0) - y(ret));
        ctx.fillStyle = 'rgba(194,165,111,.8)'; ctx.fillRect(cx0, y(ret + V.re), cw, y(ret) - y(ret + V.re));
        if (V.over > 0.05) {
          ctx.save(); ctx.beginPath(); ctx.rect(cx0, y(loss), cw, y(ret + V.re) - y(loss)); ctx.clip();
          ctx.fillStyle = 'rgba(135,167,198,.35)'; ctx.fillRect(cx0, y(loss), cw, H);
          ctx.strokeStyle = 'rgba(243,234,217,.35)';
          for (let s = -H; s < cw + H; s += 9) { ctx.beginPath(); ctx.moveTo(cx0 + s, y(loss)); ctx.lineTo(cx0 + s - 60, y(loss) + 60); ctx.stroke(); }
          ctx.restore();
          label(ctx, 'ABOVE LAYER · CEDANT', cx0 + cw + 12, y(loss) + 12, 'rgba(243,234,217,.6)', 'left', 9);
        }
      } else {
        // proportional: the loss column is split side by side in the ceded proportion
        const share = loss > 0 ? V.re / loss : 0;
        ctx.fillStyle = 'rgba(135,167,198,.55)'; ctx.fillRect(cx0, y(loss), cw * (1 - share), y(0) - y(loss));
        ctx.fillStyle = 'rgba(194,165,111,.8)'; ctx.fillRect(cx0 + cw * (1 - share), y(loss), cw * share, y(0) - y(loss));
        label(ctx, `${Math.round((1 - share) * 100)}%`, cx0 + (cw * (1 - share)) / 2, y(0) - 10, 'rgba(0,20,31,.9)', 'center', 10);
        label(ctx, `${Math.round(share * 100)}%`, cx0 + cw * (1 - share) + (cw * share) / 2, y(0) - 10, 'rgba(0,20,31,.9)', 'center', 10);
        if (mode === 'sp') {
          const si = +I.si.value, r = +I.r.value;
          ctx.strokeStyle = C.skyA(0.5); ctx.setLineDash([4, 6]);
          ctx.beginPath(); ctx.moveTo(ax, y(si)); ctx.lineTo(w * 0.94, y(si)); ctx.stroke();
          ctx.strokeStyle = C.goldA(0.6);
          ctx.beginPath(); ctx.moveTo(ax, y(r)); ctx.lineTo(w * 0.94, y(r)); ctx.stroke();
          ctx.setLineDash([]);
          label(ctx, 'SUM INSURED', w * 0.92, y(si) - 8, 'rgba(185,205,224,.8)', 'right', 9);
          label(ctx, 'RETENTION LINE', w * 0.92, y(r) - 8, 'rgba(226,207,165,.8)', 'right', 9);
        }
      }
      // loss marker
      ctx.strokeStyle = 'rgba(243,234,217,.85)';
      ctx.beginPath(); ctx.moveTo(cx0 - 14, y(loss)); ctx.lineTo(cx0 + cw + 14, y(loss)); ctx.stroke();
      SKY.sparkle(ctx, cx0 - 20, y(loss), 9, 1);
      label(ctx, `LOSS ${loss.toFixed(1)}`, cx0 - 32, y(loss) + 4, 'rgba(243,234,217,.9)', 'right', 10);
      // twin bars on the right: who pays
      const narrow = w < 520;
      const bx = narrow ? w * 0.62 : w * 0.64, bw = narrow ? w * 0.13 : w * 0.08, gap = narrow ? 10 : 16;
      [[V.ced, 'rgba(135,167,198,.6)', narrow ? 'CED.' : 'CEDANT'], [V.re, 'rgba(194,165,111,.85)', narrow ? 'RE.' : 'REINSURERS']].forEach(([v, col, n], i) => {
        const x = bx + i * (bw + gap);
        ctx.fillStyle = col; ctx.fillRect(x, y(v), bw, y(0) - y(v));
        label(ctx, n, x + bw / 2, bot + 18, 'rgba(243,234,217,.55)', 'center', 9);
        label(ctx, v.toFixed(1), x + bw / 2, y(v) - 8, 'rgba(243,234,217,.85)', 'center', 10);
      });
    });
  }
})();
