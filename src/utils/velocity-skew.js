import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * @param {ScrollTrigger} st
 * @returns {Element | null}
 */
function resolvePinnedElement(st) {
  if (!st.pin) return null;
  if (st.pin instanceof Element) return st.pin;
  if (st.pin === true) return st.trigger;
  if (typeof st.pin === 'string') {
    return st.trigger?.querySelector(st.pin) ?? document.querySelector(st.pin);
  }
  return null;
}

/**
 * Skew pinned sections directly; never skew #smooth-content while a pin is active
 * (parent transform breaks ScrollTrigger pin → black gaps).
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initVelocitySkew(lenis) {
  const content = document.getElementById('smooth-content');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!content || !lenis || prefersReduced) return null;

  let targetSkew = 0;
  let currentSkew = 0;

  const onScroll = ({ velocity }) => {
    targetSkew = gsap.utils.clamp(-1.1, 1.1, velocity * 0.14);
  };

  const onTick = () => {
    currentSkew += (targetSkew - currentSkew) * 0.055;

    if (Math.abs(currentSkew) < 0.004 && Math.abs(targetSkew) < 0.004) {
      if (currentSkew !== 0) {
        currentSkew = 0;
        targetSkew = 0;
        gsap.set(content, { skewY: 0 });
        ScrollTrigger.getAll().forEach((st) => {
          const el = resolvePinnedElement(st);
          if (el) gsap.set(el, { skewY: 0 });
        });
      }
      return;
    }

    const activePins = ScrollTrigger.getAll().filter((st) => st.isActive && st.pin);

    if (activePins.length > 0) {
      gsap.set(content, { skewY: 0 });
      activePins.forEach((st) => {
        const el = resolvePinnedElement(st);
        if (el) gsap.set(el, { skewY: currentSkew });
      });
    } else {
      gsap.set(content, { skewY: currentSkew });
      ScrollTrigger.getAll().forEach((st) => {
        const el = resolvePinnedElement(st);
        if (el) gsap.set(el, { skewY: 0 });
      });
    }
  };

  lenis.on('scroll', onScroll);
  gsap.ticker.add(onTick);

  return () => {
    lenis.off('scroll', onScroll);
    gsap.ticker.remove(onTick);
    gsap.set(content, { skewY: 0, clearProps: 'skewY' });
    ScrollTrigger.getAll().forEach((st) => {
      const el = resolvePinnedElement(st);
      if (el) gsap.set(el, { skewY: 0, clearProps: 'skewY' });
    });
  };
}
