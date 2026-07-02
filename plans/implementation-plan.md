# FloorX Shopify Website Redesign — Implementation Plan v2.0

## Project Overview

Transform the **LuminTheme Beauty 14.5.7** (Shopify 2.0) FloorX theme into a cinematic premium experience inspired by Orbitshift's lighting language — while touching zero Shopify business logic.

**Core constraint**: Every CSS override cascades on top of the untouched `base.css`. Every Liquid section file retains its Shopify schema and block logic intact. Liquid files each gain only a single class name addition plus, where needed, one small JS snippet.

---

## Open Questions — Answered

| Question | Answer |
|---|---|
| Deployment method | **Shopify CLI** — `shopify theme dev` → `git` → `shopify theme push` → preview → publish |
| GSAP usage | **Yes, scoped** — hero floating, ScrollTrigger reveals, product transitions, before/after. CSS only for buttons, hovers, micro-interactions |
| Font loading | **Self-hosted** — Manrope `.woff2` files in `/assets/`, loaded via `@font-face` in tokens CSS. No Google Fonts dependency |

---

## Architecture Rules

1. Never modify `base.css`
2. Never modify cart/checkout/product-form JS
3. Never add large `{% style %}` blocks to Liquid — only dynamic Shopify-setting values stay in `{% style %}`
4. All static CSS lives in `floorx-main.css`
5. All section Liquid files change only: one class name added, one small JS snippet if needed
6. Every design decision references the Brand Design Guide token system
7. Shopify Theme Editor compatibility must be preserved in every section

---

## Folder Structure

```
assets/
├── manrope-300.woff2           ← self-hosted font
├── manrope-400.woff2
├── manrope-500.woff2
├── manrope-600.woff2
├── manrope-700.woff2
├── manrope-800.woff2
├── floorx-main.css             ← master CSS (all tokens + components + sections)
└── floorx-main.js              ← master JS (all animation modules)

plans/
├── implementation-plan.md      ← this file
└── task-tracker.md             ← progress tracking
```

---

## Design Token Reference

### Colors
```css
--fx-bg-0:            #060810;
--fx-bg-1:            #080A12;
--fx-bg-2:            #0B1120;
--fx-bg-card:         #111827;
--fx-bg-card-hover:   #162032;
--fx-bg-input:        #0D1525;
--fx-accent:          #2563EB;
--fx-accent-light:    #3B82F6;
--fx-accent-muted:    #1D4ED8;
--fx-accent-ultra:    #60A5FA;
--fx-glow-sm:         rgba(59,130,246,0.15);
--fx-glow-md:         rgba(59,130,246,0.30);
--fx-glow-lg:         rgba(59,130,246,0.50);
--fx-glow-xl:         rgba(59,130,246,0.70);
--fx-beam:            rgba(59,130,246,0.06);
--fx-text-primary:    #FFFFFF;
--fx-text-secondary:  #A8B3C5;
--fx-text-muted:      #6B7A99;
--fx-text-accent:     #60A5FA;
--fx-border-subtle:   rgba(59,130,246,0.08);
--fx-border-soft:     rgba(59,130,246,0.15);
--fx-border-active:   rgba(59,130,246,0.40);
--fx-border-glow:     rgba(59,130,246,0.70);
--fx-glass-bg:        rgba(11,17,32,0.65);
--fx-glass-border:    rgba(59,130,246,0.18);
--fx-glass-blur:      16px;
```

### Typography
```css
--fx-font:            'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
--fx-text-hero:       clamp(3rem, 6vw, 5rem);
--fx-weight-light:    300;
--fx-weight-regular:  400;
--fx-weight-medium:   500;
--fx-weight-semibold: 600;
--fx-weight-bold:     700;
--fx-weight-black:    800;
```

### Motion Scale
```css
--fx-dur-xs:    150ms;
--fx-dur-sm:    250ms;
--fx-dur-md:    400ms;
--fx-dur-lg:    600ms;
--fx-dur-xl:    900ms;
--fx-ease-out:  cubic-bezier(0.16, 1, 0.3, 1);
--fx-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--fx-reveal-y:  28px;
--fx-reveal-blur: 8px;
--fx-stagger:   80ms;
```

