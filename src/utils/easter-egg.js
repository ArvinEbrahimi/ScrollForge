import { gsap } from 'gsap';
import { getLenis } from './lenis.js';
import { initBackstage } from '../sections/backstage.js';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/**
 * @param {{ getStats: () => object, refresh: () => void }} orchestrator
 * @returns {(() => void) | null}
 */
export function initEasterEgg(orchestrator) {
  if (sessionStorage.getItem('scrollforge:konami') === '1') {
    revealBackstage(orchestrator, false);
  }

  let index = 0;
  let unlocked = sessionStorage.getItem('scrollforge:konami') === '1';
  /** @type {(() => void) | null} */
  let destroyBackstage = null;

  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  toast.innerHTML = `
    <span class="achievement-toast__icon">★</span>
    <span class="achievement-toast__text">Achievement unlocked: Behind the Scenes</span>
  `;
  document.body.appendChild(toast);

  const showToast = () => {
    toast.hidden = false;
    gsap.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
    setTimeout(() => {
      gsap.to(toast, {
        y: -10,
        opacity: 0,
        duration: 0.4,
        delay: 2.5,
        onComplete: () => {
          toast.hidden = true;
        },
      });
    }, 0);
  };

  function revealBackstage(orch, scroll = true) {
    const section = document.getElementById('backstage');
    if (!section) return;

    section.hidden = false;
    section.removeAttribute('aria-hidden');

    if (!destroyBackstage) {
      destroyBackstage = initBackstage(orch);
      orch.refresh();
    }

    if (scroll) {
      getLenis()?.scrollTo(section, { offset: 0, duration: 1.4 });
    }
  }

  const onKey = (e) => {
    if (unlocked) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expected = KONAMI[index];
    const normalized = expected.length === 1 ? expected.toLowerCase() : expected;

    if (key === normalized) {
      index++;
      if (index >= KONAMI.length) {
        unlocked = true;
        sessionStorage.setItem('scrollforge:konami', '1');
        showToast();
        revealBackstage(orchestrator, true);
      }
    } else {
      index = key === KONAMI[0] || key === (KONAMI[0].length === 1 ? KONAMI[0].toLowerCase() : KONAMI[0]) ? 1 : 0;
    }
  };

  document.addEventListener('keydown', onKey);

  return () => {
    document.removeEventListener('keydown', onKey);
    destroyBackstage?.();
    toast.remove();
  };
}
