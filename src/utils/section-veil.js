import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SECTION_NAV } from './scroll-nav.js';
import { sound } from './sound.js';

const COOLDOWN_MS = 700;

/**
 * @param {HTMLElement} veil
 */
function playVeil(veil) {
  const now = Date.now();
  if (now - playVeil.lastPlayed < COOLDOWN_MS) return;
  if (playVeil.locked) return;

  playVeil.lastPlayed = now;
  playVeil.locked = true;

  if (sound.isEnabled()) sound.chime();

  gsap.killTweensOf(veil);
  gsap.set(veil, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });

  gsap.to(veil, {
    scaleX: 1,
    opacity: 0.48,
    duration: 0.48,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(veil, {
        opacity: 0,
        duration: 0.38,
        ease: 'power1.out',
        onComplete: () => {
          gsap.set(veil, { scaleX: 0 });
          playVeil.locked = false;
        },
      });
    },
  });
}

playVeil.lastPlayed = 0;
playVeil.locked = false;

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
      start: 'top 88%',
      onEnter: () => playVeil(veil),
      onEnterBack: () => playVeil(veil),
    });

    triggers.push(st);
  });

  return () => {
    triggers.forEach((st) => st.kill());
    gsap.killTweensOf(veil);
    veil.remove();
    playVeil.locked = false;
  };
}
