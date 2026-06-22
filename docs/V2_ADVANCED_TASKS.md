# ScrollForge V2 — Advanced Task Plan

> **هدف:** ارتقای ScrollForge از یک scroll demo خوب به یک **agency-grade cinematic experience** در سطح Awwwards / Locomotive / Active Theory.  
> **قانون طلایی:** هر تسک = یک branch جدا → commit → push → PR → merge به `main`.  
> **Agent rule:** مثل senior fullstack developer عمل کن — PRهای کوچک، scope محدود، کیفیت production.

---

## نسخه‌بندی تسک‌ها

```
V1: T01–T14  →  پایه (تکمیل شده ✅)
V2: A01–A40  →  ارتقاهای پیشرفته (این سند)
```

**Branch naming:** `feat/V2-A<nn>-<kebab-case>`  
**Commit:** `feat(scope): imperative description`  
**PR title:** `V2-A<nn>: <Title>`

### Git workflow (الزامی)

```bash
git checkout main && git pull origin main
git checkout -b feat/V2-A01-scroll-orchestrator

# ... implement ...

git add <files>
git commit -m "feat(orchestrator): add central ScrollTrigger lifecycle manager"
git push -u origin feat/V2-A01-scroll-orchestrator

# gh در دسترس نیست → merge دستی:
git checkout main
git merge feat/V2-A01-scroll-orchestrator --no-ff -m "Merge branch 'feat/V2-A01-scroll-orchestrator'"
git push origin main
```

---

## چشم‌انداز V2 — ۱۰۰ پله جلو

| لایه | پله‌ها | هدف |
|------|--------|-----|
| **Architecture** | A01–A05 | زیرساخت مقیاس‌پذیر، debuggable، maintainable |
| **Global UX** | A06–A10 | navigation، progress، preloader، sound، theme |
| **Hero 2.0** | A11–A14 | WebGL، scramble text، depth parallax، hero CTA |
| **Section Upgrades** | A15–A24 | هر section به نسخه cinematic ارتقا پیدا کند |
| **New Sections** | A25–A30 | case study، stats، process، contact، footer |
| **Interaction** | A31–A34 | magnetic UI، FLIP modals، gesture، easter eggs |
| **Performance & QA** | A35–A37 | Lighthouse، reduced motion v2، cross-browser |
| **Deploy & Brand** | A38–A40 | OG/SEO، live deploy، portfolio integration |

**جمع sub-taskها:** ~۱۰۲ آیتم actionable در کل سند.

---

## Dependency Graph (فازبندی)

```
Phase 0 — Foundation
 A01 Orchestrator
 A02 matchMedia system
 A03 Asset preloader
  └─ A04 Global progress nav
      └─ A05 Section transitions veil

Phase 1 — Global Polish
 A06 Sound design (opt-in)
 A07 Theme toggle (dark ↔ light via GSAP)
 A08 Custom scrollbar + scroll progress ring
 A09 Page meta / route shell
 A10 Noise + vignette post-layer

Phase 2 — Hero 2.0
 A11 Three.js particle field
 A12 Text scramble + decode entrance
 A13 Multi-layer parallax depth
 A14 Hero magnetic CTA + reel trigger

Phase 3 — Section Upgrades
 A15 Marquee: velocity-reactive speed
 A16 Pinned: 3D panel tilt + video mockups
 A17 Horizontal: real media + FLIP case modal
 A18 Text reveal: per-word ScrollTrigger zones
 A19 SVG: morphing path between milestones
 A20 Cards: 3D tilt + glassmorphism
 A21 Outro: particle burst + email capture

Phase 4 — New Sections
 A22 Stats counter (scrub)
 A23 Process timeline (vertical)
 A24 Tech stack orbit (interactive)
 A25 Testimonials pinned carousel
 A26 Contact form + micro-interactions
 A27 Footer sitemap + social

Phase 5 — Interaction & Delight
 A28 Magnetic cursor v2 (blend modes)
 A29 Keyboard + section jump nav
 A30 Scroll velocity skew effect
 A31 View Transitions API (progressive)
 A32 Easter egg / Konami unlock

Phase 6 — Ship
 A33 Performance audit + fixes
 A34 Cross-browser + device QA matrix
 A35 README v2 + demo video/GIF
 A36 Deploy (Vercel/GitHub Pages)
 A37 Lighthouse CI gate
 A38–A40 Buffer / polish tasks
```

