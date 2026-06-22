import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

export function initPinnedReveal() {
  const section = document.querySelector('#pinned');
  if (!section) return null;

  const panels = [
    {
      num: '01',
      title: 'GSAP ScrollTrigger',
      desc: 'Scroll-driven animations with pixel-perfect control over every keyframe.',
    },
    {
      num: '02',
      title: 'Smooth Inertia',
      desc: 'Lenis smooth scroll synced with GSAP ticker for buttery 60fps performance.',
    },
    {
      num: '03',
      title: 'Timeline Mastery',
      desc: 'Orchestrated sequences, staggers, and callbacks for cinematic storytelling.',
    },
  ];

  section.innerHTML = `
    <div class="pinned__progress-bar"><div class="pinned__progress-fill"></div></div>
    <div class="pinned__container">
      ${panels
        .map(
          (p) => `
        <div class="pinned__panel">
          <div class="pinned__left">
            <span class="pinned__num">${p.num}</span>
            <h2 class="pinned__title">${p.title}</h2>
            <p class="pinned__desc">${p.desc}</p>
          </div>
          <div class="pinned__visual">
            <div class="pinned__visual-inner"></div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const panelEls = section.querySelectorAll('.pinned__panel');

  return withSectionContext(section, (ctx) => {
    const revertMedia = createMatchMedia({
      [`${BREAKPOINTS.mobile} and (prefers-reduced-motion: no-preference)`]: () => {
        gsap.set(panelEls, { opacity: 1, y: 0, clearProps: 'transform' });

        panelEls.forEach((panel) => {
          gsap.from(panel, {
            opacity: 0,
            y: 48,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        gsap.to('.pinned__progress-fill', {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      },
      [`(min-width: 769px) and (prefers-reduced-motion: no-preference)`]: () => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.pinned__container',
        });

        gsap.to('.pinned__progress-fill', {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        gsap.set(panelEls[0], { opacity: 1, y: 0 });

        tl.to(panelEls[0], { opacity: 0, y: -60, duration: 1 }, 0.55)
          .fromTo(panelEls[1], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 0.25)
          .to(panelEls[1], { opacity: 0, y: -60, duration: 1 }, 1.55)
          .fromTo(panelEls[2], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 1.25);
      },
      [BREAKPOINTS.reducedMotion]: () => {
        gsap.set(panelEls, { opacity: 1, y: 0 });
        gsap.set('.pinned__progress-fill', { width: '100%' });
      },
    });

    ctx.add(revertMedia);
  });
}
