import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';

export function initOutro() {
  const section = document.querySelector('#outro');
  if (!section) return null;

  const headline = "LET'S BUILD SOMETHING.";

  section.innerHTML = `
    <div class="outro__noise"></div>
    <div class="outro__content">
      <h2 class="outro__title">
        ${headline
          .split('')
          .map((c) => `<span class="outro__char">${c === ' ' ? '&nbsp;' : c}</span>`)
          .join('')}
      </h2>
      <a class="outro__link" href="https://arvinebrahimi.dev" target="_blank" rel="noopener noreferrer">
        arvinebrahimi.dev
      </a>
      <a
        class="outro__cta"
        href="https://github.com/ArvinEbrahimi"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="text"
      >
        VIEW GITHUB →
      </a>
    </div>
  `;

  return withSectionContext(section, () => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom bottom',
      onEnter: () => gsap.to('body', { backgroundColor: 'var(--accent)', duration: 0.6 }),
      onLeaveBack: () => gsap.to('body', { backgroundColor: 'var(--bg)', duration: 0.6 }),
    });

    gsap.from('.outro__char', {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
      },
    });
  });
}
