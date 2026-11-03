/* SKY RE — Partners: the ecosystem as a living system */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$, lerp } = SKY;
  const TAU = Math.PI * 2;

  const cv = $('#ecoCv');
  if (!cv) return;
  const CAPS = [
    'Complete ecosystem: risks move from insurers and brokers to Sky Re, which underwrites them on behalf of reinsurers under delegated authority, while capacity and protection flow back to the market.',
    'Insurers & brokers: insurance companies (cedants) and reinsurance brokers bring complex commercial risks to Sky Re, and receive capacity and protection in return.',
    'Underwriting authority: reinsurers grant Sky Re a written mandate, with lines, limits and guidelines, to assess, price and bind risks on their behalf.',
    'Reinsurers & capacity: local and international reinsurers provide the capacity and carry the risks bound on their behalf. Sky Re does not retain risk on its own balance sheet.',
  ];
  let view = 0;
  const em = [1, 1, 1];
  const tabs = $$('#ecoTabs [role="tab"]');
  const cards = $$('.cats .card');
  const setView = (v, scroll) => {
    view = v;
    tabs.forEach((t) => { const on = +t.dataset.v === v; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    cards.forEach((c) => c.classList.toggle('is-on', +c.dataset.v === v));
    $('#ecoCap').textContent = CAPS[v];
    if (scroll) SKY.scrollTo('#ecosystem');
  };
  tabs.forEach((t) => t.addEventListener('click', () => setView(+t.dataset.v)));
  cards.forEach((c) => c.addEventListener('click', () => setView(+c.dataset.v, true)));

  const L = [null, ['Insurers', 'CEDANTS'], null, ['Brokers', 'REINSURANCE BROKERS'], null];
  const R = [null, ['Local', 'REINSURERS'], null, ['International', 'REINSURERS'], null];
  let parts = [];

  SKY.canvas(cv, (ctx, w, h, t, dt) => {
    ctx.clearRect(0, 0, w, h);
    const tgt = [view === 0 || view === 1 ? 1 : 0.25, view === 0 || view === 2 ? 1 : 0.25, view === 0 || view === 3 ? 1 : 0.25];
    for (let i = 0; i < 3; i++) em[i] = lerp(em[i], tgt[i], 0.06);
    const small = w < 700;
    const cx = w / 2, cy = h * 0.5;
    const m = Math.min(w, h);
    const ringR = m * 0.16;
    const spread = small ? w * 0.36 : w * 0.34;
    const lx = cx - spread, rx = cx + spread;
    const nodeY = (i, n) => cy + (i - (n - 1) / 2) * m * (small ? 0.12 : 0.13);
    const ln = L.map((_, i) => [lx - Math.abs(i - 2) * m * 0.03, nodeY(i, L.length)]);
    const rn = R.map((_, i) => [rx + Math.abs(i - 2) * m * 0.03, nodeY(i, R.length)]);

    // orbits behind
    ctx.strokeStyle = 'rgba(135,167,198,.10)';
    [1.6, 2.3, 3.1].forEach((k) => { ctx.beginPath(); ctx.ellipse(cx, cy, ringR * k * 1.4, ringR * k * 0.7, 0, 0, TAU); ctx.stroke(); });

    // authority: dotted mandate lines from reinsurers to the ring
    ctx.setLineDash([3, 6]);
    ctx.lineDashOffset = t * 12;
    ctx.strokeStyle = `rgba(243,234,217,${0.08 + em[1] * 0.4})`;
    rn.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx + ringR * 0.95, cy + (y - cy) * 0.35); ctx.stroke(); });
    ctx.lineDashOffset = 0;
    ctx.strokeStyle = `rgba(194,165,111,${0.2 + em[1] * 0.6})`;
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);

    // links (risk lanes above, capacity lanes below)
    ln.forEach(([x, y]) => {
      ctx.strokeStyle = `rgba(194,165,111,${0.06 + em[0] * 0.16})`;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + cx) / 2, y - m * 0.05, cx - ringR, cy); ctx.stroke();
    });
    rn.forEach(([x, y]) => {
      ctx.strokeStyle = `rgba(135,167,198,${0.06 + em[2] * 0.16})`;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + cx) / 2, y + m * 0.05, cx + ringR, cy); ctx.stroke();
    });

    // particles
    for (const p of parts) {
      p.t += dt * p.s;
      if (p.t > 1) { p.t = 0; p.i = (Math.random() * 5) | 0; p.j = (Math.random() * 5) | 0; }
      const a = ln[p.i], b = rn[p.j];
      let x, y;
      const k = p.t;
      if (p.kind === 0) { // risk: market → Sky Re → reinsurers
        if (k < 0.5) { const q = k / 0.5; x = lerp(a[0], cx, q); y = lerp(a[1], cy, q) - Math.sin(q * Math.PI) * m * 0.03; }
        else { const q = (k - 0.5) / 0.5; x = lerp(cx, b[0], q); y = lerp(cy, b[1], q) - Math.sin(q * Math.PI) * m * 0.03; }
        const al = Math.sin(k * Math.PI) * (0.25 + em[0] * 0.75) * (k > 0.5 ? 0.35 + em[2] * 0.65 : 1);
        SKY.glow(ctx, x, y, 7, '226,207,165', al * 0.8);
      } else { // capacity & protection: reinsurers → Sky Re → market
        if (k < 0.5) { const q = k / 0.5; x = lerp(b[0], cx, q); y = lerp(b[1], cy, q) + Math.sin(q * Math.PI) * m * 0.03; }
        else { const q = (k - 0.5) / 0.5; x = lerp(cx, a[0], q); y = lerp(cy, a[1], q) + Math.sin(q * Math.PI) * m * 0.03; }
        const al = Math.sin(k * Math.PI) * (0.25 + em[2] * 0.75) * (k > 0.5 ? 0.35 + em[0] * 0.65 : 1);
        SKY.glow(ctx, x, y, 7, '185,205,224', al * 0.8);
      }
    }

    // nodes
    const node = (x, y, lab, rgb, e, right) => {
      if (!lab) {
        ctx.fillStyle = `rgba(${rgb},${0.3 + e * 0.5})`;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill();
        return;
      }
      const [label, sub] = lab;
      SKY.glow(ctx, x, y, 26, rgb, 0.25 * e);
      ctx.strokeStyle = `rgba(${rgb},${0.3 + e * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(${rgb},${0.4 + e * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
      if (!small) {
        ctx.textAlign = right ? 'left' : 'right';
        ctx.font = '500 13px Cairo, sans-serif'; ctx.letterSpacing = '0px';
        ctx.fillStyle = `rgba(243,234,217,${0.35 + e * 0.6})`;
        ctx.fillText(label, x + (right ? 18 : -18), y + 1);
        ctx.font = '600 9px Cairo, sans-serif'; ctx.letterSpacing = '2px';
        ctx.fillStyle = `rgba(${rgb},${0.3 + e * 0.5})`;
        ctx.fillText(sub, x + (right ? 18 : -18), y + 15);
      }
    };
    ln.forEach(([x, y], i) => node(x, y, L[i], '226,207,165', em[0], false));
    rn.forEach(([x, y], i) => node(x, y, R[i], '185,205,224', em[2], true));

    // group titles
    // on narrow screens the titles pin to the edges so they can never meet
    const ty = small ? nodeY(0, 5) - 34 : cy - m * 0.38;
    ctx.font = `600 ${small ? 9 : 10}px Cairo, sans-serif`; ctx.letterSpacing = small ? '2px' : '3px';
    ctx.fillStyle = `rgba(226,207,165,${0.4 + em[0] * 0.5})`;
    ctx.textAlign = small ? 'left' : 'center';
    ctx.fillText(small ? 'MARKET' : 'INSURANCE MARKET', small ? 14 : lx, ty);
    ctx.fillStyle = `rgba(185,205,224,${0.4 + em[2] * 0.5})`;
    ctx.textAlign = small ? 'right' : 'center';
    ctx.fillText(small ? 'CAPACITY' : 'REINSURANCE CAPACITY', small ? w - 14 : rx, ty);
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(243,234,217,${0.4 + em[1] * 0.5})`;
    ctx.fillText('ONSHORE MGA · RIYADH', cx, cy + ringR + 30);

    SKY.glow(ctx, cx, cy, ringR * 1.3, '226,207,165', 0.12 + em[1] * 0.1);
    SKY.drawMark(ctx, cx, cy, ringR * 1.1, { star: 0.5 + 0.5 * Math.sin(t * 1.5) ** 2 });
  }, {
    resize: () => {
      parts = Array.from({ length: 70 }, (_, i) => ({ kind: i % 2, t: Math.random(), s: 0.1 + Math.random() * 0.07, i: (Math.random() * 5) | 0, j: (Math.random() * 5) | 0 }));
    },
  });
})();
