
    /* ── Scroll reveal ── */
    const revealItems = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(r => revealObs.observe(r));

    /* ── Nav shadow on scroll ── */
    window.addEventListener('scroll', () => {
      document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 40);
    });

    /* ── Sticky Contact btn: hide near footer ── */
    const footer   = document.querySelector('footer');
    const stickyEl = document.getElementById('stickyBtn');
    if (footer && stickyEl) {
      const stickyObs = new IntersectionObserver(([e]) => {
        stickyEl.style.opacity       = e.isIntersecting ? '0' : '1';
        stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
      }, { threshold: 0.05 });
      stickyObs.observe(footer);
    }

    /* ── Mobile hamburger ── */
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

    /* ── Active services nav highlight on scroll ── */
    const sections  = document.querySelectorAll('section[id], div[id]');
    const snavItems = document.querySelectorAll('.snav-item');
    const scrollSpy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          snavItems.forEach(a => a.classList.remove('active'));
          const match = document.querySelector(`.snav-item[href="#${e.target.id}"]`);
          if (match) {
            match.classList.add('active');
            match.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => scrollSpy.observe(s));
  