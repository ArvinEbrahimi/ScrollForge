# ScrollForge — Implementation Tasks

> **Workflow rule:** هر تسک = یک branch جدا → commit → push → PR → merge به `main`.  
> **Agent rule:** همیشه مثل senior fullstack developer عمل کن — کد تمیز، scope محدود، PRهای کوچک و قابل review.

---

## Branch & PR Convention

```
Branch:  feat/T<nn>-<kebab-case-name>
Commit:  <type>(<scope>): <imperative description>
         types: feat | fix | style | refactor | chore | docs
PR:      gh pr create --title "T<nn>: <Title>" --body "..."
Merge:   gh pr merge --squash (after review / build pass)
```

### Per-task git commands (template)

```bash
git checkout main
git pull origin main
git checkout -b feat/T01-scaffold
# ... implement ...
git add <files>
git commit -m "feat(scaffold): initialize vite project with gsap and lenis"
git push -u origin feat/T01-scaffold
gh pr create --title "T01: Project scaffold" --body "## Summary\n- ...\n\n## Test plan\n- [ ] npm run dev\n- [ ] npm run build"
gh pr merge --squash
git checkout main
git pull origin main
```

---

## Task Dependency Graph

```
T01 Scaffold
 ├── T02 Design system & global CSS
 │    ├── T03 Lenis smooth scroll
 │    └── T04 Custom cursor
 ├── T05 Hero
 ├── T06 Marquee
 ├── T07 Pinned reveal
 ├── T08 Horizontal scroll
 ├── T09 Text reveal
 ├── T10 SVG path
 ├── T11 Stagger cards
 └── T12 Outro
      └── T13 Responsive, a11y & polish
           └── T14 README & final QA
```

T03 and T04 can run in parallel after T02.  
T05–T12 can run in parallel after T03+T04 (each section is independent).  
T13 depends on all sections. T14 is final.

---

## Task Breakdown

### T01 — Project Scaffold
**Branch:** `feat/T01-scaffold`  
**Status:** ✅ Done

**Scope:**
- [ ] `package.json` with dependencies (gsap, lenis, vite)
- [ ] `vite.config.js`
- [ ] `.gitignore`
- [ ] `index.html` shell (sections, loader, cursor elements, fonts)
- [ ] `src/main.js` stub (registers plugins, empty inits)
- [ ] Empty section files exporting `init*()` stubs
- [ ] Empty `utils/lenis.js`, `utils/cursor.js`
- [ ] `public/fonts/` directory (`.gitkeep`)

**Acceptance criteria:**
- `npm install && npm run dev` starts without errors
- `npm run build` produces `dist/`
- All eight section IDs present in HTML

**Files:**
```
package.json, vite.config.js, .gitignore, index.html,
src/main.js, src/style.css (minimal reset only),
src/sections/*.js (stubs), src/utils/*.js (stubs),
public/fonts/.gitkeep
```

---

### T02 — Design System & Global CSS
**Branch:** `feat/T02-design-system`  
**Status:** ✅ Done  
**Depends on:** T01

**Scope:**
- [ ] Full CSS variables (colors, typography, spacing)
- [ ] Global resets, `.section` base, `main` wrapper
- [ ] Loader styles (`.loader`)
- [ ] Cursor base styles (`.cursor-dot`, `.cursor-ring`)
- [ ] Lenis helper classes in CSS
- [ ] Section-specific CSS blocks (placeholder layout per section — no animations yet)

**Acceptance criteria:**
- Page renders dark theme with correct fonts
- All sections visible with minimum layout (no broken overflow)
- Loader visible on load (static, no animation yet)

**Files:** `src/style.css` (majority of work), minor `index.html` tweaks if needed

---

### T03 — Lenis Smooth Scroll
**Branch:** `feat/T03-lenis`  
**Status:** ✅ Done  
**Depends on:** T02

**Scope:**
- [ ] Implement `initLenis()` per spec
- [ ] Import `lenis/dist/lenis.css` in `main.js`
- [ ] Wire `lenis.on('scroll', ScrollTrigger.update)`
- [ ] `gsap.ticker` RAF loop + `lagSmoothing(0)`
- [ ] Skip Lenis when `prefers-reduced-motion: reduce`
- [ ] Debounced `ScrollTrigger.refresh()` on resize

**Acceptance criteria:**
- Smooth wheel scroll on desktop
- ScrollTrigger scrub animations stay in sync
- No scroll jank or double-scroll behavior
- Reduced motion: native scroll works

**Files:** `src/utils/lenis.js`, `src/main.js`

---

### T04 — Custom Cursor
**Branch:** `feat/T04-cursor`  
**Status:** ✅ Done  
**Depends on:** T02

**Scope:**
- [ ] Dot (instant) + ring (lerp via gsap.ticker)
- [ ] `data-cursor="expand"` → ring 80px
- [ ] `data-cursor="text"` → pill with "VIEW" label
- [ ] Link hover: dot hidden, ring filled accent
- [ ] `cursor: none` on body; skip entirely on touch/mobile/reduced-motion

