import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

const SEGMENTS = [
  'M 50,150 C 150,50 250,250 350,150',
  'M 350,150 S 550,50 650,150',
  'M 650,150 S 850,250 950,150',
  'M 950,150 S 1100,50 1150,150',
];

const MILESTONES = [
  { cx: 50, label: 'INIT', x: 30 },
  { cx: 350, label: 'BUILD', x: 330 },
  { cx: 650, label: 'TEST', x: 630 },
  { cx: 950, label: 'DEPLOY', x: 930 },
];

export function initSvgPath() {
  const section = document.querySelector('#svg-path');
  if (!section) return null;

  const isMobile = window.matchMedia(BREAKPOINTS.mobile).matches;
  const milestones = isMobile ? MILESTONES.filter((_, i) => i === 0 || i === 3) : MILESTONES;

  section.innerHTML = `
    <div class="svg-path__container" role="img" aria-label="Development workflow: Init, Build, Test, Deploy">
      <h3 class="svg-path__eyebrow">THE WORKFLOW</h3>
      <svg class="svg-path__svg" viewBox="0 0 1200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        ${SEGMENTS.map((d, i) => `<path class="svg-path__segment" data-segment="${i}" d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />`).join('')}
        ${milestones
          .map(
            (m, i) => `
          <circle class="svg-milestone" cx="${m.cx}" cy="150" r="6" opacity="${i === 0 ? 1 : 0}" />
          <text class="svg-label" x="${m.x}" y="130" font-size="12" opacity="${i === 0 ? 1 : 0}">${m.label}</text>
        `
          )
          .join('')}
      </svg>
    </div>
  `;

  const segments = section.querySelectorAll('.svg-path__segment');
  const dots = section.querySelectorAll('.svg-milestone');
  const labels = section.querySelectorAll('.svg-label');

  return withSectionContext(section, (ctx) => {
    const lengths = [...segments].map((seg) => {
      const len = seg.getTotalLength();
      gsap.set(seg, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    });

    segments.forEach((seg, i) => {
      tl.to(seg, { strokeDashoffset: 0, ease: 'none', duration: 1 }, i * 0.9);
    });

    dots.forEach((dot, i) => {
      if (i === 0) return;

      tl.to(
        [dot, labels[i]],
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        i * 0.9 + 0.2
      );

      gsap.to(dot, {
        scale: 1.4,
        transformOrigin: 'center',
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: section,
          start: `${15 + i * 20}% 80%`,
          toggleActions: 'play pause resume pause',
        },
      });
    });

    gsap.set(labels, { y: 8 });
  });
}
