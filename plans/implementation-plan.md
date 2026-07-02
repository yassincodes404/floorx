FloorX Shopify Website Redesign — Implementation Plan v2.0

What Changed from v1.0

Area

v1.0

v2.0

CSS Organization

Single floorx-design-system.css

Full design system with separate token files

Section Styling

Large {% style %} blocks inside .liquid

Dedicated component CSS files; {% style %} only for Shopify-setting-driven dynamic values

Animation System

Ad-hoc per-section

Unified motion scale with named tokens

GSAP Usage

Broad

Scoped to hero, scroll reveals, product transitions only

Fonts

Google Fonts CDN

Self-hosted .woff2 files inside /assets/

Hero Effort

~10%

~30% — cinematic treatment

Mobile

Mentioned

Explicit 4-breakpoint system

Brand Guide

Missing

Created as first deliverable

Deployment

Manual OR CLI

Shopify CLI only

Project Overview

Transform the LuminTheme Beauty 14.5.7 (Shopify 2.0) FloorX theme into a cinematic premium experience inspired by Orbitshift's lighting language — while touching zero Shopify business logic.

Core constraint: Every CSS override cascades on top of the untouched base.css. Every Liquid section file retains its Shopify schema and block logic intact.

Open Questions — Answered

Question

Answer

Deployment method

Shopify CLI — shopify theme dev → git → shopify theme push → preview → publish

GSAP usage

Yes, scoped — hero floating, ScrollTrigger reveals, product transitions, before/after. CSS only for buttons, hovers, micro-interactions

Font loading

Self-hosted — Manrope .woff2 files in /assets/fonts/, loaded via @font-face in floorx-tokens/typography.css. No Google Fonts dependency

Architecture Evaluation (Reviewer Agreed Points)

All 12 suggestions from the reviewer are correct and incorporated:

✅ Full design system split into token files

✅ No large CSS in {% style %} — component files only

✅ Reusable component library

✅ Global motion scale with named tokens

✅ Page transition system

✅ CSS variables for everything (radius, shadow, blur, glow, spacing, motion)

✅ Hero gets ~30% of total effort

✅ Per-element scroll animation (headings, paragraphs, cards independently)

✅ Premium product variant interaction (fade → slide → count → glow → pulse)

✅ Orbitshift lighting language (glow, reflection, beam, ambient depth)

✅ Explicit 4-breakpoint mobile system

✅ Brand Design Guide as first deliverable before any code

Brand Design Guide (Deliverable 0 — Before Any Code)

This document will be created as assets/FLOORX-BRAND-GUIDE.md (dev reference only, not served to users).

Mission Statement

FloorX is the premium choice for professional floor care. Every pixel communicates: performance, trust, cleanliness, and strength.

Visual Style

Cinematic dark. Deep navy atmosphere. Blue ambient lighting. Like a product reveal inside a darkened studio with a single blue spotlight.

Color Palette — Full Token Set

/* Backgrounds */
--fx-bg-0:            #060810;   /* deepest bg — page body */
--fx-bg-1:            #080A12;   /* primary background */
--fx-bg-2:            #0B1120;   /* secondary sections */
--fx-bg-card:         #111827;   /* card surfaces */
--fx-bg-card-hover:   #162032;   /* card on hover */
--fx-bg-input:        #0D1525;   /* form inputs */

/* Accent */
--fx-accent:          #2563EB;   /* primary blue */
--fx-accent-light:    #3B82F6;   /* highlight blue */
--fx-accent-muted:    #1D4ED8;   /* pressed/deep blue */
--fx-accent-ultra:    #60A5FA;   /* text links, small accents */

/* Glow & Light */
--fx-glow-sm:         rgba(59,130,246,0.15);
--fx-glow-md:         rgba(59,130,246,0.30);
--fx-glow-lg:         rgba(59,130,246,0.50);
--fx-glow-xl:         rgba(59,130,246,0.70);
--fx-beam:            rgba(59,130,246,0.06); /* ambient background light */

