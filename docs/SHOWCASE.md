# ScrollForge — Showcase Guide

> Portfolio presentation notes for **ScrollForge v2**.

## Elevator Pitch

ScrollForge is a scroll-driven cinematic experience that demonstrates GSAP ScrollTrigger mastery, Lenis smooth scroll, and selective WebGL — all without a JavaScript framework.

## Key Selling Points

1. **Orchestrated motion** — 15 sections, 14 nav dots, every animation scoped with `gsap.context`.
2. **Performance-conscious** — Three.js code-split; lazy section init via `IntersectionObserver`.
3. **Production polish** — Theme toggle, sound design, keyboard nav, accessibility fallbacks.
4. **Agency-grade interactions** — FLIP modals, 3D card tilt, velocity-reactive marquee, particle burst outro.

## Suggested Screenshots

| Shot | Section | Why |
|------|---------|-----|
| Hero + particles | `#hero` | WebGL + scramble text entrance |
| Pinned reveal | `#pinned` | Multi-panel scroll storytelling |
| Horizontal projects | `#horizontal` | Case study cards + modal |
| Text reveal | `#text-reveal` | Per-word scroll zones |
| Stats counter | `#stats` | Scrub-driven numbers |
| Outro burst | `#outro` | Particle canvas + accent morph |
| Backstage (secret) | `#backstage` | Easter egg / Konami unlock |

## Demo Recording Tips

- Record at **1920×1080**, 60fps, slow scroll pace (~60s full pass).
- Show keyboard nav with `?` overlay briefly.
- Click a project card to demo FLIP modal.
- Toggle theme (☾/☀) mid-scroll for contrast.
- Optional: enter Konami code for surprise ending.

## Embed / Link

```html
<a href="https://scrollforge.arvinebrahimi.dev">ScrollForge — Cinematic Scroll Experience</a>
```

## Tech Tags (for portfolios)

`GSAP` · `ScrollTrigger` · `Lenis` · `Three.js` · `Vite` · `Vanilla JS` · `WebGL` · `Accessibility`
