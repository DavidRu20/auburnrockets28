// ======================= Tiny helpers =======================
const $  = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  wireMobileMenu();
  highlightActiveNav();
  startNYClock();
  startCountdown();
  initStarfield();
  loadCalendar();
  checkAuthBadge();
});

// ======================= Mobile menu =======================
function wireMobileMenu() {
  const menuBtn    = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  const open = () => {
    mobileMenu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // lock scroll on small screens
  };
  const close = () => {
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const toggle = () => (mobileMenu.classList.contains('hidden') ? open() : close());

  menuBtn.addEventListener('click', toggle);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('hidden')) return;
    const clickedOutside = !mobileMenu.contains(e.target) && !menuBtn.contains(e.target);
    if (clickedOutside) close();
  });

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) close();
  });
}

// ======================= Active nav =======================
function highlightActiveNav() {
  const path = location.pathname.replace(/\/index\.html?$/i, '/');
  $$('.nav .links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Match exact file or root; keeps it simple for static sites
    if (
      (href === './' && (path === '/' || path.endsWith('/'))) ||
      (href && path.endsWith(href.replace('./','')))
    ) {
      a.classList.add('active');
    }
  });
}

// ======================= NY clock =======================
let nyClockInterval;
function startNYClock() {
  const dateEl = $('#date');
  const timeEl = $('#time');
  if (!dateEl || !timeEl) return;

  const dtFormatDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const dtFormatTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  });

  const update = () => {
    const now = new Date();
    dateEl.textContent = dtFormatDate.format(now);
    timeEl.textContent = dtFormatTime.format(now) + ' ET';
  };

  update();
  clearInterval(nyClockInterval);
  nyClockInterval = setInterval(update, 1000);
}

// ======================= Countdown =======================
let countdownInterval;
function startCountdown() {
  const hero = $('#home');
  // Use page-provided date if present; otherwise default
  const endIso = hero?.getAttribute('data-end-of-school') || '2026-06-19T18:00:00-04:00';
  const END = new Date(endIso).getTime();
  if (Number.isNaN(END)) return;

  const dEl = $('#cd-days'), hEl = $('#cd-hrs'), mEl = $('#cd-min'), sEl = $('#cd-sec');
  if (!(dEl && hEl && mEl && sEl)) return;

  const pad2 = (n) => String(n).padStart(2, '0');

  const update = () => {
    let diff = END - Date.now();
    if (diff <= 0) {
      dEl.textContent = '0'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
      clearInterval(countdownInterval);
      return;
    }
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);

    dEl.textContent = d;
    hEl.textContent = pad2(h);
    mEl.textContent = pad2(m);
    sEl.textContent = pad2(s);
  };

  update();
  clearInterval(countdownInterval);
  countdownInterval = setInterval(update, 1000);
}

// ======================= Calendar loader =======================
async function loadCalendar() {
  const container = $('#calendar-list');
  if (!container) return; // not on the calendar page

  container.innerHTML = '<p class="small">Loading events…</p>';

  try {
    // Put calendar.json in your project root /public (Vite) or same folder as the page on simple hosting
    // If using Vite/public, the path is exactly '/calendar.json'
    const res = await fetch('/calendar.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events = await res.json();

    if (!Array.isArray(events) || events.length === 0) {
      container.innerHTML = '<p class="small">No upcoming events yet. Check back soon.</p>';
      return;
    }

    // Normalize + sort
    const normalize = (e) => ({
      title: e.title ?? 'Untitled Event',
      date: e.date ? new Date(e.date) : null,
      time: e.time ?? '',
      location: e.location ?? '',
      description: e.description ?? '',
      link: e.link ?? ''
    });

    const list = events.map(normalize).sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date - b.date;
    });

    container.innerHTML = list.map(e => `
      <article class="card-item">
        <div class="row">
          <div class="title">${e.title}</div>
          ${e.date ? `<span class="badge blue">${e.date.toLocaleDateString()}</span>` : ''}
        </div>
        <div class="meta">
          ${e.time ? `${e.time}` : ''}${e.time && e.location ? ' • ' : ''}${e.location ? `${e.location}` : ''}
        </div>
        ${e.description ? `<p>${e.description}</p>` : ''}
        ${e.link ? `<p><a class="btn" href="${e.link}" target="_blank" rel="noopener">Details</a></p>` : ''}
      </article>
    `).join('');
  } catch (err) {
    console.error('Calendar load failed:', err);
    container.innerHTML = `
      <div class="panel">
        <p>Couldn’t load the calendar right now.</p>
        <details class="small"><summary>Error details</summary><pre>${String(err)}</pre></details>
      </div>
    `;
  }
}

