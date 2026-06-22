import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';
import { getLenis } from '../utils/lenis.js';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/ArvinEbrahimi' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/arvinebrahimi' },
  { label: 'Portfolio', href: 'https://arvinebrahimi.dev' },
];

const SOCIAL = [
  { label: 'GitHub', href: 'https://github.com/ArvinEbrahimi', icon: 'GH' },
  { label: 'Twitter', href: 'https://twitter.com/arvinebrahimi', icon: 'X' },
  { label: 'Email', href: 'mailto:hello@arvinebrahimi.dev', icon: '@' },
];

export function initFooter() {
  const footer = document.querySelector('#footer');
  if (!footer) return null;

  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);

  footer.innerHTML = `
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="footer__logo">ScrollForge</span>
        <p class="footer__tagline">Cinematic scroll experiences</p>
      </div>
      <nav class="footer__nav" aria-label="Footer links">
        ${LINKS.map((l) => `<a href="${l.href}" target="_blank" rel="noopener noreferrer" data-cursor="text">${l.label}</a>`).join('')}
      </nav>
      <div class="footer__social">
        ${SOCIAL.map((s) => `<a href="${s.href}" class="footer__social-link" data-cursor="expand" aria-label="${s.label}" target="_blank" rel="noopener noreferrer">${s.icon}</a>`).join('')}
      </div>
      <div class="footer__meta">
        <span>© ${new Date().getFullYear()} Arvin Ebrahimi</span>
        <span class="footer__version">v${version} · ${buildDate}</span>
      </div>
      <button type="button" class="footer__top" aria-label="Back to top" data-cursor="text">↑ TOP</button>
    </div>
  `;

  const topBtn = footer.querySelector('.footer__top');

  return withSectionContext(footer, (ctx) => {
    const onTop = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.6 });
      } else {
        gsap.to(window, { scrollTo: 0, duration: 1, ease: 'power2.inOut' });
      }
    };

    topBtn.addEventListener('click', onTop);
    ctx.add(() => topBtn.removeEventListener('click', onTop));

    gsap.from('.footer__inner > *', {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 90%',
      },
    });
  });
}
