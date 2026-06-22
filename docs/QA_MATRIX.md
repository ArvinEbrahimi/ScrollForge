# ScrollForge — QA Matrix

> Cross-browser and device testing matrix for **v2.0.0**.  
> Last updated: 2026-06-22

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Pass — no critical issues |
| ⚠️ | Pass with minor notes |
| ❌ | Fail — needs fix |
| — | Not tested |

## Desktop Browsers

| Feature | Chrome 125+ | Firefox 126+ | Safari 17+ | Edge 125+ |
|---------|:-----------:|:------------:|:----------:|:---------:|
| Smooth scroll (Lenis) | ✅ | ✅ | ✅ | ✅ |
| ScrollTrigger pin/scrub | ✅ | ✅ | ✅ | ✅ |
| Horizontal scroll section | ✅ | ✅ | ✅ | ✅ |
| Custom cursor + trail | ✅ | ✅ | ✅ | ✅ |
| Theme toggle (dark/light) | ✅ | ✅ | ✅ | ✅ |
| Case study modal (FLIP) | ✅ | ✅ | ✅ | ✅ |
| View Transitions API | ✅ | — | ✅ | ✅ |
| Three.js hero particles | ✅ | ✅ | ✅ | ✅ |
| Keyboard nav (`J/K`, `?`) | ✅ | ✅ | ✅ | ✅ |
| Contact form validation | ✅ | ✅ | ✅ | ✅ |

## Mobile

| Feature | iOS Safari 17+ | Android Chrome 125+ |
|---------|:--------------:|:-------------------:|
| Touch scroll (no cursor) | ✅ | ✅ |
| Section nav pill bar | ✅ | ✅ |
| Reduced motion fallback | ✅ | ✅ |
| Stack orbit (CSS 3D) | ⚠️ | ✅ |
| Haptic feedback (buttons) | ⚠️ | ✅ |
| Horizontal section (stacked) | ✅ | ✅ |

### Notes

- **iOS Safari — Stack orbit:** CSS 3D orbit may appear flatter; core interaction still works.
- **iOS Safari — Haptic:** `navigator.vibrate` not supported; ripple still renders.
- **View Transitions:** Progressive enhancement — GSAP fallback when API unavailable.

## Accessibility

| Check | Status |
|-------|--------|
| Semantic landmarks (`main`, `footer`, `section`) | ✅ |
| `aria-label` on sections | ✅ |
| Focus visible on interactive elements | ✅ |
| `prefers-reduced-motion` respected | ✅ |
| Modal `aria-modal` + Escape close | ✅ |
| Form `aria-invalid` + error messages | ✅ |
| Skip loader on repeat visit (session) | ✅ |

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Lighthouse Performance | ≥ 85 | CI gate in `.github/workflows/lighthouse.yml` |
| Lighthouse Accessibility | ≥ 90 | Warn threshold in LHCI config |
| LCP | < 2.5s | Hero text renders before WebGL chunk |
| Three.js bundle | Lazy | `import()` in `hero.js` — separate chunk ~117KB gzip |

## Regression Checklist (manual)

- [ ] Full scroll-through without console errors
- [ ] Preloader skip on second visit (same session)
- [ ] Sound toggle opt-in (no autoplay audio)
- [ ] Theme persists across reload
- [ ] Case modal: Lenis stop/start
- [ ] Konami code unlocks backstage section
- [ ] `npm run build` succeeds
- [ ] `npm run lighthouse` passes locally (optional)

## Known Limitations

1. Video assets (`/video/*.mp4`) are optional — shimmer fallback when missing.
2. GitHub Pages deploy uses `/ScrollForge/` base path; Vercel uses `/`.
3. Lighthouse scores vary with network throttling in CI.
