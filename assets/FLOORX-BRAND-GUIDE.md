# FloorX Brand Design Guide v2.0

**Developer Reference Only** — Not served to users

---

## Mission Statement

> FloorX is the premium choice for professional floor care. Every pixel communicates: performance, trust, cleanliness, and strength.

---

## Visual Style

**Cinematic dark.** Deep navy atmosphere. Blue ambient lighting. Like a product reveal inside a darkened studio with a single blue spotlight.

---

## Color Palette — Complete Token Set

### Backgrounds
```css
--fx-bg-0:            #060810;   /* deepest bg — page body */
--fx-bg-1:            #080A12;   /* primary background */
--fx-bg-2:            #0B1120;   /* secondary sections */
--fx-bg-card:         #111827;   /* card surfaces */
--fx-bg-card-hover:   #162032;   /* card on hover */
--fx-bg-input:        #0D1525;   /* form inputs */
```

### Accent Colors
```css
--fx-accent:          #2563EB;   /* primary blue */
--fx-accent-light:    #3B82F6;   /* highlight blue */
--fx-accent-muted:    #1D4ED8;   /* pressed/deep blue */
--fx-accent-ultra:    #60A5FA;   /* text links, small accents */
```

### Glow & Light Effects
```css
--fx-glow-sm:         rgba(59,130,246,0.15);
--fx-glow-md:         rgba(59,130,246,0.30);
--fx-glow-lg:         rgba(59,130,246,0.50);
--fx-glow-xl:         rgba(59,130,246,0.70);
--fx-beam:            rgba(59,130,246,0.06); /* ambient background light */
```

### Text Colors
```css
--fx-text-primary:    #FFFFFF;
--fx-text-secondary:  #A8B3C5;
--fx-text-muted:      #6B7A99;
--fx-text-accent:     #60A5FA;
```

### Borders
```css
--fx-border-subtle:   rgba(59,130,246,0.08);
--fx-border-soft:     rgba(59,130,246,0.15);
--fx-border-active:   rgba(59,130,246,0.40);
--fx-border-glow:     rgba(59,130,246,0.70);
```

### Glass Morphism
```css
--fx-glass-bg:        rgba(11,17,32,0.65);
--fx-glass-border:    rgba(59,130,246,0.18);
--fx-glass-blur:      16px;
```

---

## Typography Scale

