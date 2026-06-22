# ScrollForge — Project Specification

> **Codename:** `gsap-scroll-experience`  
> **Purpose:** A cinematic, scroll-driven portfolio piece demonstrating GSAP ScrollTrigger mastery.  
> **Stack:** Vite 5 · Vanilla JS · HTML/CSS · GSAP 3 · Lenis  
> **Target feel:** High-end agency website — dark, precise, motion-forward.

---

## 1. Executive Summary

ScrollForge is a single-page, scroll-orchestrated experience with eight distinct sections. Every animation is scroll-synced or timeline-driven via GSAP. There is no UI framework — the goal is to showcase low-level control, performance discipline, and cinematic pacing.

**Non-goals:**
- No React/Vue/Svelte
- No CMS or backend
- No real project data / routing — content is static and injected via JS modules

**Success criteria:**
- Butter-smooth 60fps on mid-range desktop (Lenis + `gsap.ticker.lagSmoothing(0)`)
- Each section is independently init-able and testable
- Mobile degrades gracefully (no broken layouts, reduced motion respected)
- Code is modular, readable, and PR-reviewable in small slices

---

## 2. Repository Structure

```
ScrollForge/
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
├── README.md
├── docs/
│   ├── PROJECT_SPEC.md          ← this file
│   ├── IMPLEMENTATION_TASKS.md  ← V1 task breakdown (complete)
│   └── V2_ADVANCED_TASKS.md   ← V2 advanced upgrades (40 tasks)
├── public/
│   └── fonts/                   ← optional self-hosted font fallback
└── src/
    ├── main.js                  ← entry: plugin registration, module init
    ├── style.css                ← design tokens, resets, section styles
    ├── sections/
    │   ├── hero.js
    │   ├── marquee.js
    │   ├── pinned-reveal.js
    │   ├── horizontal-scroll.js
    │   ├── text-reveal.js
    │   ├── svg-path.js
    │   ├── stagger-cards.js
    │   └── outro.js
    └── utils/
        ├── lenis.js             ← smooth scroll + ScrollTrigger bridge
        ├── cursor.js            ← custom cursor states
        └── reduced-motion.js    ← optional: centralize motion prefs check
```

### Module contract

Every section module exports a single `init*()` function:

```js
export function initHero() {
  const section = document.querySelector('#hero');
  if (!section) return; // fail-safe
  // inject HTML → query elements → create animations
}
```

`main.js` is the only orchestrator. Sections must not import each other.

---

## 3. Dependencies

```json
{
  "name": "scrollforge",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "gsap": "^3.12.5",
    "lenis": "^1.1.14"
  },
  "devDependencies": {
    "vite": "^5.2.0"
  }
}
```

### Vite config

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

### Lenis CSS

Import Lenis base styles in `main.js` (before `style.css`):

```js
import 'lenis/dist/lenis.css';
import './style.css';
```

Add to `style.css`:

```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
```

---

## 4. Design System

### 4.1 Color palette

| Token            | Value     | Usage                              |
|------------------|-----------|------------------------------------|
| `--bg`           | `#080808` | Page background                    |
| `--surface`      | `#111111` | Cards, panels                      |
| `--border`       | `#1f1f1f` | Dividers, card borders             |
| `--text-primary` | `#f0ece4` | Headlines, body                    |
| `--text-muted`   | `#5a5a5a` | Ghost / inactive text              |
| `--accent`       | `#c8f04e` | Signature acid lime                |
| `--accent-dim`   | `#8aaa2e` | Hover, secondary accent            |

**Signature rule:** Acid lime on near-black + Space Grotesk must appear in every section — as text accent, border, fill, or background inversion (outro).

### 4.2 Typography

**Fonts (Google Fonts, loaded in `index.html`):**
- Display: `Space Grotesk` — weights 300–700
- Body: `Inter` — weights 300–500

```css
:root {
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;

  --text-xs:   clamp(0.75rem, 1vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 1.2vw, 1rem);
  --text-base: clamp(1rem, 1.5vw, 1.125rem);
  --text-xl:   clamp(1.25rem, 2vw, 1.75rem);
  --text-2xl:  clamp(1.75rem, 3vw, 2.5rem);
  --text-hero: clamp(4rem, 10vw, 10rem);
}
```

