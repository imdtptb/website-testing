(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Cursor-tracked specular highlight on glass panels ---------- */
  const glassEls = document.querySelectorAll('[data-glass], .glass');
  if (!reduceMotion) {
    glassEls.forEach(el => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ---------- Theme toggle (Ink / Paper) ---------- */
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const STORAGE_KEY = 'mq-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeLabel.textContent = theme === 'paper' ? 'Paper' : 'Ink';
    toggle.setAttribute('aria-pressed', theme === 'paper' ? 'true' : 'false');
  }

  let saved = 'ink';
  try { saved = localStorage.getItem(STORAGE_KEY) || 'ink'; } catch (e) { /* storage unavailable */ }
  applyTheme(saved);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'paper' ? 'ink' : 'paper';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Active dock link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const dockLinks = document.querySelectorAll('.dock-links a');
  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          dockLinks.forEach(a => {
            a.style.color = a.getAttribute('href') === '#' + id ? 'var(--ink)' : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -58% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  /* ---------- Work card modal ---------- */
  const backdrop = document.getElementById('modalBackdrop');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalTag = document.getElementById('modalTag');
  const modalMeta = document.getElementById('modalMeta');
  const modalExcerpt = document.getElementById('modalExcerpt');
  const modalLink = document.getElementById('modalLink');
  const modalOutlet = document.getElementById('modalOutlet');
  const modalClose = document.getElementById('modalClose');
  let lastFocused = null;

  function openModal(card) {
    const tagText = card.querySelector('.tag')?.textContent || '';
    modalTag.textContent = tagText;
    modalTitle.textContent = card.dataset.title || '';
    modalMeta.innerHTML = `<span>${card.dataset.outlet || ''}</span><span>${card.dataset.date || ''}</span><span>${card.dataset.time || ''}</span>`;
    modalExcerpt.textContent = card.dataset.excerpt || '';
    modalOutlet.textContent = card.dataset.outlet || '';
    modalLink.href = card.dataset.link || '#';

    lastFocused = document.activeElement;
    backdrop.classList.add('open');
    modalClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.work-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });

  /* ---------- "Currently drafting" word meter ---------- */
  const wordFill = document.getElementById('wordFill');
  const wordCountEl = document.getElementById('wordCount');
  const TARGET_WORDS = 1840;
  const GOAL_WORDS = 3000;

  function animateCount(target, goal) {
    if (reduceMotion) {
      wordCountEl.textContent = target.toLocaleString();
      wordFill.style.width = Math.min(100, (target / goal) * 100) + '%';
      return;
    }
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      wordCountEl.textContent = current.toLocaleString();
      wordFill.style.width = Math.min(100, (current / goal) * 100) + '%';
    }, 20);
  }

  const nowPanel = document.querySelector('.now-panel');
  if (nowPanel && 'IntersectionObserver' in window) {
    const wordObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(TARGET_WORDS, GOAL_WORDS);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    wordObs.observe(nowPanel);
  } else {
    animateCount(TARGET_WORDS, GOAL_WORDS);
  }

})();
