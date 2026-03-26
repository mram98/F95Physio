/* ── Scroll reveal ─────────────────────────────────────── */
const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length > 0) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { 
        e.target.classList.add('visible'); 
        revealObs.unobserve(e.target); 
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach(r => revealObs.observe(r));
}

/* ── Animated counters ────────────────────────────────── */
const countEls = document.querySelectorAll('[data-count]');
if (countEls.length > 0) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el      = e.target;
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = Math.floor(cur).toLocaleString() + suffix;
      }, 18);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  countEls.forEach(c => counterObs.observe(c));

  /* Also animate bento-stat-num */
  document.querySelectorAll('.bento-stat-num').forEach(el => {
    const raw    = el.textContent.trim();
    const num    = parseInt(raw.replace(/\D/g, ''), 10);
    const suffix = raw.replace(/[\d,]/g, '');
    el.dataset.count  = num;
    el.dataset.suffix = suffix;
    counterObs.observe(el);
  });
}

/* ── Nav: shadow on scroll ──────────────────────────────── */
const mainNav = document.getElementById('mainNav');
if (mainNav) {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ── Sticky Contact btn: hide when near footer ──────────── */
const footer   = document.querySelector('footer');
const stickyEl = document.getElementById('stickyBtn');
if (footer && stickyEl) {
  const stickyObs = new IntersectionObserver(([e]) => {
    stickyEl.style.opacity       = e.isIntersecting ? '0' : '1';
    stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
  }, { threshold: 0.05 });
  stickyObs.observe(footer);
}

/* ── Mobile hamburger ───────────────────────────────────── */
const hamburger   = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');

if (hamburger && mobileDrawer && mainNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileDrawer.classList.toggle('open');
    mainNav.classList.toggle('nav-mobile-open', open);
  });
  
  /* Close drawer on link click */
  mobileDrawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      mainNav.classList.remove('nav-mobile-open');
    });
  });
}