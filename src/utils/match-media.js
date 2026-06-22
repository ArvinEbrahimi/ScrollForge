import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const BREAKPOINTS = {
  desktop: '(min-width: 1024px)',
  tablet: '(max-width: 1023px) and (min-width: 769px)',
  mobile: '(max-width: 768px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
};

/**
 * @param {Record<string, (context: { conditions: Record<string, boolean> }) => void>} config
 * @returns {() => void}
 */
export function createMatchMedia(config) {
  const mm = ScrollTrigger.matchMedia();

  for (const [query, setup] of Object.entries(config)) {
    mm.add(query, (context) => {
      setup(context);
    });
  }

  return () => mm.revert();
}

export function prefersReducedMotion() {
  return window.matchMedia(BREAKPOINTS.reducedMotion).matches;
}

export function isMobile() {
  return window.matchMedia(BREAKPOINTS.mobile).matches;
}