---

## Phase 0 — Architecture & Foundation

### V2-A01 — Scroll Orchestrator
**Branch:** `feat/V2-A01-scroll-orchestrator`  
**Priority:** P0 · **Status:** ✅ Done  
**Depends on:** —

**ایده:** یک `ScrollOrchestrator` مرکزی که lifecycle همه sectionها را مدیریت کند — init، refresh، destroy، pause/resume.

**Scope:**
- [ ] `src/core/orchestrator.js` — register/unregister sections
- [ ] `src/core/section-base.js` — abstract contract: `init()`, `destroy()`, `refresh()`
- [ ] Refactor `main.js` به orchestrator-driven init
- [ ] `gsap.context()` per section برای cleanup تمیز
- [ ] Global `ScrollTrigger.batch()` برای performance
- [ ] Dev-only debug panel (`import.meta.env.DEV`)

**Acceptance:**
- [ ] هیچ ScrollTrigger orphan بعد از hot reload نماند
- [ ] `npm run build` بدون error
- [ ] همه sectionهای فعلی بدون regression کار کنند

**Files:** `src/core/*`, `src/main.js`, `src/sections/*.js` (minimal refactor)

---

### V2-A02 — ScrollTrigger.matchMedia System
**Branch:** `feat/V2-A02-match-media`  
**Priority:** P0 · **Status:** ✅ Done  
**Depends on:** A01

**ایده:** انیمیشن‌های کاملاً متفاوت برای desktop / tablet / mobile / reduced-motion — نه فقط CSS hide.

**Scope:**
- [ ] `src/utils/match-media.js` — wrapper برای `ScrollTrigger.matchMedia()`
- [ ] Breakpoints: `(min-width: 1024px)`, `(max-width: 768px)`, `(prefers-reduced-motion: reduce)`
- [ ] Horizontal scroll: desktop = pin+scrub، mobile = stacked + fade (بهبود یافته)
- [ ] Pinned section: desktop = 400vh timeline، mobile = accordion stack
- [ ] مستندسازی pattern در `docs/PATTERNS.md`

**Acceptance:**
- [ ] Resize بین breakpointها بدون glitch
- [ ] reduced-motion: هیچ infinite animation فعال نباشد

---

### V2-A03 — Asset Preloader (Real Progress)
**Branch:** `feat/V2-A03-asset-preloader`  
**Priority:** P0 · **Status:** ✅ Done  
**Depends on:** A01

**ایده:** جایگزینی loader ساده accent با preloader حرفه‌ای — progress bar واقعی بر اساس load فونت‌ها و media.

**Scope:**
- [ ] `src/utils/preloader.js` — track fonts (`document.fonts.ready`) + images
- [ ] Progress 0→100% با GSAP counter روی عدد
- [ ] `.loader` redesign: logo mark + progress line + percentage
- [ ] `sessionStorage` flag: skip loader در visit دوم (optional)
- [ ] Hero animation فقط بعد از `preloader.complete`

**Acceptance:**
- [ ] Progress واقعی است نه fake timer
- [ ] CLS صفر — محتوا قبل از reveal نمایش داده نشود

---

### V2-A04 — Global Scroll Progress Navigation
**Branch:** `feat/V2-A04-scroll-nav`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** A01, A03

**ایده:** نوار ناوبری ثابت (مثل Locomotive/Stripe) — dots یا section labels + progress bar + active section highlight.

