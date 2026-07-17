/*
 * FloorX How To Use — interactive step stage + autoplay
 * - Desktop: left rail + detail
 * - Mobile: rail hidden (CSS); detail + dots only
 * - Auto-advances every few seconds with animated transitions
 */
(function FXHowToUse() {
  'use strict';

  var AUTOPLAY_MS = 4000;
  var RESUME_MS = 8000;

  function boot() {
    var roots = document.querySelectorAll('[data-fx-htu]');
    if (!roots.length) return;
    roots.forEach(initRoot);
  }

  function initRoot(root) {
    if (root.__fxHtuReady) return;
    root.__fxHtuReady = true;

    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-fx-htu-step]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-fx-htu-panel]'));
    var images = Array.prototype.slice.call(root.querySelectorAll('[data-fx-htu-image]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-fx-htu-dot]'));
    var prevBtn = root.querySelector('[data-fx-htu-prev]');
    var nextBtn = root.querySelector('[data-fx-htu-next]');
    var total = Math.max(steps.length, panels.length, images.length, dots.length);
    var index = 0;
    var timer = null;
    var resumeTimer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var inView = true;

    if (!total) return;

    root.style.setProperty('--htu-autoplay-ms', AUTOPLAY_MS + 'ms');

    function setIndex(i, opts) {
      opts = opts || {};
      if (i < 0) i = total - 1;
      if (i >= total) i = 0;
      index = i;

      steps.forEach(function (el, n) {
        var on = n === index;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
        el.setAttribute('tabindex', on ? '0' : '-1');
      });

      panels.forEach(function (el, n) {
        var on = n === index;
        el.classList.toggle('is-active', on);
        if (on) {
          el.removeAttribute('hidden');
          /* retrigger enter animation */
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        } else {
          el.setAttribute('hidden', '');
        }
      });

      images.forEach(function (el, n) {
        var on = n === index;
        el.classList.toggle('is-active', on);
        el.style.opacity = on ? '1' : '0';
      });

      dots.forEach(function (el, n) {
        el.classList.toggle('is-active', n === index);
        el.setAttribute('aria-current', n === index ? 'true' : 'false');
        /* restart progress fill */
        if (n === index) {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        }
      });

      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;

      root.style.setProperty(
        '--htu-progress',
        total > 1 ? (index / (total - 1)) * 100 + '%' : '0%'
      );

      if (opts.user) pauseThenResume();
    }

    function next() {
      setIndex(index + 1);
    }

    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion || !inView) return;
      root.classList.add('is-autoplay');
      timer = setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      root.classList.remove('is-autoplay');
    }

    function pauseThenResume() {
      stopAutoplay();
      if (resumeTimer) clearTimeout(resumeTimer);
      if (reduceMotion) return;
      resumeTimer = setTimeout(function () {
        if (inView) startAutoplay();
      }, RESUME_MS);
    }

    steps.forEach(function (el, n) {
      el.addEventListener('click', function () {
        setIndex(n, { user: true });
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIndex(n, { user: true });
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setIndex(Math.min(total - 1, n + 1), { user: true });
          if (steps[Math.min(total - 1, n + 1)]) steps[Math.min(total - 1, n + 1)].focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setIndex(Math.max(0, n - 1), { user: true });
          if (steps[Math.max(0, n - 1)]) steps[Math.max(0, n - 1)].focus();
        }
      });
    });

    dots.forEach(function (el, n) {
      el.addEventListener('click', function () {
        setIndex(n, { user: true });
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        setIndex(index - 1, { user: true });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        setIndex(index + 1, { user: true });
      });
    }

    root.addEventListener('keydown', function (e) {
      if (e.target.closest('a, button, input, textarea, select')) return;
      if (e.key === 'ArrowRight') setIndex(index + 1, { user: true });
      if (e.key === 'ArrowLeft') setIndex(index - 1, { user: true });
    });

    var touchStartX = 0;
    var touchEndX = 0;

    root.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    root.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          setIndex(index + 1, { user: true });
        } else {
          setIndex(index - 1, { user: true });
        }
      }
    }, {passive: true});

    /* Pause autoplay while user hovers / focuses (desktop rail & detail) */
    root.addEventListener('mouseenter', function () {
      if (!reduceMotion) stopAutoplay();
    });
    root.addEventListener('mouseleave', function () {
      if (!reduceMotion && inView) startAutoplay();
    });
    root.addEventListener('focusin', function () {
      if (!reduceMotion) stopAutoplay();
    });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget) && inView && !reduceMotion) {
        startAutoplay();
      }
    });

    /* Only autoplay when section is in view */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            inView = en.isIntersecting;
            if (inView) startAutoplay();
            else stopAutoplay();
          });
        },
        { threshold: 0.28 }
      );
      io.observe(root);
    } else {
      startAutoplay();
    }

    setIndex(0);
    if (!reduceMotion) startAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
