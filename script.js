(function () {
  'use strict';
  // ---- Settings -----------------------------------------------------------
  // RSVP destination: family WhatsApp number, international format, digits only (e.g. "919876543210").
  var RSVP_WHATSAPP = "";
  // Contact numbers for the "Contact Us" section. Leave empty to hide the section.
  var CONTACTS = [
    // { label: "Bride's family", phone: "91XXXXXXXXXX" },
    // { label: "Groom's family", phone: "91XXXXXXXXXX" }
  ];
  var NIKAH_DATE = new Date(2026, 11, 26, 11, 30, 0); // 26 Dec 2026, 11:30 AM local

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  var preview = /[?&]open\b/.test(location.search);
  if (/[?&]still\b/.test(location.search)) document.documentElement.classList.add('still');

  // ---- Loader -------------------------------------------------------------
  var loader = document.getElementById('loader'), fill = document.getElementById('loader-fill'), pctEl = document.getElementById('loader-pct');
  var pct = 0;
  function loaderDone() { loader.classList.add('is-done'); setTimeout(function () { loader.remove(); }, 900); }
  if (preview || reduceMotion) { loaderDone(); }
  else {
    var lt = setInterval(function () {
      pct = Math.min(100, pct + 6 + Math.random() * 14);
      fill.style.width = pct + '%'; pctEl.textContent = Math.round(pct) + '%';
      if (pct >= 100) { clearInterval(lt); setTimeout(loaderDone, 350); }
    }, 140);
  }

  // ---- Envelope -----------------------------------------------------------
  var opening = document.getElementById('opening');
  var envelope = document.getElementById('envelope');
  var tapHint = document.getElementById('tap-hint');
  var opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    tapHint.textContent = 'With love';
    startPetals(true);
    setTimeout(function () {
      opening.classList.add('is-leaving');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      revealVisible();
      tryMusic();
    }, reduceMotion ? 50 : 1500);
    setTimeout(function () { opening.remove(); }, 3000);
  }
  envelope.addEventListener('click', openInvitation);

  // ---- Scroll reveal ------------------------------------------------------
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function revealVisible() {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }
  setTimeout(function () { if (!opened) revealVisible(); }, 8000);

  if (preview) {
    opened = true;
    opening.remove();
    document.body.classList.remove('locked');
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---- Falling petals & blossoms -----------------------------------------
  var canvas = document.getElementById('petals');
  var ctx = canvas.getContext('2d');
  var petals = [], running = false, W = 0, H = 0, DPR = 1;
  var COLORS = ['#f1d98f', '#d4af5a', '#f8f1e0', '#fffaf0', '#e6c76f', '#e9dcb8'];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function makePetal(fromTop) {
    return {
      x: Math.random() * W, y: fromTop ? -20 - Math.random() * 40 : Math.random() * H,
      size: 5 + Math.random() * 7, vy: 0.4 + Math.random() * 0.8, drift: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.03,
      tilt: Math.random() * Math.PI * 2, vt: 0.01 + Math.random() * 0.02,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], alpha: 0.6 + Math.random() * 0.4,
      flower: Math.random() < 0.35
    };
  }
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.tilt)));
    ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
    var s = p.size;
    if (p.flower) {
      var r = s * 0.6;
      for (var k = 0; k < 5; k++) {
        ctx.save(); ctx.rotate((Math.PI * 2 / 5) * k);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.7, r * 0.42, r * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#b8923f'; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.9, s * 0.9, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.9, s * 0.5, -s * 0.9, -s * 0.9, 0, -s); ctx.fill();
    }
    ctx.restore();
  }
  var last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min((t - last) / 16.67, 3); last = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.phase += 0.015 * dt; p.x += Math.sin(p.phase) * p.drift * dt + 0.12 * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.tilt += p.vt * dt;
      if (p.y > H + 30 || p.x > W + 40) petals[i] = makePetal(true);
      drawPetal(p);
    }
    requestAnimationFrame(frame);
  }
  function startPetals(burst) {
    if (reduceMotion) return;
    resize();
    var count = W < 600 ? 22 : 38;
    if (!petals.length) for (var i = 0; i < count; i++) petals.push(makePetal(!burst && Math.random() < 0.5));
    if (burst) {
      for (var j = 0; j < 16; j++) { var p = makePetal(true); p.vy += 0.8; petals.push(p); }
      setTimeout(function () { petals.length = Math.min(petals.length, count); }, 6000);
    }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }
  window.addEventListener('resize', function () { if (running) resize(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false;
    else if (petals.length && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });
  startPetals(false);

  // ---- Countdown ----------------------------------------------------------
  var target = NIKAH_DATE.getTime();
  var el = { d: document.getElementById('cd-days'), h: document.getElementById('cd-hours'), m: document.getElementById('cd-mins'), s: document.getElementById('cd-secs') };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      el.d.textContent = el.h.textContent = el.m.textContent = el.s.textContent = '00';
      document.getElementById('count-hint').textContent = 'Alhamdulillah, the day has arrived.';
      return;
    }
    var s = Math.floor(diff / 1000);
    el.d.textContent = pad(Math.floor(s / 86400)); el.h.textContent = pad(Math.floor(s % 86400 / 3600));
    el.m.textContent = pad(Math.floor(s % 3600 / 60)); el.s.textContent = pad(s % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();

  // ---- Calendar -----------------------------------------------------------
  (function buildCalendar() {
    var grid = document.getElementById('cal-grid');
    var y = NIKAH_DATE.getFullYear(), m = NIKAH_DATE.getMonth(), d = NIKAH_DATE.getDate();
    var offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    var days = new Date(y, m + 1, 0).getDate();
    var html = '';
    for (var i = 0; i < offset; i++) html += '<span class="cal-day is-empty" aria-hidden="true"></span>';
    for (var day = 1; day <= days; day++) {
      html += day === d
        ? '<span class="cal-day is-event" aria-label="Nikah day ' + day + '"><svg aria-hidden="true"><use href="#heart"/></svg><span class="cal-num">' + day + '</span></span>'
        : '<span class="cal-day">' + day + '</span>';
    }
    grid.innerHTML = html;
  })();

  // ---- Venue tabs ---------------------------------------------------------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.venue-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.venue-panel'));
  function activateTab(name) {
    tabs.forEach(function (t) { var on = t.getAttribute('data-tab') === name; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
    panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === name); });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { activateTab(t.getAttribute('data-tab')); }); });

  // ---- Contact ------------------------------------------------------------
  (function buildContact() {
    var sec = document.getElementById('contact'), wrap = document.getElementById('contact-actions');
    var valid = CONTACTS.filter(function (c) { return c && /^\d{8,15}$/.test(String(c.phone)); });
    if (!valid.length) { sec.hidden = true; return; }
    sec.hidden = false;
    valid.forEach(function (c) {
      var a = document.createElement('a');
      a.className = 'btn btn-glass'; a.href = 'tel:+' + c.phone;
      a.innerHTML = '<svg><use href="#phone"/></svg><span>' + (c.label || 'Call') + '</span>';
      wrap.appendChild(a);
    });
  })();

  // ---- RSVP ---------------------------------------------------------------
  var count = 1, out = document.getElementById('guest-count');
  document.getElementById('minus').addEventListener('click', function () { count = Math.max(1, count - 1); out.textContent = count; });
  document.getElementById('plus').addEventListener('click', function () { count = Math.min(12, count + 1); out.textContent = count; });
  var yes = document.getElementById('att-yes'), no = document.getElementById('att-no'), gf = document.getElementById('guests-field');
  function syncGuests() { gf.style.opacity = no.checked ? '.4' : '1'; }
  yes.addEventListener('change', syncGuests); no.addEventListener('change', syncGuests);

  var form = document.getElementById('rsvp-form'), previewBox = document.getElementById('preview'), copyRow = document.getElementById('copy-row');
  var lastMsg = '';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameEl = document.getElementById('guest-name');
    var name = nameEl.value.trim();
    if (!name) { nameEl.focus(); nameEl.style.borderBottomColor = '#a9403a'; return; }
    nameEl.style.borderBottomColor = '';
    var attending = yes.checked;
    var msg = document.getElementById('guest-msg').value.trim();
    var lines = [
      'Assalamu Alaikum! RSVP for the Nikah of Fathima Nargin & Rashid A.K (26 Dec 2026).',
      'Name: ' + name,
      attending ? 'Attending: Yes, joyfully' : 'Attending: Regretfully unable to attend'
    ];
    if (attending) lines.push('Guests: ' + count);
    if (msg) lines.push('Message: ' + msg);
    lastMsg = lines.join('\n');
    previewBox.textContent = lastMsg;
    previewBox.classList.add('show');
    copyRow.hidden = false;
    if (RSVP_WHATSAPP) {
      window.open('https://wa.me/' + RSVP_WHATSAPP + '?text=' + encodeURIComponent(lastMsg), '_blank', 'noopener');
    } else {
      previewBox.textContent = lastMsg + '\n\n(Reply number not set yet. Copy this message and send it to the family.)';
    }
  });
  document.getElementById('copy-btn').addEventListener('click', function () {
    var btn = this;
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy message'; }, 1600); }
    function selectPreview() { var r = document.createRange(); r.selectNodeContents(previewBox); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(lastMsg).then(done, selectPreview);
    else selectPreview();
  });

  // ---- Music (optional: music.mp3 beside index.html) ----------------------
  var audio = document.getElementById('music'), musicBtn = document.getElementById('music-btn');
  var musicAvailable = false;
  audio.addEventListener('canplay', function () { musicAvailable = true; musicBtn.classList.remove('off'); musicBtn.title = 'Play music'; });
  audio.addEventListener('error', function () { musicAvailable = false; musicBtn.classList.add('off'); musicBtn.title = 'Add music.mp3 next to index.html to enable music'; });
  audio.load();
  function tryMusic() {
    if (!musicAvailable) return;
    audio.volume = 0.85;
    audio.play().then(function () { musicBtn.classList.add('playing'); musicBtn.setAttribute('aria-label', 'Mute music'); }).catch(function () {});
  }
  musicBtn.addEventListener('click', function () {
    if (!musicAvailable) return;
    if (audio.paused) { audio.play().then(function () { musicBtn.classList.add('playing'); musicBtn.setAttribute('aria-label', 'Mute music'); }).catch(function () {}); }
    else { audio.pause(); musicBtn.classList.remove('playing'); musicBtn.setAttribute('aria-label', 'Play music'); }
  });
})();