Display text uses `--font-display`. Body, labels, and descriptions use `--font-body`.

### 4.3 Spacing & layout

```css
:root {
  --section-pad-x: clamp(1.5rem, 5vw, 6rem);
  --section-pad-y: clamp(4rem, 8vw, 8rem);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --transition-fast: 0.2s ease;
  --z-cursor: 9999;
  --z-overlay: 10000;
}
```

### 4.4 Global base styles

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html { scroll-behavior: auto; } /* Lenis owns scroll */

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  overflow-x: hidden;
  cursor: none;
  -webkit-font-smoothing: antialiased;
}

.section {
  position: relative;
  overflow: hidden;
}

img, svg { display: block; max-width: 100%; }

a {
  color: inherit;
  text-decoration: none;
}
```

---

## 5. GSAP Architecture

### 5.1 Plugin registration (`main.js`)

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
// TextPlugin only if used in outro — register on demand
```

> **Note:** SplitText is a GSAP Club plugin and is **not** used. Per-character animation uses manual `<span>` injection.

### 5.2 Init order (critical)

```
1. reduced-motion check (optional flag on document.documentElement)
2. initLenis()          — must run before ScrollTriggers that depend on smooth scroll
3. initCursor()         — after DOM ready, before section hovers
4. Section inits        — DOM order: hero → marquee → … → outro
5. ScrollTrigger.refresh() — once after all sections mounted (use requestAnimationFrame)
```

### 5.3 Lenis ↔ ScrollTrigger bridge (`utils/lenis.js`)

```js
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initLenis() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
```

Export `lenis` instance if sections need programmatic scroll (outro CTA).

### 5.4 ScrollTrigger best practices

- Use `scrub: true` or `scrub: 1` for scroll-linked animations (1 = 1s catch-up lag)
- Use `anticipatePin: 1` on horizontal pin sections
- Call `ScrollTrigger.refresh()` on `window.resize` (debounced 150ms)
- Assign `id` to horizontal scroll tween: `gsap.to(track, { id: 'horiz-anim', ... })` so per-card triggers can use `containerAnimation`
- `markers: false` in production; enable only during dev via `import.meta.env.DEV`

### 5.5 Performance

- Animate only `transform` and `opacity` where possible
- Avoid layout thrashing in scroll handlers
- Marquee uses `repeat: -1` with duplicated content (no DOM measurement per frame)
- SVG path: set `strokeDasharray`/`strokeDashoffset` once via `getTotalLength()`

---

## 6. Custom Cursor (`utils/cursor.js`)

### Structure

Two fixed elements (also declared in `index.html` for SSR-like stability):

| Element        | Default              | State: `expand`     | State: `text`        | State: link hover   |
|----------------|----------------------|---------------------|----------------------|---------------------|
| `.cursor-dot`  | 8px, accent fill     | unchanged           | hidden               | hidden              |
| `.cursor-ring` | 40px, accent border  | 80px diameter       | pill 80×32, "VIEW"   | filled accent, 40px |

### Implementation requirements

```js
export function initCursor() {
  // Skip on touch / mobile / reduced-motion
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || isMobile || prefersReduced) {
    document.body.style.cursor = 'auto';
    document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.remove());
    return;
  }

  // gsap.ticker lerp for ring lag (dot follows instantly or with lighter lag)
  // data-cursor="expand" | data-cursor="text" via event delegation
  // <a> and [data-cursor] targets get mouseenter/mouseleave
}
```

Ring follow: use `gsap.quickTo()` or manual lerp (`current += (target - current) * 0.15`) on `gsap.ticker`.

---

## 7. HTML Shell (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A cinematic scroll experience built with GSAP ScrollTrigger and Lenis.">
  <meta name="theme-color" content="#080808">
  <title>ScrollForge — Arvin Ebrahimi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Loading overlay (hero module animates this out) -->
  <div class="loader" aria-hidden="true"></div>

  <!-- Custom cursor -->
  <div class="cursor-dot" aria-hidden="true"></div>
  <div class="cursor-ring" aria-hidden="true"><span class="cursor-ring__label">VIEW</span></div>

  <main id="smooth-content">
    <section id="hero" class="section section--hero" aria-label="Hero"></section>
    <section id="marquee" class="section section--marquee" aria-label="Technologies"></section>
    <section id="pinned" class="section section--pinned" aria-label="Features"></section>
    <section id="horizontal" class="section section--horizontal" aria-label="Projects"></section>
    <section id="text-reveal" class="section section--text" aria-label="Philosophy"></section>
    <section id="svg-path" class="section section--svg" aria-label="Workflow"></section>
    <section id="cards" class="section section--cards" aria-label="Capabilities"></section>
    <section id="outro" class="section section--outro" aria-label="Contact"></section>
  </main>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## 8. Section Specifications

