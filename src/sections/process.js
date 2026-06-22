import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Research goals, users, and constraints. Map the narrative before a single line of code.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Motion storyboards, typography systems, and scroll choreography as first-class deliverables.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>',
  },
  {
    num: '03',
    title: 'Develop',
    desc: 'GSAP timelines, Lenis sync, and performance budgets — built for 60fps on real devices.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6l-4 6 4 6M16 6l4 6-4 6M14 4l-4 16"/></svg>',
  },
  {
    num: '04',
    title: 'Deploy',
    desc: 'Lighthouse gates, cross-browser QA, and a launch that feels as polished as the scroll.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
  },
];

export function initProcess() {
  const section = document.querySelector('#process');
  if (!section) return null;

  section.innerHTML = `
    <div class="process__inner">
      <p class="process__eyebrow">HOW I WORK</p>
      <h2 class="process__title">From idea to launch</h2>
      <div class="process__timeline">
        <div class="process__line" aria-hidden="true">
          <div class="process__line-fill"></div>
        </div>
        ${STEPS.map(
          (step, i) => `
          <article class="process__step ${i % 2 === 0 ? 'process__step--left' : 'process__step--right'}" data-step="${i}">
            <div class="process__marker" aria-hidden="true">
              <span class="process__marker-dot"></span>
            </div>
            <div class="process__card">
              <div class="process__icon">${step.icon}</div>
              <span class="process__num">${step.num}</span>
              <h3 class="process__step-title">${step.title}</h3>
              <p class="process__desc">${step.desc}</p>
            </div>
          </article>
        `
        ).join('')}
      </div>
    </div>
  `;

  const lineFill = section.querySelector('.process__line-fill');
  const steps = section.querySelectorAll('.process__step');

  return withSectionContext(section, (ctx, add) => {
    const revertMedia = createMatchMedia({
      [`(min-width: 769px) and (prefers-reduced-motion: no-preference)`]: () => {
        gsap.to(lineFill, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 20%',
            end: 'bottom 60%',
            scrub: true,
          },
        });

        steps.forEach((step, i) => {
          gsap.from(step.querySelector('.process__card'), {
            x: i % 2 === 0 ? -48 : 48,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      },
      [BREAKPOINTS.mobile]: () => {
        gsap.set(lineFill, { scaleY: 1 });
        steps.forEach((step) => {
          gsap.from(step, {
            y: 32,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      },
      [BREAKPOINTS.reducedMotion]: () => {
        gsap.set(lineFill, { scaleY: 1 });
        gsap.set(steps, { opacity: 1, y: 0, x: 0 });
      },
    });

    add(revertMedia);
  });
}
