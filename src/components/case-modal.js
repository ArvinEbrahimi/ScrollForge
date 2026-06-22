import { gsap } from 'gsap';
import { getLenis } from '../utils/lenis.js';

/**
 * @typedef {Object} CaseStudy
 * @property {string} title
 * @property {string} desc
 * @property {string[]} tags
 * @property {string} image
 * @property {string} [link]
 */

/**
 * @returns {{ open: (card: HTMLElement, data: CaseStudy) => void, destroy: () => void }}
 */
export function createCaseModal() {
  const modal = document.createElement('div');
  modal.className = 'case-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Project case study');
  modal.hidden = true;

  modal.innerHTML = `
    <div class="case-modal__backdrop" data-close="true"></div>
    <article class="case-modal__panel">
      <button type="button" class="case-modal__close" aria-label="Close case study">×</button>
      <div class="case-modal__media">
        <img class="case-modal__image" alt="" />
      </div>
      <div class="case-modal__body">
        <div class="case-modal__tags"></div>
        <h2 class="case-modal__title"></h2>
        <p class="case-modal__desc"></p>
        <a class="case-modal__link" href="#" target="_blank" rel="noopener noreferrer">View project →</a>
      </div>
    </article>
  `;

  document.body.appendChild(modal);

  const panel = modal.querySelector('.case-modal__panel');
  const backdrop = modal.querySelector('.case-modal__backdrop');
  const closeBtn = modal.querySelector('.case-modal__close');
  const img = modal.querySelector('.case-modal__image');
  const tagsEl = modal.querySelector('.case-modal__tags');
  const titleEl = modal.querySelector('.case-modal__title');
  const descEl = modal.querySelector('.case-modal__desc');
  const linkEl = modal.querySelector('.case-modal__link');

  const close = () => {
    gsap.to([panel, backdrop], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        modal.hidden = true;
        gsap.set(panel, { clearProps: 'all' });
        document.body.style.overflow = '';
        getLenis()?.start();
      },
    });
  };

  const open = (card, data) => {
    getLenis()?.stop();

    img.src = data.image;
    img.alt = data.title;
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    tagsEl.innerHTML = data.tags.map((t) => `<span class="case-modal__tag">${t}</span>`).join('');

    if (data.link) {
      linkEl.href = data.link;
      linkEl.style.display = '';
    } else {
      linkEl.style.display = 'none';
    }

    const rect = card.getBoundingClientRect();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(panel, {
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      opacity: 1,
      borderRadius: 12,
      margin: 0,
    });

    gsap.to(backdrop, { opacity: 1, duration: 0.35 });
    gsap.to(panel, {
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
      width: 'min(92vw, 920px)',
      height: 'auto',
      borderRadius: 8,
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        panel.focus();
      },
    });
  };

  panel.setAttribute('tabindex', '-1');
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