/* Text */
--fx-text-primary:    #FFFFFF;
--fx-text-secondary:  #A8B3C5;
--fx-text-muted:      #6B7A99;
--fx-text-accent:     #60A5FA;

/* Borders */
--fx-border-subtle:   rgba(59,130,246,0.08);
--fx-border-soft:     rgba(59,130,246,0.15);
--fx-border-active:   rgba(59,130,246,0.40);
--fx-border-glow:     rgba(59,130,246,0.70);

/* Glass */
--fx-glass-bg:        rgba(11,17,32,0.65);
--fx-glass-border:    rgba(59,130,246,0.18);
--fx-glass-blur:      16px;

Typography Scale

/* Family */
--fx-font:            'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;

/* Sizes — Desktop */
--fx-text-xs:         0.75rem;   /* 12px */
--fx-text-sm:         0.875rem;  /* 14px */
--fx-text-base:       1rem;      /* 16px */
--fx-text-lg:         1.125rem;  /* 18px */
--fx-text-xl:         1.25rem;   /* 20px */
--fx-text-2xl:        1.5rem;    /* 24px */
--fx-text-3xl:        1.875rem;  /* 30px */
--fx-text-4xl:        2.25rem;   /* 36px */
--fx-text-5xl:        3rem;      /* 48px */
--fx-text-6xl:        3.75rem;   /* 60px */
--fx-text-7xl:        4.5rem;    /* 72px */
--fx-text-hero:       clamp(3rem, 6vw, 5rem); /* fluid hero heading */

/* Weights */
--fx-weight-light:    300;
--fx-weight-regular:  400;
--fx-weight-medium:   500;
--fx-weight-semibold: 600;
--fx-weight-bold:     700;
--fx-weight-black:    800;

/* Line Heights */
--fx-leading-tight:   1.1;
--fx-leading-snug:    1.3;
--fx-leading-normal:  1.5;
--fx-leading-relaxed: 1.7;

/* Letter Spacing */
--fx-tracking-tight:  -0.025em;
--fx-tracking-normal: 0;
--fx-tracking-wide:   0.05em;
--fx-tracking-wider:  0.1em;

Spacing Scale

--fx-space-1:   0.25rem;   /* 4px */
--fx-space-2:   0.5rem;    /* 8px */
--fx-space-3:   0.75rem;   /* 12px */
--fx-space-4:   1rem;      /* 16px */
--fx-space-5:   1.25rem;   /* 20px */
--fx-space-6:   1.5rem;    /* 24px */
--fx-space-8:   2rem;      /* 32px */
--fx-space-10:  2.5rem;    /* 40px */
--fx-space-12:  3rem;      /* 48px */
--fx-space-16:  4rem;      /* 64px */
--fx-space-20:  5rem;      /* 80px */
--fx-space-24:  6rem;      /* 96px */
--fx-space-32:  8rem;      /* 128px */
--fx-section:   clamp(4rem, 8vw, 8rem); /* fluid section padding */

Border Radius Scale

--fx-radius-sm:   6px;
--fx-radius-md:   12px;
--fx-radius-lg:   16px;
--fx-radius-xl:   24px;
--fx-radius-2xl:  32px;
--fx-radius-full: 9999px;

Shadow & Glow Scale

--fx-shadow-sm:   0 2px 8px rgba(0,0,0,0.3);
--fx-shadow-md:   0 8px 24px rgba(0,0,0,0.4);
--fx-shadow-lg:   0 16px 48px rgba(0,0,0,0.5);
--fx-shadow-xl:   0 24px 64px rgba(0,0,0,0.6);
--fx-glow-btn:    0 0 20px var(--fx-glow-md), 0 0 40px var(--fx-glow-sm);
--fx-glow-card:   0 0 30px var(--fx-glow-sm);
--fx-glow-card-hover: 0 0 40px var(--fx-glow-md), 0 8px 32px rgba(0,0,0,0.5);
--fx-glow-product:    0 0 80px var(--fx-glow-md), 0 0 120px var(--fx-glow-sm);

