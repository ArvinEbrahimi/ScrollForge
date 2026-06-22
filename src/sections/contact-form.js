import { gsap } from 'gsap';
import { withSectionContext } from '../core/section-base.js';

const EMAIL = 'hello@arvinebrahimi.dev';

export function initContactForm() {
  const section = document.querySelector('#contact');
  if (!section) return null;

  section.innerHTML = `
    <div class="contact__inner">
      <div class="contact__header">
        <p class="contact__eyebrow">GET IN TOUCH</p>
        <h2 class="contact__title">Start a project</h2>
        <p class="contact__subtitle">Tell me about your idea — I'll reply within 48 hours.</p>
      </div>
      <form class="contact__form" novalidate>
        <div class="contact__field">
          <input class="contact__input" type="text" id="contact-name" name="name" required autocomplete="name" placeholder=" " />
          <label class="contact__label" for="contact-name">Name</label>
          <span class="contact__error" role="alert"></span>
        </div>
        <div class="contact__field">
          <input class="contact__input" type="email" id="contact-email" name="email" required autocomplete="email" placeholder=" " />
          <label class="contact__label" for="contact-email">Email</label>
          <span class="contact__error" role="alert"></span>
        </div>
        <div class="contact__field contact__field--area">
          <textarea class="contact__input contact__textarea" id="contact-message" name="message" rows="4" required placeholder=" "></textarea>
          <label class="contact__label" for="contact-message">Message</label>
          <span class="contact__error" role="alert"></span>
        </div>
        <button type="submit" class="contact__submit" data-cursor="text">
          <span class="contact__submit-text">Send message</span>
          <span class="contact__submit-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
          </span>
        </button>
      </form>
      <div class="contact__success" hidden role="status">
        <p>Message ready — opening your email client…</p>
      </div>
    </div>
  `;

  const form = section.querySelector('.contact__form');
  const successEl = section.querySelector('.contact__success');
  const submitBtn = section.querySelector('.contact__submit');

  const validateField = (input) => {
    const field = input.closest('.contact__field');
    const errorEl = field?.querySelector('.contact__error');
    let message = '';

    if (!input.value.trim()) {
      message = 'This field is required.';
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      message = 'Enter a valid email address.';
    }

    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message;
    field?.classList.toggle('has-error', Boolean(message));

    return !message;
  };

  return withSectionContext(section, (ctx) => {
    const inputs = form.querySelectorAll('.contact__input');

    inputs.forEach((input) => {
      const onBlur = () => validateField(input);
      input.addEventListener('blur', onBlur);
      ctx.add(() => input.removeEventListener('blur', onBlur));
    });

    const onSubmit = (e) => {
      e.preventDefault();
      const valid = [...inputs].every(validateField);
      if (!valid) return;

      const name = form.name.value.trim();
      const from = form.email.value.trim();
      const message = form.message.value.trim();
      const subject = encodeURIComponent(`ScrollForge inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${from}\n\n${message}`);
      const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

      submitBtn.classList.add('is-success');
      gsap.fromTo(
        submitBtn.querySelector('.contact__submit-check'),
        { scale: 0, rotate: -45 },
        { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.5)' }
      );

      successEl.hidden = false;
      gsap.from(successEl, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' });

      setTimeout(() => {
        window.location.href = mailto;
      }, 600);
    };

    form.addEventListener('submit', onSubmit);
    ctx.add(() => form.removeEventListener('submit', onSubmit));

    gsap.from('.contact__header', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
      },
    });
  });
}
