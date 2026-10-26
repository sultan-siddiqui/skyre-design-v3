/* ==========================================================================
   SKY RE — Home hero: the mark as a living constellation (WebGL)
   Thousands of stars converge into the two crescents; on scroll the
   crescents part (Global Reach ↔ Local Authority), rejoin, and the star
   is born — then the constellation disperses into the night sky.
   ========================================================================== */
(function () {
'use strict';
// Classic script (not an ES module) so it also runs when index.html is opened straight from disk.
const THREE = window.THREE;
const SKY = window.SKY;
const hero = document.querySelector('.hero');
const host = document.querySelector('.hero__gl');

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (hero && host && THREE && webglOK()) init();
else if (hero) hero.classList.add('no-gl');

/* ---------- sample points inside the official logo paths ---------- */
function sample(total, starCount) {
  const N = 900;
  const L = SKY.LOGO;
  const k = N / L;
  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  // id, group (0 upper/offshore · 1 lower/onshore · 2 star), kind (0 outer · 1 inner · 2 star)
  const layers = [['s0', 0, 0], ['s1', 0, 1], ['s2', 1, 0], ['s3', 1, 1], ['star', 2, 2]];
  const data = layers.map(([id]) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, N, N);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fill(new Path2D(SKY.paths[id]));
    const d = ctx.getImageData(0, 0, N, N).data;
    const fill = [], edge = [];
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const i = (y * N + x) * 4 + 3;
        if (d[i] > 127) {
          fill.push(y * N + x);
          if (d[i - 4] < 128 || d[i + 4] < 128 || d[i - N * 4] < 128 || d[i + N * 4] < 128) edge.push(y * N + x);
        }
      }
    }
    return { fill, edge };
  });
  const crescentArea = data.slice(0, 4).reduce((s, l) => s + l.fill.length, 0);
  const out = [];
  layers.forEach(([, group, kind], li) => {
    const { fill, edge } = data[li];
    const n = kind === 2 ? starCount : Math.round((fill.length / crescentArea) * total * (kind === 1 ? 2.1 : 0.9));
    for (let j = 0; j < n; j++) {
      const useEdge = kind !== 2 && Math.random() < 0.22 && edge.length;
      const src = useEdge ? edge : fill;
      const idx = src[(Math.random() * src.length) | 0];
      const px = (idx % N) + Math.random();
      const py = ((idx / N) | 0) + Math.random();
      out.push({ x: px / k, y: py / k, group, kind });
    }
  });
  return out;
}

