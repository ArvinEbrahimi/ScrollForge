import { gsap } from 'gsap';

const TRAIL_COUNT = 3;

/**
 * @returns {(() => void) | null}
 */
export function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (!dot || !ring) return null;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouch || isMobile || prefersReduced) {
    document.body.style.cursor = 'auto';
    dot.remove();
    ring.remove();
    return null;
  }

  document.body.classList.add('has-custom-cursor');

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pos.x, y: pos.y };
  let activeEl = null;
  let isDragging = false;

  const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--trail-opacity', String(0.4 - i * 0.12));
    document.body.appendChild(el);
    return { el, x: pos.x, y: pos.y, lag: 0.12 + i * 0.06 };
  });

  gsap.set(dot, { x: pos.x, y: pos.y });
  gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  trails.forEach((t) => gsap.set(t.el, { x: pos.x, y: pos.y }));

  const onMove = (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    gsap.set(dot, { x: pos.x, y: pos.y });
  };

  const onTicker = () => {
    ringPos.x += (pos.x - ringPos.x) * 0.15;
    ringPos.y += (pos.y - ringPos.y) * 0.15;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });

    trails.forEach((trail, i) => {
      const target = i === 0 ? { x: ringPos.x, y: ringPos.y } : trails[i - 1];
      trail.x += (target.x - trail.x) * trail.lag;
      trail.y += (target.y - trail.y) * trail.lag;
      gsap.set(trail.el, { x: trail.x, y: trail.y });
    });
  };

  window.addEventListener('mousemove', onMove);
  gsap.ticker.add(onTicker);

  const resetRing = () => {
    ring.classList.remove('is-expand', 'is-text', 'is-link', 'is-drag');
    dot.classList.remove('is-hidden');
    ring.querySelector('.cursor-ring__label').textContent = 'VIEW';
  };

  const applyState = (el) => {
    resetRing();
    if (!el || isDragging) return;

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

  const onOver = (e) => {
    const el = e.target.closest('[data-cursor], a');
    if (el && el !== activeEl) {
      activeEl = el;
      applyState(el);
    }
  };

  const onOut = (e) => {
    if (!activeEl) return;
    const related = e.relatedTarget;
    if (related && activeEl.contains(related)) return;
    if (e.target.closest('[data-cursor], a') === activeEl) {
      activeEl = null;
      resetRing();
    }
  };

  const horiz = document.getElementById('horizontal');

  const onHorizDown = (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    ring.classList.add('is-drag');
    ring.classList.remove('is-expand', 'is-text', 'is-link');
    ring.querySelector('.cursor-ring__label').textContent = 'DRAG';
    dot.classList.add('is-hidden');
  };

  const onHorizUp = () => {
    if (!isDragging) return;
    isDragging = false;
    resetRing();
    if (activeEl) applyState(activeEl);
  };

  horiz?.addEventListener('mousedown', onHorizDown);
  window.addEventListener('mouseup', onHorizUp);

  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);

  return () => {
    window.removeEventListener('mousemove', onMove);
    gsap.ticker.remove(onTicker);
    document.removeEventListener('mouseover', onOver);
    document.removeEventListener('mouseout', onOut);
    horiz?.removeEventListener('mousedown', onHorizDown);
    window.removeEventListener('mouseup', onHorizUp);
    trails.forEach((t) => t.el.remove());
    document.body.classList.remove('has-custom-cursor');
  };
}
