import { gsap } from 'gsap';

export function initHero() {
  const section = document.querySelector('#hero');
  if (!section) return;

  section.innerHTML = `
    <div class="hero__grid"></div>
    <div class="hero__content">
      <h1 class="hero__title">
        <span class="hero__line">
          ${'SCROLL'.split('').map((l) => `<span class="hero__char">${l}</span>`).join('')}
        </span>
        <span class="hero__line hero__line--accent">
          ${'EXPERIENCE'.split('').map((l) => `<span class="hero__char">${l}</span>`).join('')}
        </span>
      </h1>
      <p class="hero__sub">Crafted with GSAP ScrollTrigger</p>
    </div>
    <div class="hero__scroll-indicator">
      <span>SCROLL</span>
      <div class="hero__arrow">↓</div>
    </div>
  `;

  const loader = document.querySelector('.loader');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    delay: prefersReduced ? 0 : 0.3,
  });

  if (loader && !prefersReduced) {
    tl.to(loader, {
      y: '-100%',
      duration: 1,
      ease: 'power4.inOut',
    });
  } else if (loader) {
    loader.style.display = 'none';
  }

  tl.from('.hero__char', {
    y: 120,
    opacity: 0,
    duration: 1,
    stagger: 0.04,
  }, prefersReduced ? 0 : '-=0.3')
    .from('.hero__sub', { opacity: 0, y: 20, duration: 0.8 }, '-=0.4')
    .from('.hero__scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2')
    .to('.hero__grid', { opacity: 0.15, duration: 2 }, 0);

  gsap.to('.hero__content', {
    y: -200,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  if (!prefersReduced) {
    gsap.to('.hero__arrow', {
      y: 10,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      duration: 0.8,
    });
  }
}
