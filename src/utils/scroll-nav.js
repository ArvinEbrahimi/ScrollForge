import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const SECTION_NAV = [
  { id: 'hero', label: 'Hero', abbr: 'HR' },
  { id: 'marquee', label: 'Technologies', abbr: 'TQ' },
  { id: 'pinned', label: 'Features', abbr: 'FT' },
  { id: 'horizontal', label: 'Projects', abbr: 'PJ' },
  { id: 'text-reveal', label: 'Philosophy', abbr: 'PH' },
  { id: 'svg-path', label: 'Workflow', abbr: 'WF' },
  { id: 'cards', label: 'Capabilities', abbr: 'CP' },
  { id: 'outro', label: 'Contact', abbr: 'CT' },
];

/**
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initScrollNav(lenis) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sections = SECTION_NAV.map((item) => ({
    ...item,
    el: document.getElementById(item.id),
  })).filter((item) => item.el);

  if (!sections.length) return null;

  const nav = document.createElement('nav');
  nav.className = isMobile ? 'scroll-nav scroll-nav--mobile' : 'scroll-nav scroll-nav--desktop';
  nav.setAttribute('aria-label', 'Page sections');

  if (isMobile) {
    nav.innerHTML = `
      <div class="scroll-nav__mobile-track" role="tablist">
        ${sections
          .map(
            (s) => `
          <button
            type="button"
            class="scroll-nav__mobile-btn"
            role="tab"
            data-section="${s.id}"
            aria-label="${s.label}"
            aria-selected="false"
          >${s.abbr}</button>
        `
          )
          .join('')}
      </div>
      <div class="scroll-nav__mobile-progress" aria-hidden="true">
        <div class="scroll-nav__mobile-progress-fill"></div>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <div class="scroll-nav__progress" aria-hidden="true">
        <div class="scroll-nav__progress-fill"></div>
      </div>
      <ul class="scroll-nav__list" role="tablist">
        ${sections
          .map(
            (s) => `
          <li class="scroll-nav__item">
            <button
              type="button"
              class="scroll-nav__btn"
              role="tab"
              data-section="${s.id}"
              aria-label="${s.label}"
              aria-selected="false"
            >
              <span class="scroll-nav__dot" aria-hidden="true"></span>
              <span class="scroll-nav__tooltip">${s.label}</span>
            </button>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  document.body.appendChild(nav);

  const buttons = nav.querySelectorAll('[data-section]');
  const triggers = [];
  let activeIndex = 0;

  const setActive = (index) => {
    activeIndex = index;
    const current = sections[index];

    buttons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    sections.forEach((s, i) => {
      if (i === index) {
        s.el.setAttribute('aria-current', 'true');
      } else {
        s.el.removeAttribute('aria-current');
      }
    });

    nav.classList.toggle('is-hidden', current?.id === 'outro');
  };

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, {
        offset: 0,
        duration: prefersReduced ? 0 : 1.4,
      });
      return;
    }

    gsap.to(window, {
      scrollTo: { y: target, autoKill: false },
      duration: prefersReduced ? 0 : 1,
      ease: 'power2.inOut',
    });
  };

  buttons.forEach((btn) => {
    const onClick = () => scrollToSection(btn.dataset.section);
    btn.addEventListener('click', onClick);
    triggers.push({ kill: () => btn.removeEventListener('click', onClick) });
  });

  sections.forEach((section, index) => {
    const st = ScrollTrigger.create({
      trigger: section.el,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => setActive(index),
      onEnterBack: () => setActive(index),
    });
    triggers.push(st);
  });

  const progressFill = nav.querySelector(
    isMobile ? '.scroll-nav__mobile-progress-fill' : '.scroll-nav__progress-fill'
  );

  if (progressFill) {
    const isHorizontal = isMobile;
    const progressTween = gsap.fromTo(
      progressFill,
      isHorizontal ? { scaleX: 0 } : { scaleY: 0 },
      {
        ...(isHorizontal ? { scaleX: 1 } : { scaleY: 1 }),
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );
    triggers.push(progressTween.scrollTrigger);
  }

  setActive(0);

  return () => {
    triggers.forEach((t) => t.kill?.());
    nav.remove();
    sections.forEach((s) => s.el.removeAttribute('aria-current'));
  };
}
