/* ==========================================================================
   SKY RE — Home hero: the approved mark over a forming horizon
   The logo is drawn exactly as approved (vector, no effects): its two halves
   slide together along the diagonal and meet; on scroll they part (Global
   Reach ↔ Local Authority), rejoin, and the mark fades as the page moves on.
   The horizon behind it is a WebGL background layer.
   ========================================================================== */
(function () {
'use strict';
// Classic script (not an ES module) so it also runs when index.html is opened straight from disk.
const THREE = window.THREE;
const SKY = window.SKY;
const hero = document.querySelector('.hero');
const host = document.querySelector('.hero__gl');
const mark = hero && hero.querySelector('.hero__mark');
if (!hero || !mark) return;

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

/* ---------- the horizon: a planet's limb whose luminous crossing sits on the star ---------- */
function horizon() {
  if (!host || !THREE || !webglOK()) { hero.classList.add('no-gl'); return null; }
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const HU = { uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uForm: { value: 0 }, uPull: { value: 0 }, uOut: { value: 0 }, uLift: { value: 0 } };
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: HU,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
      fragmentShader: /* glsl */ `
        uniform vec2 uRes;
        uniform float uTime, uForm, uPull, uOut, uLift;
        varying vec2 vUv;
        void main(){
          vec2 q = (vUv - .5) * uRes / uRes.y;          // screen heights, y up, centred on the star
          q.y -= uLift;                                  // the star's crossing follows the mark when it lifts
          q /= 1. + uPull * uPull * 1.6;                 // the portal draws the horizon closer
          const float R = 2.4;                           // planet radius
          vec2 pc = vec2(0., -R);
          float d = length(q - pc) - R;                  // + above the limb, - on the planet
          float ax = abs(q.x);
          float reach = uForm * 1.9;
          float grow = smoothstep(reach, reach - .35, ax);   // the limb is drawn outward from the star
          float sun = exp(-ax * 1.15);
          float up = step(0., d);
          float atm = exp(-max(d, 0.) * 9.) * up;
          float atm2 = exp(-max(d, 0.) * 2.6) * up;
          float limb = exp(-abs(d) * 220.);
          float limbW = exp(-abs(d) * 45.);
          float surf = (1. - up) * exp(d * 7.);
          vec3 sky = vec3(.53, .65, .78), skyL = vec3(.73, .80, .88), gold = vec3(.89, .81, .65), white = vec3(1., .98, .94);
          vec3 col = sky * atm2 * .16 * (.4 + .6 * sun);
          col += skyL * atm * .42 * (.25 + .75 * sun);
          col += mix(gold, white, sun) * limb * 1.15 * (.35 + .65 * sun);
          col += skyL * limbW * .28 * (.3 + .7 * sun);
          col += vec3(.035, .09, .17) * surf * (.6 + .4 * sun);
          float d2 = length(q - pc) - (R + .2);          // the outer shell of the atmosphere
          col += sky * exp(-abs(d2) * 60.) * .10 * (.3 + .7 * sun);
          float rr = length(q);                          // sunrise behind the mark
          col += gold * exp(-rr * 5.5) * .35;
          col += white * exp(-abs(q.y) * 80.) * exp(-ax * 1.6) * .35;
          col += skyL * exp(-pow(q.x - sin(uTime * .12) * .9, 2.) * 18.) * limbW * .35;   // light travelling the limb
          col *= uForm * grow * (1. - uOut) * (1. + uPull * 1.6);
          float shade = (1. - up) * smoothstep(0., -.02, d) * .72 * uForm * (1. - uOut);   // the planet hides the stars behind it
          gl_FragColor = vec4(col, clamp(max(max(col.r, col.g), col.b) + shade, 0., 1.));
        }`,
    })
  ));
  const size = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); HU.uRes.value.set(w, h); };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);
  SKY._observers.push(ro);
  let visible = true;
  const io = new IntersectionObserver((es) => (visible = es[es.length - 1].isIntersecting));
  io.observe(hero);
  SKY._observers.push(io);
  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    HU.uTime.value += Math.min(clock.getDelta(), 0.05);
    renderer.render(scene, cam);
  })();
  hero.classList.add('has-gl');
  return HU;
}

const HU = horizon();
const gA = mark.querySelector('.hm-a');
const gB = mark.querySelector('.hm-b');

