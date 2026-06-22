import { gsap } from 'gsap';

export function initMarquee() {
  const section = document.querySelector('#marquee');
  if (!section) return;

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

  if (prefersReduced) return;

  const [track1, track2] = section.querySelectorAll('.marquee__track');

  const anim1 = gsap.to(track1, { x: '-50%', ease: 'none', duration: 20, repeat: -1 });
  const anim2 = gsap.fromTo(track2, { x: '-50%' }, { x: '0%', ease: 'none', duration: 20, repeat: -1 });

  section.addEventListener('mouseenter', () => {
    anim1.timeScale(0.4);
    anim2.timeScale(0.4);
  });

  section.addEventListener('mouseleave', () => {
    anim1.timeScale(1);
    anim2.timeScale(1);
  });
}