**Scope:**
- [ ] Fixed right rail: ۸ dot + tooltip section name
- [ ] Click dot → `lenis.scrollTo()` + `ScrollToPlugin` fallback
- [ ] Active dot با `--accent` fill + scale
- [ ] Mobile: bottom pill bar با section abbreviation
- [ ] `aria-current="true"` روی section فعال
- [ ] Hide در outro section

**Acceptance:**
- [ ] Keyboard: Tab + Enter روی dots کار کند
- [ ] Scroll sync بدون lag

---

### V2-A05 — Section Transition Veil
**Branch:** `feat/V2-A05-section-veil`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** A01

**ایده:** بین sectionها یک veil نازک (clip-path wipe یا gradient sweep) برای حس continuity سینماتیک.

**Scope:**
- [ ] `src/utils/section-veil.js`
- [ ] ScrollTrigger `onEnter` هر section: accent wipe 0.4s
- [ ] `prefers-reduced-motion`: instant cut
- [ ] Z-index مدیریت شده — تداخل با pin نداشته باشد

**Acceptance:**
- [ ] Wipe روی همه ۸ section حس شود، نه فقط hero

---

## Phase 1 — Global Experience Layer

### V2-A06 — Sound Design (Opt-in)
**Branch:** `feat/V2-A06-sound-design`  
**Priority:** P2 · **Status:** ✅ Done  
**Depends on:** A04

**ایده:** subtle UI sounds — hover tick، scroll whoosh، section enter chime. کاملاً opt-in.

**Scope:**
- [ ] `src/utils/sound.js` — Web Audio API، mute toggle در nav
- [ ] `localStorage` preference
- [ ] Sounds: `public/audio/` (≤50KB each، compressed)
- [ ] No autoplay — اولین click فعال‌سازی
- [ ] reduced-motion = muted by default

---

### V2-A07 — Theme Toggle (GSAP Color Morph)
**Branch:** `feat/V2-A07-theme-toggle`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** A02

**ایده:** dark (فعلی) ↔ light با morph تمام CSS variables توسط GSAP — نه snap.

**Scope:**
- [ ] Light palette در `:root[data-theme="light"]`
- [ ] `gsap.to(document.documentElement, { ...cssVars })` — یا manual lerp
- [ ] Toggle در nav + `prefers-color-scheme` initial
- [ ] Outro section palette-aware
- [ ] Persist در `localStorage`

---

### V2-A08 — Custom Scrollbar + Progress Ring
**Branch:** `feat/V2-A08-scroll-progress`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** A04

**ایده:** scrollbar سفارشی نازک + حلقه progress دور viewport (مثل Apple Watch activity ring).

**Scope:**
- [ ] SVG ring در گوشه: `stroke-dashoffset` با scroll
- [ ] Thin scrollbar track با `--accent` thumb
- [ ] مخفی در mobile

---

### V2-A09 — SEO, OG & Meta Shell
**Branch:** `feat/V2-A09-seo-meta`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** —

**Scope:**
- [ ] `index.html`: Open Graph، Twitter Card، canonical
- [ ] `public/og-image.png` (1200×630) — generate یا placeholder
- [ ] `robots.txt`، `sitemap.xml`
- [ ] JSON-LD `WebSite` + `Person` schema
- [ ] `lang` attribute + hreflang اگر لازم

---

### V2-A10 — Global Post-Processing Layer
**Branch:** `feat/V2-A10-post-layer`  
**Priority:** P1 · **Status:** ✅ Done  
**Depends on:** —

**ایده:** film grain + vignette + subtle chromatic aberration on scroll velocity — pure CSS/SVG، بدون WebGL.

**Scope:**
- [ ] `::after` fixed overlay با animated noise SVG
- [ ] Vignette radial-gradient
- [ ] Velocity-based aberration (tie to Lenis velocity در A30)
- [ ] `pointer-events: none`، `mix-blend-mode: overlay`

---

## Phase 2 — Hero 2.0

### V2-A11 — Three.js Particle Field (Hero Background)
**Branch:** `feat/V2-A11-hero-particles`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A01, A03

**ایده:** میدان particle سبز acid روی near-black — react به mouse و scroll. سبک Active Theory.

