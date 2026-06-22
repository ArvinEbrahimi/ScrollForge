/**
 * @returns {(() => void) | null}
 */
export function initMicroInteractions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

  const onPointerDown = (e) => {
    const target = e.target.closest(
      'button, .contact__submit, .hero__reel-btn, .outro__cta, .horiz__card, .stack__node'
    );
    if (!target || target.disabled) return;

    if (canVibrate && window.matchMedia('(max-width: 768px)').matches) {
      navigator.vibrate(10);
    }

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ui-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    target.classList.add('ui-ripple-host');
    target.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
      if (!target.querySelector('.ui-ripple')) {
        target.classList.remove('ui-ripple-host');
      }
    });
  };

  document.addEventListener('pointerdown', onPointerDown);

  return () => document.removeEventListener('pointerdown', onPointerDown);
}
