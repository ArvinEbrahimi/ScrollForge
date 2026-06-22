import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SECTION_NAV } from './scroll-nav.js';

gsap.registerPlugin(ScrollToPlugin);

const SHORTCUTS = [
  { keys: 'J / ↓', action: 'Next section' },
  { keys: 'K / ↑', action: 'Previous section' },
  { keys: 'Home', action: 'First section' },
  { keys: 'End', action: 'Last section' },
  { keys: '?', action: 'Toggle this help' },
  { keys: 'Esc', action: 'Close overlays' },
];

/**
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initKeyboardNav(lenis) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sections = SECTION_NAV.map((item) => document.getElementById(item.id)).filter(Boolean);
  if (!sections.length) return null;

  const overlay = document.createElement('div');
  overlay.className = 'kbd-help';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Keyboard shortcuts');
  overlay.innerHTML = `
    <div class="kbd-help__backdrop" data-close="true"></div>
    <div class="kbd-help__panel">
      <h2 class="kbd-help__title">Keyboard Shortcuts</h2>
      <ul class="kbd-help__list">
        ${SHORTCUTS.map((s) => `<li><kbd>${s.keys}</kbd><span>${s.action}</span></li>`).join('')}
      </ul>
      <button type="button" class="kbd-help__close" data-close="true">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);

  let helpOpen = false;

  const isTyping = () => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  };

  const getCurrentIndex = () => {
    const mid = window.innerHeight * 0.45;
    let closest = 0;
    let minDist = Infinity;

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - mid);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    return closest;
  };

  const scrollToIndex = (index) => {
    const target = sections[Math.max(0, Math.min(sections.length - 1, index))];
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: prefersReduced ? 0 : 1.2 });
      return;
    }

    gsap.to(window, {
      scrollTo: { y: target, autoKill: false },
      duration: prefersReduced ? 0 : 0.9,
      ease: 'power2.inOut',
    });
  };

  const toggleHelp = (open) => {
    helpOpen = open ?? !helpOpen;
    overlay.hidden = !helpOpen;
    overlay.classList.toggle('is-open', helpOpen);
  };

  const onKey = (e) => {
    if (isTyping()) return;

    const key = e.key;

    if (key === '?' || (key === '/' && e.shiftKey)) {
      e.preventDefault();
      toggleHelp();
      return;
    }

    if (helpOpen && key === 'Escape') {
      e.preventDefault();
      toggleHelp(false);
      return;
    }

    if (helpOpen) return;

    const current = getCurrentIndex();

    if (key === 'j' || key === 'J' || key === 'ArrowDown') {
      e.preventDefault();
      scrollToIndex(current + 1);
    } else if (key === 'k' || key === 'K' || key === 'ArrowUp') {
      e.preventDefault();
      scrollToIndex(current - 1);
    } else if (key === 'Home') {
      e.preventDefault();
      scrollToIndex(0);
    } else if (key === 'End') {
      e.preventDefault();
      scrollToIndex(sections.length - 1);
    }
  };

  overlay.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) toggleHelp(false);
  });

  document.addEventListener('keydown', onKey);

  return () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };
}
