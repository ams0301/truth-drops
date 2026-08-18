/**
 * Truth Drops — vanilla interaction layer
 * Scroll reveals, reading ribbon, sticky header shrink, footnote popovers,
 * editor note unfiling, Broken Amphora scroll fracture.
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
  // 6. Broken Amphora — Scroll-driven fracture (article pages)
  // Crack draws down, then fragments separate
  // ============================================================
  function initBrokenAmphora() {
    if (prefersReduced) {
      document.querySelectorAll('.broken-vessel:not(.is-static)').forEach(vessel => {
        vessel.querySelectorAll('.crack-path').forEach(crack => {
          crack.style.strokeDashoffset = '0';
          crack.classList.add('active');
        });
        vessel.querySelectorAll('.vessel-piece').forEach(p => p.classList.add('separated'));
      });
      return;
    }

    const vessels = document.querySelectorAll('.broken-vessel:not(.is-static)');
    if (!vessels.length) return;

    let ticking = false;
    let flashDone = false;

    function update() {
      const article = document.querySelector('.drop__body') || document.querySelector('main article');
      if (!article) {
        // On homepage (static vessel), show crack
        vessels.forEach(vessel => {
          const crack = vessel.querySelector('.crack-path');
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
        const crack = vessel.querySelector('.crack-path');
        const leftPiece = vessel.querySelector('.fragment-left');
        const rightPiece = vessel.querySelector('.fragment-right');

        if (crack) {
          // Crack draws from top to bottom (0% to 60% scroll)
          const crackProgress = Math.min(1, progress / 0.6);
          if (crackProgress > 0) {
            const totalLength = 180; // matches stroke-dasharray
            crack.style.strokeDashoffset = (totalLength * (1 - crackProgress)).toString();
            if (crackProgress >= 1) {
              crack.style.strokeDashoffset = '0';
              crack.classList.add('active');
            } else {
              crack.classList.remove('active');
            }
          }
        }

        // Fragments separate after crack completes (60% to 85% scroll)
        const separationProgress = Math.max(0, Math.min(1, (progress - 0.6) / 0.25));
        if (separationProgress > 0) {
          const leftPiece = vessel.querySelector('.fragment-left');
          const rightPiece = vessel.querySelector('.fragment-right');
          
          if (leftPiece && rightPiece) {
            const tx = parseFloat(leftPiece.dataset.tx) || -12;
            const ty = parseFloat(leftPiece.dataset.ty) || 4;
            const rot = leftPiece.dataset.rot || '-3deg';
            
            leftPiece.style.transform = `
              translateX(${tx * separationProgress}px)
              translateY(${ty * separationProgress}px)
              rotate(${parseFloat(rot) * separationProgress}deg)
            `;
            rightPiece.style.transform = `
              translateX(${-parseFloat(leftPiece.dataset.tx) * separationProgress}px)
              translateY(${ty * separationProgress}px)
              rotate(${-parseFloat(rot) * separationProgress}deg)
            `;
            
            if (separationProgress >= 1) {
              leftPiece.classList.add('separated');
              rightPiece.classList.add('separated');
            }
          }
        }

        // Final flash at sign-off (95% scroll)
        const crack = vessel.querySelector('.crack-path');
        if (crack && progress >= 0.95) {
          crack.classList.add('final-flash');
          setTimeout(() => crack.classList.remove('final-flash'), 600);
        }
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
  // 7. Smooth scroll offset for anchor links
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
  // 8. Homepage Vase Easter Egg — click to fully crack
  // ============================================================
  function initVaseEasterEgg() {
    if (prefersReduced) return;

    const homeVase = document.querySelector('.feature__vessel .broken-vessel.is-static');
    if (!homeVase) return;

    let cracked = false;

    homeVase.addEventListener('click', () => {
      if (cracked) return;
      cracked = true;

      // Animate crack drawing
      const crack = homeVase.querySelector('.crack-path');
      if (crack) {
        crack.style.strokeDashoffset = '0';
        crack.classList.add('active');
      }

      // Separate fragments
      setTimeout(() => {
        const leftPiece = homeVase.querySelector('.fragment-left');
        const rightPiece = homeVase.querySelector('.fragment-right');
        if (leftPiece && rightPiece) {
          leftPiece.classList.add('separated');
          rightPiece.classList.add('separated');
        }
      }, 800);

      // Final flash
      setTimeout(() => {
        const crack = homeVase.querySelector('.crack-path');
        if (crack) {
          crack.classList.add('final-flash');
          setTimeout(() => crack.classList.remove('final-flash'), 1200);
        }
      }, 1600);
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
    initBrokenAmphora();
    initVaseEasterEgg();
    initCustomCursor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();