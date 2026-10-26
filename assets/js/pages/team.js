/* SKY RE — Team: portrait cards with a "beyond the role" glimpse and a two-sided profile */
(function () {
  'use strict';
  const SKY = window.SKY;
  const { $, $$ } = SKY;

  // Illustrative profiles for design review (portraits, names and biographies are samples).
  const PEOPLE = [
    { id: 'omar', name: 'Omar Al Nasser', role: 'Underwriting Director · Property', img: 'team-saudi-omar', tenure: '12 years', focus: 'Property & facultative',
      bio: 'Omar brings together commercial property expertise, a considered view of complex exposures and a focus on long-term broker relationships. He helps translate a complete risk picture into clear underwriting conversations.',
      fav: [['Sport', 'Desert hiking'], ['Food', 'Kabsa'], ['Holiday destination', 'AlUla'], ['Creative pursuit', 'Photography']],
      bucket: ['Explore a new desert landscape', 'Learn another language', 'Create a collection of landscape photographs'],
      power: 'Turning complex questions into clear conversations.' },
    { id: 'sara', name: 'Sara Al Harbi', role: 'Underwriting Director · Casualty', img: 'team-saudi-sara', tenure: '10 years', focus: 'Casualty & commercial liability',
      bio: 'Sara takes a specialist approach to commercial liability, with curiosity about each business’s operating context and a commitment to constructive dialogue with brokers and capacity partners.',
      fav: [['Sport', 'Swimming'], ['Food', 'Mediterranean cuisine'], ['Holiday destination', 'Kyoto'], ['Creative pursuit', 'Architecture and reading']],
      bucket: ['Discover the architecture of a new city', 'Learn another language', 'Complete a meaningful creative project'],
      power: 'Seeing the connections that help a team find its next idea.' },
    { id: 'faisal', name: 'Faisal Al Qahtani', role: 'Broker Relationships Director', img: 'team-saudi-faisal', tenure: '14 years', focus: 'Broker & capacity relationships',
      bio: 'Faisal takes a relationship-led approach to specialist conversations, combining market curiosity with clear coordination between brokers and underwriting colleagues.',
      fav: [['Sport', 'Football'], ['Food', 'Jareesh'], ['Holiday destination', 'Asir'], ['Creative pursuit', 'Travel photography']],
      bucket: ['Walk a new mountain trail', 'Learn to sail', 'Visit a new cultural destination'],
      power: 'Bringing the right people into the same conversation.' },
    { id: 'noura', name: 'Noura Al Dosari', role: 'Head of Operations', img: 'team-saudi-noura', tenure: '11 years', focus: 'Operations & collaboration',
      bio: 'Noura brings careful coordination, a thoughtful approach to operational clarity and a commitment to helping teams communicate well.',
      fav: [['Sport', 'Walking'], ['Food', 'Saudi home cooking'], ['Holiday destination', 'AlUla'], ['Creative pursuit', 'Arabic calligraphy']],
      bucket: ['Learn a new creative craft', 'Explore another historic city', 'Complete a long-distance walking challenge'],
      power: 'Finding a clear path through a complex day.' },
  ];
  const src = (p) => `assets/img/team/${p.img}.jpg`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- cards ---------- */
  const grid = $('#people');
  grid.innerHTML = PEOPLE.map((p, i) => `
    <article class="person" id="${p.id}" data-reveal>
      <button class="portrait" type="button" data-profile="${i}" aria-label="Meet ${esc(p.name)}">
        <span class="ph ph--portrait"><img src="${src(p)}" alt="Portrait of ${esc(p.name)}" width="800" height="1200" loading="lazy"><i class="glint" aria-hidden="true"></i></span>
        <span class="portrait__peek">
          <span class="mono">Beyond the role</span>
          <b>${esc(p.fav[3][1])} &amp; ${esc(p.fav[0][1].toLowerCase())}.</b>
          <span class="portrait__go">Discover the person <span aria-hidden="true">↗</span></span>
        </span>
      </button>
      <span class="mono person__n">${String(i + 1).padStart(2, '0')} / 04</span>
      <h3>${esc(p.name)}</h3>
      <span class="role">${esc(p.role)}</span>
      <button class="open" type="button" data-profile="${i}">View profile <i aria-hidden="true">+</i></button>
    </article>`).join('');

  /* ---------- profile dialog ---------- */
  const modal = $('#bioModal');
  const box = $('.modal__box', modal);
  const tabs = SKY.tabs($('.profile__tabs', modal));
  let opener = null, current = 0;

  function fill(i) {
    const p = PEOPLE[i], next = PEOPLE[(i + 1) % PEOPLE.length];
    current = i;
    const img = $('#bioImg');
    img.src = src(p);
    img.alt = 'Portrait of ' + p.name;
    $('#bioName').textContent = p.name;
    $('#bioRole').textContent = p.role;
    $('#bioTenure').textContent = p.tenure;
    $('#bioFocus').textContent = p.focus;
    $('#bioText').textContent = p.bio;
    $('#bioFav').innerHTML = p.fav.map(([k, v]) => `<div><small>Favourite ${esc(k.toLowerCase())}</small><span>${esc(v)}</span></div>`).join('');
    $('#bioBucket').innerHTML = p.bucket.map((b) => `<li>${esc(b)}</li>`).join('');
    $('#bioPower').textContent = p.power;
    $('#bioNext').innerHTML = `Meet ${esc(next.name.split(' ')[0])} <span aria-hidden="true">→</span>`;
    tabs.select(0);
    history.replaceState(null, '', '#' + p.id);
  }
  function reveal() {
    const ph = $('.profile__pic .ph', modal);
    if (SKY.reduce) { ph.style.setProperty('--s', 220); return; }
    gsap.fromTo(ph, { '--s': 0 }, { '--s': 160, duration: 1.4, ease: 'expo.out' });
    gsap.fromTo($$('.profile__info > *', modal), { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.8, delay: 0.15 });
  }
  function open(i, from) {
    opener = from || document.activeElement;
    fill(i);
    modal.hidden = false;
    modal.classList.add('is-open');
    SKY.lenis && SKY.lenis.stop();
    gsap.fromTo($('.modal__bg', modal), { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo(box, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9 });
    reveal();
    $('.modal__x', modal).focus();
  }
  function close() {
    if (!modal.classList.contains('is-open')) return;
    gsap.to(box, { opacity: 0, y: 30, duration: 0.35, ease: 'power2.in' });
    gsap.to($('.modal__bg', modal), {
      opacity: 0, duration: 0.4, onComplete: () => {
        modal.classList.remove('is-open');
        modal.hidden = true;
        SKY.lenis && SKY.lenis.start();
        opener && opener.focus();
      },
    });
    history.replaceState(null, '', location.pathname);
  }
  $('#bioNext').addEventListener('click', () => { fill((current + 1) % PEOPLE.length); reveal(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-profile]');
    if (b) open(+b.dataset.profile, b);
  });
  $$('[data-close]', modal).forEach((b) => b.addEventListener('click', close));
  addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = $$('a[href], button:not([tabindex="-1"])', box);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // deep link: team.html#sara opens that profile
  SKY.onReady(() => {
    const i = PEOPLE.findIndex((p) => p.id === location.hash.slice(1));
    if (i >= 0) setTimeout(() => open(i, document.getElementById(PEOPLE[i].id)), 900);
  });
})();
