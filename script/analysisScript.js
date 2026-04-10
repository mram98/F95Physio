
  
    /* ── Scroll reveal ── */
    const revealItems = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealItems.forEach(r => revealObs.observe(r));

    /* ── Animated counters ── */
    const countEls = document.querySelectorAll('[data-count]');
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
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

    /* ── Nav shadow on scroll ── */
    window.addEventListener('scroll', () => {
      document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 40);
    });

    /* ── Sticky contact hide near footer ── */
    const footer = document.querySelector('footer');
    const stickyEl = document.getElementById('stickyBtn');
    const stickyObs = new IntersectionObserver(([e]) => {
      stickyEl.style.opacity = e.isIntersecting ? '0' : '1';
      stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
    }, { threshold: 0.05 });
    stickyObs.observe(footer);

    /* ── Mobile hamburger ── */
    const hamburger = document.getElementById('hamburgerBtn');
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
