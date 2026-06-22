import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSectionContext } from '../core/section-base.js';
import { BREAKPOINTS, createMatchMedia } from '../utils/match-media.js';

export function initPinnedReveal() {
  const section = document.querySelector('#pinned');
  if (!section) return null;

  const panels = [
    {
      num: '01',
      title: 'GSAP ScrollTrigger',
      desc: 'Scroll-driven animations with pixel-perfect control over every keyframe.',
      video: '/video/feature-01.mp4',
    },
    {
      num: '02',
      title: 'Smooth Inertia',
      desc: 'Lenis smooth scroll synced with GSAP ticker for buttery 60fps performance.',
      video: '/video/feature-02.mp4',
    },
    {
      num: '03',
      title: 'Timeline Mastery',
      desc: 'Orchestrated sequences, staggers, and callbacks for cinematic storytelling.',
      video: '/video/feature-03.mp4',
    },
  ];

  section.innerHTML = `
    <div class="pinned__progress-bar"><div class="pinned__progress-fill"></div></div>
    <div class="pinned__container">
      ${panels
        .map(
          (p, i) => `
        <div class="pinned__panel" data-panel="${i}">
          <div class="pinned__left">
            <span class="pinned__num">${p.num}</span>
            <h2 class="pinned__title">${p.title}</h2>
            <p class="pinned__desc">${p.desc}</p>
          </div>
          <div class="pinned__visual">
            <video class="pinned__video" muted loop playsinline preload="none" data-src="${p.video}"></video>
            <div class="pinned__visual-fallback" aria-hidden="true"></div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const panelEls = section.querySelectorAll('.pinned__panel');
  const videos = section.querySelectorAll('.pinned__video');

  videos.forEach((video) => {
    video.addEventListener('error', () => {
      video.style.display = 'none';
    });
  });

  const loadVideo = (index) => {
    const video = videos[index];
    if (!video || video.dataset.loaded) return;
    const src = video.dataset.src;
    if (!src) return;
    video.src = src;
    video.dataset.loaded = '1';
    video.play().catch(() => {
      video.style.display = 'none';
    });
  };

  return withSectionContext(section, (ctx, add) => {
    const revertMedia = createMatchMedia({
      [`${BREAKPOINTS.mobile} and (prefers-reduced-motion: no-preference)`]: () => {
        gsap.set(panelEls, { opacity: 1, y: 0, clearProps: 'transform' });

        panelEls.forEach((panel, i) => {
          gsap.from(panel, {
            opacity: 0,
            y: 48,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              onEnter: () => loadVideo(i),
            },
          });
        });

        gsap.to('.pinned__progress-fill', {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      },
      [`(min-width: 769px) and (prefers-reduced-motion: no-preference)`]: () => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.pinned__container',
          pinReparent: true,
        });

        gsap.to('.pinned__progress-fill', {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.35) loadVideo(0);
              else if (p < 0.7) loadVideo(1);
              else loadVideo(2);
            },
          },
        });

        gsap.set(panelEls[0], { opacity: 1, y: 0, zIndex: 3 });
        gsap.set(panelEls[1], { zIndex: 2 });
        gsap.set(panelEls[2], { zIndex: 1 });

        tl.to(panelEls[0], { opacity: 0, y: -60, duration: 1 }, 0.55)
          .fromTo(panelEls[1], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, zIndex: 3 }, 0.25)
          .to(panelEls[1], { opacity: 0, y: -60, duration: 1, zIndex: 1 }, 1.55)
          .fromTo(panelEls[2], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, zIndex: 3 }, 1.25);

        panelEls.forEach((panel) => {
          const visual = panel.querySelector('.pinned__visual');
          if (!visual) return;

          const rotX = gsap.quickTo(visual, 'rotateX', { duration: 0.45, ease: 'power2.out' });
          const rotY = gsap.quickTo(visual, 'rotateY', { duration: 0.45, ease: 'power2.out' });

          const onMove = (e) => {
            const rect = panel.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            rotY(px * 16);
            rotX(-py * 16);
          };

          const onLeave = () => {
            gsap.to(visual, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          panel.addEventListener('mousemove', onMove);
          panel.addEventListener('mouseleave', onLeave);

          add(() => {
            panel.removeEventListener('mousemove', onMove);
            panel.removeEventListener('mouseleave', onLeave);
          });
        });
      },
      [BREAKPOINTS.reducedMotion]: () => {
        gsap.set(panelEls, { opacity: 1, y: 0 });
        gsap.set('.pinned__progress-fill', { width: '100%' });
      },
    });

    add(revertMedia);
  });
}
