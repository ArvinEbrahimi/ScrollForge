import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';

export function initHorizontalScroll() {
  const section = document.querySelector('#horizontal');
  if (!section) return null;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const projects = [
    { label: 'PROJECT 01', title: 'Cinematic\nHero', desc: 'Three.js + post-processing pipeline' },
    { label: 'PROJECT 02', title: 'SaaS\nPlatform', desc: 'Django + React full-stack architecture' },
    { label: 'PROJECT 03', title: 'Real-time\nKanban', desc: 'WebSocket + Django Channels' },
    { label: 'PROJECT 04', title: 'WebRTC\nCalls', desc: 'Peer-to-peer signaling from scratch' },
    { label: 'PROJECT 05', title: 'Motion\nLibrary', desc: 'Framer Motion component system' },
  ];

  section.innerHTML = `
    <div class="horiz__wrapper">
      <div class="horiz__track">
        ${projects
          .map(
            (p) => `
          <div class="horiz__card" data-cursor="expand">
            <span class="horiz__label">${p.label}</span>
            <h2 class="horiz__title">${p.title.replace(/\n/g, '<br>')}</h2>
            <p class="horiz__desc">${p.desc}</p>
            <div class="horiz__img-placeholder"></div>
            <span class="horiz__cta">VIEW →</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  const track = section.querySelector('.horiz__track');
  const cards = section.querySelectorAll('.horiz__card');

  return withSectionContext(section, () => {
    if (isMobile) {
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
      return;
    }

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
  });
}
