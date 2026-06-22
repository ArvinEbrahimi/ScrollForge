import { gsap } from 'gsap';

export function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (!dot || !ring) return;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouch || isMobile || prefersReduced) {
    document.body.style.cursor = 'auto';
    dot.remove();
    ring.remove();
    return;
  }

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pos.x, y: pos.y };
  let activeEl = null;

  gsap.set(dot, { x: pos.x, y: pos.y });
  gsap.set(ring, { x: ringPos.x, y: ringPos.y });

  window.addEventListener('mousemove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    gsap.set(dot, { x: pos.x, y: pos.y });
  });

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.15;
    ringPos.y += (pos.y - ringPos.y) * 0.15;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  });

  const resetRing = () => {
    ring.classList.remove('is-expand', 'is-text', 'is-link');
    dot.classList.remove('is-hidden');
  };

  const applyState = (el) => {
    resetRing();
    if (!el) return;

    if (el.matches('[data-cursor="text"]')) {
      ring.classList.add('is-text');
      dot.classList.add('is-hidden');
    } else if (el.matches('[data-cursor="expand"]')) {
      ring.classList.add('is-expand');
    } else if (el.matches('a')) {
      ring.classList.add('is-link');
      dot.classList.add('is-hidden');
    }
  };

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-cursor], a');
    if (el && el !== activeEl) {
      activeEl = el;
      applyState(el);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!activeEl) return;
    const related = e.relatedTarget;
    if (related && activeEl.contains(related)) return;
    if (e.target.closest('[data-cursor], a') === activeEl) {
      activeEl = null;
      resetRing();
    }
  });
}