/* ---------- size: the mark keeps the proportions and footprint of the hero ---------- */
let unit = 1; // screen pixels per logo unit
let spread = 175; // how far (logo units) the halves part on scroll
let liftPx = 0; // how far the mark rises so the caption below never touches it
function fit() {
  const w = hero.clientWidth, h = hero.clientHeight;
  const px = Math.min(h / 1.62, w / (w < 760 ? 1.65 : 1.55));
  hero.style.setProperty('--mk', px.toFixed(1) + 'px');
  unit = px / SKY.LOGO;
  spread = w < 760 ? 92 : 175;
  const cap = hero.querySelector('.hero__cap');
  if (cap) {
    const capTop = h - (parseFloat(getComputedStyle(cap).bottom) || 0) - cap.offsetHeight;
    liftPx = Math.max(0, h / 2 + px / 2 + 28 - capTop);
  }
  sync();
}

/* ---------- state ----------
   U: arrival (horizon, then the halves meet)  ·  F: a replayable re-formation when scrolling back
   Sc: the scroll story's own layer (part / rejoin), blended over U so a ScrollTrigger refresh never
   undoes the formation  ·  X.out: the mark and horizon leaving as the page moves on */
const U = { horizon: 0, join: 0 };
const F = { join: 1 };
const Sc = { split: 0, lift: 0 };
const X = { out: 0 };
let gate = 1;
const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
function sync() {
  const o = X.out * gate;
  const join = U.join * F.join;
  // the halves travel only along the logo's own diagonal: the form itself is never altered
  const d = (1 - join) * 320 + Sc.split * spread;
  gA.setAttribute('transform', `translate(${(-d).toFixed(2)} ${(-d).toFixed(2)})`);
  gB.setAttribute('transform', `translate(${d.toFixed(2)} ${d.toFixed(2)})`);
  const a = smooth(0, 1, join) * (1 - smooth(0.2, 1, o));
  gA.style.opacity = gB.style.opacity = a.toFixed(3);
  const lift = Sc.lift * liftPx;
  mark.style.transform = `translate(-50%, calc(-50% - ${lift.toFixed(1)}px))`;
  if (HU) { HU.uForm.value = U.horizon; HU.uOut.value = o; HU.uLift.value = lift / (hero.clientHeight || 1); }
  if (host) host.style.opacity = 1 - smooth(0.75, 1, o);
}
fit();
new ResizeObserver(fit).observe(hero);
// the caption's height depends on the web font
document.fonts && document.fonts.ready.then(fit);

let introDone = false;
// the arrival fade runs on the foot's children, so it can never fight the scroll story's fade of the foot itself
const footKids = hero.querySelectorAll('.hero__foot > *');
gsap.set(footKids, { opacity: 0, y: 30 });
SKY.onReady(() => {
  gsap.to(footKids, { opacity: 1, y: 0, duration: 1.6, delay: 0.9, stagger: 0.08 });
  if (SKY.reduce) { Object.assign(U, { horizon: 1, join: 1 }); sync(); introDone = true; return; }
  gsap.timeline({ onUpdate: sync, onComplete: () => (introDone = true) })
    .to(U, { horizon: 1, duration: 2.4, ease: 'power2.inOut' }, 0)
    .to(U, { join: 1, duration: 2.6, ease: 'expo.out' }, 1.1);
});

/* ---------- scroll story — the hero is pinned while the mark tells its story ---------- */
const lblA = hero.querySelector('.hero__lbl--a');
const lblB = hero.querySelector('.hero__lbl--b');
const cap = hero.querySelector('.hero__cap');
const l1 = hero.querySelector('.hero__l1');
const l2 = hero.querySelector('.hero__l2');
const foot = hero.querySelector('.hero__foot');
const hud = hero.querySelectorAll('.hud, .eyebrow, .scroll-cue');

