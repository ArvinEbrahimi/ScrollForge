import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { getLenis } from '../utils/lenis.js';

const TECH_NAMES = [
  'GSAP',
  'ScrollTrigger',
  'Three.js',
  'WebGL',
  'React',
  'Next.js',
  'Django',
  'Framer Motion',
  'TypeScript',
  'PostgreSQL',
  'Docker',
  'WebRTC',
  'Redis',
];

/** @type {HTMLElement | null} */
let marqueeSection = null;

const accentize = (text) => text.replace(/·/g, '<span class="marquee__sep">·</span>');

const wrapTech = (text) => {
  let html = accentize(text);
  TECH_NAMES.forEach((name) => {
    const re = new RegExp(name.replace('.', '\\.'), 'g');
    html = html.replace(re, `<span class="marquee__tech" data-tech="${name}">${name}</span>`);
  });
  return html;
};

/**
 * @param {string} tech
 */
export function highlightMarqueeTech(tech) {
  if (!marqueeSection) return;

  marqueeSection.classList.add('is-filtering');
  marqueeSection.querySelectorAll('.marquee__tech').forEach((el) => {
    el.classList.toggle('is-highlighted', el.dataset.tech === tech);
  });

  window.setTimeout(() => {
    marqueeSection?.classList.remove('is-filtering');
    marqueeSection?.querySelectorAll('.marquee__tech.is-highlighted').forEach((el) => {
      el.classList.remove('is-highlighted');
    });
  }, 3200);
}

export function initMarquee() {
  const section = document.querySelector('#marquee');
  if (!section) return null;

  marqueeSection = section;

  const row1Items = 'GSAP · ScrollTrigger · Three.js · WebGL · React · Next.js · Django · ';
  const row2Items = 'Framer Motion · TypeScript · PostgreSQL · Docker · WebRTC · Redis · ';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildRow = (text) => `
    <div class="marquee__track">
      <span class="marquee__content">${wrapTech(text.repeat(4))}</span>
      <span class="marquee__content" aria-hidden="true">${wrapTech(text.repeat(4))}</span>
    </div>
  `;

  section.innerHTML = `
    <div class="marquee__wrapper">
      ${buildRow(row1Items)}
      ${buildRow(row2Items)}
    </div>
  `;

  if (prefersReduced) return null;

  return withSectionContext(section, (ctx, add) => {
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

    add(() => {
      section.removeEventListener('mouseenter', onEnter);
      section.removeEventListener('mouseleave', onLeave);
      if (lenis) lenis.off('scroll', onScroll);
    });
  });
}