### 8.1 Hero (`sections/hero.js`)

**Layout:**
- Full viewport (`min-height: 100vh`)
- CSS grid background (vertical + horizontal lines, `--border` at ~15% opacity)
- Headline: line 1 `SCROLL`, line 2 `EXPERIENCE` (accent color on line 2)
- Subtext: `Crafted with GSAP ScrollTrigger`
- Bottom-right scroll indicator: `SCROLL` + bouncing arrow

**CSS highlights:**

```css
.section--hero { min-height: 100vh; display: flex; align-items: center; }
.hero__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0;
  pointer-events: none;
}
.hero__title {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 700;
  line-height: 0.9;
  text-transform: uppercase;
}
.hero__line--accent { color: var(--accent); }
.hero__char { display: inline-block; overflow: hidden; }
```

**Animations:**
1. **Loader:** `.loader` full-screen `--accent` → `y: '-100%'` over 1s `power4.inOut` on load
2. **Chars:** `y: 120 → 0`, `opacity: 0 → 1`, stagger `0.04`, `power4.out`, duration `1`
3. **Subtext:** delay `0.8s`, `opacity` + `y: 20 → 0`
4. **Grid:** `opacity: 0 → 0.15`, duration `2s`
5. **Parallax:** `.hero__content` `y: 0 → -200`, scrub `1`, trigger `#hero`
6. **Arrow:** infinite yoyo `y: 0 → 10`, `0.8s`, `power1.inOut`

---

### 8.2 Marquee (`sections/marquee.js`)

**Layout:**
- Two rows, opposite scroll directions
- Row 1: `GSAP · ScrollTrigger · Three.js · WebGL · React · Next.js · Django ·`
- Row 2: `Framer Motion · TypeScript · PostgreSQL · Docker · WebRTC · Redis ·`
- Top/bottom border `--border`
- Separator `·` in `--accent`

**Animation:**
- Row 1: `x: 0 → -50%`, `duration: 20`, `repeat: -1`, `ease: none`
- Row 2: `x: -50% → 0`, same timing
- Hover section: `timeScale(0.4)` on both (not 0.5 — snappier feel)
- Each track duplicates content twice for seamless loop

**CSS:**

```css
.section--marquee {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2rem 0;
}
.marquee__track { display: flex; width: max-content; }
.marquee__content {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  padding-right: 2rem;
}
```

---

### 8.3 Pinned Reveal (`sections/pinned-reveal.js`)

**Layout:**
- Section height: `400vh`
- Pinned `.pinned__container` (centered, `min-height: 100vh`)
- Progress bar: 2px top, fill `--accent`
- 3 panels stacked absolutely; only active panel visible

| # | Title              | Description                                                                 |
|---|--------------------|-----------------------------------------------------------------------------|
| 01 | GSAP ScrollTrigger | Scroll-driven animations with pixel-perfect control over every keyframe.   |
| 02 | Smooth Inertia     | Lenis smooth scroll synced with GSAP ticker for buttery 60fps performance. |
| 03 | Timeline Mastery   | Orchestrated sequences, staggers, and callbacks for cinematic storytelling.|

Each panel: left = number + title + desc; right = mock visual with shimmer (`@keyframes shimmer` gradient sweep).

**Animation:**
- Pin `.pinned__container` from `top top` to `bottom bottom`
- Progress fill `width: 0 → 100%`, scrub
- Panels: use a **single scrubbed timeline** mapped to scroll progress (cleaner than per-panel toggleActions):
  - Panel 1: visible `0%–33%`
  - Panel 2: fade in `25%–40%`, hold, fade out `55%–65%`
  - Panel 3: fade in `60%–75%`, hold to end