**Scope:**
- [ ] `three` dependency (`^0.16`)
- [ ] `src/webgl/hero-particles.js` — Points + custom shader یا PointsMaterial
- [ ] Canvas `position: absolute` در `#hero`، behind content
- [ ] Mouse parallax + scroll dispersion
- [ ] `prefers-reduced-motion`: static یا hidden
- [ ] `destroy()` در orchestrator cleanup
- [ ] DPR cap `Math.min(devicePixelRatio, 2)`

**Acceptance:**
- [ ] 60fps روی GTX 1060 / M1 equivalent
- [ ] Canvas resize handled

---

### V2-A12 — Text Scramble + Decode Entrance
**Branch:** `feat/V2-A12-hero-scramble`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A03, A11

**ایده:** قبل از per-char reveal، یک فاز scramble/decode (کاراکترهای random → SCROLL EXPERIENCE).

**Scope:**
- [ ] `src/utils/scramble-text.js` — custom impl (بدون Club plugin)
- [ ] Charset: `01ABCDEF!@#$%`
- [ ] Timeline: scramble 0.6s → resolve 0.8s → existing char stagger
- [ ] Subtext typewriter effect

---

### V2-A13 — Multi-Layer Depth Parallax
**Branch:** `feat/V2-A13-hero-depth`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A11

**ایده:** ۳ لایه depth — grid، particles، typography — هر کدام speed متفاوت.

**Scope:**
- [ ] `data-depth="0.2|0.5|1"` attribute system
- [ ] ScrollTrigger scrub per layer
- [ ] Mouse move subtle shift (`quickTo`)
- [ ] Grid lines perspective transform (CSS `perspective`)

---

### V2-A14 — Hero Showreel Trigger
**Branch:** `feat/V2-A14-hero-reel`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A12

**ایده:** دکمه `WATCH REEL` — fullscreen video overlay با GSAP scale-from-dot transition.

**Scope:**
- [ ] `public/video/showreel.mp4` (placeholder یا compressed loop)
- [ ] Modal: backdrop blur + video player
- [ ] Open: `scale: 0 → 1` از موقعیت دکمه (FLIP)
- [ ] Close: Escape + click outside
- [ ] `data-cursor="text"` → label "PLAY"

---

## Phase 3 — Section Upgrades

### V2-A15 — Marquee: Velocity-Reactive
**Branch:** `feat/V2-A15-marquee-velocity`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01

**ایده:** سرعت marquee به scroll velocity وابسته — scroll سریع = marquee تندتر.

**Scope:**
- [ ] Lenis `scroll` event → velocity normalize
- [ ] `timeScale(1 + velocity * 0.5)` clamped
- [ ] Row 2 offset phase shift برای organic feel
- [ ] Gradient mask چپ/راست (fade edges)

---

### V2-A16 — Pinned Reveal: 3D Tilt + Video Mockups
**Branch:** `feat/V2-A16-pinned-3d`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A02

**ایده:** panelها با `rotateX/rotateY` subtle tilt به mouse؛ visualها video loop کوتاه.

**Scope:**
- [ ] `transform-style: preserve-3d` روی panel
- [ ] Mouse tilt `quickTo` max ±8deg
- [ ] `public/video/feature-0*.mp4` — 3 placeholder loops
- [ ] Video lazy load فقط وقتی panel active
- [ ] Timeline panel crossfade بهبود یافته با `z-index` management

---

### V2-A17 — Horizontal: Real Media + Case Study Modal
**Branch:** `feat/V2-A17-horizontal-modal`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A02, A01

**ایده:** تصاویر واقعی پروژه + کلیک کارت → fullscreen case study با FLIP animation.

**Scope:**
- [ ] `public/images/projects/` — 5 project images (WebP)
- [ ] `src/components/case-modal.js`
- [ ] FLIP: card rect → fullscreen modal
- [ ] Modal content: title، tags، description، live link
- [ ] Lenis `stop()` وقتی modal open
- [ ] Focus trap + `aria-modal="true"`

