# ScrollForge — ScrollTrigger Patterns

Patterns for responsive, maintainable scroll animations in ScrollForge V2.

---

## 1. Section lifecycle (`withSectionContext`)

Every section wraps GSAP code in `gsap.context()` via `withSectionContext()`:

```js
import { withSectionContext } from '../core/section-base.js';

export function initMySection() {
  const section = document.querySelector('#my-section');
  if (!section) return null;

  section.innerHTML = `...`;

  return withSectionContext(section, (ctx) => {
    gsap.to('.my-el', { ... });

    ctx.add(() => {
      // optional DOM event cleanup
    });
  });
}
```

Returns a `destroy()` function consumed by `ScrollOrchestrator`.

---

## 2. Responsive animations (`createMatchMedia`)

Use `ScrollTrigger.matchMedia()` through the project wrapper:

```js
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

return withSectionContext(section, (ctx) => {
  const revertMedia = createMatchMedia({
    [BREAKPOINTS.mobile]: () => {
      // mobile-only animations
    },
    ['(min-width: 769px)']: () => {
      // desktop / tablet animations
    },
    [BREAKPOINTS.reducedMotion]: () => {
      // static fallbacks
    },
  });

  ctx.add(revertMedia);
});
```

**Rules:**
- Queries must not overlap without intent — mobile vs `(min-width: 769px)` are mutually exclusive.
- Always call `ctx.add(revertMedia)` so matchMedia reverts on section destroy / HMR.
- Put `reducedMotion` last if it should override motion for all viewports.

---

## 3. Breakpoint tokens

| Token | Query |
|-------|-------|
| `BREAKPOINTS.desktop` | `(min-width: 1024px)` |
| `BREAKPOINTS.tablet` | `(max-width: 1023px) and (min-width: 769px)` |
| `BREAKPOINTS.mobile` | `(max-width: 768px)` |
| `BREAKPOINTS.reducedMotion` | `(prefers-reduced-motion: reduce)` |

---

## 4. ScrollTrigger.batch (lists)

For grids of elements entering the viewport:

```js
ScrollTrigger.batch(elements, {
  start: 'top 85%',
  onEnter: (els) => gsap.from(els, { y: 80, opacity: 0, stagger: 0.1 }),
  once: true,
});
```

---

## 5. Orchestrator registration (`main.js`)

```js
orchestrator
  .register('hero', initHero)
  .register('pinned', initPinnedReveal)
  .initAll();
```

Dev panel (`import.meta.env.DEV`): Refresh ST · Reinit All · Pause · Resume.

---

## 6. HMR cleanup (Vite)

```js
if (import.meta.hot) {
  import.meta.hot.dispose(() => orchestrator.destroyAll());
}
```

---

*See `docs/V2_ADVANCED_TASKS.md` for the full upgrade roadmap.*
