import { gsap } from 'gsap';

const SESSION_KEY = 'scrollforge:loaded';

/**
 * @typedef {Object} PreloaderResult
 * @property {boolean} skipped
 */

/**
 * @returns {Promise<PreloaderResult>}
 */
export async function initPreloader() {
  const loader = document.querySelector('.loader');
  if (!loader) return { skipped: true };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visited = sessionStorage.getItem(SESSION_KEY) === '1';

  if (visited || prefersReduced) {
    dismissLoader(loader);
    sessionStorage.setItem(SESSION_KEY, '1');
    return { skipped: true };
  }

  const fill = loader.querySelector('.loader__progress-fill');
  const percentEl = loader.querySelector('.loader__percent');
  const progress = { value: 0 };

  const setProgress = (target) => {
    gsap.to(progress, {
      value: target,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        const rounded = Math.round(progress.value);
        if (fill) fill.style.width = `${rounded}%`;
        if (percentEl) percentEl.textContent = String(rounded);
      },
    });
  };

  setProgress(0);
  await trackAssets(setProgress);
  setProgress(100);

  await wait(250);
  sessionStorage.setItem(SESSION_KEY, '1');
  await exitLoader(loader);

  return { skipped: false };
}

/**
 * @param {(value: number) => void} onProgress
 */
async function trackAssets(onProgress) {
  const jobs = [
    { weight: 0.45, run: trackFonts },
    { weight: 0.35, run: trackDocumentReady },
    { weight: 0.2, run: trackImages },
  ];

  let loadedWeight = 0;

  for (const { weight, run } of jobs) {
    await run();
    loadedWeight += weight;
    onProgress(loadedWeight * 100);
  }
}

function trackFonts() {
  if (!document.fonts?.ready) return Promise.resolve();
  return document.fonts.ready;
}

function trackDocumentReady() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true });
  });
}

function trackImages() {
  const images = [...document.querySelectorAll('img')].filter((img) => !img.complete);

  if (!images.length) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
    )
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dismissLoader(loader) {
  loader.style.display = 'none';
  loader.style.pointerEvents = 'none';
}

function exitLoader(loader) {
  return gsap.to(loader, {
    yPercent: -100,
    duration: 1,
    ease: 'power4.inOut',
    onComplete: () => {
      loader.style.display = 'none';
      loader.style.pointerEvents = 'none';
    },
  });
}