---

### V2-A18 — Text Reveal: Per-Word Scroll Zones
**Branch:** `feat/V2-A18-text-zones`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01

**ایده:** upgrade از stagger ساده به Linear-style — هر کلمه trigger مستقل با `start` محاسبه‌شده.

**Scope:**
- [ ] هر `.reveal-word` یک ScrollTrigger جدا
- [ ] `start: "top 85%"` per word با offset index
- [ ] Active word: `--accent` color + `font-weight: 600`
- [ ] Past words: `--text-primary`، future: `--text-muted`

---

### V2-A19 — SVG Path: Morphing Milestones
**Branch:** `feat/V2-A19-svg-morph`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01

**ایده:** path بین milestoneها morph کند (GSAP MorphSVG نیست — استفاده از `d` attribute lerp یا چند path crossfade).

**Scope:**
- [ ] 4 segment path جداگانه
- [ ] Sequential draw per segment
- [ ] Milestone dot pulse animation (`scale` yoyo)
- [ ] Label slide-up on activate
- [ ] Mobile: simplified 2-milestone version

---

### V2-A20 — Cards: 3D Tilt + Glassmorphism
**Branch:** `feat/V2-A20-cards-3d`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01

**ایده:** کارت‌ها glass effect + tilt 3D به mouse + gradient border animated.

**Scope:**
- [ ] `backdrop-filter: blur(12px)`
- [ ] `conic-gradient` animated border (CSS `@property` یا GSAP)
- [ ] Tilt max 12deg با glare highlight
- [ ] Icon SVG جایگزین emoji
- [ ] Stagger entrance با `scrollTrigger.batch`

---

### V2-A21 — Outro: Particle Burst + Email CTA
**Branch:** `feat/V2-A21-outro-burst`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A11

**ایده:** ورود به outro = burst of lime particles؛ CTA اصلی `GET IN TOUCH` با mailto یا form link.

**Scope:**
- [ ] Reuse particle system (lite version) برای burst
- [ ] Headline glitch 0.2s قبل از settle
- [ ] `clipboard copy` برای email
- [ ] Body bg morph بهبود یافته با `will-change`

---

## Phase 4 — New Sections

### V2-A22 — Stats Counter Section (NEW)
**Branch:** `feat/V2-A22-stats-section`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01, A04

**ایده:** section جدید بین cards و outro — اعداد بزرگ scrub-driven: `50+ Projects`, `3M+ Lines`, `99 Lighthouse`.

**Scope:**
- [ ] `#stats` section در `index.html`
- [ ] `src/sections/stats.js`
- [ ] `gsap.utils.snap` counter scrub
- [ ] ۴ ستون با `--accent` numbers
- [ ] CSS + nav dot اضافه شود (۹ section)

---

### V2-A23 — Process Timeline Section (NEW)
**Branch:** `feat/V2-A23-process-timeline`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A02

**ایده:** timeline عمودی: Discover → Design → Develop → Deploy — خط accent draw روی scroll.

**Scope:**
- [ ] `#process` section
- [ ] Central line + alternating left/right steps
- [ ] Step number + icon + description
- [ ] Pin optional در desktop

---

### V2-A24 — Tech Stack Orbit (NEW)
**Branch:** `feat/V2-A24-stack-orbit`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A11

**ایده:** لوگوهای tech در مدار چرخان (CSS 3D یا Three.js) — hover روی هر لوگو pause + tooltip.

**Scope:**
- [ ] `public/icons/stack/` — SVG logos
- [ ] Orbit animation با `rotationY` infinite
- [ ] Hover: scale + glow accent
- [ ] Click: filter marquee به آن tech

---

### V2-A25 — Testimonials Pinned Carousel (NEW)
**Branch:** `feat/V2-A25-testimonials`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A02

**ایده:** section pin شده با ۴ quote — scroll عمودی → quote بعدی fade + slide.

