import { gsap } from 'gsap';

export function initSvgPath() {
  const section = document.querySelector('#svg-path');
  if (!section) return;

  section.innerHTML = `
    <div class="svg-path__container" role="img" aria-label="Development workflow: Init, Build, Test, Deploy">
      <h3 class="svg-path__eyebrow">THE WORKFLOW</h3>
      <svg class="svg-path__svg" viewBox="0 0 1200 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <path
          class="svg-path__line"
          d="M 50,150 C 150,50 250,250 350,150 S 550,50 650,150 S 850,250 950,150 S 1100,50 1150,150"
          fill="none"
          stroke="var(--accent)"
          stroke-width="2"
          stroke-linecap="round"
        />
        <circle class="svg-milestone" cx="50"   cy="150" r="6" />
        <circle class="svg-milestone" cx="350"  cy="150" r="6" opacity="0" />
        <circle class="svg-milestone" cx="650"  cy="150" r="6" opacity="0" />
        <circle class="svg-milestone" cx="950"  cy="150" r="6" opacity="0" />
        <circle class="svg-milestone" cx="1150" cy="150" r="6" opacity="0" />
        <text class="svg-label" x="30"   y="130" font-size="12">INIT</text>
        <text class="svg-label" x="330"  y="130" font-size="12" opacity="0">BUILD</text>
        <text class="svg-label" x="630"  y="130" font-size="12" opacity="0">TEST</text>
        <text class="svg-label" x="930"  y="130" font-size="12" opacity="0">DEPLOY</text>
      </svg>
    </div>
  `;

  const path = section.querySelector('.svg-path__line');
  const length = path.getTotalLength();

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
    },
  });

  const milestones = section.querySelectorAll('.svg-milestone:not(:first-child)');
  const labels = section.querySelectorAll('.svg-label:not(:first-child)');

  milestones.forEach((dot, i) => {
    gsap.to([dot, labels[i]], {
      opacity: 1,
      duration: 0.3,
      scrollTrigger: {
        trigger: section,
        start: `${20 + i * 22}% 80%`,
        toggleActions: 'play none none reverse',
      },
    });
  });
}
