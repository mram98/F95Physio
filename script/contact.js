/* ══════════════════════════════════════════════════
   contact.js — F95 Contact Page Animations & Logic
   Mirrors the structure and patterns of indexScript.js.
   Handles: scroll-reveal, nav shadow, hamburger menu.
   Does NOT handle: form submission (→ dataPost.js)
                    map logic (→ mapping.js)
══════════════════════════════════════════════════ */

/* ── Scroll Reveal ──────────────────────────────────
   Identical pattern to indexScript.js.
   Observes every .reveal element and adds .visible
   once 10% is in the viewport.                       */
const revealItems = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target); /* fire once, then stop watching */
    }
  });
}, { threshold: 0.1 });

revealItems.forEach(r => revealObs.observe(r));


/* ── Nav: Shadow on Scroll ──────────────────────────
   Matches the behaviour in indexScript.js exactly.   */
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle(
    'scrolled',
    window.scrollY > 40
  );
}, { passive: true });


/* ── Mobile Hamburger ───────────────────────────────
   Opens / closes the mobile drawer.
   Closes the drawer when any link inside it is tapped.  */
const hamburger    = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');

hamburger.addEventListener('click', () => {
  const open = mobileDrawer.classList.toggle('open');
  document.getElementById('mainNav').classList.toggle('nav-mobile-open', open);
});

mobileDrawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileDrawer.classList.remove('open');
    document.getElementById('mainNav').classList.remove('nav-mobile-open');
  });
});


/* ── Smooth internal anchor links ──────────────────
   Ensures pill links (e.g. "Find a Centre") scroll
   smoothly even on browsers without CSS scroll-behavior. */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ── Form input focus: floating-label visual enhance ──
   Adds a .has-value class to .form-group when its
   input/textarea is non-empty, so CSS can add extra
   visual affordance (e.g., label color shift).           */
document.querySelectorAll('.form-input').forEach(input => {
  const group = input.closest('.form-group');

  const updateState = () => {
    if (!group) return;
    group.classList.toggle('has-value', input.value.trim().length > 0);
  };

  input.addEventListener('input', updateState);
  input.addEventListener('blur', updateState);
  updateState(); /* initialise in case of browser autofill */
});


/* ── Holiday cards: staggered entry animation ──────
   Each holiday card gets a small reveal delay based
   on its index, creating a cascade effect.           */
const holidayCards = document.querySelectorAll('.holiday-card');

const holidayObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      e.target.classList.add('holiday-animate');
      holidayObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

holidayCards.forEach((card, i) => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(24px)';
  card.style.transition = `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`;
  holidayObs.observe(card);
});

/* Trigger animation by updating inline styles */
const holidayMutObs = new MutationObserver(() => {});
holidayCards.forEach(card => {
  card.addEventListener('transitionrun', () => {});
});

/* Use a single IntersectionObserver callback that sets styles */
const holidayRevealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
      holidayRevealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

holidayCards.forEach(card => holidayRevealObs.observe(card));


/* ── Contact info cards: hover-depth effect ────────
   Adds a subtle parallax-like depth on mouse move
   inside each info card for a tactile, premium feel. */
document.querySelectorAll('.cinfo-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `
      translateY(-3px)
      rotateX(${-y * 3}deg)
      rotateY(${x * 3}deg)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease';
  });
});
