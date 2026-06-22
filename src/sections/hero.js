import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { scrambleChars, typewriter } from '../utils/scramble-text.js';
import { createShowreelModal } from '../components/showreel-modal.js';

export function initHero() {
  const section = document.querySelector('#hero');
  if (!section) return null;

  section.innerHTML = `
    <div class="hero__layers">
      <div class="hero__grid" data-depth="0.2"></div>
      <div class="hero__content" data-depth="1">
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
      <div class="hero__scroll-indicator" data-depth="0.8">
        <span>SCROLL</span>
        <div class="hero__arrow">↓</div>
      </div>
    </div>
  `;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let destroyParticles = null;
  let showreel = null;

  import('../webgl/hero-particles.js').then(({ initHeroParticles }) => {
    destroyParticles = initHeroParticles(section);
  });

  showreel = createShowreelModal();
  const reelBtn = section.querySelector('.hero__reel-btn');
  reelBtn?.addEventListener('click', () => showreel.open(reelBtn));

  const depthEls = section.querySelectorAll('[data-depth]');
  const depthQuick = new Map();

  depthEls.forEach((el) => {
    depthQuick.set(el, {
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power2.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power2.out' }),
    });
  });

  return withSectionContext(section, (ctx) => {
    ctx.add(() => {
      destroyParticles?.();
      showreel?.destroy();
    });

    const chars = section.querySelectorAll('.hero__char');
    const subEl = section.querySelector('.hero__sub-text');
    const subCopy = 'Crafted with GSAP ScrollTrigger';

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

    tl.from('.hero__reel-btn', { opacity: 0, y: 16, duration: 0.6 }, '-=0.3')
      .from('.hero__scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2')
      .to('.hero__grid', { opacity: 0.15, duration: 2 }, 0);

    depthEls.forEach((el) => {
      const depth = parseFloat(el.dataset.depth || '1');
      gsap.to(el, {
        y: -200 * depth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    if (!prefersReduced) {
      const onMouseMove = (e) => {
        const rect = section.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        depthEls.forEach((el) => {
          const depth = parseFloat(el.dataset.depth || '1');
          const q = depthQuick.get(el);
          q?.x(px * 30 * depth);
          q?.y(py * 20 * depth);
        });
      };

      section.addEventListener('mousemove', onMouseMove);
      ctx.add(() => section.removeEventListener('mousemove', onMouseMove));

      gsap.to('.hero__arrow', {
        y: 10,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        duration: 0.8,
      });
    }
  });
}