### Font Family
```css
--fx-font: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Size Scale (Desktop)
```css
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
```

### Weights
```css
--fx-weight-light:    300;
--fx-weight-regular:  400;
--fx-weight-medium:   500;
--fx-weight-semibold: 600;
--fx-weight-bold:     700;
--fx-weight-black:    800;
```

### Line Heights
```css
--fx-leading-tight:   1.1;
--fx-leading-snug:    1.3;
--fx-leading-normal:  1.5;
--fx-leading-relaxed: 1.7;
```

### Letter Spacing
```css
--fx-tracking-tight:  -0.025em;
--fx-tracking-normal: 0;
--fx-tracking-wide:   0.05em;
--fx-tracking-wider:  0.1em;
```

---

## Spacing Scale

```css
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
```

---

## Border Radius Scale

```css
--fx-radius-sm:   6px;
--fx-radius-md:   12px;
--fx-radius-lg:   16px;
--fx-radius-xl:   24px;
--fx-radius-2xl:  32px;
--fx-radius-full: 9999px;
```

---

## Shadow & Glow Scale

```css
--fx-shadow-sm:   0 2px 8px rgba(0,0,0,0.3);
--fx-shadow-md:   0 8px 24px rgba(0,0,0,0.4);
--fx-shadow-lg:   0 16px 48px rgba(0,0,0,0.5);
--fx-shadow-xl:   0 24px 64px rgba(0,0,0,0.6);
--fx-glow-btn:    0 0 20px var(--fx-glow-md), 0 0 40px var(--fx-glow-sm);
--fx-glow-card:   0 0 30px var(--fx-glow-sm);
--fx-glow-card-hover: 0 0 40px var(--fx-glow-md), 0 8px 32px rgba(0,0,0,0.5);
--fx-glow-product:    0 0 80px var(--fx-glow-md), 0 0 120px var(--fx-glow-sm);
```

---

## Motion / Animation Scale

### Duration Tokens
```css
--fx-dur-xs:  150ms;    /* micro: icon state change */
--fx-dur-sm:  250ms;    /* small: button hover */
--fx-dur-md:  400ms;    /* medium: card hover, accordion */
--fx-dur-lg:  600ms;    /* large: section reveal */
--fx-dur-xl:  900ms;    /* xl: hero entrance */
--fx-dur-hero: 1200ms;  /* hero sequence total */
```

### Easing Functions
```css
--fx-ease-out:     cubic-bezier(0.16, 1, 0.3, 1);  /* easeOutExpo */
--fx-ease-in:      cubic-bezier(0.7, 0, 0.84, 0);  /* easeInExpo */
--fx-ease-inout:   cubic-bezier(0.87, 0, 0.13, 1); /* easeInOutExpo */
--fx-ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* gentle spring */
```

### Transition Presets
```css
--fx-transition-fast:   var(--fx-dur-sm) var(--fx-ease-out);
--fx-transition-base:   var(--fx-dur-md) var(--fx-ease-out);
--fx-transition-slow:   var(--fx-dur-lg) var(--fx-ease-out);
```

### Scroll Reveal Defaults
```css
--fx-reveal-y:      28px;    /* translateY start offset */
--fx-reveal-blur:   8px;     /* blur start amount */
--fx-stagger:       80ms;    /* per-child stagger increment */
```

---

## Component Interaction Rules

| Element | Hover State | Transition |
|---------|-------------|------------|
| Cards | `translateY(-6px)` + shadow+15% + glow+10% | `var(--fx-dur-md)` |
| Primary Button | Glow pulse + arrow moves right 4px | `var(--fx-dur-sm)` |
| Secondary Button | Border brightens + bg fades in | `var(--fx-dur-sm)` |
| Nav Links | Underline slides in from left | `var(--fx-dur-sm)` |
| Images | Scale 1.03 | `var(--fx-dur-md)` |
| Variant Cards | Border glows + scale 1.02 | `var(--fx-dur-sm)` |
| FAQ Row | Left border appears + bg lightens | `var(--fx-dur-md)` |
| Social Icons | Ring glow expands | `var(--fx-dur-sm)` |

---

## Lighting Language (Orbitshift-Inspired)

Every section must have **at least one** of:

### 1. Ambient Orb
`radial-gradient` pseudo-element, low opacity, blue glow

### 2. Surface Glow
`box-shadow` with blue rgba on interactive elements

### 3. Light Beam
Diagonal linear-gradient overlay, 3–6% opacity

### 4. Depth Layering
Multiple z-index layers creating foreground/midground/background

---

## Breakpoint System (4-point, Mobile First)

```css
/* Base: mobile (320px–479px) */

/* sm: 480px+ — large phones */
@media (min-width: 480px) { }

/* md: 768px+ — tablets */
@media (min-width: 768px) { }

/* lg: 990px+ — desktop */
@media (min-width: 990px) { }

/* xl: 1200px+ — large desktop */
@media (min-width: 1200px) { }
```

### Mobile-Specific Rules
- Hero: reduced font size, product image below text
- Feature cards: single column
- FAQ: full-width, increased touch targets (min 48px)
- Footer: stacked, centered
- All hover effects in `@media (hover: hover)`
- Heavy animations in `@media (prefers-reduced-motion: no-preference)`

---

## Accessibility Requirements

- All interactive elements minimum 44x44px touch target
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text (18px+)
- All animations respect `prefers-reduced-motion`
- Focus states visible and consistent
- Semantic HTML maintained
- ARIA labels on icon-only buttons

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Performance | ≥ 85 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |

---

**Last Updated:** July 1, 2026  
**Version:** 2.0  
**Status:** Implementation Ready
