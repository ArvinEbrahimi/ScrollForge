import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import 'lenis/dist/lenis.css';
import './style.css';

import { ScrollOrchestrator } from './core/orchestrator.js';
import { initLenis } from './utils/lenis.js';
import { initCursor } from './utils/cursor.js';
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

orchestrator
  .register('hero', initHero)
  .register('marquee', initMarquee)
  .register('pinned', initPinnedReveal)
  .register('horizontal', initHorizontalScroll)
  .register('text-reveal', initTextReveal)
  .register('svg-path', initSvgPath)
  .register('cards', initStaggerCards)
  .register('outro', initOutro);

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  orchestrator.initAll();
  initCursor();

  requestAnimationFrame(() => orchestrator.refresh());

  if (import.meta.env.DEV) {
    orchestrator.mountDebugPanel();
  }
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    orchestrator.destroyAll();
  });
}
