/* ═══════════════════════════════════════════════
   GALLERY SCRIPT — galleryScript.js
   F95 Advance Physiotherapy & Research Centre

   Gallery-specific logic ONLY.
   The following are intentionally absent — they live
   in indexScript.js which loads before this file:
     · heroSwiper  (Swiper carousel)
     · footer      (querySelector)
     · stickyEl    (stickyBtn observer)
     · hamburger   (hamburgerBtn + mobileDrawer)
     · nav shadow  (scroll listener on #mainNav)

   This file handles:
     1. Lazy image loading + skeleton swap
     2. Quicklink pill active state (scroll-tracked)
     3. Smooth scroll with sticky-offset compensation
     4. Glassmorphic header "is-pinned" shadow boost
     5. Mobile overlay tap toggle
     6. Scroll reveal
═══════════════════════════════════════════════ */

/* ── 1. LAZY IMAGE LOADING + SKELETON SWAP ─────── */
const lazyImages = document.querySelectorAll('.gallery-img.lazy');

if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;

      img.src = src;

      img.addEventListener('load', () => {
        img.classList.add('loaded');
        img.closest('.gallery-item')?.classList.add('img-loaded');
      }, { once: true });

      img.addEventListener('error', () => {
        img.closest('.gallery-item')?.classList.add('img-loaded');
      }, { once: true });

      imgObserver.unobserve(img);
    });
  }, { rootMargin: '200px 0px', threshold: 0.05 });

  lazyImages.forEach(img => imgObserver.observe(img));
} else {
  /* Fallback for browsers without IntersectionObserver */
  lazyImages.forEach(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        img.closest('.gallery-item')?.classList.add('img-loaded');
      }, { once: true });
    }
  });
}

/* ── 2. ACTIVE STATE — Quicklink pills ────────────
   Drives the navy pill highlight as the user scrolls
   into each event section.
*/
const quickLinks    = document.querySelectorAll('.quicklink-pill');
const eventSections = document.querySelectorAll('.gallery-event');

/**
 * setActiveEvent(id)
 * Highlights the matching quicklink pill.
 */
function setActiveEvent(id) {
  quickLinks.forEach(pill => {
    const target = pill.dataset.target
      || pill.getAttribute('href')?.replace('#', '');
    pill.classList.toggle('active', target === id);
  });
}

/* ── 3. SMOOTH SCROLL WITH OFFSET ────────────────
   Compensates for the sticky nav + quicklinks bar
   so the section title isn't hidden behind them.
*/
function getScrollOffset() {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 72;
  const qlH = document.getElementById('gallery-quicklinks')?.offsetHeight || 53;
  return navH + qlH + 16; /* 16px breathing room */
}

function smoothScrollTo(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getScrollOffset();
  window.scrollTo({ top, behavior: 'smooth' });
}

/* Click handler — smooth scroll + immediate pill highlight */
quickLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.target
      || link.getAttribute('href')?.replace('#', '');
    if (!target) return;
    smoothScrollTo(target);
    setActiveEvent(target); /* instant feedback before observer fires */
  });
});

/* ── Scroll-based section tracking ───────────────
   Fires when a section crosses the centre-ish band
   of the viewport (between top 18% and bottom 55%).
   The first intersecting section wins.
*/
let currentActiveId = null;

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      if (id !== currentActiveId) {
        currentActiveId = id;
        setActiveEvent(id);
      }
    }
  });
}, {
  rootMargin: '-18% 0px -55% 0px',
  threshold: 0,
});

eventSections.forEach(section => sectionObserver.observe(section));

/* Default: highlight the first event on load */
if (eventSections.length) {
  setActiveEvent(eventSections[0].id);
  currentActiveId = eventSections[0].id;
}

/* ── 4. GLASSMORPHIC HEADER PINNED SHADOW ─────── */
if ('IntersectionObserver' in window) {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 72;
  const qlH  = document.getElementById('gallery-quicklinks')?.offsetHeight || 53;
  const stickyOffset = navH + qlH;

  document.querySelectorAll('.glass-header').forEach(header => {
    /* Insert a 1px sentinel element just above the header */
    const sentinel = document.createElement('div');
    sentinel.style.cssText =
      'position:absolute;top:-1px;left:0;right:0;height:1px;pointer-events:none;';
    const parent = header.parentElement;
    parent.style.position = 'relative';
    parent.insertBefore(sentinel, header);

    const pinObs = new IntersectionObserver(([e]) => {
      header.classList.toggle('is-pinned', !e.isIntersecting);
    }, {
      rootMargin: `-${stickyOffset}px 0px 0px 0px`,
      threshold: 1,
    });
    pinObs.observe(sentinel);
  });
}

/* ── 5. MOBILE TAP OVERLAY TOGGLE ─────────────── */
function isTouchDevice() {
  return window.matchMedia('(hover: none)').matches;
}

if (isTouchDevice()) {
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      galleryItems.forEach(other => {
        if (other !== item) other.classList.remove('overlay-visible');
      });
      item.classList.toggle('overlay-visible');
    });
  });

  /* Tap outside any card closes all overlays */
  document.addEventListener('click', e => {
    if (!e.target.closest('.gallery-item')) {
      document.querySelectorAll('.gallery-item').forEach(i =>
        i.classList.remove('overlay-visible')
      );
    }
  });
}

/* ── 6. SCROLL REVEAL ─────────────────────────── 
const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach(r => revealObs.observe(r));
}
  */