### Component Hover Rules
| Element | Hover | Duration |
|---|---|---|
| Cards | `translateY(-6px)` + glow+10% | `--fx-dur-md` |
| Primary Button | Glow pulse + arrow +4px | `--fx-dur-sm` |
| Secondary Button | Border brightens + bg fade | `--fx-dur-sm` |
| Nav Links | Underline slides from left | `--fx-dur-sm` |
| Images | `scale(1.03)` | `--fx-dur-md` |
| Variant Cards | Border glow + `scale(1.02)` | `--fx-dur-sm` |
| FAQ Row | Left border + bg lightens | `--fx-dur-md` |
| Social Icons | Ring glow expands | `--fx-dur-sm` |

---

## Phase Checklists

---

### ✅ Phase 0 — Design System Foundation
*Goal: Create `floorx-main.css` with all tokens, components, utilities, and keyframes. No visible changes yet.*

- [ ] **P0.1** Create `assets/floorx-main.css` with all `--fx-*` CSS variable tokens in `:root`
- [ ] **P0.2** Add `@font-face` declarations for all 6 Manrope weights (self-hosted `.woff2`)
- [ ] **P0.3** Download/source Manrope `.woff2` files and add to `/assets/`
- [ ] **P0.4** Write global body override: dark bg, Manrope font, text color, box-sizing
- [ ] **P0.5** Write utility classes: `.fx-glass`, `.fx-gradient-text`, `.fx-glow-wrap`, `.fx-container`, `.fx-section`
- [ ] **P0.6** Write component: `.fx-btn-primary` (blue gradient, glow hover, arrow animation)
- [ ] **P0.7** Write component: `.fx-btn-secondary` (glass morphism, border glow hover)
- [ ] **P0.8** Write component: `.fx-btn-ghost` (transparent, white border)
- [ ] **P0.9** Write component: `.fx-card` (dark surface, border, hover lift + glow)
- [ ] **P0.10** Write component: `.fx-card-product` (variant card, selected state)
- [ ] **P0.11** Write component: `.fx-glass-panel` (backdrop blur, glass border)
- [ ] **P0.12** Write all `@keyframes`: `fx-float`, `fx-gradient-shift`, `fx-beam-sweep`, `fx-pulse-glow`, `fx-fade-up`, `fx-blur-in`, `fx-bounce-subtle`
- [ ] **P0.13** Write scroll reveal base classes: `.fx-reveal`, `.fx-reveal--active`, stagger via CSS vars
- [ ] **P0.14** Write `@media (prefers-reduced-motion: reduce)` override block
- [ ] **P0.15** Inject `floorx-main.css` into `layout/theme.liquid` (single `stylesheet_tag` line)
- [ ] **P0.16** Verify: page loads with dark background, Manrope font applied, no console errors

---

### ✅ Phase 1 — Animation JS Engine
*Goal: Create `floorx-main.js` with all animation modules. GSAP conditionally loaded.*

- [ ] **P1.1** Create `assets/floorx-main.js` with module pattern wrapper
- [ ] **P1.2** `FXReveal` module: IntersectionObserver, `data-fx-reveal` attribute, stagger via `data-fx-order`, opacity + translateY + blur
- [ ] **P1.3** `FXNav` module: scroll listener → toggle `.fx-header--scrolled` class on `<header>`
- [ ] **P1.4** `FXProduct` module: variant selection animations (price count, card glow, button pulse)
- [ ] **P1.5** `FXPageTransition` module: fade overlay using existing `.transition-cover` element
- [ ] **P1.6** `FXParallax` module: rAF-based hero parallax on product image
- [ ] **P1.7** `FXCounter` module: animated number count-up for stats elements
- [ ] **P1.8** Shopify design mode guard: `if (Shopify.designMode) return;` in animation inits
- [ ] **P1.9** `prefers-reduced-motion` guard in every module
- [ ] **P1.10** Add conditional GSAP CDN load to `layout/theme.liquid` (index + product pages only)
- [ ] **P1.11** Inject `floorx-main.js` into `layout/theme.liquid` before `</body>` with `defer`
- [ ] **P1.12** Verify: JS loads without errors, design mode guard works in Theme Editor