**Acceptance criteria:**
- Ring lags smoothly behind mouse
- All three states work on test elements (horizontal cards in T08 will use them)
- Mobile: cursor elements removed, system cursor restored

**Files:** `src/utils/cursor.js`, `src/style.css` (cursor states)

---

### T05 — Hero Section
**Branch:** `feat/T05-hero`  
**Status:** ✅ Done  
**Depends on:** T03 (recommended), T02

**Scope:**
- [ ] HTML injection (grid, split chars, subtext, scroll indicator)
- [ ] Loader slide-out animation (accent overlay)
- [ ] Per-character entrance timeline
- [ ] Grid fade-in
- [ ] Scroll parallax on `.hero__content`
- [ ] Bouncing arrow

**Acceptance criteria:**
- Loader animates out on first paint
- Characters stagger in smoothly
- Parallax scrubs with scroll without jump
- Hero CSS matches design system

**Files:** `src/sections/hero.js`, `src/style.css` (`.hero__*`)

---

### T06 — Marquee Section
**Branch:** `feat/T06-marquee`  
**Status:** ✅ Done  
**Depends on:** T02

**Scope:**
- [ ] Two-row bidirectional infinite marquee
- [ ] Duplicated content for seamless loop
- [ ] Hover `timeScale(0.4)` on both rows
- [ ] Accent separators, borders top/bottom

**Acceptance criteria:**
- No gap/jump in loop
- Rows move opposite directions
- Hover slows both rows

**Files:** `src/sections/marquee.js`, `src/style.css` (`.marquee__*`)

---

### T07 — Pinned Reveal Section
**Branch:** `feat/T07-pinned-reveal`  
**Status:** ✅ Done  
**Depends on:** T03

**Scope:**
- [ ] `400vh` section height
- [ ] Pin `.pinned__container`
- [ ] Progress bar scrub
- [ ] 3 panels with crossfade timeline (scrub-based)
- [ ] Shimmer effect on mock visuals

**Acceptance criteria:**
- Container stays pinned for full scroll range
- Panels transition sequentially without overlap glitches
- Progress bar fills left-to-right

**Files:** `src/sections/pinned-reveal.js`, `src/style.css` (`.pinned__*`)

---

### T08 — Horizontal Scroll Section
**Branch:** `feat/T08-horizontal-scroll`  
**Status:** ✅ Done  
**Depends on:** T03, T04 (for data-cursor)

**Scope:**
- [ ] 5 project cards in horizontal track
- [ ] Vertical scroll drives horizontal movement (pin + scrub)
- [ ] Tween `id: 'horiz-anim'` for containerAnimation
- [ ] Per-card scale/opacity entrance
- [ ] `data-cursor="expand"` on cards

**Acceptance criteria:**
- No horizontal scrollbar visible
- Pin releases cleanly at end
- Cards animate in as they enter viewport
- `invalidateOnRefresh: true` — resize doesn't break width

**Files:** `src/sections/horizontal-scroll.js`, `src/style.css` (`.horiz__*`)

---

### T09 — Text Reveal Section
**Branch:** `feat/T09-text-reveal`  
**Status:** ✅ Done  
**Depends on:** T03

**Scope:**
- [ ] Word spans with muted default state
- [ ] Scrubbed illumination to primary color
- [ ] Centered layout, display typography

**Acceptance criteria:**
- Words light up progressively while scrolling
- Readable on mobile (font scales via clamp)

**Files:** `src/sections/text-reveal.js`, `src/style.css` (`.text-reveal__*`)

---

### T10 — SVG Path Section
**Branch:** `feat/T10-svg-path`  
**Status:** ✅ Done  
**Depends on:** T03

**Scope:**
- [ ] SVG wave path with `getTotalLength()` draw
- [ ] 4 milestone dots + labels
- [ ] Scrubbed stroke + milestone fade-ins
- [ ] `aria-label` on SVG wrapper

**Acceptance criteria:**
- Path draws smoothly with scroll
- Milestones appear in sequence
- Responsive scaling via `viewBox`

**Files:** `src/sections/svg-path.js`, `src/style.css` (`.svg-path__*`)

---

### T11 — Stagger Cards Section
**Branch:** `feat/T11-stagger-cards`  
**Status:** ✅ Done  
**Depends on:** T02

**Scope:**
- [ ] 6-card grid (3/2/1 responsive columns)
- [ ] Scroll entrance stagger
- [ ] GSAP hover animations (y, border, shadow)

**Acceptance criteria:**
- Cards enter with stagger on scroll into view
- Hover uses GSAP (not CSS transition) and reverses cleanly

**Files:** `src/sections/stagger-cards.js`, `src/style.css` (`.cards__*`)

---

### T12 — Outro Section
**Branch:** `feat/T12-outro`  
**Status:** ✅ Done  
**Depends on:** T03

**Scope:**
- [ ] Fullscreen outro with inverted color scheme
- [ ] Body background transition on ScrollTrigger enter/leaveBack
- [ ] Staggered bounce headline chars
- [ ] GitHub CTA link + `arvinebrahimi.dev`
- [ ] Noise texture overlay

