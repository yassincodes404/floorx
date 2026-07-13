# FloorX Design System & Architecture

## Goal

One design language, one token source, predictable load order, and fault-isolated JS — so features can be built without fighting the theme.

---

## Asset map

| File | Role |
|------|------|
| `floorx-system.css` | **Source of truth** — tokens + primitives |
| `floorx-header.css` | Header chrome (extracted from `header.liquid`) |
| `floorx-main.css` | Section overrides + Shopify bridges only |
| `floorx-main.js` | Animation engine v3 (isolated modules) |
| `FLOORX-SYSTEM.md` | This document |

### Load order (`layout/theme.liquid`)

```
base.css
lumin.css
floorx-system.css    ← tokens first
floorx-main.css      ← section overrides
… later in header section …
floorx-header.css    ← header chrome (after system)
```

**Rule:** never load header/main before `floorx-system.css`.

---

## Tokens (change only in floorx-system.css)

| Group | Examples |
|-------|----------|
| Cyan energy | `--fx-cyan`, `--fx-cyan-soft`, `--fx-cyan-deep` |
| Surfaces | `--fx-bg-0`, `--fx-bg-elevated` |
| Text | `--fx-text-primary`, `--fx-text-secondary`, `--fx-text-muted` |
| Type | `--fx-font-display`, `--fx-font-ui`, `--fx-font-body` |
| Spacing (8pt) | `--fx-space-2` (8px) … `--fx-space-8` (64px) |
| Radius | `--fx-radius-md` (8), `--fx-radius-lg` (12) |
| Motion | `--fx-ease`, `--fx-dur-sm/md/lg` |
| Hits | `--fx-hit` (40), `--fx-icon` (20) |

Legacy aliases (`--fx-accent`, `--fx-glow-*`, `--fx-space-sm`, etc.) map onto the system so older selectors keep working.

---

## Primitives (reuse these)

```html
<a class="fx-btn fx-btn--primary">Shop Now</a>
<a class="fx-btn fx-btn--ghost">Watch Demo</a>
<div class="fx-btn-row">…</div>

<button class="fx-icon-btn" aria-label="Cart">…</button>

<article class="fx-card">…</article>
<article class="fx-card fx-card--stat">
  <span class="fx-card__value">500+</span>
  <span class="fx-card__label">Gyms</span>
</article>

<p class="fx-label">Professional</p>
<h1 class="fx-display">REVIVE</h1>
<p class="fx-body">…</p>
```

Hero buttons should include **both** system + section classes:

```html
class="fx-btn fx-btn--primary fxch-btn fxch-btn--primary"
```

Hero CSS variables bridge:

```css
[id^="fx-ch-"] {
  --fxch-accent: var(--fx-cyan);
  /* … see floorx-system.css */
}
```

---

## Reliability rules

1. **No second token set** in `floorx-main.css` or section files (except section-scoped bridges).
2. **No second search** in the header (only `.header__icons` search).
3. **No null DOM listeners** — always guard `getElementById` before `addEventListener`.
4. **JS modules are isolated** — `safeInit` in `floorx-main.js` catches failures.
5. **Header styles live in** `floorx-header.css`, not a 900-line `{% style %}` block.
6. Prefer `var(--fx-*)` over hardcoded `#7DF9FF` / random radii.

---

## JS debug

```js
FloorX.engineVersion  // "3.0"
FloorX.reinit()       // re-run modules
document.documentElement.dataset.fxEngine
document.documentElement.classList.contains('fx-engine-ready')
```

---

## Migration checklist (when touching a section)

- [ ] Replace hardcoded cyan/blue with `var(--fx-cyan*)`
- [ ] Replace one-off radii with `var(--fx-radius-md|lg)`
- [ ] Use `.fx-btn` / `.fx-card` if adding UI
- [ ] Do not add a new full `:root { … }` block
- [ ] Do not paste large CSS into Liquid `{% style %}` (use an asset)

---

## Known debt (intentionally deferred)

- `floorx-main.css` still has high `!important` density for legacy Shopify overrides — reduce only when editing that section.
- Lumin / base theme styles remain under FloorX; we override, we don’t fork `base.css`.
- Full header.liquid still contains theme-default styles (Shopify schema + menu); only FloorX chrome was extracted.
