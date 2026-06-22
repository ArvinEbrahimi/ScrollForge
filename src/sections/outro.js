import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { initOutroBurst } from '../webgl/outro-burst.js';

const EMAIL = 'hello@arvinebrahimi.dev';

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
      <button type="button" class="outro__email" data-email="${EMAIL}">
        ${EMAIL}
        <span class="outro__email-hint">Click to copy</span>
      </button>
      <a
        class="outro__cta outro__cta--primary"
        href="mailto:${EMAIL}"
        data-cursor="text"
      >
        GET IN TOUCH →
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

  let destroyBurst = null;
  let burstOnce = false;

  const emailBtn = section.querySelector('.outro__email');
  emailBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      emailBtn.classList.add('is-copied');
      emailBtn.querySelector('.outro__email-hint').textContent = 'Copied!';
      setTimeout(() => {
        emailBtn.classList.remove('is-copied');
        emailBtn.querySelector('.outro__email-hint').textContent = 'Click to copy';
      }, 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  });

  return withSectionContext(section, (ctx, add) => {
    add(() => {
      destroyBurst?.();
      document.body.classList.remove('is-outro-active');
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom bottom',
      onEnter: () => {
        document.body.classList.add('is-outro-active');
        if (!burstOnce) {
          destroyBurst = initOutroBurst(section);
          burstOnce = true;
        }
      },
      onLeave: () => document.body.classList.remove('is-outro-active'),
      onLeaveBack: () => document.body.classList.remove('is-outro-active'),
    });

    const chars = section.querySelectorAll('.outro__char');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      gsap.from(chars, {
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

      gsap.to(chars, {
        x: () => gsap.utils.random(-4, 4),
        duration: 0.05,
        repeat: 4,
        yoyo: true,
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
        onComplete: () => gsap.set(chars, { x: 0 }),
      });
    } else {
      gsap.from(chars, {
        opacity: 0,
        duration: 0.5,
        stagger: 0.02,
        scrollTrigger: { trigger: section, start: 'top 75%' },
      });
    }
  });
}
