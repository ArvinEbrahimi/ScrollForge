import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { scrambleChars, typewriter } from '../utils/scramble-text.js';
import { createShowreelModal } from '../components/showreel-modal.js';
import { HERO_PHASES } from '../webgl/hero-shapes.js';

export const HERO_SCROLL_TRIGGER_ID = 'hero-scroll';

const STAGES = [
  { id: 0, label: '01 — ATOM', until: HERO_PHASES.hold1[1] },
  { id: 1, label: '02 — ROCKET', until: HERO_PHASES.hold2[1] },
  { id: 2, label: '03 — HELIX', until: HERO_PHASES.hold3[1] },
  { id: 3, label: '', until: 1 },
];

const HERO_PIN_SCROLL_VH = 3;

function stageIndex(progress) {
  if (progress < STAGES[0].until) return 0;
  if (progress < STAGES[1].until) return 1;
  if (progress < STAGES[2].until) return 2;
  return 3;
}

export function initHero() {
  const section = document.querySelector('#hero');
  if (!section) return null;

  section.dataset.heroBuild = '2026-06-22-particle-scatter-v2';
  section.innerHTML = `
    <div class="hero__pin">
      <div class="hero__canvas-host" aria-hidden="true"></div>
      <div class="hero__layers">
        <div class="hero__grid" data-depth="0.15"></div>
        <div class="hero__stage" aria-live="polite">
          <p class="hero__stage-label">01 — ATOM</p>
          <div class="hero__stage-dots" aria-hidden="true">
            <span class="hero__stage-dot is-active"></span>
            <span class="hero__stage-dot"></span>
            <span class="hero__stage-dot"></span>
          </div>
        </div>
        <div class="hero__content" data-depth="0.4">
          <h1 class="hero__title">
            <span class="hero__line">
              ${'SCROLL'.split('').map((l) => `<span class="hero__char">${l}</span>`).join('')}
            </span>
            <span class="hero__line hero__line--accent">
              ${'EXPERIENCE'.split('').map((l) => `<span class="hero__char">${l}</span>`).join('')}
            </span>
          </h1>
          <p class="hero__sub"><span class="hero__sub-text"></span></p>
          <button type="button" class="hero__reel-btn" data-cursor="text" data-cursor-label="PLAY">
            WATCH REEL
          </button>
        </div>
        <div class="hero__scroll-indicator" data-depth="0.6">
          <span>SCROLL</span>
          <div class="hero__arrow">↓</div>
        </div>
      </div>
    </div>
  `;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** @type {ReturnType<typeof import('../webgl/hero-particles.js').initHeroParticles> | null} */
  let particleApi = null;
  let showreel = null;

  const heroPin = section.querySelector('.hero__pin');
  const heroArrow = section.querySelector('.hero__arrow');
  const heroStage = section.querySelector('.hero__stage');
  const heroGrid = section.querySelector('.hero__grid');
  const heroLayers = section.querySelector('.hero__layers');
  const canvasHost = section.querySelector('.hero__canvas-host');

  if (!prefersReduced && canvasHost) {
    import('../webgl/hero-particles.js').then(({ initHeroParticles }) => {
      particleApi = initHeroParticles(canvasHost, HERO_SCROLL_TRIGGER_ID, heroPin);
      ScrollTrigger.refresh();
    });
  }

  showreel = createShowreelModal();
  const reelBtn = section.querySelector('.hero__reel-btn');
  reelBtn?.addEventListener('click', () => showreel.open(reelBtn));

  const depthEls = section.querySelectorAll('[data-depth]');
  const depthQuick = new Map();
  const stageLabel = section.querySelector('.hero__stage-label');
  const stageDots = section.querySelectorAll('.hero__stage-dot');
  const scrollIndicator = section.querySelector('.hero__scroll-indicator');

  depthEls.forEach((el) => {
    depthQuick.set(el, {
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power2.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power2.out' }),
    });
  });

  let lastStage = -1;
  let lastProgress = 0;

  const updateStageUI = (progress) => {
    const p = gsap.utils.clamp(0, 1, progress);

    if (p < lastProgress - 0.002) {
      lastStage = -1;
    }
    lastProgress = p;

    const idx = stageIndex(p);
    if (idx === lastStage) return;
    lastStage = idx;

    if (stageLabel && STAGES[idx].label) {
      gsap.fromTo(
        stageLabel,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      );
      stageLabel.textContent = STAGES[idx].label;
    } else if (stageLabel) {
      gsap.to(stageLabel, { opacity: 0, duration: 0.3 });
    }

    stageDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx && idx < 3);
    });

    if (scrollIndicator) {
      gsap.to(scrollIndicator, {
        opacity: idx >= 3 ? 0 : 1,
        duration: 0.4,
      });
    }
  };

  return withSectionContext(section, (ctx, add) => {
    add(() => {
      particleApi?.destroy();
      showreel?.destroy();
    });

    const chars = section.querySelectorAll('.hero__char');
    const subEl = section.querySelector('.hero__sub-text');
    const subCopy = 'Agency-grade motion — built with GSAP ScrollTrigger';

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      delay: prefersReduced ? 0 : 0.15,
    });

    if (!prefersReduced) {
      tl.add(async () => {
        await scrambleChars(chars, 0.6);
      });
      tl.from(chars, {
        y: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.04,
      });
      tl.add(async () => {
        await typewriter(subEl, subCopy, 0.035);
      }, '-=0.5');
    } else {
      if (subEl) subEl.textContent = subCopy;
      tl.from(chars, { y: 40, opacity: 0, duration: 0.6, stagger: 0.02 });
    }

    tl.from(reelBtn, { opacity: 0, y: 16, duration: 0.6 }, '-=0.3')
      .from(scrollIndicator, { opacity: 0, duration: 0.6 }, '-=0.2')
      .from(heroStage, { opacity: 0, y: -8, duration: 0.5 }, '-=0.5')
      .to(heroGrid, { opacity: 0.12, duration: 2 }, 0);

    const scrollSt = ScrollTrigger.create({
      id: HERO_SCROLL_TRIGGER_ID,
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * HERO_PIN_SCROLL_VH}`,
      pin: heroPin,
      pinReparent: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        particleApi?.setProgress(self.progress);
        updateStageUI(self.progress);
      },
      onEnterBack: (self) => {
        particleApi?.refresh();
        particleApi?.setProgress(self.progress);
        updateStageUI(self.progress);
      },
    });

    add(() => scrollSt.kill());

    updateStageUI(scrollSt.progress);

    if (!prefersReduced) {
      const onMouseMove = (e) => {
        const rect = heroPin?.getBoundingClientRect() ?? section.getBoundingClientRect();
        if (rect.width < 1) return;

        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!inside) return;

        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        depthEls.forEach((el) => {
          const depth = parseFloat(el.dataset.depth || '1');
          const q = depthQuick.get(el);
          q?.x(px * 24 * depth);
          q?.y(py * 16 * depth);
        });
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      add(() => window.removeEventListener('mousemove', onMouseMove));

      if (heroArrow) {
        gsap.to(heroArrow, {
          y: 10,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          duration: 0.8,
        });
      }
    }
  });
}