// ======================= Optional auth badge =======================
function checkAuthBadge() {
  // Safe no-op on static hosting — will fail CORS/404 quietly
  fetch('/auth/check')
    .then(res => (res.ok ? res.json() : { loggedIn: false }))
    .then(data => {
      if (data && data.loggedIn) {
        const links = document.querySelector('.links');
        if (links) {
          links.insertAdjacentHTML('beforeend',
            `<span style="margin-left: 1rem; opacity:.9">Welcome, ${data.user?.name ?? 'User'}</span>
             <form action="/auth/logout" method="POST" style="display:inline;">
               <button style="background:none; border:none; color:#f88; cursor:pointer;">Log Out</button>
             </form>`
          );
        }
      }
    })
    .catch(() => {});
}

// ======================= Starfield + subtle twinkle =======================
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars = [];
  const asteroids = [];
  let width = 0;
  let height = 0;

  const palette = {
    darkTop: '#0b0e1a',
    darkBottom: '#02040a',
    lightTop: '#eaf2ff',
    lightBottom: '#ffffff',
    starDark: 'rgba(186,205,255,0.9)',
    starLight: 'rgba(60,90,140,0.8)'
  };

  const starDensity = 5000;
  const asteroidCount = reduceMotion ? 2 : 8;
  const driftScale = reduceMotion ? 0.2 : 1;

  const createStar = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.2,
    speed: (Math.random() * 0.25 + 0.05) * driftScale,
    phase: Math.random() * Math.PI * 2,
    twinkle: Math.random() * 0.6 + 0.3
  });

  const createAsteroid = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 12 + 6,
    vx: (Math.random() * 0.15 + 0.05) * driftScale,
    vy: (Math.random() * 0.15 + 0.02) * driftScale,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() * 0.004 + 0.002) * driftScale,
    alpha: Math.random() * 0.22 + 0.08
  });

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.length = 0;

    const count = Math.min(280, Math.floor((width * height) / starDensity));
    for (let i = 0; i < count; i += 1) {
      stars.push(createStar());
    }

    asteroids.length = 0;
    for (let i = 0; i < asteroidCount; i += 1) {
      asteroids.push(createAsteroid());
    }
  };

  const drawAsteroid = (asteroid) => {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rot);
    ctx.beginPath();
    const bumps = 6;
    for (let i = 0; i < bumps; i += 1) {
      const angle = (Math.PI * 2 * i) / bumps;
      const variance = asteroid.r * (0.7 + Math.sin(i * 1.7) * 0.12);
      ctx.lineTo(Math.cos(angle) * variance, Math.sin(angle) * variance);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(120,140,170,${asteroid.alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(200,210,230,${asteroid.alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  const update = (time) => {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, light ? palette.lightTop : palette.darkTop);
    gradient.addColorStop(1, light ? palette.lightBottom : palette.darkBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const starColor = light ? palette.starLight : palette.starDark;
    ctx.fillStyle = starColor;
    for (const star of stars) {
      const glow = Math.sin(time * 0.001 + star.phase) * star.twinkle;
      const alpha = 0.35 + (glow + 1) * 0.25;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      star.y += star.speed;
      if (star.y > height + 2) {
        star.y = -4;
        star.x = Math.random() * width;
      }
    }
    ctx.globalAlpha = 1;

    for (const asteroid of asteroids) {
      drawAsteroid(asteroid);
      asteroid.x += asteroid.vx;
      asteroid.y += asteroid.vy;
      asteroid.rot += asteroid.rotSpeed;
      if (asteroid.x > width + 40 || asteroid.y > height + 40) {
        asteroid.x = -40;
        asteroid.y = Math.random() * height * 0.6;
      }
    }

    requestAnimationFrame(update);
  };

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(update);
}