Motion / Animation Scale

/* Duration tokens */
--fx-dur-xs:  150ms;    /* micro: icon state change */
--fx-dur-sm:  250ms;    /* small: button hover */
--fx-dur-md:  400ms;    /* medium: card hover, accordion */
--fx-dur-lg:  600ms;    /* large: section reveal */
--fx-dur-xl:  900ms;    /* xl: hero entrance */
--fx-dur-hero: 1200ms;  /* hero sequence total */

/* Easing */
--fx-ease-out:     cubic-bezier(0.16, 1, 0.3, 1);  /* easeOutExpo */
--fx-ease-in:      cubic-bezier(0.7, 0, 0.84, 0);  /* easeInExpo */
--fx-ease-inout:   cubic-bezier(0.87, 0, 0.13, 1); /* easeInOutExpo */
--fx-ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* gentle spring */

/* Transition presets */
--fx-transition-fast:   var(--fx-dur-sm) var(--fx-ease-out);
--fx-transition-base:   var(--fx-dur-md) var(--fx-ease-out);
--fx-transition-slow:   var(--fx-dur-lg) var(--fx-ease-out);

/* Scroll reveal defaults */
--fx-reveal-y:      28px;    /* translateY start offset */
--fx-reveal-blur:   8px;     /* blur start amount */
--fx-stagger-delay: 80ms;    /* per-child stagger increment */

Component Rules Summary

Element

Hover State

Transition

Cards

translateY(-6px) + shadow+15% + glow+10%

var(--fx-dur-md)

Primary Button

Glow pulse + arrow moves right 4px

var(--fx-dur-sm)

Secondary Button

Border brightens + bg fades in

var(--fx-dur-sm)

Nav Links

Underline slides in from left

var(--fx-dur-sm)

Images

Scale 1.03

var(--fx-dur-md)

Variant Cards

Border glows + scale 1.02

var(--fx-dur-sm)

FAQ Row

Left border appears + bg lightens

var(--fx-dur-md)

Social Icons

Ring glow expands

var(--fx-dur-sm)

Lighting Language (Orbitshift-Inspired)

Every section must have at least one of:

Ambient orb: radial-gradient pseudo-element, low opacity, blue

Surface glow: box-shadow with blue rgba on interactive elements

Light beam: diagonal linear-gradient overlay, 3–6% opacity

Depth layering: Multiple z-index layers creating foreground/midground/background

Folder Structure

assets/
├── fonts/
│   ├── manrope-300.woff2
│   ├── manrope-400.woff2
│   ├── manrope-500.woff2
│   ├── manrope-600.woff2
│   ├── manrope-700.woff2
│   └── manrope-800.woff2
│
├── floorx-tokens/
│   ├── colors.css          ← all --fx-* color variables
│   ├── typography.css      ← @font-face + font token vars
│   ├── spacing.css         ← spacing + radius + shadow vars
│   └── motion.css          ← duration + easing + transition vars
│
├── floorx-base/
│   ├── reset.css           ← minimal overrides on top of base.css
│   └── utilities.css       ← .fx-glass, .fx-glow-wrap, .fx-gradient-text, etc.
│
├── floorx-components/
│   ├── buttons.css         ← .fx-btn-primary, .fx-btn-secondary, .fx-btn-ghost
│   ├── cards.css           ← .fx-card, .fx-card-product, .fx-card-feature
│   ├── forms.css           ← inputs, selects, newsletter
│   ├── badges.css          ← .fx-badge, .fx-tag
│   ├── dividers.css        ← section separators, gradient lines
│   └── icons.css           ← icon sizing + glow states
│
├── floorx-sections/
│   ├── header.css          ← navbar + mobile drawer overrides
│   ├── hero.css            ← hero/slideshow overrides
│   ├── product.css         ← featured product overrides
│   ├── comparison.css      ← before/after overrides
│   ├── faq.css             ← accordion overrides
│   ├── gallery.css         ← instagram/gallery overrides
│   └── footer.css          ← footer overrides
│
├── floorx-animations.css   ← @keyframes definitions
├── floorx-main.css         ← master import file (imports all above)
│
└── floorx-main.js          ← animation orchestration JS
    ├── scroll-reveal.js (module)
    ├── hero-gsap.js (module)
    ├── product-interactions.js (module)
    └── page-transitions.js (module)