**Acceptance criteria:**
- Background flips to accent when outro enters
- Reverts when scrolling back up
- CTA link works and has focus style

**Files:** `src/sections/outro.js`, `src/style.css` (`.outro__*`)

---

### T13 — Responsive, Accessibility & Polish
**Branch:** `feat/T13-responsive-a11y`  
**Status:** ⬜ Pending  
**Depends on:** T05–T12

**Scope:**
- [ ] Mobile: horizontal → vertical card stack (`≤768px`)
- [ ] `prefers-reduced-motion` JS guards in all section inits
- [ ] `:focus-visible` styles on interactive elements
- [ ] Global `ScrollTrigger.refresh()` after all inits
- [ ] Remove any dev `markers: true`
- [ ] Cross-browser spot check (Chrome, Firefox, Safari if available)

**Acceptance criteria:**
- No broken layout on 375px viewport
- Reduced motion: no infinite animations, no Lenis
- Tab navigation shows visible focus on CTA/links

**Files:** `src/style.css`, `src/main.js`, section files as needed

---

### T14 — README & Final QA
**Branch:** `feat/T14-readme-qa`  
**Status:** ⬜ Pending  
**Depends on:** T13

**Scope:**
- [ ] Update `README.md` (features, stack, run, build, demo link)
- [ ] Full page QA pass
- [ ] `npm run build` clean
- [ ] Optional: add `preview` script verification

**Acceptance criteria:**
- README reflects actual project state
- Build artifact works via `npm run preview`
- All checklist items from PROJECT_SPEC §13 pass

**Files:** `README.md`

---

## Master Checklist (mirror of spec)

```
[ ] T01  vite.config.js + package.json + project skeleton
[ ] T02  Design tokens + global CSS
[ ] T03  Lenis + ScrollTrigger sync
[ ] T04  Custom cursor (all states)
[ ] T05  Hero: loader + per-char + parallax
[ ] T06  Marquee: bidirectional + hover speed
[ ] T07  Pinned: pin + progress + panel timeline
[ ] T08  Horizontal: scrub + per-card + horiz-anim id
[ ] T09  Text reveal: word illumination
[ ] T10  SVG path: strokeDashoffset + milestones
[ ] T11  Stagger cards: entrance + GSAP hover
[ ] T12  Outro: theme inversion + CTA
[ ] T13  Responsive + reduced motion + a11y
[ ] T14  README + final QA
```

---

## Execution Order (recommended serial path)

For a single developer/agent, this order minimizes rework:

| Order | Task | Est. complexity |
|-------|------|-----------------|
| 1 | T01 Scaffold | Low |
| 2 | T02 Design system | Medium |
| 3 | T03 Lenis | Medium |
| 4 | T04 Cursor | Medium |
| 5 | T05 Hero | High |
| 6 | T06 Marquee | Low |
| 7 | T07 Pinned | High |
| 8 | T08 Horizontal | High |
| 9 | T09 Text reveal | Low |
| 10 | T10 SVG path | Medium |
| 11 | T11 Stagger cards | Medium |
| 12 | T12 Outro | Medium |
| 13 | T13 Responsive/a11y | Medium |
| 14 | T14 README/QA | Low |

---

## Current Progress

| Task | Branch | PR | Status |
|------|--------|-----|--------|
| T01 | `feat/T01-scaffold` | merged | ✅ Done |
| T02 | `feat/T02-design-system` | merged | ✅ Done |
| T03 | `feat/T03-lenis` | merged | ✅ Done |
| T04 | `feat/T04-cursor` | merged | ✅ Done |
| T05 | `feat/T05-hero` | merged | ✅ Done |
| T06 | `feat/T06-marquee` | merged | ✅ Done |
| T07 | `feat/T07-pinned-reveal` | merged | ✅ Done |
| T08 | `feat/T08-horizontal-scroll` | merged | ✅ Done |
| T09 | `feat/T09-text-reveal` | merged | ✅ Done |
| T10 | `feat/T10-svg-path` | merged | ✅ Done |
| T11 | `feat/T11-stagger-cards` | merged | ✅ Done |
| T12 | `feat/T12-outro` | merged | ✅ Done |
| T13 | — | — | ⬜ Pending |
| T14 | — | — | ⬜ Pending |

> این جدول بعد از هر PR merge به‌روز می‌شود.

---

## Notes for Implementation Agent

1. **Scope discipline:** هر PR فقط فایل‌های همان تسک را تغییر دهد. CSS مشترک را در T02 پایه بگذار، در تسک‌های بعد فقط بلوک section مربوطه را اضافه کن.
2. **No premature optimization:** `will-change` و GPU hacks فقط اگر jank دیدی.
3. **Test before PR:** همیشه `npm run build` قبل از push.
4. **Empty stubs:** در T01 همه `init*()` باید no-op باشند تا `main.js` از روز اول کار کند.
5. **Git:** هیچ‌وقت مستقیم به `main` push نکن برای feature work.

---

*Task plan version: 1.0 · Ready to start with T01*
