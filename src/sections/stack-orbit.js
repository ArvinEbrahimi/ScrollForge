import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { getLenis } from '../utils/lenis.js';
import { highlightMarqueeTech } from './marquee.js';

const STACK = [
  { name: 'GSAP', icon: '/icons/stack/gsap.svg', filter: 'GSAP' },
  { name: 'React', icon: '/icons/stack/react.svg', filter: 'React' },
  { name: 'Three.js', icon: '/icons/stack/threejs.svg', filter: 'Three.js' },
  { name: 'Django', icon: '/icons/stack/django.svg', filter: 'Django' },
  { name: 'TypeScript', icon: '/icons/stack/typescript.svg', filter: 'TypeScript' },
  { name: 'Docker', icon: '/icons/stack/docker.svg', filter: 'Docker' },
];

export function initStackOrbit() {
  const section = document.querySelector('#stack');
  if (!section) return null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  section.innerHTML = `
    <div class="stack__inner">
      <p class="stack__eyebrow">TECH STACK</p>
      <h2 class="stack__title">Tools in orbit</h2>
      <div class="stack__orbit-scene">
        <div class="stack__orbit-ring" aria-label="Technology stack">
          ${STACK.map(
            (item, i) => `
            <button
              type="button"
              class="stack__node"
              data-index="${i}"
              data-filter="${item.filter}"
              style="--i: ${i}; --count: ${STACK.length}"
              aria-label="${item.name}"
            >
              <img src="${item.icon}" alt="" width="40" height="40" loading="lazy" />
              <span class="stack__tooltip">${item.name}</span>
            </button>
          `
          ).join('')}
        </div>
        <div class="stack__core" aria-hidden="true">SF</div>
      </div>
      <p class="stack__hint">Click a logo to highlight it in the marquee</p>
    </div>
  `;

  const ring = section.querySelector('.stack__orbit-ring');
  const nodes = section.querySelectorAll('.stack__node');
  let spinTween = null;
  let paused = false;

  return withSectionContext(section, (ctx, add) => {
    if (!prefersReduced) {
      spinTween = gsap.to(ring, {
        rotateY: 360,
        duration: 28,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center',
      });
    }

    nodes.forEach((node) => {
      const onEnter = () => {
        paused = true;
        spinTween?.pause();
        gsap.to(node, { scale: 1.15, duration: 0.3, ease: 'back.out(2)' });
      };

      const onLeave = () => {
        paused = false;
        spinTween?.resume();
        gsap.to(node, { scale: 1, duration: 0.3, ease: 'power2.out' });
      };

      const onClick = () => {
        const filter = node.dataset.filter;
        highlightMarqueeTech(filter);
        const marquee = document.getElementById('marquee');
        if (marquee) {
          getLenis()?.scrollTo(marquee, { offset: 0, duration: 1.2 });
        }
      };

      node.addEventListener('mouseenter', onEnter);
      node.addEventListener('mouseleave', onLeave);
      node.addEventListener('click', onClick);

      add(() => {
        node.removeEventListener('mouseenter', onEnter);
        node.removeEventListener('mouseleave', onLeave);
        node.removeEventListener('click', onClick);
      });
    });

    add(() => {
      spinTween?.kill();
      if (paused) spinTween = null;
    });
  });
}