Note on Shopify's asset system: Shopify does not support subdirectory serving from /assets/. All files must be flat in /assets/. The folder structure above represents the local development organization. During build/deploy, files are referenced directly by filename. Alternatively, we use floorx-main.css as the single import file that contains all @import statements, compiled via a simple build step or uploaded as one concatenated file.

Practical solution: We create a single floorx-main.css that contains all token definitions and @imports for components. Since Shopify doesn't support CSS @import at runtime (performance), we will concatenate all files into floorx-main.css during the build step before uploading via CLI.

Proposed Changes — File by File

Phase 0 — Brand Guide + Tokens

[NEW] assets/floorx-main.css

Single file containing all design tokens + component styles (concatenated from the module structure above). Loaded once globally via theme.liquid. Contains:

All --fx-* CSS variables in :root

@font-face declarations for self-hosted Manrope

All component classes

All section overrides

All utility classes

All animation keyframes

[NEW] assets/floorx-main.js

Animation orchestration. Module pattern, no global namespace pollution:

// Modules loaded inside:
// - FXReveal: IntersectionObserver with stagger + per-element options
// - FXHero: GSAP timeline for hero entrance + floating
// - FXProduct: variant selection animations
// - FXNav: scroll-based header state
// - FXPageTransition: fade overlay between pages
// - FXParallax: rAF-based parallax on hero elements
// - FXCounter: animated number counting
// All modules respect prefers-reduced-motion
// All modules guard against Shopify.designMode

[MODIFY] layout/theme.liquid

Two injections only:

In <head> (after existing stylesheets):

{{ 'floorx-main.css' | asset_url | stylesheet_tag }}

Before </body>:

{%- unless settings.animations_reveal_on_scroll == false -%}
  <script src="{{ 'floorx-main.js' | asset_url }}" defer></script>
{%- endunless -%}

GSAP loaded conditionally on pages that need it:

{% if template.name == 'index' or template.name == 'product' %}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
{% endif %}

Phase 1 — Navigation

[MODIFY] sections/header.liquid

What we touch: Add class fx-header to the <header> element. Add a small <script> block at the bottom of the file for scroll state only.

What we do NOT touch: All drawer logic, search, cart, mega-menu, mobile nav — completely untouched.

CSS target: assets/floorx-sections/header.css (part of floorx-main.css):

.fx-header                → transparent, no border
.fx-header.fx-header--scrolled → backdrop-filter blur(20px) + bg #0B1120CC
.fx-header a              → text white, tracking-wide
.fx-header a::after       → underline slide animation
.fx-header .header__cart  → white icon, count badge blue
Mobile drawer             → dark bg #080A12, blue accents

Only {% style %} kept: the existing section-padding Liquid dynamic vars.

Phase 2 — Hero Section (30% of total effort)

[MODIFY] sections/slideshow.liquid

What we touch: Add classes fx-hero to the slideshow wrapper. Add data-fx-hero attribute for JS targeting.

What we do NOT touch: Slider JS, slide navigation, autoplay, accessibility attributes, Shopify section schema.

CSS target: assets/floorx-sections/hero.css:

Layer 1 — Background:

