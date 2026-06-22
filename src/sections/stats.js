import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';

const STATS = [
  { end: 50, suffix: '+', label: 'Projects Delivered' },
  { end: 3, suffix: 'M+', label: 'Lines of Code', decimals: 0 },
  { end: 99, suffix: '', label: 'Lighthouse Score' },
  { end: 8, suffix: '+', label: 'Years Building' },
];

export function initStats() {
  const section = document.querySelector('#stats');
  if (!section) return null;

  section.innerHTML = `
    <div class="stats__inner">
      <p class="stats__eyebrow">BY THE NUMBERS</p>
      <div class="stats__grid">
        ${STATS.map(
          (s, i) => `
          <div class="stats__item" data-stat="${i}">
            <span class="stats__value" data-value="${s.end}" data-suffix="${s.suffix}" data-decimals="${s.decimals ?? 0}">0${s.suffix}</span>
            <span class="stats__label">${s.label}</span>
          </div>
        `
        ).join('')}
      </div>
    </div>
  `;

  const valueEls = section.querySelectorAll('.stats__value');

  return withSectionContext(section, () => {
    const progress = { value: 0 };

    gsap.to(progress, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'top 25%',
        scrub: 0.6,
        onUpdate: (self) => {
          valueEls.forEach((el, i) => {
            const end = Number(el.dataset.value);
            const suffix = el.dataset.suffix || '';
            const decimals = Number(el.dataset.decimals) || 0;
            const stagger = i * 0.08;
            const p = gsap.utils.clamp(0, 1, (self.progress - stagger) / (1 - stagger));
            const raw = end * p;
            const snapped =
              decimals > 0 ? gsap.utils.snap(0.1, raw) : gsap.utils.snap(1, raw);
            el.textContent = `${decimals > 0 ? snapped.toFixed(decimals) : Math.round(snapped)}${suffix}`;
          });
        },
      },
    });

    ScrollTrigger.batch('.stats__item', {
      start: 'top 85%',
      onEnter: (elements) => {
        gsap.from(elements, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  });
}
