import { gsap } from 'gsap';

const STORAGE_KEY = 'scrollforge:theme';

const PALETTES = {
  dark: {
    '--bg': '#080808',
    '--surface': '#111111',
    '--border': '#1f1f1f',
    '--text-primary': '#f0ece4',
    '--text-muted': '#5a5a5a',
    '--accent': '#c8f04e',
    '--accent-dim': '#8aaa2e',
  },
  light: {
    '--bg': '#f0ece4',
    '--surface': '#ffffff',
    '--border': '#ddd8ce',
    '--text-primary': '#080808',
    '--text-muted': '#6a6a6a',
    '--accent': '#8aaa2e',
    '--accent-dim': '#6b8524',
  },
};

/** @type {'dark' | 'light'} */
let currentTheme = 'dark';

(function applyInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored === 'light' || stored === 'dark' ? stored : systemLight ? 'light' : 'dark';
  currentTheme = initial;
  document.documentElement.setAttribute('data-theme', initial);
  Object.entries(PALETTES[initial]).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
})();

/**
 * @param {'dark' | 'light'} theme
 * @param {boolean} animate
 */
export function applyTheme(theme, animate = true) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const palette = PALETTES[theme];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (animate && !prefersReduced) {
    gsap.to(document.documentElement, {
      ...palette,
      duration: 0.65,
      ease: 'power2.inOut',
    });
    return;
  }

  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

export function getTheme() {
  return currentTheme;
}

/**
 * @returns {(() => void) | null}
 */
export function initTheme() {
  const panel = document.querySelector('.site-controls');
  if (!panel) return null;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'site-controls__btn site-controls__btn--theme';
  btn.setAttribute('aria-label', 'Toggle color theme');
  btn.innerHTML = `
    <span class="site-controls__icon site-controls__icon--dark" aria-hidden="true">☾</span>
    <span class="site-controls__icon site-controls__icon--light" aria-hidden="true">☀</span>
  `;

  panel.appendChild(btn);

  const syncUI = () => {
    const isLight = currentTheme === 'light';
    btn.classList.toggle('is-active', isLight);
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  };

  syncUI();

  const onToggle = () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
    syncUI();
  };

  btn.addEventListener('click', onToggle);

  return () => {
    btn.removeEventListener('click', onToggle);
    btn.remove();
  };
}