**Scope:**
- [ ] `#testimonials` section
- [ ] Avatar + name + role + quote
- [ ] Progress dots پایین
- [ ] Typography: large italic quote

---

### V2-A26 — Contact Form Section (NEW)
**Branch:** `feat/V2-A26-contact-form`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A07

**ایده:** فرم minimal — name, email, message — micro-interactions روی focus (label float, border glow).

**Scope:**
- [ ] `#contact` section قبل از outro
- [ ] Formspree یا `mailto:` fallback (no backend)
- [ ] Field validation UI
- [ ] Submit: GSAP success checkmark animation
- [ ] `aria-invalid` + error messages

---

### V2-A27 — Footer + Social Bar (NEW)
**Branch:** `feat/V2-A27-footer`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A09

**Scope:**
- [ ] Footer بعد از outro: copyright، links، social icons
- [ ] `data-cursor="expand"` روی social
- [ ] Back-to-top button با `lenis.scrollTo(0)`
- [ ] Site version + build date (vite inject)

---

## Phase 5 — Interaction & Delight

### V2-A28 — Cursor v2 (Blend Modes + Trail)
**Branch:** `feat/V2-A28-cursor-v2`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A01

**ایده:** cursor با `mix-blend-mode: difference`، trail dots، state `drag` برای horizontal section.

**Scope:**
- [ ] ۳ trail dot با opacity decay
- [ ] Blend mode روی light theme (A07) تست شود
- [ ] State `drag` وقتی mouse down در horizontal
- [ ] Performance: max 3 trail elements

---

### V2-A29 — Keyboard Section Navigation
**Branch:** `feat/V2-A29-keyboard-nav`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A04

**Scope:**
- [ ] `↑/↓` یا `J/K`: jump section
- [ ] `Home/End`: first/last section
- [ ] `?`: shortcut overlay help
- [ ] Respect focus در input fields

---

### V2-A30 — Scroll Velocity Skew
**Branch:** `feat/V2-A30-velocity-skew`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A10, A03 (Lenis velocity)

**ایده:** وقتی scroll سریع است، sectionها `skewY(±2deg)` subtle — حس speed.

**Scope:**
- [ ] Lenis velocity → `gsap.quickTo` on `#smooth-content`
- [ ] Clamp ±3deg
- [ ] disabled در reduced-motion

---

### V2-A31 — View Transitions API
**Branch:** `feat/V2-A31-view-transitions`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A17

**Scope:**
- [ ] `document.startViewTransition()` برای modal open/close
- [ ] Progressive enhancement — fallback GSAP
- [ ] `::view-transition-old/new` CSS custom

---

### V2-A32 — Easter Egg (Konami / Secret Section)
**Branch:** `feat/V2-A32-easter-egg`  
**Priority:** P3 · **Status:** ⬜  
**Depends on:** A29

**ایده:** Konami code → secret section "Behind the Scenes" با GSAP timeline debug viz.

**Scope:**
- [ ] Key sequence listener
- [ ] Hidden `#backstage` section inject
- [ ] Content: GSAP timeline graph، fps counter، fun facts
- [ ] Achievement toast

---

## Phase 6 — Performance, QA & Ship

### V2-A33 — Performance Audit & Fixes
**Branch:** `feat/V2-A33-perf-audit`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A11, A17 (after heavy assets)

**Scope:**
- [ ] Lighthouse run — target: Performance ≥90، Accessibility ≥95
- [ ] `will-change` audit — remove overuse
- [ ] Image WebP/AVIF pipeline
- [ ] Code-split Three.js: `import()` dynamic
- [ ] Lazy init sections outside viewport (`IntersectionObserver`)

---

### V2-A34 — Cross-Browser QA Matrix
**Branch:** `feat/V2-A34-qa-matrix`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A33

**Scope:**
- [ ] Test: Chrome، Firefox، Safari، Edge
- [ ] Test: iOS Safari، Android Chrome
- [ ] Document نتایج در `docs/QA_MATRIX.md`
- [ ] Fix critical bugs در PRهای جدا

