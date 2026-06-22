# Hero — مشخصات کامل (ScrollForge v2)

> سند مرجع برای سکشن `#hero`: چیدمان، سناریوی اسکرول، سیستم ذرات، و معیار پذیرش.

---

## ۱. هدف تجربه

هیرو اولین تماس کاربر با ScrollForge است. باید:

1. **بلافاصله** یک شکل قابل‌تشخیص از ذرات ببیند (نه ابر تصادفی).
2. با **سه مرحله اسکرول** سه آبجکت سینمایی ببیند.
3. در **مرحله چهارم** ذرات پخش شوند و محو شوند تا ورود به `#marquee` طبیعی باشد.
4. تایپوگرافی و CTA در **یک viewport تمیز** بمانند — بدون فاصله اضافه از بالا/پایین.

---

## ۲. مشکلات نسخه قبلی (رفع‌شده در این پیاده‌سازی)

| مشکل | علت | راه‌حل |
|------|-----|--------|
| فاصله زیاد بالا/پایین | `height: 400vh` + `align-items: center` — محتوا وسط ۴۰۰vh قرار می‌گرفت | حذف flex-center؛ pin فقط روی `100vh`؛ ارتفاع اسکرول با `end: +=300%` |
| شکل‌ها ضعیف | نمونه‌برداری تصادفی بدون سیلوئت | `hero-shapes.js` — هندسه پارامتری (اتم، موشک، هلیکس DNA) |
| سناریو مبهم | morph خطی روی کل اسکرول | ۵ فاز با **hold** بین morphها + برچسب مرحله |
| باگ سایز canvas | `section.clientHeight` = ۴۰۰vh | سایز از `.hero__layers` (۱۰۰vh) |
| ناهماهنگی Lenis | `window.scroll` جدا از ScrollTrigger | progress فقط از `ScrollTrigger.onUpdate` |

---

## ۳. ساختار DOM

```html
<section id="hero" class="section section--hero">
  <div class="hero__layers">           <!-- pinned, height: 100svh -->
    <canvas class="hero__particles">   <!-- WebGL, z-index 0 -->
    <div class="hero__grid">           <!-- parallax grid -->
    <div class="hero__stage">          <!-- label + progress dots -->
    <div class="hero__content">        <!-- title, sub, CTA -->
    <div class="hero__scroll-indicator">
  </div>
</section>
```

---

## ۴. چیدمان (Layout)

### سکشن بیرونی `#hero`
- `padding: 0` — بدون `--section-pad-y` عمومی
- ارتفاع اسکرول توسط **ScrollTrigger pinSpacing** تولید می‌شود (`end: +=300%` ≈ ۴ viewport کل)

### لایه پین‌شده `.hero__layers`
- `height: 100svh` / `min-height: 100vh`
- `display: flex; flex-direction: column; justify-content: flex-end`
- padding افقی: `var(--section-pad-x)`
- padding عمودی: `clamp(4.5rem, 10vh, 6rem)` بالا (فضای nav) · `clamp(1.5rem, 4vh, 2.5rem)` پایین
- محتوا نزدیک **مرکز-پایین** viewport — نه شناور در وسط ۴۰۰vh

### ذرات
- `position: absolute; inset: 0` داخل layers
- مرکز آبجکت: `(0, 2, 0)` در فضای Three.js — کمی بالاتر از تایتل
- دوربین: `z = 24`, FOV 55°

---

## ۵. سناریوی اسکرول (۵ فاز)

Progress از ScrollTrigger: `0 → 1` روی `end: +=300%`.

| Progress | فاز | رفتار ذرات | UI |
|----------|-----|------------|-----|
| `0.00 – 0.18` | **Hold 1** | اتم پایدار (هسته + ۳ مدار) | `01 — ATOM` · dot 1 |
| `0.18 – 0.32` | **Morph A→B** | اتم → موشک | label fade |
| `0.32 – 0.50` | **Hold 2** | موشک پایدار | `02 — ROCKET` · dot 2 |
| `0.50 – 0.64` | **Morph B→C** | موشک → هلیکس DNA | label fade |
| `0.64 – 0.78` | **Hold 3** | هلیکس پایدار | `03 — HELIX` · dot 3 |
| `0.78 – 1.00` | **Burst** | هلیکس → پخش + محو opacity | dots خاموش · indicator محو |