---

### ✅ Phase 2 — Navigation
*Goal: Navbar transforms to premium dark glass. All Shopify functionality intact.*

- [ ] **P2.1** Add class `fx-header` to `<header>` element in `sections/header.liquid`
- [ ] **P2.2** Add small scroll-state script at bottom of `header.liquid` (toggles `.fx-header--scrolled`)
- [ ] **P2.3** CSS: `.fx-header` — transparent bg, no border, smooth transition
- [ ] **P2.4** CSS: `.fx-header.fx-header--scrolled` — `backdrop-filter: blur(20px)`, `bg: rgba(11,17,32,0.85)`, border-bottom glow
- [ ] **P2.5** CSS: Nav links — white, `--fx-font`, hover underline slide-in animation
- [ ] **P2.6** CSS: Logo — ensure white version is visible on dark bg
- [ ] **P2.7** CSS: Cart icon — white, count badge in `--fx-accent`
- [ ] **P2.8** CSS: Search icon — white, hover glow
- [ ] **P2.9** CSS: Mobile hamburger — white, animated open/close states
- [ ] **P2.10** CSS: Mobile drawer — dark bg `#080A12`, blue accent links, glass panel feel
- [ ] **P2.11** CSS: Dropdown/mega menu — dark card bg, border glow, soft shadow
- [ ] **P2.12** Verify: scroll behavior works, all nav links clickable, search opens, cart drawer opens, mobile nav works

---

### ✅ Phase 3 — Hero Section (30% of effort)
*Goal: Cinematic 6-layer hero with floating product, animated background, GSAP entrance timeline.*

- [ ] **P3.1** Add class `fx-hero` to slideshow wrapper in `sections/slideshow.liquid`
- [ ] **P3.2** Add `data-fx-hero` attribute to slideshow wrapper
- [ ] **P3.3** CSS Layer 1 — Background: animated gradient mesh via `::before` pseudo-element
- [ ] **P3.4** CSS Layer 2 — Light beam: diagonal sweep animation via `::after`
- [ ] **P3.5** CSS Layer 3 — Product image: `drop-shadow` glow + `fx-float` animation
- [ ] **P3.6** CSS Layer 4 — Ambient orbs: 2 radial gradient pseudo-elements for depth lighting
- [ ] **P3.7** CSS Layer 5 — Typography: Manrope, hero size, tight tracking, gradient keyword span
- [ ] **P3.8** CSS Layer 6 — Scroll indicator: chevron at bottom center with subtle bounce
- [ ] **P3.9** CSS: CTA primary button inside hero (`.fx-btn-primary` applied)
- [ ] **P3.10** CSS: Hero section min-height, vertical centering, responsive layout
- [ ] **P3.11** GSAP: `FXHero` timeline — bg fade → heading words stagger → subheading → CTA → product float-in
- [ ] **P3.12** GSAP: Product image parallax on scroll (slight upward drift)
- [ ] **P3.13** Responsive: Mobile — product image below text, reduced font sizes, no parallax
- [ ] **P3.14** Responsive: Tablet — side-by-side with reduced glow intensity
- [ ] **P3.15** Verify: Slideshow controls still work, image loads correctly, GSAP timeline fires once on load

---

### ✅ Phase 4 — Featured Product Section
*Goal: Premium dark product presentation with animated variant selection.*

- [ ] **P4.1** Add class `fx-product-section` to `<section>` in `sections/featured-product.liquid`
- [ ] **P4.2** CSS: Section background — `--fx-bg-1`, ambient blue orb behind media
- [ ] **P4.3** CSS: Product image wrapper — glow treatment (`--fx-glow-product`)
- [ ] **P4.4** CSS: `.floorx-card` — dark card `--fx-bg-card`, subtle border, hover state
- [ ] **P4.5** CSS: `.floorx-card.selected` — border glow, `scale(1.02)`, left accent line 3px blue
- [ ] **P4.6** CSS: `.floorx-top-price` — Manrope 800, gradient text treatment
- [ ] **P4.7** CSS: `.add-btn` — `.fx-btn-primary` treatment (blue gradient + glow pulse)
- [ ] **P4.8** CSS: `.buy-btn` — `.fx-btn-secondary` treatment (glass + border glow)
- [ ] **P4.9** CSS: Price old/new styling — old: muted strikethrough, new: accent blue
- [ ] **P4.10** JS `FXProduct`: price fade-out → count-up → fade-in on variant change
- [ ] **P4.11** JS `FXProduct`: card border animation on selection (previous dims, new glows)
- [ ] **P4.12** JS `FXProduct`: add-to-cart button brief glow pulse after selection
- [ ] **P4.13** Responsive: Mobile — product info stacked below image, full-width variant cards
- [ ] **P4.14** Verify: Variant selection updates price, Add to Cart submits correctly, Buy Now redirects correctly

