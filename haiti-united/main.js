(() => {
  const D = window.HU;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  document.documentElement.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- render data ---------- */
  const fmtDate = iso => {
    const d = new Date(iso);
    return { m: d.toLocaleString('en-US', { month: 'short' }), d: d.getDate(),
      t: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
  };
  const upcoming = D.fixtures.filter(f => new Date(f.date) > Date.now());
  const fixList = $('#fixlist');
  const drawFix = mode => {
    fixList.innerHTML = mode === 'fixtures'
      ? (upcoming.length ? upcoming : D.fixtures).map(f => { const t = fmtDate(f.date);
          return `<li><div class="d">${t.m}<b>${t.d}</b></div>
          <div class="o">${f.home ? 'vs' : '@'} ${f.opp}<small>${f.venue} · ${t.t}</small></div>
          <span class="t">${f.comp}</span></li>`; }).join('')
      : D.results.map(r => { const c = r.us > r.them ? 'w' : r.us < r.them ? 'l' : 'd2';
          return `<li><div class="d">${r.date.split(' ')[0]}<b>${r.date.split(' ')[1]}</b></div>
          <div class="o">${r.home ? 'vs' : '@'} ${r.opp}<small>${r.comp}</small></div>
          <span class="s ${c}">${r.us}–${r.them}</span></li>`; }).join('');
    gsap.fromTo(fixList.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .07, duration: .6, ease: 'power3.out' });
  };
  drawFix('fixtures');
  $$('.tab').forEach(b => b.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.toggle('is-on', x === b));
    drawFix(b.dataset.tab);
  }));

  $('#table tbody').innerHTML = D.table.map((r, i) =>
    `<tr class="${r.us ? 'us' : ''}"><td>${i + 1}</td><td>${r.club}</td><td>${r.p}</td><td>${r.gd}</td><td>${r.pts}</td></tr>`).join('');
  $('#form').innerHTML = D.results.slice(0, 5).reverse().map(r =>
    { const k = r.us > r.them ? 'W' : r.us < r.them ? 'L' : 'D'; return `<i class="${k}">${k}</i>`; }).join('');

  const fig = `<svg class="pcard__fig" viewBox="0 0 200 260" aria-hidden="true"><defs><linearGradient id="kit" x1="0" x2="1"><stop offset="0" stop-color="#2a4dff"/><stop offset="1" stop-color="#d21034"/></linearGradient></defs>
    <circle cx="100" cy="62" r="34" fill="#c58a62"/><path d="M60 52q40-34 80 0v-8q-40-30-80 0z" fill="#150d0a"/>
    <path d="M30 260c0-70 14-128 70-128s70 58 70 128z" fill="url(#kit)"/><path d="M82 134q18 20 36 0l-6-14h-24z" fill="#fff" opacity=".9"/></svg>`;
  $('#squadTrack').innerHTML = D.squad.map(p => `<article class="pcard"><span class="pcard__pos">${p.pos}</span><div class="pcard__no">${p.no}</div>${fig}
    <div class="pcard__info"><small>${p.tag}</small><h3>${p.name}</h3></div></article>`).join('');

  const max = Math.max(...D.scorers.map(s => s.goals));
  $('#bars').innerHTML = D.scorers.map(s => `<div class="bar" data-reveal><span class="bar__n">${s.name}</span><span class="bar__v">${s.goals}</span>
    <div class="bar__t"><i data-w="${s.goals / max * 100}"></i></div></div>`).join('');

  $('#newsGrid').innerHTML = D.news.map(n => `<a href="#" class="ncard ncard--${n.hue}" data-reveal data-cursor="Read"><div class="ncard__bg"></div>
    <small>${n.tag} · ${n.date}</small><h3>${n.title}</h3><div class="more"><span>Read story →</span></div></a>`).join('');

  const tk = (el, items) => { const h = items.map(i => `<span>${i}</span>`).join(''); el.innerHTML = h + h + h + h; };
  tk($('#ticker1'), D.ticker); tk($('#ticker2'), D.sponsors);
  // marquee loops by -50% so the repeated set must be an even number of copies (4 above)

  /* ---------- poll ---------- */
  const poll = $('#poll'), votes = [41, 33, 26];
  $('#pollOpts').innerHTML = D.poll.map((n, i) => `<button class="opt" data-i="${i}"><i></i><span>${n}</span><span class="pc"></span></button>`).join('');
  $$('.opt').forEach(b => b.addEventListener('click', () => {
    poll.classList.add('is-voted');
    votes[b.dataset.i]++;
    const tot = votes.reduce((a, c) => a + c, 0);
    $$('.opt').forEach((o, i) => { const pc = Math.round(votes[i] / tot * 100);
      $('i', o).style.width = pc + '%'; $('.pc', o).textContent = pc + '%'; });
  }));

  /* ---------- text splitting ---------- */
  $$('[data-split]').forEach(el => {
    const t = el.textContent; el.setAttribute('aria-hidden', 'true'); el.innerHTML = [...t].map(c => `<span class="ch">${c}</span>`).join('');
  });
  $$('[data-split-words]').forEach(el => {
    el.innerHTML = [...el.childNodes].map(n => n.nodeType === 3
      ? n.textContent.split(/(\s+)/).map(w => w.trim() ? `<span class="word"><span>${w}</span></span>` : ' ').join('')
      : n.outerHTML).join('');
  });

  /* ---------- menu + nav ---------- */
  const burger = $('#burger'), menu = $('#menu'), nav = $('#nav');
  const setMenu = open => { burger.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', !open); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
    const y = s.scroll(); nav.classList.toggle('is-solid', y > 60);
    nav.classList.toggle('is-hidden', y > lastY && y > 500 && !menu.classList.contains('is-open')); lastY = y; } });
  // smooth in-page jump (ScrollTrigger pins shift offsets, so use scrollTo via ScrollTrigger-refreshed positions)
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return; e.preventDefault();
    const y = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- countdown ---------- */
  const nx = upcoming[0] || D.fixtures[0];
  $('#nextComp').textContent = nx.comp;
  $('#nextCrest').textContent = nx.code;
  $('#nextName').textContent = (nx.home ? 'vs ' : '@ ') + nx.opp;
  const nt = fmtDate(nx.date);
  $('#nextMeta').textContent = `${nt.m} ${nt.d} · ${nt.t} · ${nx.venue}`;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => { let s = Math.max(0, Math.floor((new Date(nx.date) - Date.now()) / 1000));
    $('#cD').textContent = pad(Math.floor(s / 86400)); $('#cH').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cM').textContent = pad(Math.floor(s % 3600 / 60)); $('#cS').textContent = pad(s % 60); };
  tick(); setInterval(tick, 1000);

  /* ---------- hero intro ---------- */
  if (!reduce) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero__title .ch', { yPercent: 115, rotate: 6, duration: 1.1, stagger: .045 })
      .from('.reveal-line', { y: 30, opacity: 0, stagger: .12, duration: .9 }, '-=.7')
      .from('.next', { y: 60, opacity: 0, duration: 1 }, '-=.8')
      .from('.hero__no', { opacity: 0, scale: .9, duration: 1.4 }, 0)
      .from('.hero__ball', { y: -200, opacity: 0, rotate: -180, duration: 1.6, ease: 'bounce.out' }, .3);

    // scroll-scrubbed hero exit: title zooms, ball spins, bg numeral slides
    const hs = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__inner', { scale: 1.12, yPercent: -12, opacity: .1, ease: 'none', scrollTrigger: hs });
    gsap.to('.hero__ball', { rotate: 540, y: 260, ease: 'none', scrollTrigger: hs });
    gsap.to('.hero__no', { xPercent: 12, ease: 'none', scrollTrigger: hs });
    gsap.to('.next', { y: -60, opacity: .2, ease: 'none', scrollTrigger: hs });
  }

  /* ---------- mouse: spotlight + depth parallax ---------- */
  const hero = $('#hero');
  if (fine && !reduce) {
    const dq = $$('[data-depth]').map(el => ({ x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }), d: +el.dataset.depth * 50 }));
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), nxp = (e.clientX - r.left) / r.width, nyp = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--mx', nxp * 100 + '%'); hero.style.setProperty('--my', nyp * 100 + '%');
      dq.forEach(o => { o.x((.5 - nxp) * o.d); o.y((.5 - nyp) * o.d); });
    });
  }

  /* ---------- cursor ---------- */
  if (fine) {
    const cur = $('.cursor'), lab = $('.cursor__label'); document.body.classList.add('has-cursor');
    const cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor],a,button');
      cur.classList.toggle('is-big', !!(t && t.dataset.cursor));
      cur.classList.toggle('is-link', !!(t && !t.dataset.cursor));
      lab.textContent = t && t.dataset.cursor || '';
    });
  }

  /* ---------- magnetic + tilt ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.5)' }), my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.5)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .5); });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    $$('.tilt, .pcard').forEach(el => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 14); rx(-((e.clientY - r.top) / r.height - .5) * 14); });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- add to cart morph ---------- */
  $$('.cart').forEach(b => b.addEventListener('click', () => {
    b.classList.add('is-added'); setTimeout(() => b.classList.remove('is-added'), 2200);
  }));

  /* ---------- scroll reveals ---------- */
  $$('.panel,.stat,.tier,.poll').forEach(el => el.setAttribute('data-reveal', ''));
  if (reduce) { $$('[data-reveal]').forEach(e => e.style.cssText = 'opacity:1;transform:none'); }
  else {
    ScrollTrigger.batch('[data-reveal]', { start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out', overwrite: true }) });
    $$('[data-split-words]').forEach(h => gsap.from($$('.word>span', h), { yPercent: 110, duration: 1, stagger: .08, ease: 'power4.out',
      scrollTrigger: { trigger: h, start: 'top 85%', once: true } }));
    $$('.bar__t i').forEach(i => gsap.to(i, { width: i.dataset.w + '%', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: i, start: 'top 92%', once: true } }));
  }
  $$('[data-count]').forEach(el => { const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
    if (reduce) { el.textContent = end.toLocaleString() + suf; return; }
    gsap.to(o, { v: end, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => el.textContent = Math.round(o.v).toLocaleString() + suf }); });

  if (!reduce) {
    /* ---------- pinned storytelling ---------- */
    const chapters = $$('.chapter'), num = $('#storyNum'), label = $('#storyLabel'), bar = $('#storyBar');
    let cur = 0;
    const show = i => { if (i === cur) return;
      gsap.to(chapters[cur], { opacity: 0, y: -40, duration: .35, onComplete: (p => () => p.classList.remove('is-on'))(chapters[cur]) });
      const c = chapters[i]; c.classList.add('is-on'); gsap.fromTo(c, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .6, delay: .25, ease: 'power3.out' });
      gsap.fromTo(num, { yPercent: 18, opacity: 0, rotate: -6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: .7, ease: 'back.out(1.6)' });
      num.textContent = c.dataset.num; label.textContent = c.dataset.label; cur = i; };
    chapters.forEach((c, i) => { if (i) gsap.set(c, { opacity: 0 }); });
    ScrollTrigger.create({ trigger: '.story__pin', start: 'top top', end: '+=300%', pin: true, scrub: true,
      onUpdate: s => { show(Math.min(chapters.length - 1, Math.floor(s.progress * chapters.length)));
        bar.style.width = (25 + s.progress * 75) + '%'; } });
    gsap.to('.story__ring--2', { rotate: -270, ease: 'none', scrollTrigger: { trigger: '.story__pin', start: 'top top', end: '+=300%', scrub: true } });

    /* ---------- mask reveal (circle wipe) ---------- */
    gsap.to('#maskOver', { clipPath: 'circle(75% at 50% 50%)', ease: 'none',
      scrollTrigger: { trigger: '#mask', start: 'top top', end: 'bottom bottom', scrub: .6 } });
    gsap.from('.mask__inner', { scale: .6, ease: 'none', scrollTrigger: { trigger: '#mask', start: 'top top', end: 'bottom bottom', scrub: .6 } });

    /* ---------- horizontal squad ---------- */
    const track = $('#squadTrack');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.squad__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true } });

    /* ---------- footer giant text drifts ---------- */
    gsap.fromTo('.footer__giant', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  } else {
    $$('.chapter').forEach(c => c.style.cssText = 'visibility:visible;opacity:1;transform:none;grid-area:auto');
    $('.story__text').style.gap = '40px';
    $('.squad__track').style.cssText += ';overflow-x:auto;width:auto';
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
