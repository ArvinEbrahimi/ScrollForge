import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';

const ICONS = {
  performance:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
  precision:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  smooth:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c2-6 14-6 16 0s-14 6-16 0z"/></svg>',
  cinematics:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>',
  layout:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>',
  integration:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12h8M12 8v8"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
};

export function initStaggerCards() {
  const section = document.querySelector('#cards');
  if (!section) return null;

  const cards = [
    { icon: 'performance', title: 'Performance', desc: 'GPU-friendly transforms, minimal layout thrash.' },
    { icon: 'precision', title: 'Precision', desc: 'Scroll-scrubbed timelines with sub-pixel control.' },
    { icon: 'smooth', title: 'Smooth Scroll', desc: 'Lenis inertia paired with GSAP ticker.' },
    { icon: 'cinematics', title: 'Cinematics', desc: 'Orchestrated sequences that feel intentional.' },
    { icon: 'layout', title: 'Layout', desc: 'Responsive systems without framework overhead.' },
    { icon: 'integration', title: 'Integration', desc: 'APIs, WebSockets, real-time — motion meets data.' },
  ];

  section.innerHTML = `
    <div class="cards__grid">
      ${cards
        .map(
          (c) => `
        <div class="cards__card">
          <div class="cards__icon">${ICONS[c.icon]}</div>
          <h3 class="cards__title">${c.title}</h3>
          <p class="cards__desc">${c.desc}</p>
          <div class="cards__glare" aria-hidden="true"></div>
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
      const rotX = gsap.quickTo(card, 'rotateX', { duration: 0.35, ease: 'power2.out' });
      const rotY = gsap.quickTo(card, 'rotateY', { duration: 0.35, ease: 'power2.out' });
      const glare = card.querySelector('.cards__glare');

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotX(-py * 12);
        rotY(px * 12);
        if (glare) {
          glare.style.setProperty('--gx', `${50 + px * 40}%`);
          glare.style.setProperty('--gy', `${50 + py * 40}%`);
        }
        gsap.to(card, {
          y: -8,
          borderColor: 'var(--accent)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const onLeave = () => {
        rotX(0);
        rotY(0);
        gsap.to(card, {
          y: 0,
          borderColor: 'var(--border)',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      ctx.add(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
  });
}