### انیمیشن ورود (بدون اسکرول)
- ۱.۲ ثانیه: ذرات از نقطه مرکزی به **اتم** جمع می‌شوند (`intro` 0→1)
- تایتل و sub طبق timeline موجود hero.js

### Easing morph
- `power3.inOut` روی t هر فاز morph
- در holdها morph ثابت — کاربر وقت دارد شکل را ببیند

---

## ۶. آبجکت‌های ذراتی

**تعداد:** `2000` ذره · رنگ `#c8f04e` · additive blending · size `0.11` (hold) / `0.09` (morph)

### ۶.۱ اتم (Atom)
- **۱۲٪** هسته: توزیع فیبوناچی روی کره `r ≈ 1.8`
- **۸۸٪** سه مدار بیضوی با محورهای متفاوت (`rx=8, ry=5`) و tilt ±60°
- چرخش آهسته مدارها در render loop

### ۶.۲ موشک (Rocket)
- **۵۵٪** بدنه استوانه: `y ∈ [-5, 5]`, `r ∈ [1.8, 2.4]`
- **۲۰٪** نوک مخروط: `y ∈ [5, 10]`, radius خطی به صفر
- **۱۵٪** سه باله مثلثی در `y ≈ -5`
- **۱۰٪** شعله خروجی: `y ∈ [-9, -5]`, spread افقی

### ۶.۳ هلیکس DNA (Helix)
- دو رشته مارپیچ: `r=4`, pitch `2π/6`, `y ∈ [-8, 8]`
- ۵۰٪ ذرات هر رشته — اتصالات rung هر ۸ ذره (پل بین رشته‌ها)

### ۶.۴ پخش (Burst)
- هر ذره به سمت بردار `(random X, -random Y, random Z)` با `Y` منفی (سقوط به پایین)
- opacity: `1 → 0` از progress `0.82`

---

## ۷. ScrollTrigger (hero.js)

```js
ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top',
  end: '+=300%',
  pin: '.hero__layers',
  pinSpacing: true,
  anticipatePin: 1,
  scrub: 0.6,
  onUpdate: (self) => {
    particles.setProgress(self.progress);
    updateStageUI(self.progress);
  },
});
```

- **یک** pin — depth parallax عمودی حذف (تداخل با pin)
- parallax ماوس روی `[data-depth]` حفظ می‌شود

---

## ۸. UI مرحله (`.hero__stage`)

- گوشه بالا-چپ (زیر nav): برچسب monospace `01 — ATOM`
- سه نقطه progress — active با `--accent`
- `prefers-reduced-motion`: ذرات غیرفعال، فقط تایتل

---

## ۹. فایل‌ها

| فایل | نقش |
|------|-----|
| `docs/HERO_SPEC.md` | این سند |
| `src/webgl/hero-shapes.js` | تولید point cloud هر شکل |
| `src/webgl/hero-particles.js` | Three.js render + morph |
| `src/sections/hero.js` | DOM, pin, stage UI, load anim |
| `src/style.css` | `.section--hero`, `.hero__*` |

---

## ۱۰. معیار پذیرش (QA)

- [ ] بارگذاری: ذرات شکل **اتم** واضح — نه ابر پراکنده
- [ ] viewport اول: تایتل بدون gap غیرعادی بالا/پایین
- [ ] اسکرول ۱: اتم → موشک با morph روان
- [ ] اسکرول ۲: موشک → هلیکس
- [ ] اسکرول ۳: hold هلیکس سپس پخش به پایین
- [ ] خروج هیرو: opacity ذرات ≈ 0 قبل از `#marquee`
- [ ] resize: canvas بدون stretch
- [ ] `prefers-reduced-motion`: بدون WebGL، layout سالم
- [ ] موبایل `≤768px`: شکل‌ها خوانا، stage label کوچک‌تر

---

## ۱۱. ثابت‌های قابل تنظیم

```js
// hero-shapes.js
export const PARTICLE_COUNT = 2000;

// hero.js ScrollTrigger
const HERO_SCROLL_END = '+=300%';  // 4× viewport feel

// hero-particles.js phases
const PHASES = {
  hold1: [0, 0.18],
  morph1: [0.18, 0.32],
  hold2: [0.32, 0.50],
  morph2: [0.50, 0.64],
  hold3: [0.64, 0.78],
  burst: [0.78, 1.0],
};
```

---

*آخرین به‌روزرسانی: 2026-06-22 — بازنویسی کامل پس از بازخورد UX*