/* Animated gradient mesh */
.fx-hero::before {
  background: radial-gradient(ellipse at 20% 50%, var(--fx-glow-sm) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.12) 0%, transparent 50%),
              linear-gradient(135deg, #060810 0%, #0B1120 50%, #080A12 100%);
  animation: fx-gradient-shift 12s ease infinite;
}

Layer 2 — Light beam:

/* Diagonal light sweep */
.fx-hero::after {
  background: linear-gradient(125deg, transparent 40%, var(--fx-beam) 50%, transparent 60%);
  animation: fx-beam-sweep 8s ease-in-out infinite;
}

Layer 3 — Product image:

/* Floating + cinematic glow */
.fx-hero .banner__media img {
  filter: drop-shadow(0 0 40px var(--fx-glow-md))
          drop-shadow(0 0 80px var(--fx-glow-sm));
  animation: fx-float 7s var(--fx-ease-inout) infinite;
}

Layer 4 — Particles (CSS only):

/* 6 ambient particle pseudo-elements using nth-child */
/* Soft blue dots, very low opacity, slow drift animation */

Layer 5 — Typography:

.fx-hero .banner__heading { 
  font-family: var(--fx-font);
  font-size: var(--fx-text-hero);
  font-weight: var(--fx-weight-black);
  line-height: var(--fx-leading-tight);
  letter-spacing: var(--fx-tracking-tight);
}
/* Gradient text on keyword */
.fx-hero .banner__heading .fx-gradient-word {
  background: linear-gradient(135deg, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

Layer 6 — Scroll indicator:

/* Animated chevron at bottom center */
.fx-hero-scroll-indicator {
  animation: fx-bounce-subtle 2s ease-in-out infinite;
}

GSAP Hero timeline (FXHero module):

// Sequence:
// t=0    background fades in (opacity 0→1, 700ms)
// t=0.3  heading word 1 slides up (translateY 40px→0, blur 8px→0, 600ms)
// t=0.5  heading word 2 slides up (stagger 80ms)
// t=0.7  subheading fades in
// t=0.9  CTA button fades + scales in
// t=1.0  product image floats in from right (translateX 60px→0)
// t=1.0  product glow pulses on
// Loop: floating animation continues via CSS

Phase 3 — Featured Product

[MODIFY] sections/featured-product.liquid

What we touch: Add fx-product-section class to outer <section>. The custom liquid block (variant picker in index.json) already has classes .floorx-card, .add-btn, .buy-btn — we target those in CSS.

What we do NOT touch: Product form, variant logic, buy buttons JS, media gallery, price component.

CSS target: assets/floorx-sections/product.css:

.fx-product-section      → dark bg, ambient orb behind image
.product__media-wrapper  → glow treatment on image
.floorx-card             → dark card, subtle border, hover glow
.floorx-card.selected    → stronger border glow, scale, left accent line
.floorx-top-price        → Manrope 800, gradient text
.add-btn                 → primary blue gradient + glow pulse
.buy-btn                 → glass morphism, blue border

Product variant JS animation (FXProduct module):

// On .floorx-card click:
// 1. Fade out current price (opacity 0, 150ms)
// 2. Count up to new price (200ms)
// 3. Fade in new price (opacity 1, 150ms)
// 4. Previous card: border dims (250ms)
// 5. New card: border glows, translateY(-2px), scale(1.02) (250ms)
// 6. Add-to-cart button: brief glow pulse (400ms)
// Works alongside existing selectVariant() function — does not replace it

Phase 4 — Before & After

[MODIFY] sections/image-comparison.liquid

What we touch: Add fx-comparison class to section wrapper.

What we do NOT touch: The comparison slider JS (image-compare-viewer.js), drag logic, image rendering.

CSS target: assets/floorx-sections/comparison.css:

.fx-comparison           → dark bg #0B1120, ambient blue orb
.fx-comparison h2        → Manrope, white, large
.before-after-image-wrapper → rounded-xl + subtle glow border
/* Slider handle */       → blue gradient circle, glow shadow
/* Before label */        → glass pill, red-tinted
/* After label */         → glass pill, blue-tinted

Scroll reveal: entire section fx-reveal with translateY + blur entrance.

Phase 5 — FAQ

[MODIFY] sections/collapsible-content.liquid

What we touch: Add fx-faq class to section wrapper.

What we do NOT touch: <details>/<summary> HTML structure, Shopify block rendering.

CSS target: assets/floorx-sections/faq.css:

.fx-faq                  → dark bg #080A12
.fx-faq details          → dark card, border-radius lg, subtle border
.fx-faq summary          → Manrope 600, white, icon right
.fx-faq summary::marker  → hidden (replaced with custom CSS icon)
.fx-faq details[open]    → border-left 3px #2563EB, glow shadow
/* Icon rotation */
.fx-faq summary::after   → "+" rotates to "×" via CSS [open] selector
/* Animated height */
.fx-faq .accordion__content → max-height transition, fade in

No JS needed — pure CSS <details> open/close with smooth transition via @starting-style or grid-template-rows trick.

Phase 6 — Instagram / Gallery

[MODIFY] sections/lumin-gallery.liquid (the active Instagram section)

What we touch: Add fx-gallery class to section wrapper.

What we do NOT touch: Image rendering, Shopify CDN URLs, grid block logic.

CSS target: assets/floorx-sections/gallery.css:

.fx-gallery             → dark bg #080A12
.fx-gallery h2          → Manrope 800, white, large
.fx-gallery img         → rounded-lg, hover scale(1.04) + glow
.ig-button              → glass morphism, Instagram gradient border
Stagger reveal          → images enter with 80ms stagger

Phase 7 — Footer

[MODIFY] sections/footer.liquid

What we touch: Add fx-footer class to <footer> element.

What we do NOT touch: Footer menu Liquid, social links, payment icons, newsletter form functionality.

CSS target: assets/floorx-sections/footer.css:

.fx-footer              → bg #060810, top gradient separator (blue → transparent)
.fx-footer h3           → Manrope 600, white, tracking-wider
.fx-footer a            → muted text → white on hover, 250ms transition
.fx-footer .social-icon → outlined circle, blue glow ring on hover
.fx-footer input        → dark bg, blue focus ring
.fx-footer .footer__copyright → muted, top border separator
Payment icons           → white, 60% opacity

Phase 8 — Page Transitions + Polish

FXPageTransition module (inside floorx-main.js):

// On link click (internal only):
// 1. Overlay fades in (opacity 0→1, 200ms) — dark #080A12
// 2. Page navigates
// 3. On new page load, overlay fades out (200ms)
// Uses existing .transition-cover element from transition-cover.liquid

Global scroll reveal (FXReveal):

// Applied via data attributes:
// data-fx-reveal           → section-level reveal
// data-fx-reveal="child"   → stagger children individually
// data-fx-delay="0.1"      → custom delay override
// Each element: opacity 0 + translateY(28px) + blur(8px) → 0,0,0
// Duration: var(--fx-dur-lg) = 600ms
// Easing: var(--fx-ease-out)

Per-element animation targets (added via class in Liquid):

Section headings   → fx-reveal, first to enter
Paragraphs         → fx-reveal data-fx-delay="0.1"
Feature cards      → fx-reveal data-fx-delay="0.2" stagger children
Buttons            → fx-reveal data-fx-delay="0.3"
Images             → fx-reveal with scale(0.96→1) instead of translateY

Breakpoint System (4-point)

/* Mobile first — base styles are mobile */
/* sm: 480px  — large phones, small mobile */
/* md: 768px  — tablets, iPad portrait */
/* lg: 990px  — tablets landscape, small desktop */
/* xl: 1200px — desktop */

@media (min-width: 480px)  { /* sm  */ }
@media (min-width: 768px)  { /* md  */ }
@media (min-width: 990px)  { /* lg  */ }
@media (min-width: 1200px) { /* xl  */ }

Mobile-specific rules:

Hero: reduced font size, product image below text

Feature cards: single column

FAQ: full-width, increased touch targets (min 48px)

Footer: stacked, centered

All hover effects disabled (use :hover inside @media (hover: hover))

Heavy animations reduced (use @media (prefers-reduced-motion: no-preference))

Files Modification Summary

New Files Created

File

Purpose

assets/floorx-main.css

Master CSS — all tokens, components, sections, utils

assets/floorx-main.js

Master JS — all animation modules

assets/fonts/manrope-*.woff2

Self-hosted Manrope (6 weights)

Modified Files (minimal, surgical)

File

Only Change

Risk

layout/theme.liquid

Add 2 asset tags (CSS + JS) + conditional GSAP

Minimal

sections/header.liquid

Add fx-header class + scroll JS snippet

Minimal

sections/slideshow.liquid

Add fx-hero class + data-fx-hero

Minimal

sections/featured-product.liquid

Add fx-product-section class

Minimal

sections/image-comparison.liquid

Add fx-comparison class

Minimal

sections/collapsible-content.liquid

Add fx-faq class

Minimal

sections/lumin-gallery.liquid

Add fx-gallery class

Minimal

sections/footer.liquid

Add fx-footer class

Minimal

Files Never Touched ✅

base.css · global.js · cart*.js · product-form.js · templates/*.json · config/settings_*.json · All product/cart/checkout liquid sections · All component-*.css files

Verification Plan

Build Validation

shopify theme check   # Liquid syntax — zero errors required

Performance Targets (Lighthouse)

Metric

Target

Performance

≥ 85

Accessibility

≥ 90

Best Practices

≥ 95

LCP

< 2.5s

CLS

< 0.1

Functional Checklist

Add to Cart works correctly

Buy Now works correctly

Cart drawer opens/closes

Checkout flow unaffected

Variant selection updates price + image

Before/After slider draggable

FAQ accordion opens/closes

Newsletter form submits

Header search works

Mobile nav drawer works

All product images load

Shopify Theme Editor — all sections editable

prefers-reduced-motion disables animations

Visual Checklist

Dark navy background end-to-end

Hero cinematic with glow + float + particles

Navbar transparent → glass on scroll

All buttons have correct states (default, hover, active)

Product variant cards glow on selection

Before/After has dark premium styling

FAQ has smooth accordion with icon rotation

Gallery images hover correctly

Footer premium layout

Mobile 375px — no overflow, no broken layout

Mobile 480px — intermediate layout correct

Tablet 768px — layout correct

Desktop 1200px+ — full premium layout

Deployment Workflow

# 1. Development
shopify theme dev --store=your-store.myshopify.com

# 2. Work on duplicate theme (never edit live theme directly)
shopify theme list
shopify theme push --theme=<DUPLICATE_THEME_ID>

# 3. Preview in Shopify Admin → Themes → Preview

# 4. QA pass

# 5. Publish
shopify theme publish --theme=<DUPLICATE_THEME_ID>

Git workflow:

main branch      ← production (live theme)
redesign branch  ← all redesign work
PR → main        ← after QA approval

Execution Order

Phase 0  → Brand guide + all token variables (floorx-main.css foundation)
Phase 1  → Manrope font self-hosting + theme.liquid injection
Phase 2  → Navigation (header.css + scroll JS)
Phase 3  → Hero — 30% of effort (hero.css + GSAP timeline)
Phase 4  → Featured Product (product.css + variant animations)
Phase 5  → Before & After (comparison.css)
Phase 6  → FAQ (faq.css)
Phase 7  → Instagram/Gallery (gallery.css)
Phase 8  → Footer (footer.css)
Phase 9  → Page transitions + global scroll reveals
Phase 10 → Mobile optimization across all sections
Phase 11 → Performance pass (font loading, GSAP conditional, lazy load audit)
Phase 12 → Final QA + deployment prep