---

### ✅ Phase 5 — Before & After Section
*Goal: Dark premium comparison section with cinema-quality treatment.*

- [ ] **P5.1** Add class `fx-comparison` to section wrapper in `sections/image-comparison.liquid`
- [ ] **P5.2** CSS: Section background — `--fx-bg-2`, subtle ambient blue orb
- [ ] **P5.3** CSS: Section heading — Manrope, white, large, tight tracking
- [ ] **P5.4** CSS: Section subheading — `--fx-text-secondary`
- [ ] **P5.5** CSS: `.before-after-image-wrapper` — `border-radius: --fx-radius-xl`, blue glow border
- [ ] **P5.6** CSS: Comparison slider handle — blue gradient circle, `--fx-glow-md` shadow
- [ ] **P5.7** CSS: "Before" label — glass pill, subtle red-tinted border
- [ ] **P5.8** CSS: "After" label — glass pill, blue border, `--fx-glow-sm`
- [ ] **P5.9** Add `data-fx-reveal` to section for scroll entrance animation
- [ ] **P5.10** Responsive: Mobile — full width, reduced height, handle large enough to touch
- [ ] **P5.11** Verify: Drag/slider interaction still works, images load correctly from Shopify CDN

---

### ✅ Phase 6 — FAQ Section
*Goal: Premium dark accordion with smooth CSS transitions, no heavy JS.*

- [ ] **P6.1** Add class `fx-faq` to section wrapper in `sections/collapsible-content.liquid`
- [ ] **P6.2** CSS: Section background — `--fx-bg-1`
- [ ] **P6.3** CSS: Section heading — Manrope, white, centered, large
- [ ] **P6.4** CSS: Each `details` item — dark card `--fx-bg-card`, `border-radius: --fx-radius-md`, border `--fx-border-subtle`
- [ ] **P6.5** CSS: `details` hover — border becomes `--fx-border-soft`, slight lift `translateY(-2px)`
- [ ] **P6.6** CSS: `summary` — Manrope 600, white, custom icon (`::after` pseudo, suppress `::marker`)
- [ ] **P6.7** CSS: `summary::after` — "+" icon, rotates to "×" via `details[open] summary::after` selector
- [ ] **P6.8** CSS: `details[open]` — left border 3px `--fx-accent`, `--fx-glow-sm` box-shadow
- [ ] **P6.9** CSS: Answer content — `--fx-text-secondary`, animated height via `max-height` transition
- [ ] **P6.10** CSS: Stagger entrance for FAQ items via `.fx-reveal` with `data-fx-order`
- [ ] **P6.11** Add `data-fx-reveal` + `data-fx-order` to each FAQ item in the Liquid loop
- [ ] **P6.12** Responsive: Mobile — full width, 48px min touch target on summary
- [ ] **P6.13** Verify: Open/close works, only one can be open (if configured that way), content readable

---

### ✅ Phase 7 — Instagram / Gallery Section
*Goal: Premium dark social proof section with hover effects.*

