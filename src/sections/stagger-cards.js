import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';

export function initStaggerCards() {
  const section = document.querySelector('#cards');
  if (!section) return null;

  const cards = [
    { icon: '⚡', title: 'Performance', desc: 'GPU-friendly transforms, minimal layout thrash.' },
    { icon: '🎯', title: 'Precision', desc: 'Scroll-scrubbed timelines with sub-pixel control.' },
    { icon: '🌊', title: 'Smooth Scroll', desc: 'Lenis inertia paired with GSAP ticker.' },
    { icon: '🎬', title: 'Cinematics', desc: 'Orchestrated sequences that feel intentional.' },
    { icon: '📐', title: 'Layout', desc: 'Responsive systems without framework overhead.' },
    { icon: '🔗', title: 'Integration', desc: 'APIs, WebSockets, real-time — motion meets data.' },
  ];

  section.innerHTML = `
    <div class="cards__grid">
      ${cards
        .map(
          (c) => `
        <div class="cards__card">
          <div class="cards__icon">${c.icon}</div>
          <h3 class="cards__title">${c.title}</h3>
          <p class="cards__desc">${c.desc}</p>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const cardEls = section.querySelectorAll('.cards__card');

  return withSectionContext(section, (ctx) => {
    ScrollTrigger.batch(cardEls, {
      start: 'top 85%',
      onEnter: (elements) => {
        gsap.from(elements, {
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });
      },
      once: true,
    });

    cardEls.forEach((card) => {
      const onEnter = () => {
        gsap.to(card, {
          y: -8,
          borderColor: 'var(--accent)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          borderColor: 'var(--border)',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      ctx.add(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
  });
}
