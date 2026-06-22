# Hero Particles — ریشه‌یابی و طرح رفع باگ

## علائم (بازتولید)
1. بعد از آبجکت سوم (HELIX) ذرات پخش نمی‌شوند
2. ذرات ناپدید می‌شوند
3. اسکرول به بالا ذرات را برنمی‌گرداند — فقط refresh کمک می‌کند

## ریشه‌های واقعی

### A. `progress` گیر می‌کند (مهم‌ترین)
- `setProgress` فقط از `onUpdate` هیرو صدا زده می‌شود
- با `pinReparent`، بعد از خروج از محدوده pin ممکن است callbackها نامنظم باشند
- `scrollProgress` روی `1` + morph در حالت burst می‌ماند → ذرات دور دوربین → **نامرئی**

**رفع:** هر فریم در render loop مستقیم از `ScrollTrigger.getById('hero-scroll').progress` بخوان.

### B. پخش خارج از frustum
- `buildBurst` + offset اضافی در render → فاصله زیاد → `gl_PointSize` کوچک → نامرئی
- قبلاً fog هم بود (حذف شد)

**رفع:** burst فقط در morphTarget، شعاع max ~۱۰، `uSizeBoost` در shader هنگام burst.

### C. canvas از لایه جدا می‌شود
- `pinReparent` فقط `.hero__layers` را جابه‌جا می‌کند؛ canvas داخل layers است اما resize/visibility نامطمئن

**رفع:** wrapper `.hero__pin` — canvas + layers با هم pin می‌شوند.

### D. lag موقعیت هنگام برگشت
- positions در burst گیر می‌کنند؛ morph به helix برمی‌گردد اما lerp کند

**رفع:** هنگام `progress ↓` از snap ≥ 0.35 استفاده شود؛ optional hard-sync اگر فاصله > 15.

## معماری جدید

```
#hero
  .hero__pin          ← ScrollTrigger pin target
    .hero__canvas-host ← WebGL canvas (absolute inset 0)
    .hero__layers      ← UI content (z-index above)
```

## فازهای progress (بدون تغییر)
| progress | فاز |
|----------|-----|
| 0–0.18 | ATOM hold |
| 0.18–0.32 | morph → ROCKET |
| 0.32–0.5 | ROCKET hold |
| 0.5–0.64 | morph → HELIX |
| 0.64–0.78 | HELIX hold |
| 0.78–1.0 | BURST (پخش — بدون fade) |

## قوانین رندر
- ❌ بدون fog
- ❌ بدون uGlobalOpacity fade
- ❌ بدون offset burst اضافی در render (فقط morphTarget)
- ✅ ST progress هر فریم
- ✅ uSizeBoost = 1 + burstT * 0.8
- ✅ alphas burst ≥ 0.7

## ریشه قطعی (باگ NaN) — 2026-06-22

```js
// ❌ باگ: helix یک object است نه Float32Array
buildBurst(PARTICLE_COUNT, helix);

// در buildBurst: from[i3] === undefined → NaN
// از progress 0.78 (burst) همه ذرات NaN → ناپدید
// برگشت اسکرول: positions همچنان NaN تا refresh

// ✅ رفع
buildBurst(PARTICLE_COUNT, helix.positions);
```

برای تأیید deploy: `#hero` باید `data-hero-build="2026-06-22-burst-fix"` داشته باشد.
- [ ] اسکرول کامل: اتم → موشک → هلیکس → پخش واضح
- [ ] ذرات در burst محو نمی‌شوند
- [ ] برگشت به بالا: شکل‌ها برمی‌گردند بدون refresh
- [ ] refresh صفحه: همچنان درست
