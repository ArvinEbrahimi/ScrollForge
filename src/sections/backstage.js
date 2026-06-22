import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';

/**
 * @param {{ getStats: () => { sections: number, scrollTriggers: number } }} orchestrator
 * @returns {(() => void) | null}
 */
export function initBackstage(orchestrator) {
  const section = document.querySelector('#backstage');
  if (!section) return null;

  const stats = orchestrator.getStats();

  section.innerHTML = `
    <div class="backstage__inner">
      <p class="backstage__eyebrow">SECRET UNLOCKED</p>
      <h2 class="backstage__title">Behind the Scenes</h2>
      <div class="backstage__grid">
        <div class="backstage__card">
          <span class="backstage__metric" data-fps>60</span>
          <span class="backstage__label">FPS (live)</span>
        </div>
        <div class="backstage__card">
          <span class="backstage__metric">${stats.scrollTriggers}</span>
          <span class="backstage__label">ScrollTriggers</span>
        </div>
        <div class="backstage__card">
          <span class="backstage__metric">${stats.sections}</span>
          <span class="backstage__label">Active Sections</span>
        </div>
      </div>
      <div class="backstage__timeline" aria-hidden="true">
        ${Array.from({ length: 8 }, (_, i) => `<div class="backstage__bar" style="--h:${30 + i * 8}%"></div>`).join('')}
      </div>
      <ul class="backstage__facts">
        <li>Lenis + GSAP ticker sync keeps scroll and timelines frame-locked.</li>
        <li>Three.js hero particles are code-split — ~117KB gzip lazy-loaded.</li>
        <li>Every section owns a gsap.context for zero-leak teardown.</li>
        <li>You found the Konami code. Respect.</li>
      </ul>
    </div>
  `;

  const fpsEl = section.querySelector('[data-fps]');
  let frames = 0;
  let last = performance.now();
  let raf = 0;

  const tick = (now) => {
    frames++;
    if (now - last >= 1000) {
      if (fpsEl) fpsEl.textContent = String(frames);
      frames = 0;
      last = now;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return withSectionContext(section, (ctx, add) => {
    add(() => cancelAnimationFrame(raf));

    gsap.from('.backstage__card', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
    });

    gsap.from('.backstage__bar', {
      scaleY: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power2.out',
      transformOrigin: 'bottom center',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
      },
    });
  });
}