function init() {
  const isSmall = innerWidth < 760;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || isSmall;
  const COUNT = lowPower ? 9000 : 17000;
  const STAR = lowPower ? 900 : 1600;
  const DUST = lowPower ? 900 : 1800;
  const SCALE = 2.5;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const world = new THREE.Group();
  scene.add(world);

  /* ---- particles ---- */
  const pts = sample(COUNT, STAR);
  const total = pts.length + DUST;
  const pos = new Float32Array(total * 3);
  const scat = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const rnd = new Float32Array(total * 4);
  const grp = new Float32Array(total);
  const cCloud = new THREE.Color('#f3ead9'), cSky = new THREE.Color('#87a7c6'), cSkyL = new THREE.Color('#b9cde0');
  const cGold = new THREE.Color('#947b4c'), cGoldXL = new THREE.Color('#e2cfa5'), cStar = new THREE.Color('#fff8ea');
  const tmp = new THREE.Color();
  const C = SKY.STAR_C;

  for (let i = 0; i < total; i++) {
    const p = pts[i];
    // scattered start: a deep, wide field behind the mark
    const th = Math.random() * Math.PI * 2;
    const rr = 2.2 + Math.pow(Math.random(), 0.6) * 7.5;
    scat[i * 3] = Math.cos(th) * rr * 1.25;
    scat[i * 3 + 1] = Math.sin(th) * rr * 0.75;
    scat[i * 3 + 2] = -Math.random() * 14 + 1.5;
    rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    if (p) {
      pos[i * 3] = ((p.x - C.x) / SKY.LOGO) * SCALE;
      pos[i * 3 + 1] = (-(p.y - C.y) / SKY.LOGO) * SCALE;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      grp[i] = p.group + (p.kind === 1 ? 0.25 : 0);
      if (p.kind === 0) tmp.copy(cCloud).lerp(Math.random() < 0.5 ? cSky : cSkyL, Math.random() * 0.45).multiplyScalar(0.86);
      else if (p.kind === 1) tmp.copy(cGold).lerp(cGoldXL, 0.25 + Math.random() * 0.6).multiplyScalar(1.3);
      else tmp.copy(cStar);
    } else {
      pos[i * 3] = scat[i * 3];
      pos[i * 3 + 1] = scat[i * 3 + 1];
      pos[i * 3 + 2] = scat[i * 3 + 2];
      grp[i] = 3;
      tmp.copy(Math.random() < 0.15 ? cGoldXL : cSkyL);
    }
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aScatter', new THREE.BufferAttribute(scat, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
  geo.setAttribute('aGroup', new THREE.BufferAttribute(grp, 1));

  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: 0 },
    uSplit: { value: 0 },
    uStar: { value: 0 },
    uDisperse: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uPR: { value: renderer.getPixelRatio() },
    uSize: { value: isSmall ? 2.6 : 2.2 },
    uSpread: { value: 0.8 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uForm, uSplit, uStar, uDisperse, uHover, uPR, uSize, uSpread;
      uniform vec2 uMouse;
      attribute vec3 aScatter;
      attribute vec3 aColor;
      attribute vec4 aRnd;
      attribute float aGroup;
      varying vec3 vColor;
      varying float vAlpha;
      float io(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
      void main(){
        float isDust = step(2.5, aGroup);
        float isStar = step(1.5, aGroup) * (1. - isDust);
        float isInner = step(.1, fract(aGroup)) * (1. - isStar);
        vec3 home = position;
        home.xy += vec2(sin(uTime*.7 + aRnd.y*20.), cos(uTime*.6 + aRnd.x*20.)) * .005;
        home.z  += sin(uTime*aRnd.z*1.3 + aRnd.y*30.) * .02;
        // the two crescents part along the diagonal of the mark
        vec2 dir = aGroup < .5 ? vec2(-.7071, .7071) : (aGroup < 1.5 ? vec2(.7071, -.7071) : vec2(0.));
        float sp = uSplit * (.92 + aRnd.x * .16);
        home.xy += dir * sp * uSpread;
        home.z  += sp * (aGroup < .5 ? .35 : -.35);
        // converge from the field (staggered, with a slight spiral)
        float f = io(clamp(uForm * 1.75 - aRnd.x * .75, 0., 1.)) * (1. - isDust);
        float ang = (1. - f) * (1.4 + aRnd.z);
        vec3 s = aScatter;
        s.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * s.xy;
        vec3 p = mix(s, home, f);
        // disperse toward the viewer
        float d = clamp(uDisperse * 1.6 - aRnd.w * .6, 0., 1.);
        d = d * d;
        vec3 far = aScatter * vec3(1.7, 1.7, 1.) + vec3(0., 0., 5.5);
        p = mix(p, far, d * (1. - isDust));
        if (isDust > .5) {
          p = aScatter + vec3(sin(uTime*.05*aRnd.z + aRnd.y*6.) * .3, cos(uTime*.04 + aRnd.x*6.) * .2, uDisperse * 4.);
        }
        // pointer: stars lean away from the cursor
        vec2 md = p.xy - uMouse;
        float ml = length(md);
        float push = smoothstep(.6, 0., ml) * uHover * (1. - d) * (1. - isDust);
        p.xy += normalize(md + 1e-4) * push * .24;
        p.z  += push * .4;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (.5 + aRnd.y * .95);
        size *= mix(1., uStar * 1.35, isStar);
        size *= isDust > .5 ? .8 : 1.;
        size *= 1. + isInner * .3;
        gl_PointSize = size * uPR * (5. / -mv.z);
        float tw = .72 + .28 * sin(uTime * (1. + aRnd.z * 3.) + aRnd.x * 40.);
        vAlpha = tw * mix(1., uStar, isStar) * (isDust > .5 ? .5 : mix(.78, 1., isInner)) * (1. - d * .55);
        vColor = aColor + isStar * uStar * .15;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main(){
        vec2 c = gl_PointCoord - .5;
        float r = length(c);
        if (r > .5) discard;
        float a = pow(smoothstep(.5, 0., r), 1.7);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  world.add(points);

  /* ---- star flare (four-point lens glow at the moment of joining) ---- */
  const flareU = { uI: { value: 0 }, uTime: uniforms.uTime };
  const flare = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.ShaderMaterial({
      uniforms: flareU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: /* glsl */ `
        uniform float uI, uTime;
        varying vec2 vUv;
        void main(){
          vec2 p = (vUv - .5) * 2.;
          float r = length(p);
          float core = exp(-r * 18.) * 1.6;
          float halo = exp(-r * 4.5) * .35;
          float rays = (exp(-abs(p.x) * 70.) * exp(-abs(p.y) * 2.2) + exp(-abs(p.y) * 70.) * exp(-abs(p.x) * 2.2)) * .9;
          float diag = (exp(-abs(p.x - p.y) * 60.) + exp(-abs(p.x + p.y) * 60.)) * exp(-r * 5.) * .25;
          float flick = .9 + .1 * sin(uTime * 3.1);
          vec3 c = mix(vec3(.886, .81, .647), vec3(1.), core);
          float a = (core + halo + rays + diag) * uI * flick;
          gl_FragColor = vec4(c * a, a);
        }`,
    })
  );
  flare.position.z = 0.05;
  world.add(flare);

  /* ---- instrument rings ---- */
  const rings = new THREE.Group();
  const ringMat = (o, c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false });
  const mkRing = (r, o, c, seg = 256, dash = false) => {
    const g = new THREE.BufferGeometry();
    const arr = [];
    for (let i = 0; i <= seg; i++) {
      if (dash && i % 4 > 1) continue;
      const a = (i / seg) * Math.PI * 2;
      arr.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return dash ? new THREE.LineSegments(g, ringMat(o, c)) : new THREE.LineLoop(g, ringMat(o, c));
  };
  const r1 = mkRing(1.9, 0.14, 0x87a7c6);
  const r2 = mkRing(2.35, 0.22, 0x947b4c, 360, true);
  const r3 = mkRing(2.9, 0.07, 0xf3ead9);
  r1.rotation.x = 1.15; r2.rotation.x = 1.25; r2.rotation.y = 0.35; r3.rotation.x = 1.05; r3.rotation.y = -0.4;
  rings.add(r1, r2, r3);
  world.add(rings);
  const ringMats = [r1.material, r2.material, r3.material];
  const ringBase = ringMats.map((m) => m.opacity);

  /* ---- sizing ---- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole mark in frame on portrait screens
    const vH = 2 * Math.tan(THREE.MathUtils.degToRad(17.5));
    const needW = SCALE * (w < 760 ? 1.12 : 1.55);
    const needH = SCALE * 1.62;
    camera.position.z = Math.max(needH / vH, needW / (vH * camera.aspect));
    camera.updateProjectionMatrix();
    uniforms.uPR.value = renderer.getPixelRatio();
    uniforms.uSpread.value = w < 760 ? 0.42 : 0.8;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  SKY._observers.push(ro);

  /* ---- state & choreography ---- */
  const U = { form: 0, split: 0, star: 0, disperse: 0, flare: 0, rings: 0 };
  const sync = () => {
    uniforms.uForm.value = U.form;
    uniforms.uSplit.value = U.split;
    uniforms.uStar.value = U.star;
    uniforms.uDisperse.value = U.disperse;
    flareU.uI.value = U.flare;
    ringMats.forEach((m, i) => (m.opacity = ringBase[i] * U.rings));
  };
  sync();

  let introDone = false;
  gsap.set(hero.querySelector('.hero__foot'), { opacity: 0, y: 30 });
  SKY.onReady(() => {
    gsap.to(hero.querySelector('.hero__foot'), { opacity: 1, y: 0, duration: 1.6, delay: 0.9 });
    if (SKY.reduce) {
      Object.assign(U, { form: 1, star: 1, flare: 0.35, rings: 1 });
      sync();
      introDone = true;
      return;
    }
    gsap.timeline({ onUpdate: sync, onComplete: () => (introDone = true) })
      .to(U, { form: 1, duration: 3.4, ease: 'power2.inOut' }, 0)
      .to(U, { rings: 1, duration: 2.4, ease: 'power2.out' }, 1.2)
      .to(U, { star: 1, duration: 1.2, ease: 'expo.out' }, 2.7)
      .to(U, { flare: 1, duration: 0.5, ease: 'expo.out' }, 2.75)
      .to(U, { flare: 0.32, duration: 1.8, ease: 'power2.out' }, 3.25);
  });

  // scroll story — the hero is pinned while the mark tells its story
  const lblA = hero.querySelector('.hero__lbl--a');
  const lblB = hero.querySelector('.hero__lbl--b');
  const cap = hero.querySelector('.hero__cap');
  const l1 = hero.querySelector('.hero__l1');
  const l2 = hero.querySelector('.hero__l2');
  const foot = hero.querySelector('.hero__foot');
  const hud = hero.querySelectorAll('.hud, .eyebrow, .scroll-cue');

  if (!SKY.reduce) {
    const st = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=260%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
      onUpdate() {
        if (introDone) sync();
      },
    });
    st.to([l1, ...hud], { x: -60, y: -40, opacity: 0, duration: 0.14 }, 0)
      .to([l2, foot], { x: 60, y: 40, opacity: 0, duration: 0.14 }, 0)
      .fromTo(U, { split: 0, star: 1, flare: 0.32, rings: 1, form: 1 }, { split: 1, star: 0, flare: 0, rings: 1, form: 1, duration: 0.3, ease: 'power2.inOut', immediateRender: false }, 0.08)
      .fromTo(lblA, { opacity: 0, x: 30, y: 30 }, { opacity: 1, x: 0, y: 0, duration: 0.12 }, 0.2)
      .fromTo(lblB, { opacity: 0, x: -30, y: -30 }, { opacity: 1, x: 0, y: 0, duration: 0.12 }, 0.22)
      .to([lblA, lblB], { opacity: 0, duration: 0.08 }, 0.44)
      .to(U, { split: 0, duration: 0.18, ease: 'power3.in' }, 0.44)
      .to(U, { star: 1, duration: 0.06, ease: 'power2.out' }, 0.6)
      .to(U, { flare: 1.25, duration: 0.05, ease: 'power2.out' }, 0.6)
      .to(U, { flare: 0.5, duration: 0.1 }, 0.65)
      .fromTo(cap, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.62)
      .to(cap, { opacity: 0, y: -20, duration: 0.08 }, 0.82)
      .to(U, { disperse: 1, rings: 0, flare: 0, duration: 0.26, ease: 'power2.in' }, 0.8)
      .to(host, { opacity: 0, duration: 0.06 }, 1);
  }

  /* ---- render loop ---- */
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(hero);
  (SKY._observers = SKY._observers || []).push(io);
  const clock = new THREE.Clock();
  const mouse = new THREE.Vector2(9, 9);
  let hover = 0, rx = 0, ry = 0;
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;
    const p = SKY.pointer;
    const r = host.getBoundingClientRect();
    const inside = p.active && p.y > r.top && p.y < r.bottom;
    if (inside) {
      ndc.set(((p.x - r.left) / r.width) * 2 - 1, -((p.y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        world.worldToLocal(hit);
        mouse.lerp(new THREE.Vector2(hit.x, hit.y), 0.15);
      }
    }
    hover += ((inside && SKY.fine ? 1 : 0) - hover) * 0.06;
    uniforms.uHover.value = hover;
    uniforms.uMouse.value.copy(mouse);
    // gentle 3D tilt toward the pointer (orientation of the mark is preserved)
    rx += ((p.active ? p.ny * 0.12 : 0) - rx) * 0.04;
    ry += ((p.active ? p.nx * 0.18 : 0) - ry) * 0.04;
    world.rotation.x = rx;
    world.rotation.y = ry;
    rings.rotation.z += dt * 0.04;
    r2.rotation.z -= dt * 0.08;
    flare.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
  }
  frame();
  hero.classList.add('has-gl');
}
})();
