/**
 * Truth Drops — vanilla interaction layer
 * Scroll reveals, reading ribbon, sticky header shrink, footnote popovers,
 * editor note unfiling, Broken Vase scroll fracture.
 * No frameworks, ~5KB gzipped. Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // 1. Scroll Reveal (IntersectionObserver)
  // ============================================================
  function initScrollReveal() {
    if (prefersReduced) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
      document.querySelectorAll('.editor-note').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          if (entry.target.classList.contains('editor-note')) {
            entry.target.classList.add('is-visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.querySelectorAll('.editor-note').forEach(el => observer.observe(el));
  }

  // ============================================================
  // 2. Vertical Reading Ribbon (article pages)
  // ============================================================
  function initReadingRibbon() {
    const ribbon = document.querySelector('.reading-ribbon');
    const fill = document.querySelector('.reading-ribbon__fill');
    if (!ribbon || !fill) return;

    const article = document.querySelector('.drop__body') || document.querySelector('main article');
    if (!article) return;

    let ticking = false;
    function update() {
      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const articleHeight = rect.height;
      const scrolled = -rect.top + viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / (articleHeight + viewportHeight)));
      fill.style.height = (progress * 100) + '%';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ============================================================
  // 3. Sticky Header Shrink
  // ============================================================
  function initHeaderShrink() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const shrinkThreshold = 120;
    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      const shouldShrink = scrollY > shrinkThreshold;
      header.classList.toggle('is-shrunk', shouldShrink);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  // ============================================================
  // 4. Footnote Popovers
  // ============================================================
  function initFootnotes() {
    const refs = document.querySelectorAll('.footnote-ref');
    if (!refs.length) return;

    let currentPopover = null;
    let currentRef = null;

    function closeAll() {
      if (currentPopover) {
        currentPopover.classList.remove('open');
        currentPopover = null;
      }
      currentRef = null;
    }

    function positionPopover(ref, popover) {
      const refRect = ref.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let top = refRect.top - popoverRect.height - gap;
      let left = refRect.left + (refRect.width / 2) - (popoverRect.width / 2);

      if (top < gap) {
        top = refRect.bottom + gap;
      }

      if (left < gap) left = gap;
      if (left + popoverRect.width > viewportWidth - gap) {
        left = viewportWidth - popoverRect.width - gap;
      }

      popover.style.top = top + 'px';
      popover.style.left = left + 'px';
    }

    refs.forEach(ref => {
      const id = ref.getAttribute('href')?.slice(1);
      if (!id) return;
      const popover = document.getElementById(id);
      if (!popover || !popover.classList.contains('footnote-popover')) return;

      document.body.appendChild(popover);

      function open() {
        closeAll();
        currentPopover = popover;
        currentRef = ref;
        popover.classList.add('open');
        positionPopover(ref, popover);
      }

      function close() {
        if (currentPopover === popover) closeAll();
      }

      ref.addEventListener('click', (e) => {
        e.preventDefault();
        if (popover.classList.contains('open')) {
          close();
        } else {
          open();
        }
      });

      ref.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });

      popover.querySelector('.footnote-popover__close')?.addEventListener('click', close);
    });

    document.addEventListener('click', (e) => {
      if (currentPopover && !currentPopover.contains(e.target) && e.target !== currentRef) {
        closeAll();
      }
    });

    window.addEventListener('scroll', closeAll, { passive: true });
    window.addEventListener('resize', closeAll, { passive: true });
  }

  // ============================================================
  // 5. Smooth scroll offset for anchor links
  // ============================================================
  function initAnchorOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop - headerHeight - 16, behavior: 'smooth' });
      target.focus({ preventScroll: true });
    });
  }

  // ============================================================
  // 6. Broken Vase — Scroll-driven fracture (article pages)
  // 12-stage kintsugi fracture progression
  // ============================================================
  function initBrokenVase() {
    if (prefersReduced) {
      document.querySelectorAll('.broken-vessel:not(.is-static)').forEach(vessel => {
        vessel.querySelectorAll('.crack-path').forEach(crack => {
          crack.style.strokeDashoffset = '0';
          crack.classList.add('active');
        });
        vessel.querySelectorAll('.crack-path[data-stage="12"]').forEach(c => {
          c.style.transform = 'translateX(-3px)';
          c.style.transformOrigin = 'center';
        });
      });
      return;
    }

    const vessels = document.querySelectorAll('.broken-vessel:not(.is-static)');
    if (!vessels.length) return;

    // 12 crack stages in order of appearance — kintsugi progression
    const stages = [
      { selector: '.crack-path[data-stage="1"]',  threshold: 0.00 },  // Neck crack - immediate
      { selector: '.crack-path[data-stage="2"]',  threshold: 0.08 },  // Right shoulder branch
      { selector: '.crack-path[data-stage="3"]',  threshold: 0.08 },  // Left shoulder branch
      { selector: '.crack-path[data-stage="4"]',  threshold: 0.18 },  // Right shoulder chip
      { selector: '.crack-path[data-stage="5"]',  threshold: 0.18 },  // Left shoulder chip
      { selector: '.crack-path[data-stage="6"]',  threshold: 0.30 },  // Right body fracture
      { selector: '.crack-path[data-stage="7"]',  threshold: 0.30 },  // Left body fracture
      { selector: '.crack-path[data-stage="8"]',  threshold: 0.48 },  // Lower right fracture
      { selector: '.crack-path[data-stage="9"]',  threshold: 0.48 },  // Lower left fracture
      { selector: '.crack-path[data-stage="10"]', threshold: 0.65 },  // Right foot crack
      { selector: '.crack-path[data-stage="11"]', threshold: 0.65 },  // Left foot crack
      { selector: '.crack-path[data-stage="12"]', threshold: 0.82 },  // Base center split (final)
    ];

    let ticking = false;

    function update() {
      const article = document.querySelector('.drop__body') || document.querySelector('main article');
      if (!article) {
        // On homepage (static vessel), show first few cracks
        vessels.forEach(vessel => {
          const crack = vessel.querySelector('.crack-path[data-stage="1"]');
          if (crack) {
            crack.style.strokeDashoffset = '0';
            crack.classList.add('active');
          }
        });
        return;
      }

      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const articleHeight = rect.height;
      const scrolled = -rect.top + viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / (articleHeight + viewportHeight)));

      vessels.forEach(vessel => {
        stages.forEach(({ selector, threshold }) => {
          const crack = vessel.querySelector(selector);
          if (!crack) return;

          const isActive = progress >= threshold;
          if (isActive) {
            crack.style.strokeDashoffset = '0';
            crack.classList.add('active');
          } else {
            crack.style.strokeDashoffset = crack.getAttribute('stroke-dasharray') || '0';
            crack.classList.remove('active');
          }

          // Add slight separation for final base split when near end
          if (selector.includes('data-stage="12"') && progress >= 0.88) {
            crack.style.transform = 'translateX(-3px)';
            crack.style.transformOrigin = 'center';
          }

          // Golden flash on final split at sign-off (near end of article)
          if (selector.includes('data-stage="12"') && progress >= 0.95) {
            crack.classList.add('final-flash');
            setTimeout(() => crack.classList.remove('final-flash'), 1500);
          }
        });
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ============================================================
  // 5. Smooth scroll offset for anchor links
  // ============================================================
  function initAnchorOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop - headerHeight - 16, behavior: 'smooth' });
      target.focus({ preventScroll: true });
    });
  }

  // ============================================================
  // 7. Homepage Vase Easter Egg — click to fully crack
  // ============================================================
  function initVaseEasterEgg() {
    if (prefersReduced) return;

    const homeVase = document.querySelector('.feature__vessel .broken-vessel.is-static');
    if (!homeVase) return;

    let cracked = false;

    homeVase.addEventListener('click', () => {
      if (cracked) return;
      cracked = true;

      // Animate all 12 cracks sequentially
      const allCracks = homeVase.querySelectorAll('.crack-path');
      allCracks.forEach((crack, i) => {
        setTimeout(() => {
          crack.style.strokeDashoffset = '0';
          crack.classList.add('active');
        }, i * 180);
      });

      // Final base split
      setTimeout(() => {
        const mainCrack = homeVase.querySelector('.crack-path[data-stage="12"]');
        if (mainCrack) {
          mainCrack.style.transform = 'translateX(-3px)';
          mainCrack.style.transformOrigin = 'center';
        }
      }, 2200);

      // Brief golden flash
      setTimeout(() => {
        const mainCrack = homeVase.querySelector('.crack-path[data-stage="12"]');
        if (mainCrack) {
          mainCrack.classList.add('final-flash');
          setTimeout(() => mainCrack.classList.remove('final-flash'), 2000);
        }
      }, 2400);
    });
  }

  // ============================================================
  // 8. Custom cursor for article body (text caret feel)
  // ============================================================
  function initCustomCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (prefersReduced) return;

    const style = document.createElement('style');
    style.textContent = `
      .prose, .drop__body { cursor: text !important; }
      .prose *:not(a):not(button):not(input):not([role="button"]), 
      .drop__body *:not(a):not(button):not(input):not([role="button"]) { cursor: text !important; }
      .prose a, .drop__body a, .prose button, .drop__body button { cursor: pointer !important; }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // Init all
  // ============================================================
  function init() {
    initScrollReveal();
    initReadingRibbon();
    initHeaderShrink();
    initFootnotes();
    initAnchorOffset();
    initBrokenVase();
    initVaseEasterEgg();
    initCustomCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();