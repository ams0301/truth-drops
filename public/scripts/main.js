/**
 * Truth Drops — vanilla interaction layer
 * Scroll reveals, reading ribbon, sticky header shrink, footnote popovers,
 * editor note unfiling, Broken Vessel scroll fracture, Ink Drop page transitions.
 * No frameworks, ~5KB gzipped. Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOutExpo = (t) => 1 - Math.pow(2, -10 * t);

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
  // 6. Broken Vessel — Scroll-driven fracture (article pages)
  // ============================================================
  function initBrokenVessel() {
    if (prefersReduced) {
      document.querySelectorAll('.broken-vessel:not(.is-static)').forEach(vessel => {
        vessel.querySelectorAll('.crack-path').forEach(crack => {
          crack.style.strokeDashoffset = '0';
          crack.classList.add('active');
        });
        vessel.querySelectorAll('.crack-path[data-stage="5"]').forEach(c => c.style.transform = 'translateX(-3px)');
      });
      return;
    }

    const vessels = document.querySelectorAll('.broken-vessel:not(.is-static)');
    if (!vessels.length) return;

    // Crack stages in order of appearance (matching CSS data-stage attributes)
    const stages = [
      { selector: '.crack-path[data-stage="1"]', threshold: 0.0 },      // Hairline - visible from start
      { selector: '.crack-path[data-stage="2"]', threshold: 0.2 },     // Right branch
      { selector: '.crack-path[data-stage="3"]', threshold: 0.2 },     // Left branch
      { selector: '.crack-path[data-stage="4"]', threshold: 0.35 },    // Chip at rim
      { selector: '.crack-path[data-stage="5"]', threshold: 0.5 },     // Main fracture
    ];

    let ticking = false;

    function update() {
      const article = document.querySelector('.drop__body') || document.querySelector('main article');
      if (!article) {
        // On homepage (static vessel), just show hairline crack
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

          // Add split transform for final fracture when near end
          if (selector.includes('data-stage="5"') && progress >= 0.88) {
            crack.style.transform = 'translateX(-3px)';
            crack.style.transformOrigin = 'center';
          }

          // Flash accent on final crack at sign-off (near end of article)
          if (selector.includes('data-stage="5"') && progress >= 0.95) {
            crack.classList.add('final-flash');
            setTimeout(() => crack.classList.remove('final-flash'), 1000);
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
    update(); // initial
  }

  // ============================================================
  // 7. Ink Drop Page Transition (View Transitions API + custom overlay)
  // ============================================================
  function initInkDropTransition() {
    if (prefersReduced) return;
    if (!document.startViewTransition) return;

    const transitionOverlay = document.getElementById('ink-drop-transition');
    if (!transitionOverlay) return;

    const drop = transitionOverlay.querySelector('.ink-drop');
    const ripple1 = transitionOverlay.querySelector('.ink-ripple--1');
    const ripple2 = transitionOverlay.querySelector('.ink-ripple--2');
    const svg = transitionOverlay.querySelector('.ink-drop-svg');

    let isTransitioning = false;

    // Timing constants matching the new elegant CSS animations
    const DROP_DURATION = 1200;
    const RIPPLE_DELAY = 350;
    const REVEAL_DELAY = 500;
    const TOTAL_DURATION = 1800;

    function playTransition(href, clickX, clickY) {
      if (isTransitioning) return;
      isTransitioning = true;

      // Position SVG at click point (or center if not available)
      const x = clickX ?? window.innerWidth / 2;
      const y = clickY ?? window.innerHeight / 2;
      svg.style.transformOrigin = `${x}px ${y}px`;

      transitionOverlay.hidden = false;
      transitionOverlay.classList.add('playing');

      // Wait for drop to land, then start ripple + reveal
      setTimeout(() => {
        transitionOverlay.classList.add('revealing');
        transitionOverlay.classList.remove('playing');
      }, REVEAL_DELAY);

      // Start view transition after ripple begins
      setTimeout(() => {
        document.startViewTransition(() => {
          window.location.href = href;
        });
      }, REVEAL_DELAY + 50);

      // Cleanup after transition completes
      setTimeout(() => {
        transitionOverlay.classList.remove('revealing');
        transitionOverlay.hidden = true;
        isTransitioning = false;
      }, TOTAL_DURATION);
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Only transition for internal navigation
      const isInternal = href.startsWith('/drops/') || href === '/' || href.startsWith('/tags/') || href.startsWith('/archive');
      const isSameOrigin = link.origin === window.location.origin;
      if (!isInternal || !isSameOrigin) return;

      // Skip if modifier keys pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Prevent default navigation
      e.preventDefault();

      // Get click position for drop origin
      const clickX = e.clientX;
      const clickY = e.clientY;

      playTransition(href, clickX, clickY);
    });
  }

  // ============================================================
  // 8. Homepage Vessel Easter Egg — click to crack + drop
  // ============================================================
  function initVesselEasterEgg() {
    if (prefersReduced) return;

    const homeVessel = document.querySelector('.feature__vessel .broken-vessel.is-static');
    if (!homeVessel) return;

    let cracked = false;

    homeVessel.addEventListener('click', () => {
      if (cracked) return;
      cracked = true;

      // Animate all cracks sequentially with elegant timing
      const allCracks = homeVessel.querySelectorAll('.crack-path');
      allCracks.forEach((crack, i) => {
        setTimeout(() => {
          crack.style.strokeDashoffset = '0';
          crack.classList.add('active');
        }, i * 180);
      });

      // Split pieces
      setTimeout(() => {
        homeVessel.querySelector('.crack-path[data-stage="5"]').style.transform = 'translateX(-3px)';
        homeVessel.querySelector('.crack-path[data-stage="5"]').style.transformOrigin = 'center';
      }, 800);

      // Spawn ink drop at vessel position
      setTimeout(() => {
        const rect = homeVessel.getBoundingClientRect();
        spawnInkDrop(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }, 900);
    });
  }

  function spawnInkDrop(x, y) {
    const overlay = document.getElementById('ink-drop-transition');
    if (!overlay) return;

    const svg = overlay.querySelector('.ink-drop-svg');
    const drop = overlay.querySelector('.ink-drop');
    const ripple1 = overlay.querySelector('.ink-ripple--1');
    const ripple2 = overlay.querySelector('.ink-ripple--2');

    overlay.hidden = false;
    svg.style.transformOrigin = `${x}px ${y}px`;

    // Trigger animations with new elegant timing
    drop.style.animation = 'none';
    ripple1.style.animation = 'none';
    ripple2.style.animation = 'none';

    // Force reflow
    void drop.offsetWidth;

    drop.style.animation = 'drop-fall 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
    ripple1.style.animation = 'ripple-expand 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
    ripple2.style.animation = 'ripple-expand 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';

    setTimeout(() => {
      overlay.hidden = true;
      drop.style.animation = '';
      ripple1.style.animation = '';
      ripple2.style.animation = '';
    }, 1800);
  }

  // ============================================================
  // 9. Custom cursor for article body (text caret feel)
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
    initBrokenVessel();
    initInkDropTransition();
    initVesselEasterEgg();
    initCustomCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();