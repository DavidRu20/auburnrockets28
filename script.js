// --- helper: select ---
const $ = (sel, el = document) => el.querySelector(sel);

// --- mobile menu toggle ---
const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');

function onToggleMenu() {
  const nowHidden = mobileMenu.classList.toggle('hidden'); // hidden => closed
  menuBtn?.setAttribute('aria-expanded', String(!nowHidden));
}
menuBtn?.addEventListener('click', onToggleMenu);
document.addEventListener('click', (e) => {
  if (!mobileMenu || mobileMenu.classList.contains('hidden')) return;
  const clickedOutside = !mobileMenu.contains(e.target) && !menuBtn.contains(e.target);
  if (clickedOutside) onToggleMenu();
});

// --- live date + time (America/New_York) ---
const dtFormatDate = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const dtFormatTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric', minute: '2-digit', second: '2-digit'
});

function updateNYDateTime() {
  const now = new Date();
  const dateEl = $('#date');
  const timeEl = $('#time');
  if (!dateEl || !timeEl) return;
  dateEl.textContent = dtFormatDate.format(now);
  timeEl.textContent = dtFormatTime.format(now) + ' ET';
}
updateNYDateTime();
setInterval(updateNYDateTime, 1000);

// --- countdown to end of school ---
const hero = $('#home');
const endIso = hero?.getAttribute('data-end-of-school') || '2026-06-19T18:00:00-04:00';
const END = new Date(endIso).getTime();

function pad2(n){ return String(n).padStart(2, '0'); }
function updateCountdown() {
  const now = Date.now();
  let diff = END - now;

  const dEl = $('#cd-days'), hEl = $('#cd-hrs'), mEl = $('#cd-min'), sEl = $('#cd-sec');
  if (!(dEl && hEl && mEl && sEl)) return;

  if (diff <= 0) {
    dEl.textContent = '0'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
    return;
  }
  const d = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= d * (1000 * 60 * 60 * 24);
  const h = Math.floor(diff / (1000 * 60 * 60));       diff -= h * (1000 * 60 * 60);
  const m = Math.floor(diff / (1000 * 60));            diff -= m * (1000 * 60);
  const s = Math.floor(diff / 1000);

  dEl.textContent = d;
  hEl.textContent = pad2(h);
  mEl.textContent = pad2(m);
  sEl.textContent = pad2(s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// --- optional auth status injection (safe no-op on static hosting) ---
fetch('/auth/check')
  .then(res => res.ok ? res.json() : { loggedIn: false })
  .then(data => {
    if (data && data.loggedIn) {
      const links = document.querySelector('.links');
      if (links) {
        links.insertAdjacentHTML('beforeend',
          `<span style="margin-left: 1rem; opacity:.9">Welcome, ${data.user.name}</span>
           <form action="/auth/logout" method="POST" style="display:inline;">
             <button style="background:none; border:none; color:#f88; cursor:pointer;">Log Out</button>
           </form>`
        );
      }
    }
  })
  .catch(() => {});