if (!SKY.reduce) {
  let reformTl = null;
  // scrolling back up into the hero: the halves meet again, as on arrival
  const reform = () => {
    if (!introDone) return;
    gate = 0;
    reformTl && reformTl.kill();
    F.join = 0;
    sync();
    reformTl = gsap.to(F, { join: 1, duration: 2.2, ease: 'expo.out', onUpdate: sync });
  };
  const settle = () => { reformTl && reformTl.progress(1); gate = 1; sync(); };
  const st = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: '+=260%', pin: true, scrub: 1, anticipatePin: 1, onEnterBack: reform, onLeave: settle },
    onUpdate() {
      // once the visitor is back above the fade, the next pass down fades it again
      if (gate === 0 && X.out < 0.001) gate = 1;
      sync();
    },
  });
  // explicit start values: at the top the hero text is always fully shown
  st.fromTo([l1, ...hud], { x: 0, y: 0, opacity: 1 }, { x: -60, y: -40, opacity: 0, duration: 0.14, immediateRender: false }, 0)
    .fromTo([l2, foot], { x: 0, y: 0, opacity: 1 }, { x: 60, y: 40, opacity: 0, duration: 0.14, immediateRender: false }, 0)
    .to(Sc, { split: 1, duration: 0.3, ease: 'power2.inOut' }, 0.08)
    .fromTo(lblA, { opacity: 0, x: 30, y: 30 }, { opacity: 1, x: 0, y: 0, duration: 0.12 }, 0.2)
    .fromTo(lblB, { opacity: 0, x: -30, y: -30 }, { opacity: 1, x: 0, y: 0, duration: 0.12 }, 0.22)
    .to([lblA, lblB], { opacity: 0, duration: 0.08 }, 0.44)
    .to(Sc, { split: 0, duration: 0.18, ease: 'power3.in' }, 0.44)
    .to(Sc, { lift: 1, duration: 0.08, ease: 'power2.inOut' }, 0.56)
    .fromTo(cap, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.62)
    .to(cap, { opacity: 0, y: -20, duration: 0.08 }, 0.82)
    .to(X, { out: 1, duration: 0.26, ease: 'power2.in' }, 0.8);
}

/* ---------- the star portal: the only way into the Brand Story ----------
   The hero text parts, the horizon draws in, then a ring of light opens from the star. */
const portal = hero.querySelector('.hero__portal');
const P = { pull: 0 };
let going = false, portalOff = true;
const setPull = () => { if (HU) HU.uPull.value = P.pull; };
const sides = () => ({
  left: [hero.querySelector('.hero__l1'), ...hero.querySelectorAll('.hero__in > .eyebrow, .hud')].filter(Boolean),
  right: [hero.querySelector('.hero__l2'), hero.querySelector('.hero__foot'), hero.querySelector('.scroll-cue')].filter(Boolean),
});
function enterStory() {
  if (going) return;
  going = true;
  try { sessionStorage.setItem('sky-bs', '1'); sessionStorage.setItem('sky-bs-in', '1'); } catch (e) {}
  if (SKY.reduce) { location.href = 'brand-story.html'; return; }
  SKY.lenis && SKY.lenis.stop();
  hero.classList.add('portal-off');
  // the ring always opens from the star, whichever control was used
  const r = portal.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const { left, right } = sides();
  gsap.timeline()
    .to(left, { x: -70, opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power2.in' }, 0)
    .to(right, { x: 70, opacity: 0, filter: 'blur(8px)', duration: 0.9, ease: 'power2.in' }, 0)
    .to(P, { pull: 1, duration: 1.4, ease: 'power3.in', onUpdate: setPull }, 0.1)
    .add(() => SKY.iris({ mode: 'in', x, y, from: 0, to: SKY.irisReach(x, y), dur: 1.15, keep: true, done: () => (location.href = 'brand-story.html') }), 0.85);
}
portal && portal.addEventListener('click', enterStory);
hero.querySelectorAll('[data-portal]').forEach((b) => b.addEventListener('click', enterStory));
// coming back with the browser's Back button restores the hero from the page cache
addEventListener('pageshow', (e) => {
  if (!e.persisted || !going) return;
  going = false;
  document.querySelectorAll('.iris').forEach((c) => c.remove());
  P.pull = 0; setPull();
  const { left, right } = sides();
  gsap.set([...left, ...right], { x: 0, opacity: 1, filter: 'none' });
  SKY.lenis && SKY.lenis.start();
});
// the portal opens once the mark has formed, and only while the hero is at rest at the top
gsap.ticker.add(() => {
  const off = going || !introDone || scrollY > 30;
  if (off !== portalOff) { portalOff = off; hero.classList.toggle('portal-off', off); }
});
})();
