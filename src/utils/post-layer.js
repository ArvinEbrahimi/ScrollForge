/**
 * @returns {(() => void) | null}
 */
export function initPostLayer(lenis) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layer = document.createElement('div');
  layer.className = 'post-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  if (!prefersReduced && lenis) {
    const onScroll = ({ velocity }) => {
      const shift = Math.min(Math.abs(velocity) * 0.15, 3);
      layer.style.setProperty('--aberration', `${shift}px`);
    };
    lenis.on('scroll', onScroll);

    return () => {
      lenis.off('scroll', onScroll);
      layer.remove();
    };
  }

  return () => layer.remove();
}
