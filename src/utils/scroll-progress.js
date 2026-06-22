import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * @returns {(() => void) | null}
 */
export function initScrollProgress() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return null;

  const ring = document.createElement('div');
  ring.className = 'scroll-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = `
    <svg class="scroll-ring__svg" viewBox="0 0 44 44">
      <circle class="scroll-ring__track" cx="22" cy="22" r="19" />
      <circle class="scroll-ring__fill" cx="22" cy="22" r="19" />
    </svg>
  `;
  document.body.appendChild(ring);

  const fill = ring.querySelector('.scroll-ring__fill');
  const radius = 19;
  const circumference = 2 * Math.PI * radius;

  gsap.set(fill, {
    attr: { 'stroke-dasharray': circumference, 'stroke-dashoffset': circumference },
  });

  const tween = gsap.to(fill, {
    attr: { 'stroke-dashoffset': 0 },
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    ring.remove();
  };
}
