/* ═══════════════════════════════════════════════════════════
   faqScript.js — F95 FAQ Page Logic
   Handles:
     1. Fetch + render FAQ from faq.json
     2. Real-time search with keyword highlighting
     3. Category pill filtering
     4. Custom accordion open/close with smooth animation
     5. Scroll-reveal (reuses .reveal / .visible from indexStyle.css)
     6. Nav shadow on scroll + mobile hamburger (mirrors indexScript.js)
     7. Sticky contact button hide-near-footer
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Data fetch ─────────────────────────────────────── */
  const FAQ_URL = '../Assets/faq.json';

  async function loadFAQ() {
    try {
      const res  = await fetch(FAQ_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      init(data);
    } catch (err) {
      console.error('[F95 FAQ] Failed to load faq.json:', err);
      document.getElementById('faqList').innerHTML =
        '<p style="color:var(--gray-mid);padding:32px 0;">Unable to load FAQ content. Please try refreshing the page.</p>';
    }
  }

  /* ── 2. Main init ──────────────────────────────────────── */
  function init(data) {
    /* Derive sorted unique categories */
    const cats = ['All', ...Array.from(new Set(data.map(d => d.category)))];

    let activeCategory = 'All';
    let searchQuery    = '';

    /* Render category pills */
    buildCatPills(cats, data, () => activeCategory, (c) => {
      activeCategory = c;
      render();
    });

    /* Bind search */
    const searchEl = document.getElementById('faqSearch');
    const clearBtn = document.getElementById('faqSearchClear');
    const resetBtn = document.getElementById('faqReset');

    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim();
      clearBtn.classList.toggle('visible', searchQuery.length > 0);
      render();
    });

    clearBtn.addEventListener('click', () => {
      searchEl.value = '';
      searchQuery    = '';
      clearBtn.classList.remove('visible');
      searchEl.focus();
      render();
    });

    resetBtn.addEventListener('click', () => {
      searchEl.value = '';
      searchQuery    = '';
      activeCategory = 'All';
      clearBtn.classList.remove('visible');
      /* Reset active pill */
      document.querySelectorAll('.faq-cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === 'All');
      });
      render();
    });

    /* Initial render */
    render();

    /* ── Inner render fn ── */
    function render() {
      const list    = document.getElementById('faqList');
      const emptyEl = document.getElementById('faqEmpty');
      const resBar  = document.getElementById('faqResultsBar');

      /* Filter */
      let items = data;
      if (activeCategory !== 'All') {
        items = items.filter(d => d.category === activeCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        items = items.filter(d =>
          d.question.toLowerCase().includes(q) ||
          d.answer.toLowerCase().includes(q)   ||
          d.category.toLowerCase().includes(q)
        );
      }

      /* Empty state */
      if (items.length === 0) {
        list.innerHTML = '';
        emptyEl.hidden = false;
        resBar.innerHTML = '';
        return;
      }
      emptyEl.hidden = true;

      /* Results summary */
      if (searchQuery || activeCategory !== 'All') {
        resBar.innerHTML = `Showing <strong>${items.length}</strong> result${items.length === 1 ? '' : 's'}${activeCategory !== 'All' ? ` in <strong>${activeCategory}</strong>` : ''}${searchQuery ? ` for "<strong>${escapeHtml(searchQuery)}</strong>"` : ''}`;
      } else {
        resBar.innerHTML = `<strong>${items.length}</strong> questions`;
      }

      /* Group by category for section headers */
      const grouped = groupBy(items, 'category');
      const showGroups = activeCategory === 'All' && !searchQuery;

      list.innerHTML = '';

      let delay = 0;
      Object.entries(grouped).forEach(([cat, group]) => {
        /* Category header */
        if (showGroups) {
          const hdr = document.createElement('div');
          hdr.className = 'faq-group-header';
          hdr.innerHTML = `<span class="faq-group-label">${escapeHtml(cat)}</span><div class="faq-group-line" aria-hidden="true"></div>`;
          list.appendChild(hdr);
        }

        group.forEach((item, i) => {
          const el = buildAccordionItem(item, searchQuery, !showGroups);
          el.style.animationDelay = `${delay * 40}ms`;
          el.classList.add('animate-in');
          list.appendChild(el);
          delay++;
        });
      });

      /* Re-run scroll-reveal for newly added items */
      initReveal();
    }
  }

  /* ── 3. Build category pills ─────────────────────────── */
  function buildCatPills(cats, data, getActive, setActive) {
    const container = document.getElementById('faqCats');
    container.innerHTML = '';

    cats.forEach(cat => {
      const count = cat === 'All' ? data.length : data.filter(d => d.category === cat).length;
      const btn   = document.createElement('button');
      btn.className   = 'faq-cat-btn' + (cat === getActive() ? ' active' : '');
      btn.dataset.cat = cat;
      btn.setAttribute('aria-pressed', cat === getActive() ? 'true' : 'false');
      btn.innerHTML   = `${escapeHtml(cat)} <span class="faq-cat-count">${count}</span>`;

      btn.addEventListener('click', () => {
        setActive(cat);
        container.querySelectorAll('.faq-cat-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cat === cat);
          b.setAttribute('aria-pressed', b.dataset.cat === cat ? 'true' : 'false');
        });
      });

      container.appendChild(btn);
    });
  }

  /* ── 4. Build accordion item ──────────────────────────── */
  function buildAccordionItem(item, query, showCatChip) {
    const wrapper = document.createElement('div');
    wrapper.className  = 'faq-item';
    wrapper.setAttribute('role', 'listitem');

    const details  = document.createElement('details');
    const summary  = document.createElement('summary');
    const answerEl = document.createElement('div');
    answerEl.className = 'faq-answer';

    /* Question text (with highlight) */
    const qSpan = document.createElement('span');
    qSpan.className = 'faq-q-text';
    qSpan.innerHTML = highlight(escapeHtml(item.question), query);

    /* Chevron */
    const chevron = document.createElement('span');
    chevron.className   = 'faq-chevron';
    chevron.innerHTML   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
    chevron.setAttribute('aria-hidden', 'true');

    summary.appendChild(qSpan);
    summary.appendChild(chevron);

    /* Answer */
    const chip = showCatChip
      ? `<div class="faq-cat-chip">${escapeHtml(item.category)}</div>`
      : '';
    const p = document.createElement('p');
    p.innerHTML = highlight(escapeHtml(item.answer), query);
    answerEl.innerHTML = chip;
    answerEl.appendChild(p);

    /* Smooth animation on toggle */
    details.addEventListener('toggle', () => {
      if (details.open) {
        /* Animate height open */
        answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
        answerEl.style.opacity   = '1';
        answerEl.style.paddingBottom = '22px';
        /* After transition, remove fixed max-height so content can grow */
        const tid = setTimeout(() => {
          answerEl.style.maxHeight = '800px';
        }, 400);
        details._openTimer = tid;
      } else {
        clearTimeout(details._openTimer);
        /* Snapshot current height, then animate to 0 */
        answerEl.style.maxHeight    = answerEl.scrollHeight + 'px';
        /* Force reflow */
        // eslint-disable-next-line no-unused-expressions
        answerEl.offsetHeight;
        answerEl.style.maxHeight    = '0';
        answerEl.style.opacity      = '0';
        answerEl.style.paddingBottom = '0';
      }
    });

    /* If search is active, auto-open matching items */
    if (query) {
      details.open = true;
      answerEl.style.maxHeight    = '800px';
      answerEl.style.opacity      = '1';
      answerEl.style.paddingBottom = '22px';
    }

    details.appendChild(summary);
    details.appendChild(answerEl);
    wrapper.appendChild(details);
    return wrapper;
  }

  /* ── 5. Helpers ──────────────────────────────────────── */

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re      = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<mark class="faq-hl">$1</mark>');
  }

  function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const k = item[key];
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});
  }

  /* ── 6. Scroll-reveal ────────────────────────────────── */
  function initReveal() {
    const items = document.querySelectorAll('.reveal:not(.visible)');
    if (!items.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach(el => obs.observe(el));
  }

  /* ── 7. Nav shadow on scroll ─────────────────────────── */
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── 8. Mobile hamburger ─────────────────────────────── */
  const hamburger    = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (hamburger && mobileDrawer) {
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
  }

  /* ── 9. Sticky contact hide near footer ─────────────── */
  const footer   = document.querySelector('footer');
  const stickyEl = document.getElementById('stickyBtn');

  if (footer && stickyEl) {
    const stickyObs = new IntersectionObserver(([e]) => {
      stickyEl.style.opacity       = e.isIntersecting ? '0' : '1';
      stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto';
    }, { threshold: 0.05 });
    stickyObs.observe(footer);
  }

  /* ── Boot ────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { loadFAQ(); initReveal(); });
  } else {
    loadFAQ();
    initReveal();
  }

})();
