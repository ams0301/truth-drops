/**
 * Truth Drops — vanilla interaction layer
 * Scroll reveals, reading ribbon, sticky header shrink, footnote popovers,
 * editor note unfiling, Broken Amphora scroll fracture.
 * No frameworks. Respects prefers-reduced-motion.
 *
 * NOTE: This file is loaded as an ES module. A single SyntaxError here
 * disables every interaction on the site — keep it clean.
 */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Error boundary — one failing module must never take down the rest
  function safeInit(fn, name) {
    try {
      fn();
    } catch (e) {
      console.warn('[Truth Drops] ' + name + ' failed:', e);
    }
  }

  // ============================================================
  // 1. Scroll Reveal (IntersectionObserver + viewport safety net)
  // ============================================================
  function initScrollReveal() {
    function reveal(el) {
      el.classList.add('is-in');
      if (el.classList.contains('editor-note')) {
        el.classList.add('is-visible');
      }
    }

    if (prefersReduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .editor-note').forEach(reveal);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.reveal, .editor-note').forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: if the observer ever misses an in-viewport element
    // (timing edge case), reveal it. Below-the-fold elements are left
    // for the observer so the scroll-in effect is preserved.
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-in), .editor-note:not(.is-visible)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          reveal(el);
        }
      });
    }, 2000);
  }

  // ============================================================
  // 2. Vertical Reading Ribbon (article pages)
  // ============================================================
  function initReadingRibbon() {
    var ribbon = document.querySelector('.reading-ribbon');
    var fill = document.querySelector('.reading-ribbon__fill');
    if (!ribbon || !fill) return;

    var article = document.querySelector('.drop__body') || document.querySelector('main article');
    if (!article) return;

    var ticking = false;
    function update() {
      var rect = article.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      var scrolled = -rect.top + viewportHeight;
      var progress = Math.max(0, Math.min(1, scrolled / (rect.height + viewportHeight)));
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
    var header = document.querySelector('.site-header');
    if (!header) return;

    var shrinkThreshold = 120;
    var ticking = false;

    function update() {
      header.classList.toggle('is-shrunk', window.scrollY > shrinkThreshold);
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
    var refs = document.querySelectorAll('.footnote-ref');
    if (!refs.length) return;

    var currentPopover = null;
    var currentRef = null;

    function closeAll() {
      if (currentPopover) {
        currentPopover.classList.remove('open');
        currentPopover = null;
      }
      currentRef = null;
    }

    function positionPopover(ref, popover) {
      var refRect = ref.getBoundingClientRect();
      var popoverRect = popover.getBoundingClientRect();
      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;
      var gap = 8;

      var top = refRect.top - popoverRect.height - gap;
      var left = refRect.left + (refRect.width / 2) - (popoverRect.width / 2);

      if (top < gap) top = refRect.bottom + gap;
      if (left < gap) left = gap;
      if (left + popoverRect.width > viewportWidth - gap) {
        left = viewportWidth - popoverRect.width - gap;
      }

      popover.style.top = top + 'px';
      popover.style.left = left + 'px';
    }

    refs.forEach(function (ref) {
      var id = ref.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var popover = document.getElementById(id.slice(1));
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

      ref.addEventListener('click', function (e) {
        e.preventDefault();
        if (popover.classList.contains('open')) close(); else open();
      });

      ref.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });

      var closeBtn = popover.querySelector('.footnote-popover__close');
      if (closeBtn) closeBtn.addEventListener('click', close);
    });

    document.addEventListener('click', function (e) {
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
    var header = document.querySelector('.site-header');
    if (!header) return;

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      var targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetTop - header.offsetHeight - 16, behavior: 'smooth' });
      target.focus({ preventScroll: true });
    });
  }

  // ============================================================
  // 6. Broken Amphora — scroll-driven fracture (article pages)
  //    Crack draws down (0–60%), fragments separate (60–85%),
  //    golden flash at sign-off (95%+).
  // ============================================================
  function initBrokenAmphora() {
    var vessels = document.querySelectorAll('.broken-vessel:not(.is-static)');
    if (!vessels.length) return;

    function applyFinalState(vessel) {
      vessel.querySelectorAll('.crack-path').forEach(function (crack) {
        crack.style.strokeDashoffset = '0';
        crack.classList.add('active');
      });
      vessel.querySelectorAll('.vessel-piece').forEach(function (p) {
        p.classList.add('separated');
      });
    }

    if (prefersReduced) {
      vessels.forEach(applyFinalState);
      return;
    }

    var ticking = false;
    var flashDone = false;

    function update() {
      var article = document.querySelector('.drop__body') || document.querySelector('main article');

      // No article context (e.g. non-article pages): just show the crack
      if (!article) {
        vessels.forEach(function (vessel) {
          var crack = vessel.querySelector('.crack-path');
          if (crack) {
            crack.style.strokeDashoffset = '0';
            crack.classList.add('active');
          }
        });
        ticking = false;
        return;
      }

      var rect = article.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      var scrolled = -rect.top + viewportHeight;
      var progress = Math.max(0, Math.min(1, scrolled / (rect.height + viewportHeight)));

      vessels.forEach(function (vessel) {
        var crack = vessel.querySelector('.crack-path');
        var leftPiece = vessel.querySelector('.fragment-left');
        var rightPiece = vessel.querySelector('.fragment-right');

        // Crack draws from 0% to 60% of scroll
        if (crack) {
          var crackProgress = Math.min(1, progress / 0.6);
          var totalLength = 180; // matches stroke-dasharray in the component CSS
          crack.style.strokeDashoffset = (totalLength * (1 - crackProgress)).toString();
          if (crackProgress >= 1) crack.classList.add('active');
          else crack.classList.remove('active');
        }

        // Fragments separate from 60% to 85%
        var sep = Math.max(0, Math.min(1, (progress - 0.6) / 0.25));
        if (leftPiece && rightPiece && sep > 0) {
          var tx = parseFloat(leftPiece.dataset.tx) || -12;
          var ty = parseFloat(leftPiece.dataset.ty) || 4;
          var rot = parseFloat(leftPiece.dataset.rot) || -3;

          leftPiece.style.transform =
            'translateX(' + (tx * sep) + 'px) translateY(' + (ty * sep) + 'px) rotate(' + (rot * sep) + 'deg)';
          rightPiece.style.transform =
            'translateX(' + (-tx * sep) + 'px) translateY(' + (ty * sep) + 'px) rotate(' + (-rot * sep) + 'deg)';

          if (sep >= 1) {
            leftPiece.classList.add('separated');
            rightPiece.classList.add('separated');
          }
        }

        // Single golden flash at sign-off
        if (!flashDone && progress >= 0.95 && crack) {
          flashDone = true;
          crack.classList.add('final-flash');
          setTimeout(function () { crack.classList.remove('final-flash'); }, 1200);
        }
        if (progress < 0.9) flashDone = false;
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
  // 7. Homepage Vase Easter Egg — click to fully fracture
  // ============================================================
  function initVaseEasterEgg() {
    if (prefersReduced) return;

    var homeVase = document.querySelector('.feature__vessel .broken-vessel.is-static');
    if (!homeVase) return;

    var cracked = false;

    homeVase.addEventListener('click', function () {
      if (cracked) return;
      cracked = true;

      var crack = homeVase.querySelector('.crack-path');
      if (crack) {
        crack.style.strokeDashoffset = '0';
        crack.classList.add('active');
      }

      setTimeout(function () {
        var leftPiece = homeVase.querySelector('.fragment-left');
        var rightPiece = homeVase.querySelector('.fragment-right');
        if (leftPiece && rightPiece) {
          leftPiece.classList.add('separated');
          rightPiece.classList.add('separated');
        }
      }, 800);

      setTimeout(function () {
        if (!crack) return;
        crack.classList.add('final-flash');
        setTimeout(function () { crack.classList.remove('final-flash'); }, 1200);
      }, 1600);
    });
  }

  // ============================================================
  // 8. Custom cursor for article body (text caret feel)
  // ============================================================
  function initCustomCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (prefersReduced) return;

    var style = document.createElement('style');
    style.textContent =
      '.prose, .drop__body { cursor: text !important; }' +
      '.prose *:not(a):not(button):not(input):not([role="button"]),' +
      '.drop__body *:not(a):not(button):not(input):not([role="button"]) { cursor: text !important; }' +
      '.prose a, .drop__body a, .prose button, .drop__body button { cursor: pointer !important; }';
    document.head.appendChild(style);
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    safeInit(initScrollReveal, 'initScrollReveal');
    safeInit(initReadingRibbon, 'initReadingRibbon');
    safeInit(initHeaderShrink, 'initHeaderShrink');
    safeInit(initFootnotes, 'initFootnotes');
    safeInit(initAnchorOffset, 'initAnchorOffset');
    safeInit(initBrokenAmphora, 'initBrokenAmphora');
    safeInit(initVaseEasterEgg, 'initVaseEasterEgg');
    safeInit(initCustomCursor, 'initCustomCursor');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();