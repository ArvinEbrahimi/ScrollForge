import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import 'lenis/dist/lenis.css';
import './style.css';

import { ScrollOrchestrator } from './core/orchestrator.js';
import { initPreloader } from './utils/preloader.js';
import { initLenis, getLenis } from './utils/lenis.js';
import { initCursor } from './utils/cursor.js';
import { initScrollNav } from './utils/scroll-nav.js';
import { initSectionVeil } from './utils/section-veil.js';
import { initSound } from './utils/sound.js';
import { initTheme } from './utils/theme.js';
import { initScrollProgress } from './utils/scroll-progress.js';
import { initHero } from './sections/hero.js';
import { initMarquee } from './sections/marquee.js';
import { initPinnedReveal } from './sections/pinned-reveal.js';
import { initHorizontalScroll } from './sections/horizontal-scroll.js';
import { initTextReveal } from './sections/text-reveal.js';
import { initSvgPath } from './sections/svg-path.js';
import { initStaggerCards } from './sections/stagger-cards.js';
import { initOutro } from './sections/outro.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const orchestrator = new ScrollOrchestrator();

/** @type {(() => void) | null} */
let destroyScrollNav = null;

/** @type {(() => void) | null} */
let destroySectionVeil = null;

/** @type {(() => void) | null} */
let destroySound = null;

/** @type {(() => void) | null} */
let destroyTheme = null;

/** @type {(() => void) | null} */
let destroyScrollProgress = null;

orchestrator
  .register('hero', initHero)
  .register('marquee', initMarquee)
  .register('pinned', initPinnedReveal)
  .register('horizontal', initHorizontalScroll)
  .register('text-reveal', initTextReveal)
  .register('svg-path', initSvgPath)
  .register('cards', initStaggerCards)
  .register('outro', initOutro);

async function boot() {
  document.body.classList.add('is-loading');

  try {
    await initPreloader();
  } finally {
    document.body.classList.remove('is-loading');
  }

  initLenis();
  orchestrator.initAll();
  initCursor();

  destroyScrollNav = initScrollNav(getLenis());
  destroySectionVeil = initSectionVeil();
  destroySound = initSound(getLenis());
  destroyTheme = initTheme();
  destroyScrollProgress = initScrollProgress();

  requestAnimationFrame(() => orchestrator.refresh());

  if (import.meta.env.DEV) {
    orchestrator.mountDebugPanel();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  boot();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    destroySectionVeil?.();
    destroySound?.();
    destroyTheme?.();
    destroyScrollProgress?.();
    destroyScrollNav?.();
    orchestrator.destroyAll();
  });
}
