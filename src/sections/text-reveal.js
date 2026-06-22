import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';

export function initTextReveal() {
  const section = document.querySelector('#text-reveal');
  if (!section) return null;

  const text =
    'The web is a canvas. Every scroll is a frame. Every interaction is a conversation between code and the human who reads it.';

  const words = text
    .split(' ')
    .map((w) => `<span class="reveal-word">${w}</span>`)
    .join(' ');

  section.innerHTML = `
    <div class="text-reveal__container">
      <p class="text-reveal__paragraph">${words}</p>
    </div>
  `;

  const wordEls = section.querySelectorAll('.reveal-word');

  return withSectionContext(section, () => {
    gsap.fromTo(
      wordEls,
      { opacity: 0.15, color: 'var(--text-muted)' },
      {
        opacity: 1,
        color: 'var(--text-primary)',
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      }
    );
  });
}