---

### V2-A35 — README v2 + Showcase Assets
**Branch:** `feat/V2-A35-readme-v2`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A36

**Scope:**
- [ ] README: GIF demo، feature list V2، architecture diagram
- [ ] `docs/SHOWCASE.md` — shots برای portfolio
- [ ] Credit section: GSAP، Lenis، Three.js

---

### V2-A36 — Production Deploy
**Branch:** `feat/V2-A36-deploy`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** A33

**Scope:**
- [ ] Vercel یا GitHub Pages config
- [ ] `base` path در vite.config اگر لازم
- [ ] Environment preview URLs
- [ ] Live link در README: `scrollforge.arvinebrahimi.dev`

---

### V2-A37 — Lighthouse CI Gate
**Branch:** `feat/V2-A37-lighthouse-ci`  
**Priority:** P1 · **Status:** ⬜  
**Depends on:** A36

**Scope:**
- [ ] `.github/workflows/lighthouse.yml`
- [ ] Fail PR اگر Performance < 85
- [ ] Artifact upload report

---

### V2-A38 — Micro-Interactions Pass
**Branch:** `feat/V2-A38-micro-interactions`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A20, A26

**Buffer task:** pass نهایی روی همه button/link hover states، ripple، haptic (`navigator.vibrate` mobile).

---

### V2-A39 — Content & Copy Polish
**Branch:** `feat/V2-A39-copy-polish`  
**Priority:** P2 · **Status:** ⬜  
**Depends on:** A22–A27

**Buffer task:** rewrite همه copy به tone حرفه‌ای agency؛ فارسی/انگلیسی consistency.

---

### V2-A40 — Final V2 QA & Sign-off
**Branch:** `feat/V2-A40-v2-signoff`  
**Priority:** P0 · **Status:** ⬜  
**Depends on:** ALL

**Scope:**
- [ ] Full scroll-through recording (60s)
- [ ] همه checklistهای V2 tick
- [ ] Tag release `v2.0.0`
- [ ] Update `IMPLEMENTATION_TASKS.md` با لینک به این سند

---

## پیشنهاد ترتیب اجرا (Critical Path)

| مرحله | تسک‌ها | زمان تقریبی |
|-------|--------|-------------|
| 1 | A01 → A03 | زیرساخت |
| 2 | A02, A09, A10 | parallel |
| 3 | A04, A08 | navigation |
| 4 | A11 → A14 | hero upgrade |
| 5 | A15 → A21 | section upgrades |
| 6 | A22 → A27 | new sections |
| 7 | A28 → A32 | delight |
| 8 | A33 → A37 | ship |
| 9 | A38 → A40 | polish |

---

## Master Checklist V2

```
Phase 0 — Foundation
[✓] A01  Scroll orchestrator + gsap.context cleanup
[✓] A02  ScrollTrigger.matchMedia system
[✓] A03  Real asset preloader
[✓] A04  Global scroll progress nav
[✓] A05  Section transition veil

Phase 1 — Global UX
[✓] A06  Sound design (opt-in)
[✓] A07  Theme toggle GSAP morph
[✓] A08  Scrollbar + progress ring
[✓] A09  SEO / OG / meta
[✓] A10  Grain + vignette post-layer

Phase 2 — Hero 2.0
[ ] A11  Three.js particle field
[ ] A12  Text scramble entrance
[ ] A13  Multi-layer depth parallax
[ ] A14  Showreel video modal

Phase 3 — Section Upgrades
[ ] A15  Velocity-reactive marquee
[ ] A16  Pinned 3D tilt + video
[ ] A17  Horizontal FLIP case modal
[ ] A18  Per-word text zones
[ ] A19  SVG morph milestones
[ ] A20  Cards 3D glass
[ ] A21  Outro particle burst

Phase 4 — New Sections
[ ] A22  Stats counter
[ ] A23  Process timeline
[ ] A24  Tech stack orbit
[ ] A25  Testimonials carousel
[ ] A26  Contact form
[ ] A27  Footer + social

Phase 5 — Interaction
[ ] A28  Cursor v2 trail
[ ] A29  Keyboard nav
[ ] A30  Velocity skew
[ ] A31  View Transitions API
[ ] A32  Easter egg

Phase 6 — Ship
[ ] A33  Performance audit
[ ] A34  Cross-browser QA
[ ] A35  README v2
[ ] A36  Production deploy
[ ] A37  Lighthouse CI
[ ] A38  Micro-interactions pass
[ ] A39  Copy polish
[ ] A40  V2 sign-off
```