- [ ] **P7.1** Add class `fx-gallery` to section wrapper in `sections/lumin-gallery.liquid`
- [ ] **P7.2** CSS: Section background — `--fx-bg-1`
- [ ] **P7.3** CSS: Section heading "Follow Us on Instagram" — Manrope 800, white, large
- [ ] **P7.4** CSS: Section subtext — `--fx-text-secondary`
- [ ] **P7.5** CSS: Gallery images — `border-radius: --fx-radius-md`, overflow hidden
- [ ] **P7.6** CSS: Image hover — `scale(1.04)`, `--fx-glow-sm` shadow, `--fx-dur-md` transition
- [ ] **P7.7** CSS: `.ig-button` — glass morphism, Instagram gradient border, hover scale
- [ ] **P7.8** CSS: Gallery grid — consistent gap, responsive columns
- [ ] **P7.9** Add `data-fx-reveal` to images for stagger entrance animation
- [ ] **P7.10** Responsive: Mobile — 2-column grid, reduced image height
- [ ] **P7.11** Verify: Images load, Instagram button links correctly

---

### ✅ Phase 8 — Footer
*Goal: Premium dark footer with hierarchy, glass separator, and micro-interactions.*

- [ ] **P8.1** Add class `fx-footer` to `<footer>` in `sections/footer.liquid`
- [ ] **P8.2** CSS: Footer background — `--fx-bg-0` (deepest dark)
- [ ] **P8.3** CSS: Top separator — gradient line (blue glow → transparent)
- [ ] **P8.4** CSS: Column headings — Manrope 600, white, `--fx-tracking-wider`, uppercase
- [ ] **P8.5** CSS: Footer links — `--fx-text-muted` → white on hover, `--fx-transition-fast`
- [ ] **P8.6** CSS: Social icons — outlined circles, blue glow ring on hover
- [ ] **P8.7** CSS: Newsletter input — dark bg `--fx-bg-input`, white text, blue focus ring
- [ ] **P8.8** CSS: Newsletter button — `.fx-btn-primary` treatment
- [ ] **P8.9** CSS: Payment icons — white, 60% opacity
- [ ] **P8.10** CSS: Copyright bar — top separator, `--fx-text-muted`
- [ ] **P8.11** Responsive: Mobile — stacked single column, centered
- [ ] **P8.12** Verify: All links work, newsletter submits, payment icons display

---

### ✅ Phase 9 — Page Transitions & Global Polish
*Goal: Seamless inter-page transitions and global micro-interaction polish.*

- [ ] **P9.1** `FXPageTransition`: fade overlay on internal link click, using `.transition-cover`
- [ ] **P9.2** CSS: `.transition-cover` dark bg `--fx-bg-1` (override existing if needed)
- [ ] **P9.3** Apply `data-fx-reveal` to headings in every section
- [ ] **P9.4** Apply `data-fx-reveal` to paragraphs in every section  
- [ ] **P9.5** Apply `data-fx-reveal` with stagger to feature card groups
- [ ] **P9.6** Apply `data-fx-reveal` to CTAs and buttons in every section
- [ ] **P9.7** Review all sections — consistent spacing using `--fx-section` token
- [ ] **P9.8** Review all sections — consistent border-radius using token scale
- [ ] **P9.9** Review all interactive elements — all have correct hover states
- [ ] **P9.10** Announcement bar: dark bg, blue accent, white text if visible
- [ ] **P9.11** Cart drawer: dark bg, blue accent buttons (if visible via Shopify app/snippet)
- [ ] **P9.12** Back-to-top button: blue gradient, glow on hover

---

### ✅ Phase 10 — Mobile Optimization
*Goal: Every breakpoint feels intentionally designed, not a compressed desktop.*

- [ ] **P10.1** 375px (small mobile): test every section, fix overflow issues
- [ ] **P10.2** 480px (large phone): intermediate layout check
- [ ] **P10.3** 768px (tablet portrait): two-column layouts check
- [ ] **P10.4** 990px (tablet landscape / small desktop): transition to desktop
- [ ] **P10.5** Disable all hover animations on touch devices (`@media (hover: hover)`)
- [ ] **P10.6** Hero: mobile layout — product below text, reduced glow, no parallax
- [ ] **P10.7** Product section: mobile — full-width variant cards, stacked layout
- [ ] **P10.8** FAQ: mobile — larger touch targets on summary elements
- [ ] **P10.9** Footer: mobile — centered, stacked columns
- [ ] **P10.10** Navigation: mobile drawer — smooth open/close, all items accessible
- [ ] **P10.11** Typography: verify `clamp()` values work across all breakpoints
- [ ] **P10.12** Images: verify no overflow, correct aspect ratios on all screens

