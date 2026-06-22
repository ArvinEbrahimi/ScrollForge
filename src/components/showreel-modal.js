import { gsap } from 'gsap';

/**
 * @returns {{ open: (triggerEl: HTMLElement) => void, destroy: () => void }}
 */
export function createShowreelModal() {
  const modal = document.createElement('div');
  modal.className = 'showreel-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Showreel video');
  modal.hidden = true;

  modal.innerHTML = `
    <div class="showreel-modal__backdrop" data-close="true"></div>
    <div class="showreel-modal__panel">
      <button type="button" class="showreel-modal__close" aria-label="Close showreel">×</button>
      <div class="showreel-modal__media">
        <video class="showreel-modal__video" playsinline controls preload="metadata" poster="">
          <source src="/video/showreel.mp4" type="video/mp4" />
        </video>
        <div class="showreel-modal__fallback">
          <p>Add <code>public/video/showreel.mp4</code> to enable the reel.</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const panel = modal.querySelector('.showreel-modal__panel');
  const backdrop = modal.querySelector('.showreel-modal__backdrop');
  const closeBtn = modal.querySelector('.showreel-modal__close');
  const video = modal.querySelector('.showreel-modal__video');
  const fallback = modal.querySelector('.showreel-modal__fallback');

  video.addEventListener('error', () => {
    video.style.display = 'none';
    fallback.classList.add('is-visible');
  });

  const close = () => {
    gsap.to(panel, {
      scale: 0,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => {
        modal.hidden = true;
        video.pause();
        document.body.style.overflow = '';
      },
    });
    gsap.to(backdrop, { opacity: 0, duration: 0.3 });
  };

  const open = (triggerEl) => {
    const rect = triggerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    gsap.set(panel, {
      scale: 0,
      opacity: 0,
      transformOrigin: `${cx}px ${cy}px`,
    });
    gsap.set(backdrop, { opacity: 0 });

    gsap.to(backdrop, { opacity: 1, duration: 0.35 });
    gsap.to(panel, {
      scale: 1,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out',
      transformOrigin: `${cx}px ${cy}px`,
    });

    if (video.readyState >= 2) video.play().catch(() => {});
  };

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  const onKey = (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  };
  document.addEventListener('keydown', onKey);

  return {
    open,
    destroy: () => {
      document.removeEventListener('keydown', onKey);
      modal.remove();
    },
  };
}
