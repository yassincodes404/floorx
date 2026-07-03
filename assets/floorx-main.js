/**
 * FloorX Theme — Animation Engine
 * Version: 2.0
 * 
 * Architecture: Modular animation system with Shopify design mode guards
 * Dependencies: GSAP (loaded conditionally on index and product pages)
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check if we're in Shopify design mode
  const isDesignMode = typeof Shopify !== 'undefined' && Shopify.designMode;

  // ========================================
  // Module: FXReveal
  // Purpose: Scroll-triggered reveal animations with stagger
  // ========================================
  const FXReveal = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      const revealElements = document.querySelectorAll('[data-fx-reveal]');
      
      if (revealElements.length === 0) return;

      // Use IntersectionObserver for performance
      const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add active class to trigger CSS transition
            entry.target.classList.add('fx-reveal--active');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements.forEach((element, index) => {
        // If no data-fx-order attribute, set it based on index
        if (!element.hasAttribute('data-fx-order')) {
          element.style.setProperty('--fx-order', index);
        } else {
          element.style.setProperty('--fx-order', element.getAttribute('data-fx-order'));
        }
        
        observer.observe(element);
      });
    }
  };

  // ========================================
  // Module: FXNav
  // Purpose: Header scroll state management
  // ========================================
  const FXNav = {
    init: function() {
      if (isDesignMode) return;

      const header = document.querySelector('.fx-header');
      if (!header) return;

      let lastScrollY = window.scrollY;
      let ticking = false;

      const updateHeaderState = () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
          header.classList.add('fx-header--scrolled');
        } else {
          header.classList.remove('fx-header--scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
      };

      const requestTick = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateHeaderState);
          ticking = true;
        }
      };

      // Listen to scroll events
      window.addEventListener('scroll', requestTick, { passive: true });

      // Initial check
      updateHeaderState();
    }
  };

  // ========================================
  // Module: FXProduct
  // Purpose: Product variant selection animations
  // ========================================
  const FXProduct = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      // Handle variant card selection
      const variantCards = document.querySelectorAll('.floorx-card, .fx-card-product');
      
      variantCards.forEach(card => {
        card.addEventListener('click', function() {
          // Remove selected state from all cards
          variantCards.forEach(c => c.classList.remove('selected'));
          
          // Add selected state to clicked card
          this.classList.add('selected');
          
          // Trigger price animation if price element exists
          FXProduct.animatePrice();
          
          // Pulse the add to cart button
          FXProduct.pulseButton('.add-btn, .fx-btn-primary');
        });
      });

      // Watch for variant changes (Shopify's built-in system)
      document.addEventListener('variant:change', function(event) {
        FXProduct.animatePrice();
      });
    },

    animatePrice: function() {
      const priceElement = document.querySelector('.floorx-top-price, .price__container');
      
      if (!priceElement) return;

      // Fade out, update, fade in with count-up effect
      priceElement.style.transition = 'opacity 0.2s ease-out';
      priceElement.style.opacity = '0';

      setTimeout(() => {
        priceElement.style.opacity = '1';
        
        // Add subtle scale animation
        priceElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
          priceElement.style.transform = 'scale(1)';
        }, 200);
      }, 200);
    },

    pulseButton: function(selector) {
      const button = document.querySelector(selector);
      
      if (!button) return;

      button.style.animation = 'fx-pulse-glow 0.6s ease-out';
      
      setTimeout(() => {
        button.style.animation = '';
      }, 600);
    }
  };

  // ========================================
  // Module: FXPageTransition
  // Purpose: Smooth page transitions
  // ========================================
  const FXPageTransition = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      // Find or create transition overlay
      let overlay = document.querySelector('.transition-cover');
      
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'transition-cover';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--fx-bg-1, #080A12);
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease-out;
        `;
        document.body.appendChild(overlay);
      }

      // Intercept internal link clicks
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Only animate internal links
        if (href && 
            href.startsWith('/') && 
            !href.startsWith('/#') &&
            !link.hasAttribute('download') &&
            !link.getAttribute('target')) {
          
          e.preventDefault();
          
          // Show overlay
          overlay.style.pointerEvents = 'auto';
          overlay.style.opacity = '1';
          
          // Navigate after animation
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        }
      });

      // Fade out overlay on page load
      window.addEventListener('load', function() {
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.pointerEvents = 'none';
          }, 400);
        }, 100);
      });
    }
  };

  // ========================================
  // Module: FXParallax
  // Purpose: Smooth parallax scrolling effects
  // ========================================
  const FXParallax = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      const parallaxElements = document.querySelectorAll('[data-fx-parallax]');
      
      if (parallaxElements.length === 0) return;

      let ticking = false;

      const updateParallax = () => {
        const scrollY = window.scrollY;

        parallaxElements.forEach(element => {
          const speed = parseFloat(element.getAttribute('data-fx-parallax')) || 0.5;
          const yPos = -(scrollY * speed);
          
          element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
      };

      const requestTick = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      };

      window.addEventListener('scroll', requestTick, { passive: true });
      
      // Initial position
      updateParallax();
    }
  };

  // ========================================
  // Module: FXCounter
  // Purpose: Animated number count-up
  // ========================================
  const FXCounter = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      const counterElements = document.querySelectorAll('[data-fx-counter]');
      
      if (counterElements.length === 0) return;

      const observerOptions = {
        threshold: 0.5
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            FXCounter.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      counterElements.forEach(element => {
        observer.observe(element);
      });
    },

    animateCounter: function(element) {
      const target = parseFloat(element.getAttribute('data-fx-counter'));
      const duration = parseInt(element.getAttribute('data-fx-duration')) || 2000;
      const suffix = element.getAttribute('data-fx-suffix') || '';
      const prefix = element.getAttribute('data-fx-prefix') || '';
      
      const startTime = performance.now();
      const startValue = 0;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (target - startValue) * easeOut;
        
        // Format number
        const formattedValue = Math.round(currentValue).toLocaleString();
        element.textContent = prefix + formattedValue + suffix;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = prefix + target.toLocaleString() + suffix;
        }
      };

      requestAnimationFrame(animate);
    }
  };

  // ========================================
  // Module: FXHero
  // Purpose: Hero section GSAP timeline animation
  // ========================================
  const FXHero = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;
      if (typeof gsap === 'undefined') return;

      const hero = document.querySelector('[data-fx-hero]');
      if (!hero) return;

      // Register ScrollTrigger if available
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // Hero entrance timeline
      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out'
        }
      });

      // Animate hero elements in sequence
      timeline
        .from('.fx-hero__content', {
          opacity: 0,
          duration: 0.6
        })
        .from('.fx-hero__title', {
          y: 40,
          opacity: 0,
          duration: 0.8
        }, '-=0.3')
        .from('.fx-hero__subtitle', {
          y: 30,
          opacity: 0,
          duration: 0.7
        }, '-=0.5')
        .from('.fx-hero__content .fx-btn-primary', {
          y: 20,
          opacity: 0,
          scale: 0.9,
          duration: 0.6
        }, '-=0.4')
        .from('.fx-hero__product-image', {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 1
        }, '-=0.6');

      // Parallax effect on hero product image
      if (typeof ScrollTrigger !== 'undefined') {
        const productImage = hero.querySelector('.fx-hero__product-image');
        
        if (productImage) {
          gsap.to(productImage, {
            y: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: 1
            }
          });
        }
      }
    }
  };

  // ========================================
  // Module: FXBeforeAfter
  // Purpose: Enhanced before/after image comparison
  // ========================================
  const FXBeforeAfter = {
    init: function() {
      if (isDesignMode) return;

      const containers = document.querySelectorAll('[data-fx-comparison]');
      
      containers.forEach(container => {
        const slider = container.querySelector('[data-slider]');
        const beforeImage = container.querySelector('[data-before]');
        
        if (!slider || !beforeImage) return;

        let isDragging = false;

        const updateSlider = (percentage) => {
          // Clamp between 0 and 100
          percentage = Math.max(0, Math.min(100, percentage));
          
          slider.style.left = percentage + '%';
          beforeImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        };

        const handleMove = (clientX) => {
          const rect = container.getBoundingClientRect();
          const x = clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          updateSlider(percentage);
        };

        // Mouse events
        slider.addEventListener('mousedown', () => {
          isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
          if (isDragging) {
            handleMove(e.clientX);
          }
        });

        document.addEventListener('mouseup', () => {
          isDragging = false;
        });

        // Touch events
        slider.addEventListener('touchstart', (e) => {
          isDragging = true;
          e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
          if (isDragging) {
            handleMove(e.touches[0].clientX);
          }
        }, { passive: false });

        document.addEventListener('touchend', () => {
          isDragging = false;
        });

        // Initialize at 50%
        updateSlider(50);
      });
    }
  };

  // ========================================
  // Module: FXFAQ
  // Purpose: Enhanced FAQ accordion behavior
  // ========================================
  const FXFAQ = {
    init: function() {
      const faqSection = document.querySelector('.fx-faq');
      if (!faqSection) return;

      const detailsElements = faqSection.querySelectorAll('details');
      
      detailsElements.forEach(details => {
        details.addEventListener('toggle', function() {
          if (this.open) {
            // Close other open details if single-open mode
            const singleOpen = faqSection.hasAttribute('data-single-open');
            
            if (singleOpen) {
              detailsElements.forEach(other => {
                if (other !== this && other.open) {
                  other.open = false;
                }
              });
            }

            // Smooth scroll to opened item if needed
            if (!isDesignMode) {
              const headerHeight = document.querySelector('.fx-header')?.offsetHeight || 0;
              const elementTop = this.getBoundingClientRect().top + window.scrollY;
              const offset = headerHeight + 20;

              if (elementTop < window.scrollY + headerHeight) {
                window.scrollTo({
                  top: elementTop - offset,
                  behavior: 'smooth'
                });
              }
            }
          }
        });
      });
    }
  };

  // ========================================
  // Module: FXBackToTop
  // Purpose: Back to top button with smooth scroll
  // ========================================
  const FXBackToTop = {
    init: function() {
      const backToTopBtn = document.querySelector('[data-fx-back-to-top]');
      
      if (!backToTopBtn) return;

      let ticking = false;

      const updateVisibility = () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 500) {
          backToTopBtn.style.opacity = '1';
          backToTopBtn.style.pointerEvents = 'auto';
        } else {
          backToTopBtn.style.opacity = '0';
          backToTopBtn.style.pointerEvents = 'none';
        }

        ticking = false;
      };

      const requestTick = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateVisibility);
          ticking = true;
        }
      };

      window.addEventListener('scroll', requestTick, { passive: true });

      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Initial check
      updateVisibility();
    }
  };

  // ========================================
  // INITIALIZATION
  // ========================================
  const FloorXInit = {
    init: function() {
      // Core modules (always run)
      FXNav.init();
      FXReveal.init();
      FXParallax.init();
      FXCounter.init();
      FXPageTransition.init();
      FXBackToTop.init();
      
      // Product-specific
      if (document.body.classList.contains('template-product') || 
          document.querySelector('.fx-product-section')) {
        FXProduct.init();
      }

      // Hero-specific (requires GSAP)
      if (typeof gsap !== 'undefined') {
        FXHero.init();
      }

      // Before/After comparison
      FXBeforeAfter.init();

      // FAQ
      FXFAQ.init();

      // Log initialization in development
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        console.log('✨ FloorX Animation Engine initialized');
      }
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FloorXInit.init);
  } else {
    FloorXInit.init();
  }

  // Re-initialize on Shopify section load (for theme editor)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function() {
      // Re-init specific modules that need refresh
      FXNav.init();
      FXFAQ.init();
      FXBeforeAfter.init();
    });
  }

})();


  // ========================================
  // Module: FXScrollFade
  // Purpose: Fading animations while scrolling
  // ========================================
  const FXScrollFade = {
    init: function() {
      if (prefersReducedMotion || isDesignMode) return;

      const fadeElements = document.querySelectorAll('.fx-fade-scroll, .shopify-section, .product-card, .card');
      
      if (fadeElements.length === 0) return;

      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Keep observing for re-triggering on scroll back
          }
        });
      }, observerOptions);

      fadeElements.forEach((element, index) => {
        // Add fade class if not already present
        if (!element.classList.contains('fx-fade-scroll')) {
          element.classList.add('fx-fade-scroll');
        }
        
        fadeObserver.observe(element);
      });
    }
  };

  // ========================================
  // Module: FXSmoothAnchor
  // Purpose: Smooth scrolling for anchor links
  // ========================================
  const FXSmoothAnchor = {
    init: function() {
      if (prefersReducedMotion) return;

      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      
      anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          // Skip if it's just "#"
          if (href === '#') return;
          
          const target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Update URL without jumping
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        });
      });
    }
  };

  // Initialize all modules on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllModules);
  } else {
    initAllModules();
  }

  function initAllModules() {
    FXReveal.init();
    FXNav.init();
    FXScrollFade.init();
    FXSmoothAnchor.init();
    
    // Initialize other existing modules if they exist
    if (typeof FXHero !== 'undefined') FXHero.init();
    if (typeof FXProduct !== 'undefined') FXProduct.init();
    if (typeof FXPageTransition !== 'undefined') FXPageTransition.init();
    if (typeof FXParallax !== 'undefined') FXParallax.init();
    if (typeof FXCounter !== 'undefined') FXCounter.init();
  }

})();