- Alternative: `gsap.timeline({ scrollTrigger: { scrub: true }})` with sequential `.to()` calls

---

### 8.4 Horizontal Scroll (`sections/horizontal-scroll.js`)

**Layout:**
- Section wrapper: `overflow: hidden`
- Track: flex row of 5 cards
- Each card: `70vw × 80vh`, `--surface` bg, `--border` border, `padding: 3rem`
- Content: label, title (with `\n` → `<br>`), description, image placeholder, CTA `VIEW →`
- Cards use `data-cursor="expand"`

**Projects:**

| Label      | Title          | Description                              |
|------------|----------------|------------------------------------------|
| PROJECT 01 | Cinematic Hero | Three.js + post-processing pipeline      |
| PROJECT 02 | SaaS Platform  | Django + React full-stack architecture   |
| PROJECT 03 | Real-time Kanban | WebSocket + Django Channels            |
| PROJECT 04 | WebRTC Calls   | Peer-to-peer signaling from scratch      |
| PROJECT 05 | Motion Library | Framer Motion component system           |

**Animation:**

```js
const tween = gsap.to(track, {
  id: 'horiz-anim',
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: () => `+=${track.scrollWidth}`,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});

// Per-card entrance
cards.forEach(card => {
  gsap.fromTo(card,
    { scale: 0.9, opacity: 0.5 },
    {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: {
        trigger: card,
        containerAnimation: tween,
        start: 'left 80%',
        end: 'left 40%',
        scrub: true,
      },
    }
  );
});
```

**Mobile (`≤768px`):** disable horizontal pin; stack cards vertically with standard fade-in ScrollTriggers.

---

### 8.5 Text Reveal (`sections/text-reveal.js`)

**Copy:**
> The web is a canvas. Every scroll is a frame. Every interaction is a conversation between code and the human who reads it.

**Layout:**
- Centered container, max-width `900px`
- `font-size: --text-2xl`, `font-family: --font-display`, `line-height: 1.4`

**Animation:**
- Each word wrapped in `<span class="reveal-word">`
- Default: `opacity: 0.15`, `color: --text-muted`
- Scrubbed stagger: `opacity: 1`, `color: --text-primary`
- Trigger: `start: 'top 80%'`, `end: 'bottom 20%'`, `scrub: 1`

**Enhancement:** Use individual word triggers for true Linear-style illumination (each word has its own `start` based on index) — optional polish task.

---

### 8.6 SVG Path (`sections/svg-path.js`)

**Layout:**
- Eyebrow: `THE WORKFLOW`
- SVG `viewBox="0 0 1200 300"`, full width
- Wave path in `--accent`, `stroke-width: 2`
- Milestones at x: 50, 350, 650, 950, 1150 — labels: INIT, BUILD, TEST, DEPLOY

**Animation:**
1. `const len = path.getTotalLength()`
2. `gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })`
3. Scrub `strokeDashoffset: len → 0`
4. Milestones + labels (except first): fade in at 25%, 50%, 75% scroll progress through section

**Accessibility:** Add `role="img"` and `aria-label="Development workflow: Init, Build, Test, Deploy"` on SVG wrapper.

---

### 8.7 Stagger Cards (`sections/stagger-cards.js`)

**Layout:**
- CSS grid: `3 columns` desktop, `2` tablet, `1` mobile
- 6 cards on `--surface` with `--border` border

| Icon | Title           | Description                                      |
|------|-----------------|--------------------------------------------------|
| ⚡   | Performance     | GPU-friendly transforms, minimal layout thrash.  |
| 🎯   | Precision       | Scroll-scrubbed timelines with sub-pixel control.|
| 🌊   | Smooth Scroll   | Lenis inertia paired with GSAP ticker.           |
| 🎬   | Cinematics      | Orchestrated sequences that feel intentional.    |
| 📐   | Layout          | Responsive systems without framework overhead.   |
| 🔗   | Integration     | APIs, WebSockets, real-time — motion meets data. |

**Animation:**
- Entrance: `y: 80 → 0`, `opacity: 0 → 1`, stagger `0.1`, `power3.out`, `0.8s`
- Trigger: `start: 'top 75%'`
- Hover (GSAP): `y: -8`, `borderColor: var(--accent)`, `boxShadow: '0 20px 40px rgba(0,0,0,0.4)'`
- Mouse leave: reverse with `power2.out`

