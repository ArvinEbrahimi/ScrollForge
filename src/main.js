import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import 'lenis/dist/lenis.css';
import './style.css';

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

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initHero();
  initMarquee();
  initPinnedReveal();
  initHorizontalScroll();
  initTextReveal();
  initSvgPath();
  initStaggerCards();
  initOutro();
  initCursor();

  requestAnimationFrame(() => ScrollTrigger.refresh());
});
