/**
 * CampusFind — Motion & Interaction Engine
 * Purposeful, choreographed animations and micro-interactions.
 * Strictly respects prefers-reduced-motion.
 */

export function initMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initScrollHeader();
  initSearchShortcut();

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-reveal], .reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  initScrollReveals();
  initCounterAnimations();
  initCardHoverEffects();
}

/**
 * Dynamic sticky header with smooth elevation and glassmorphism on scroll
 */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  const updateHeader = () => {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    if (currentScroll > 24) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
    lastScroll = currentScroll;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
}

/**
 * Scroll-triggered entrance reveals using IntersectionObserver
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('[data-reveal], .reveal, .step-card, .item-card, .stat-card');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  });

  revealElements.forEach((el, index) => {
    if (!el.style.getPropertyValue('--reveal-delay')) {
      // Automatic stagger for sibling cards
      const delay = (index % 4) * 80;
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    }
    observer.observe(el);
  });
}

/**
 * Smooth numeric counter animation for live stats
 */
export function animateCounter(element, targetValue, duration = 1200) {
  if (!element) return;
  const target = parseInt(targetValue, 10);
  if (isNaN(target)) {
    element.textContent = targetValue;
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || target === 0) {
    element.textContent = target.toLocaleString();
    return;
  }

  const startTime = performance.now();
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentVal = Math.round(easeOutCubic(progress) * target);

    element.textContent = currentVal.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(updateCount);
}

/**
 * Watch for stat elements entering viewport to trigger counter animation
 */
function initCounterAnimations() {
  const statNumbers = document.querySelectorAll('.hero-stat-num, .stat-card-val, [data-counter]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = el.getAttribute('data-target-val') || el.textContent.trim();
        animateCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/**
 * Keyboard shortcut: press "/" to focus search input
 */
function initSearchShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const searchInput = document.getElementById('hero-search-input') || document.getElementById('browse-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });
}

/**
 * Subtle interactive hover feedback on cards
 */
function initCardHoverEffects() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.item-card, .step-card, .stat-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
}

// Auto-run when DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
}
