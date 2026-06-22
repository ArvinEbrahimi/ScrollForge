import { gsap } from 'gsap';

/**
 * Grain, vignette, velocity chromatic aberration (overlay only).
 * Content skew lives in velocity-skew.js — never transform #smooth-content here.
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initPostLayer(lenis) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layer = document.createElement('div');
  layer.className = 'post-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  if (!prefersReduced && lenis) {
    let aberration = 0;
    let currentAberration = 0;

    const onScroll = ({ velocity }) => {
      aberration = Math.min(Math.abs(velocity) * 0.1, 2);
    };

    const onTick = () => {
      currentAberration += (aberration - currentAberration) * 0.06;

      if (currentAberration < 0.05) {
        currentAberration = 0;
        layer.style.removeProperty('transform');
        return;
      }

      layer.style.transform = `translateX(${currentAberration.toFixed(2)}px)`;
    };

    lenis.on('scroll', onScroll);
    gsap.ticker.add(onTick);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(onTick);
      layer.remove();
    };
  }

  return () => layer.remove();
}
