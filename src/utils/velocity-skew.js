import { gsap } from 'gsap';

/**
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initVelocitySkew(lenis) {
  const content = document.getElementById('smooth-content');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!content || !lenis || prefersReduced) return null;

  const skewTo = gsap.quickTo(content, 'skewY', { duration: 0.45, ease: 'power2.out' });

  const onScroll = ({ velocity }) => {
    const skew = gsap.utils.clamp(-3, 3, velocity * 0.35);
    skewTo(skew);
  };

  lenis.on('scroll', onScroll);

  return () => {
    lenis.off('scroll', onScroll);
    gsap.set(content, { skewY: 0, clearProps: 'transform' });
  };
}
