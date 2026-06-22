import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SECTION_NAV } from './scroll-nav.js';
import { sound } from './sound.js';

/**
 * @returns {(() => void) | null}
 */
export function initSectionVeil() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  const veil = document.createElement('div');
  veil.className = 'section-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  const triggers = [];

  SECTION_NAV.forEach(({ id }) => {
    const section = document.getElementById(id);
    if (!section || id === 'hero') return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 92%',
      onEnter: () => playVeil(veil),
      onEnterBack: () => playVeil(veil),
    });

    triggers.push(st);
  });

  return () => {
    triggers.forEach((st) => st.kill());
    veil.remove();
  };
}

function playVeil(veil) {
  sound.chime();
  gsap.killTweensOf(veil);

  gsap.fromTo(
    veil,
    { scaleX: 0, transformOrigin: 'left center', opacity: 1 },
    {
      scaleX: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(veil, {
          opacity: 0,
          duration: 0.25,
          ease: 'power1.out',
        });
      },
    }
  );
}
