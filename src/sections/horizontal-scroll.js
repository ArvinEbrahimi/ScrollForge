import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';
import { createCaseModal } from '../components/case-modal.js';

export function initHorizontalScroll() {
  const section = document.querySelector('#horizontal');
  if (!section) return null;

  const projects = [
    {
      label: 'PROJECT 01',
      title: 'Cinematic\nHero',
      desc: 'Three.js + post-processing pipeline',
      image: '/images/projects/project-01.svg',
      tags: ['Three.js', 'WebGL', 'GSAP'],
      link: 'https://github.com/ArvinEbrahimi',
    },
    {
      label: 'PROJECT 02',
      title: 'SaaS\nPlatform',
      desc: 'Django + React full-stack architecture',
      image: '/images/projects/project-02.svg',
      tags: ['Django', 'React', 'PostgreSQL'],
      link: 'https://github.com/ArvinEbrahimi',
    },
    {
      label: 'PROJECT 03',
      title: 'Real-time\nKanban',
      desc: 'WebSocket + Django Channels',
      image: '/images/projects/project-03.svg',
      tags: ['WebSocket', 'Channels', 'Redis'],
    },
    {
      label: 'PROJECT 04',
      title: 'WebRTC\nCalls',
      desc: 'Peer-to-peer signaling from scratch',
      image: '/images/projects/project-04.svg',
      tags: ['WebRTC', 'Signaling', 'P2P'],
    },
    {
      label: 'PROJECT 05',
      title: 'Motion\nLibrary',
      desc: 'Framer Motion component system',
      image: '/images/projects/project-05.svg',
      tags: ['Framer Motion', 'React', 'Design System'],
    },
  ];

  section.innerHTML = `
    <div class="horiz__wrapper">
      <div class="horiz__track">
        ${projects
          .map(
            (p, i) => `
          <button type="button" class="horiz__card" data-cursor="expand" data-project="${i}" aria-label="Open ${p.title.replace('\n', ' ')} case study">
            <span class="horiz__label">${p.label}</span>
            <h2 class="horiz__title">${p.title.replace(/\n/g, '<br>')}</h2>
            <p class="horiz__desc">${p.desc}</p>
            <div class="horiz__img">
              <img src="${p.image}" alt="" loading="lazy" />
            </div>
            <span class="horiz__cta">VIEW →</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  const track = section.querySelector('.horiz__track');
  const cards = section.querySelectorAll('.horiz__card');
  const caseModal = createCaseModal();

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const index = Number(card.dataset.project);
      caseModal.open(card, projects[index]);
    });
  });

  return withSectionContext(section, (ctx) => {
    ctx.add(() => caseModal.destroy());

    const revertMedia = createMatchMedia({
      [`${BREAKPOINTS.mobile} and (prefers-reduced-motion: no-preference)`]: () => {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
        });
      },
      [`(min-width: 769px) and (prefers-reduced-motion: no-preference)`]: () => {
        const tween = gsap.to(track, {
          id: 'horiz-anim',
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${track.scrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.9, opacity: 0.5 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 80%',
                end: 'left 40%',
                scrub: true,
              },
            }
          );
        });
      },
      [BREAKPOINTS.reducedMotion]: () => {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
      },
    });

    ctx.add(revertMedia);
  });
}
