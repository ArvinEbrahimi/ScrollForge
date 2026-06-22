/**
 * @param {HTMLElement} container
 * @returns {(() => void) | null}
 */
export function initOutroBurst(container) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'outro__burst';
  canvas.setAttribute('aria-hidden', 'true');
  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const particles = [];
  let animating = false;
  let raf = 0;

  const resize = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };

  resize();

  const burst = () => {
    particles.length = 0;
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.45;

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 2 + Math.random() * 3,
      });
    }

    if (!animating) {
      animating = true;
      const tick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = 0;

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.life -= 0.018;

          if (p.life <= 0) return;
          alive++;

          ctx.globalAlpha = p.life;
          ctx.fillStyle = '#c8f04e';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        if (alive > 0) {
          raf = requestAnimationFrame(tick);
        } else {
          animating = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      tick();
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  burst();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