---

## Progress Tracker

| Task | Branch | PR | Status |
|------|--------|-----|--------|
| A01 | `feat/V2-A01-scroll-orchestrator` | merged | ✅ Done |
| A02 | `feat/V2-A02-match-media` | merged | ✅ Done |
| A03 | `feat/V2-A03-asset-preloader` | merged | ✅ Done |
| A04 | `feat/V2-A04-scroll-nav` | merged | ✅ Done |
| A05 | `feat/V2-A05-section-veil` | merged | ✅ Done |
| A06 | `feat/V2-A06-sound-design` | merged | ✅ Done |
| A07 | `feat/V2-A07-theme-toggle` | merged | ✅ Done |
| A08 | `feat/V2-A08-scroll-progress` | merged | ✅ Done |
| A09 | `feat/V2-A09-seo-meta` | merged | ✅ Done |
| A10 | `feat/V2-A10-post-layer` | merged | ✅ Done |
| A11 | — | — | ⬜ Pending |
| A12 | — | — | ⬜ Pending |
| A13 | — | — | ⬜ Pending |
| A14 | — | — | ⬜ Pending |
| A15 | — | — | ⬜ Pending |
| A16 | — | — | ⬜ Pending |
| A17 | — | — | ⬜ Pending |
| A18 | — | — | ⬜ Pending |
| A19 | — | — | ⬜ Pending |
| A20 | — | — | ⬜ Pending |
| A21 | — | — | ⬜ Pending |
| A22 | — | — | ⬜ Pending |
| A23 | — | — | ⬜ Pending |
| A24 | — | — | ⬜ Pending |
| A25 | — | — | ⬜ Pending |
| A26 | — | — | ⬜ Pending |
| A27 | — | — | ⬜ Pending |
| A28 | — | — | ⬜ Pending |
| A29 | — | — | ⬜ Pending |
| A30 | — | — | ⬜ Pending |
| A31 | — | — | ⬜ Pending |
| A32 | — | — | ⬜ Pending |
| A33 | — | — | ⬜ Pending |
| A34 | — | — | ⬜ Pending |
| A35 | — | — | ⬜ Pending |
| A36 | — | — | ⬜ Pending |
| A37 | — | — | ⬜ Pending |
| A38 | — | — | ⬜ Pending |
| A39 | — | — | ⬜ Pending |
| A40 | — | — | ⬜ Pending |

---

## نکات برای Agent

1. **هر PR یک تسک** — اگر A17 بزرگ شد، split به `A17a-modal` و `A17b-media` با هماهنگی کاربر.
2. **Three.js = dynamic import** — bundle اصلی سبک بماند.
3. **Media assets** — حتماً WebP، حجم video < 2MB each.
4. **Section count افزایش** — با اضافه شدن section جدید، nav (A04) و `index.html` همزمان آپدیت شود.
5. **Regression** — قبل از هر merge، scroll کامل ۸+ section بدون console error.
6. **قانون برنچ** — هیچ‌وقت مستقیم به `main` push نکن.

---

## ایده‌های آینده (V3 — out of scope)

- WebGL page transitions (full scene morph)
- R3F integration برای interactive 3D objects
- CMS (Sanity) برای project content
- Multi-page با View Transitions between routes
- AI chat widget با motion design
- WebGPU particle compute

---

*V2 Task Plan v1.0 · 40 tasks · ~102 sub-items · Ready to start with V2-A01*
