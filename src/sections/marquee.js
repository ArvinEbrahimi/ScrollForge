import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { getLenis } from '../utils/lenis.js';

export function initMarquee() {
  const section = document.querySelector('#marquee');
  if (!section) return null;

  const row1Items = 'GSAP · ScrollTrigger · Three.js · WebGL · React · Next.js · Django · ';
  const row2Items = 'Framer Motion · TypeScript · PostgreSQL · Docker · WebRTC · Redis · ';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const accentize = (text) =>
    text.replace(/·/g, '<span class="marquee__sep">·</span>');

  const buildRow = (text) => `
    <div class="marquee__track">
      <span class="marquee__content">${accentize(text.repeat(4))}</span>
      <span class="marquee__content" aria-hidden="true">${accentize(text.repeat(4))}</span>
    </div>
  `;

  section.innerHTML = `
    <div class="marquee__wrapper">
      ${buildRow(row1Items)}
      ${buildRow(row2Items)}
    </div>
  `;

  if (prefersReduced) return null;

  return withSectionContext(section, (ctx) => {
    const [track1, track2] = section.querySelectorAll('.marquee__track');

    const anim1 = gsap.to(track1, { x: '-50%', ease: 'none', duration: 20, repeat: -1 });
    const anim2 = gsap.fromTo(track2, { x: '-50%' }, { x: '0%', ease: 'none', duration: 20, repeat: -1 });

    anim2.progress(0.25);

    let hoverSlow = false;
    let scrollVelocity = 0;

    const applySpeed = () => {
      const boost = Math.min(Math.abs(scrollVelocity) * 0.12, 1.8);
      const mult = (hoverSlow ? 0.4 : 1) * (1 + boost);
      anim1.timeScale(mult);
      anim2.timeScale(mult);
    };

    const onEnter = () => {
      hoverSlow = true;
      applySpeed();
    };
    const onLeave = () => {
      hoverSlow = false;
      applySpeed();
    };

    section.addEventListener('mouseenter', onEnter);
    section.addEventListener('mouseleave', onLeave);

    const lenis = getLenis();
    const onScroll = (e) => {
      scrollVelocity = typeof e === 'object' && e?.velocity ? e.velocity : 0;
      applySpeed();
    };

    if (lenis) lenis.on('scroll', onScroll);

    ctx.add(() => {
      section.removeEventListener('mouseenter', onEnter);
      section.removeEventListener('mouseleave', onLeave);
      if (lenis) lenis.off('scroll', onScroll);
    });
  });
}