---

### 8.8 Outro (`sections/outro.js`)

**Layout:**
- Full viewport
- Default bg inherits `--bg`; on enter transitions to `--accent`
- Headline: `LET'S BUILD SOMETHING.` in black (`#080808`)
- Link: `arvinebrahimi.dev`
- CTA button: `VIEW GITHUB →` → `https://github.com/ArvinEbrahimi`
- Subtle noise overlay via CSS `background-image` (inline SVG feTurbulence or PNG)

**Animation:**
- `ScrollTrigger` on `#outro`:
  - `onEnter`: animate `body` background to `--accent`
  - `onLeaveBack`: restore `--bg`
- Headline chars: stagger bounce (`y: 100 → 0`, `ease: 'back.out(1.7)'`)
- CTA: `data-cursor="text"` or link hover state

---

## 9. Responsive & Accessibility

### 9.1 Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `≤768px`   | Hide custom cursor; restore `cursor: auto` |
| `≤768px`   | Horizontal section → vertical card stack |
| `≤1024px`  | Stagger grid → 2 columns |
| `≤768px`   | Stagger grid → 1 column |
| `≤768px`   | Hero `font-size` scales via clamp (already) |

### 9.2 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In JS: skip Lenis, simplify ScrollTrigger `scrub` to instant toggles, disable marquee `repeat`, skip cursor init.

### 9.3 Accessibility checklist

- [ ] Semantic `<main>` wrapper
- [ ] `aria-label` on each `<section>`
- [ ] Loader has `aria-hidden="true"` (no focus trap needed — brief)
- [ ] Focus styles on links/buttons (`:focus-visible` outline in `--accent`)
- [ ] `prefers-reduced-motion` honored in JS + CSS
- [ ] Sufficient contrast on accent bg (outro black on lime)

---

## 10. `.gitignore`

```
node_modules/
dist/
.DS_Store
*.local
.env
.env.*
.vscode/
.idea/
*.log
```

---

## 11. README (target content)

See `IMPLEMENTATION_TASKS.md` Task 12 for final README update. Key sections: Features, Tech Stack, Run Locally, Build, Live Demo link.

---

## 12. Git Workflow (mandatory)

Every task and sub-task follows this pipeline:

```
main
 └── feat/<task-id>-<short-name>    ← branch per task
      ├── commit(s) with conventional messages
      ├── push to origin
      ├── PR → main (via gh cli)
      └── merge after CI/review
```

**Branch naming:** `feat/T01-scaffold`, `feat/T04-hero`, etc.  
**Commit style:** `feat(hero): add per-character load animation`  
**PR title:** mirrors the task name.  
**Never** push directly to `main` for feature work.

---

## 13. Quality Gates (per PR)

- [ ] `npm run build` passes with zero errors
- [ ] No console errors on page load
- [ ] Section works in isolation (other sections may be empty stubs during early tasks)
- [ ] ScrollTrigger markers off
- [ ] Mobile spot-check if task touches layout
- [ ] Reduced motion spot-check if task touches animation

---

## 14. Known Spec Corrections (from draft)

| Issue | Resolution |
|-------|------------|
| `gsap.getById('horiz-anim')` never defined | Add `id: 'horiz-anim'` to horizontal tween |
| Loader mentioned but missing from HTML | Add `.loader` element in `index.html` |
| `TextPlugin` imported but unused | Remove unless outro needs it; use manual spans |
| SplitText referenced | Use manual char spans (Club plugin not available) |
| `cursor: none` on mobile | Cursor util removes elements and restores cursor |
| Panel reveal uses fragile `%` triggers | Prefer single scrubbed timeline for pinned section |
| Lenis CSS not imported | Import `lenis/dist/lenis.css` in main |

---

## 15. Future Enhancements (out of scope v1)

- Page transitions / route shell for multi-page portfolio
- WebGL particle background in hero
- `SplitText` if Club license available
- Lighthouse performance audit + `will-change` audit
- Deploy to GitHub Pages / Vercel with preview URL

---

*Document version: 1.0 · Last updated: 2026-06-22*
