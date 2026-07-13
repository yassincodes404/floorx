/**
 * FloorX Theme — Animation Engine
 * Version: 3.0
 *
 * Architecture: Single IIFE, modular system with Shopify design mode guards.
 * Depends on: floorx-system.css tokens (for any DOM-applied styles).
 * Reliability: each module is isolated; one failure must not block others.
 */

(function () {
  'use strict';

  // ── Runtime flags ──────────────────────────────────────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesignMode = typeof Shopify !== 'undefined' && Shopify.designMode;

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXReveal
  // Scroll-triggered reveal animations via IntersectionObserver
  // ══════════════════════════════════════════════════════════════════════════
  const FXReveal = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      const elements = document.querySelectorAll('[data-fx-reveal]');
      if (!elements.length) return;

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fx-in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      elements.forEach((el, i) => {
        el.style.setProperty('--fx-order', el.getAttribute('data-fx-order') ?? i);
        io.observe(el);
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXScrollFade
  // Generic IntersectionObserver fade-in for elements with .fx-fade-scroll
  // ══════════════════════════════════════════════════════════════════════════
  const FXScrollFade = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      const elements = document.querySelectorAll('.fx-fade-scroll');
      if (!elements.length) return;

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

      elements.forEach(el => io.observe(el));
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXNav
  // Header scroll-state management (adds .fx-header--scrolled class)
  // ══════════════════════════════════════════════════════════════════════════
  const FXNav = {
    init() {
      if (isDesignMode) return;

      const header = document.querySelector('.fx-header');
      if (!header) return;

      // Ghost header is always ready — no flashy entrance competing with hero
      header.classList.add('fx-header--ready');

      let ticking = false;
      const THRESHOLD = 48;
      /* Homepage hero: never solidify / blur the bar on scroll */
      const isHome = document.body.classList.contains('template-index');

      const update = () => {
        const scrolled = !isHome && window.scrollY > THRESHOLD;
        header.classList.toggle('fx-header--scrolled', scrolled);
        document.documentElement.classList.toggle('fx-scrolled', scrolled);
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });

      update();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXSectionNav
  // Homepage chapter rail is self-contained in snippets/fx-section-nav.liquid
  // (boots independently so it works even if this file is deferred/gated)
  // ══════════════════════════════════════════════════════════════════════════
  const FXSectionNav = {
    init() {
      /* no-op — snippet owns init */
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXProduct
  // Variant card selection animations + price transitions
  // ══════════════════════════════════════════════════════════════════════════
  const FXProduct = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      const cards = document.querySelectorAll('.floorx-card, .fx-card-product');
      cards.forEach(card => {
        card.addEventListener('click', function () {
          cards.forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          FXProduct.animatePrice();
          FXProduct.pulseButton('.add-btn, .fx-btn-primary');
        });
      });

      document.addEventListener('variant:change', () => FXProduct.animatePrice());
    },

    animatePrice() {
      const el = document.querySelector('.floorx-top-price, .price__container');
      if (!el) return;
      el.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.96)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'scale(1.04)';
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
      }, 200);
    },

    pulseButton(selector) {
      const btn = document.querySelector(selector);
      if (!btn) return;
      btn.style.animation = 'fx-pulse-glow 0.6s ease-out';
      setTimeout(() => { btn.style.animation = ''; }, 600);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXPageTransition
  // Smooth page-exit fade overlay
  // ══════════════════════════════════════════════════════════════════════════
  const FXPageTransition = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      let overlay = document.querySelector('.transition-cover');
      if (!overlay) {
        overlay = Object.assign(document.createElement('div'), { className: 'transition-cover' });
        Object.assign(overlay.style, {
          position: 'fixed', inset: '0', background: 'var(--fx-bg-1, #080A12)',
          zIndex: '9999', opacity: '0', pointerEvents: 'none',
          transition: 'opacity 0.35s ease-out'
        });
        document.body.appendChild(overlay);
      }

      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('/#') &&
            !link.hasAttribute('download') && !link.getAttribute('target')) {
          e.preventDefault();
          overlay.style.pointerEvents = 'auto';
          overlay.style.opacity = '1';
          setTimeout(() => { window.location.href = href; }, 350);
        }
      });

      window.addEventListener('load', () => {
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 350);
        }, 80);
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXParallax
  // GPU-composited parallax for [data-fx-parallax] elements
  // ══════════════════════════════════════════════════════════════════════════
  const FXParallax = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      const elements = document.querySelectorAll('[data-fx-parallax]');
      if (!elements.length) return;

      let ticking = false;

      const update = () => {
        const scrollY = window.scrollY;
        elements.forEach(el => {
          const speed = parseFloat(el.getAttribute('data-fx-parallax')) || 0.5;
          el.style.transform = `translateY(${-(scrollY * speed).toFixed(1)}px) translateZ(0)`;
        });
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });

      update();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXCounter
  // Animated count-up numbers via IntersectionObserver
  // ══════════════════════════════════════════════════════════════════════════
  const FXCounter = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;

      const elements = document.querySelectorAll('[data-fx-counter]');
      if (!elements.length) return;

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            FXCounter.animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      elements.forEach(el => io.observe(el));
    },

    animate(el) {
      const target   = parseFloat(el.getAttribute('data-fx-counter'));
      const duration = parseInt(el.getAttribute('data-fx-duration')) || 2000;
      const suffix   = el.getAttribute('data-fx-suffix') || '';
      const prefix   = el.getAttribute('data-fx-prefix') || '';
      const start    = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = prefix + v.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXHero
  // GSAP entrance timeline (only when GSAP is loaded)
  // ══════════════════════════════════════════════════════════════════════════
  const FXHero = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;
      if (typeof gsap === 'undefined') return;

      const hero = document.querySelector('[data-fx-hero]');
      if (!hero) return;

      if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.fx-hero__content',               { opacity: 0,              duration: 0.6 })
        .from('.fx-hero__title',                 { y: 40, opacity: 0,       duration: 0.8 }, '-=0.3')
        .from('.fx-hero__subtitle',              { y: 30, opacity: 0,       duration: 0.7 }, '-=0.5')
        .from('.fx-hero__content .fx-btn-primary', { y: 20, opacity: 0, scale: 0.9, duration: 0.6 }, '-=0.4')
        .from('.fx-hero__product-image',         { y: 60, opacity: 0, scale: 0.95, duration: 1 }, '-=0.6');

      if (typeof ScrollTrigger !== 'undefined') {
        const img = hero.querySelector('.fx-hero__product-image');
        if (img) {
          gsap.to(img, {
            y: -50, ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
          });
        }
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXBeforeAfter
  // Custom before/after image comparison slider
  // ══════════════════════════════════════════════════════════════════════════
  const FXBeforeAfter = {
    init() {
      if (isDesignMode) return;

      document.querySelectorAll('[data-fx-comparison]').forEach(container => {
        const slider = container.querySelector('[data-slider]');
        const before = container.querySelector('[data-before]');
        if (!slider || !before) return;

        let dragging = false;

        const setPos = (clientX) => {
          const rect = container.getBoundingClientRect();
          const pct  = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
          slider.style.left = pct + '%';
          before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        };

        slider.addEventListener('mousedown',  () => { dragging = true; });
        document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
        document.addEventListener('mouseup',   () => { dragging = false; });

        slider.addEventListener('touchstart',  e => { dragging = true; e.preventDefault(); });
        document.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: false });
        document.addEventListener('touchend',   () => { dragging = false; });

        setPos(container.getBoundingClientRect().width / 2); // start at 50%
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXFAQ
  // Enhanced FAQ accordion — optional single-open mode
  // ══════════════════════════════════════════════════════════════════════════
  const FXFAQ = {
    init() {
      const faq = document.querySelector('.fx-faq');
      if (!faq) return;

      const items = faq.querySelectorAll('details');
      items.forEach(item => {
        item.addEventListener('toggle', function () {
          if (!this.open) return;

          if (faq.hasAttribute('data-single-open')) {
            items.forEach(other => { if (other !== this && other.open) other.open = false; });
          }

          if (!isDesignMode) {
            const headerH = document.querySelector('.fx-header')?.offsetHeight || 0;
            const top     = this.getBoundingClientRect().top + window.scrollY;
            if (top < window.scrollY + headerH) {
              window.scrollTo({ top: top - headerH - 20, behavior: 'smooth' });
            }
          }
        });
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXBackToTop
  // Back-to-top button visibility + smooth scroll
  // ══════════════════════════════════════════════════════════════════════════
  const FXBackToTop = {
    init() {
      const btn = document.querySelector('[data-fx-back-to-top]');
      if (!btn) return;

      let ticking = false;

      const update = () => {
        const visible = window.scrollY > 500;
        btn.style.opacity       = visible ? '1' : '0';
        btn.style.pointerEvents = visible ? 'auto' : 'none';
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      update();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXSmoothAnchor
  // Smooth scroll for in-page anchor links
  // ══════════════════════════════════════════════════════════════════════════
  const FXSmoothAnchor = {
    init() {
      if (prefersReducedMotion) return;

      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
          const href   = this.getAttribute('href');
          if (href === '#') return;
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (history.pushState) history.pushState(null, null, href);
          }
        });
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Module: FXElectricCursor
  // Subtle electric blue mouse-trail glow (desktop only)
  // ══════════════════════════════════════════════════════════════════════════
  const FXElectricCursor = {
    init() {
      if (prefersReducedMotion || isDesignMode) return;
      if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

      const glow = document.createElement('div');
      glow.className = 'fx-cursor-glow';
      Object.assign(glow.style, {
        position: 'fixed', width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(125,249,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: '0',
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease',
        opacity: '0'
      });
      document.body.appendChild(glow);

      let visible = false;
      document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
        if (!visible) { glow.style.opacity = '1'; visible = true; }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0'; visible = false;
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION — fault-isolated modules
  // ══════════════════════════════════════════════════════════════════════════
  function safeInit(name, fn) {
    try {
      fn();
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[FloorX] module failed:', name, err);
      }
    }
  }

  function initAll() {
    document.documentElement.setAttribute('data-fx-engine', '3.0');

    safeInit('FXNav', () => FXNav.init());
    safeInit('FXReveal', () => FXReveal.init());
    safeInit('FXScrollFade', () => FXScrollFade.init());
    safeInit('FXParallax', () => FXParallax.init());
    safeInit('FXCounter', () => FXCounter.init());
    safeInit('FXPageTransition', () => FXPageTransition.init());
    safeInit('FXBackToTop', () => FXBackToTop.init());
    safeInit('FXSmoothAnchor', () => FXSmoothAnchor.init());
    safeInit('FXElectricCursor', () => FXElectricCursor.init());
    safeInit('FXBeforeAfter', () => FXBeforeAfter.init());
    safeInit('FXFAQ', () => FXFAQ.init());

    if (document.body.classList.contains('template-product') ||
        document.querySelector('.fx-product-section, .featured-product, .floorx-card')) {
      safeInit('FXProduct', () => FXProduct.init());
    }

    if (typeof gsap !== 'undefined') {
      safeInit('FXHero', () => FXHero.init());
    }

    document.documentElement.classList.add('fx-engine-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Shopify theme editor re-init (isolated)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => {
      safeInit('FXNav', () => FXNav.init());
      safeInit('FXFAQ', () => FXFAQ.init());
      safeInit('FXBeforeAfter', () => FXBeforeAfter.init());
      safeInit('FXReveal', () => FXReveal.init());
      safeInit('FXScrollFade', () => FXScrollFade.init());
    });
  }

  // Public debug hook (non-breaking)
  window.FloorX = window.FloorX || {};
  window.FloorX.engineVersion = '3.0';
  window.FloorX.reinit = initAll;

})();
