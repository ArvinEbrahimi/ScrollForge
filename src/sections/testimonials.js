import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

const QUOTES = [
  {
    text: 'The scroll experience felt like a film — every section earned its place on screen.',
    name: 'Sarah Chen',
    role: 'Creative Director, Studio North',
    initials: 'SC',
  },
  {
    text: 'Performance and polish in one package. Lighthouse 99 and it still feels cinematic.',
    name: 'Marcus Webb',
    role: 'Lead Engineer, Flux Labs',
    initials: 'MW',
  },
  {
    text: 'Arvin translated a vague brief into a motion language our whole team adopted.',
    name: 'Elena Rossi',
    role: 'Product Lead, Meridian',
    initials: 'ER',
  },
  {
    text: 'Rare blend of frontend craft and backend depth. The real-time features shipped flawlessly.',
    name: 'James Okonkwo',
    role: 'CTO, Pipeline.io',
    initials: 'JO',
  },
];

export function initTestimonials() {
  const section = document.querySelector('#testimonials');
  if (!section) return null;

  section.innerHTML = `
    <div class="testimonials__inner">
      <p class="testimonials__eyebrow">TESTIMONIALS</p>
      <div class="testimonials__slides">
        ${QUOTES.map(
          (q, i) => `
          <blockquote class="testimonials__slide" data-slide="${i}" ${i === 0 ? '' : 'hidden'}>
            <p class="testimonials__quote">"${q.text}"</p>
            <footer class="testimonials__author">
              <span class="testimonials__avatar" aria-hidden="true">${q.initials}</span>
              <div>
                <cite class="testimonials__name">${q.name}</cite>
                <span class="testimonials__role">${q.role}</span>
              </div>
            </footer>
          </blockquote>
        `
        ).join('')}
      </div>
      <div class="testimonials__dots" role="tablist" aria-label="Testimonial slides">
        ${QUOTES.map(
          (_, i) => `
          <button type="button" class="testimonials__dot" data-dot="${i}" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0 ? 'true' : 'false'}"></button>
        `
        ).join('')}
      </div>
    </div>
  `;

  const slides = [...section.querySelectorAll('.testimonials__slide')];
  const dots = section.querySelectorAll('.testimonials__dot');

  const setSlide = (index) => {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.hidden = !active;
      slide.classList.toggle('is-active', active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  };

  return withSectionContext(section, (ctx) => {
    dots.forEach((dot) => {
      const onClick = () => setSlide(Number(dot.dataset.dot));
      dot.addEventListener('click', onClick);
      ctx.add(() => dot.removeEventListener('click', onClick));
    });

    const revertMedia = createMatchMedia({
      [`(min-width: 769px) and (prefers-reduced-motion: no-preference)`]: () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${QUOTES.length * 100}%`,
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => {
              const index = Math.min(
                QUOTES.length - 1,
                Math.floor(self.progress * QUOTES.length)
              );
              setSlide(index);
            },
          },
        });

        slides.forEach((slide, i) => {
          if (i === 0) return;
          tl.fromTo(
            slide,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1 },
            i
          );
        });
      },
      [BREAKPOINTS.mobile]: () => {
        let current = 0;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 70%',
          end: 'bottom 30%',
          onUpdate: (self) => {
            const index = Math.min(
              QUOTES.length - 1,
              Math.floor(self.progress * QUOTES.length)
            );
            if (index !== current) {
              current = index;
              gsap.fromTo(
                slides[index],
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
              );
              setSlide(index);
            }
          },
        });
      },
      [BREAKPOINTS.reducedMotion]: () => {
        setSlide(0);
      },
    });

    ctx.add(revertMedia);
  });
}
