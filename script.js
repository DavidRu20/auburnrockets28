// ======================= Tiny helpers =======================
const $  = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  wireMobileMenu();
  highlightActiveNav();
  startNYClock();
  startCountdown();
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