---

### ✅ Phase 11 — Performance Pass
*Goal: Lighthouse Performance ≥ 85, no regressions from redesign.*

- [ ] **P11.1** Verify Manrope `.woff2` files use `font-display: swap`
- [ ] **P11.2** Verify GSAP only loads on `index` and `product` templates
- [ ] **P11.3** Audit CSS file size — keep `floorx-main.css` under 80KB uncompressed
- [ ] **P11.4** Verify no layout shift from fonts (use `size-adjust` if needed)
- [ ] **P11.5** Verify animations use `transform` and `opacity` only (no layout-triggering props)
- [ ] **P11.6** Verify `will-change: transform` only on actively animating elements, removed after
- [ ] **P11.7** Verify lazy loading on gallery images
- [ ] **P11.8** Verify no unused CSS being loaded
- [ ] **P11.9** Run `shopify theme check` — zero errors, zero warnings
- [ ] **P11.10** Lighthouse audit: Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 95

---

### ✅ Phase 12 — Final QA & Deployment
*Goal: Full functional and visual verification before going live.*

**Functional QA**
- [ ] **P12.1** Add to Cart submits correctly for all variants
- [ ] **P12.2** Buy Now redirects to checkout correctly
- [ ] **P12.3** Cart drawer opens and closes
- [ ] **P12.4** Checkout flow unaffected (test full flow)
- [ ] **P12.5** Before/After slider draggable on desktop and touch
- [ ] **P12.6** FAQ accordion opens and closes
- [ ] **P12.7** Newsletter form submits
- [ ] **P12.8** Header search opens and returns results
- [ ] **P12.9** Mobile nav drawer opens and all links work
- [ ] **P12.10** All external links open correctly
- [ ] **P12.11** Shopify Theme Editor — all sections editable, no broken schema

**Visual QA**
- [ ] **P12.12** Dark background end-to-end on all pages
- [ ] **P12.13** Hero — cinematic, float animation, glow visible
- [ ] **P12.14** Navbar — transparent on top, glass on scroll
- [ ] **P12.15** All buttons — correct default + hover + active states
- [ ] **P12.16** Variant cards — glow on selection
- [ ] **P12.17** Before/After — dark styling, handle styled
- [ ] **P12.18** FAQ — smooth open/close with icon rotation
- [ ] **P12.19** Gallery — images hover correctly
- [ ] **P12.20** Footer — hierarchy clear, links visible
- [ ] **P12.21** No design inconsistencies between sections

**Accessibility QA**
- [ ] **P12.22** All interactive elements keyboard-navigable
- [ ] **P12.23** Focus states visible (blue ring, not removed)
- [ ] **P12.24** Color contrast ≥ 4.5:1 for body text
- [ ] **P12.25** `prefers-reduced-motion` disables all animations
- [ ] **P12.26** ARIA labels intact on all Shopify components

**Deployment**
- [ ] **P12.27** Final `shopify theme check` — zero errors
- [ ] **P12.28** Push to duplicate/staging theme: `shopify theme push --theme=<ID>`
- [ ] **P12.29** Client preview and approval on staging theme
- [ ] **P12.30** Publish: `shopify theme publish --theme=<ID>`
- [ ] **P12.31** Post-publish smoke test on live store

---

## Deployment Workflow

```bash
# Development
shopify theme dev --store=your-store.myshopify.com

# Push to staging (duplicate theme)
shopify theme push --theme=<STAGING_THEME_ID>

# Preview in Shopify Admin → Themes → Actions → Preview

# Publish after approval
shopify theme publish --theme=<STAGING_THEME_ID>
```

Git workflow:
```
main          ← production snapshot
redesign      ← all redesign work (this branch)
PR → main     ← after client QA approval
```

---

## Files Never Touched

`assets/base.css` · `assets/global.js` · `assets/cart.js` · `assets/cart-drawer.js` · `assets/product-form.js` · `templates/*.json` · `config/settings_schema.json` · `config/settings_data.json` · All `component-*.css` files · All product/cart/checkout liquid sections
