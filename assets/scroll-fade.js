/**
 * Enhanced Scroll Fade Animation System
 * Adds fade-in and fade-up effects to elements as they enter viewport
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    fadeDuration: 800,
    fadeDelay: 100
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize fade animations
  function initScrollFade() {
    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      document.querySelectorAll('[data-scroll-fade]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const fadeElements = document.querySelectorAll('[data-scroll-fade]');
    
    if (fadeElements.length === 0) return;

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.scrollFadeDelay || 0;
          
          setTimeout(() => {
            entry.target.classList.add('scroll-fade-visible');
          }, delay);
          
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.threshold,
      rootMargin: CONFIG.rootMargin
    });

    // Observe all fade elements
    fadeElements.forEach((element, index) => {
      // Set staggered delay if in a group
      if (element.hasAttribute('data-scroll-fade-group')) {
        element.dataset.scrollFadeDelay = index * CONFIG.fadeDelay;
      }
      
      observer.observe(element);
    });
  }

  // Auto-detect elements for fade animation
  function autoDetectFadeElements() {
    if (prefersReducedMotion) return;

    const selectors = [
      '.fx-section',
      '.card',
      '.product-card',
      '.collection-card',
      '.footer-block',
      '.image-with-text',
      '.multicolumn',
      '.testimonial'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-scroll-fade')) {
          el.setAttribute('data-scroll-fade', 'up');
        }
      });
    });
  }

  // Smooth scroll enhancement for internal links
  function enhanceSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Parallax scroll effect for hero sections
  function initParallaxScroll() {
    if (prefersReducedMotion) return;

    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = element.dataset.parallaxRate || 0.5;
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = -(scrolled * rate);
          element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
      
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    autoDetectFadeElements();
    initScrollFade();
    enhanceSmoothScroll();
    initParallaxScroll();
  }

  // Handle Shopify theme editor
  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => {
      setTimeout(init, 100);
    });
  }
})();
