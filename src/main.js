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
import { initPostLayer } from './utils/post-layer.js';
import { initHero } from './sections/hero.js';
import { initMarquee } from './sections/marquee.js';
import { initPinnedReveal } from './sections/pinned-reveal.js';
import { initHorizontalScroll } from './sections/horizontal-scroll.js';
import { initTextReveal } from './sections/text-reveal.js';
import { initSvgPath } from './sections/svg-path.js';
import { initStaggerCards } from './sections/stagger-cards.js';
import { initStats } from './sections/stats.js';
import { initProcess } from './sections/process.js';
import { initStackOrbit } from './sections/stack-orbit.js';
import { initTestimonials } from './sections/testimonials.js';
import { initContactForm } from './sections/contact-form.js';
import { initOutro } from './sections/outro.js';
import { initFooter } from './sections/footer.js';

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

/** @type {(() => void) | null} */
let destroyPostLayer = null;

orchestrator
  .register('hero', initHero)
  .register('marquee', initMarquee)
  .register('pinned', initPinnedReveal)
  .register('horizontal', initHorizontalScroll)
  .register('text-reveal', initTextReveal)
  .register('svg-path', initSvgPath)
  .register('cards', initStaggerCards)
  .register('stats', initStats)
  .register('process', initProcess)
  .register('stack', initStackOrbit)
  .register('testimonials', initTestimonials)
  .register('contact', initContactForm)
  .register('outro', initOutro)
  .register('footer', initFooter);

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
  destroyPostLayer = initPostLayer(getLenis());

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
    destroyPostLayer?.();
    destroyScrollNav?.();
    orchestrator.destroyAll();
  });
}
