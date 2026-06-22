import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    wordEls.forEach((word, i) => {
      ScrollTrigger.create({
        trigger: word,
        start: 'top 85%',
        end: 'top 55%',
        scrub: true,
        onUpdate: (self) => {
          const active = self.progress > 0.5;
          const past = self.progress >= 1;
          word.classList.toggle('is-active', active && !past);
          word.classList.toggle('is-past', past);
        },
      });
    });
  });
}
