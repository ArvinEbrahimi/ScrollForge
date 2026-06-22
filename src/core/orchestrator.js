import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class ScrollOrchestrator {
  /** @type {import('./section-base.js').SectionModule[]} */
  #sections = [];

  /** @type {{ id: string, destroy: () => void }[]} */
  #instances = [];

  /** @type {IntersectionObserver[]} */
  #lazyObservers = [];

  #debugPanel = null;

  /**
   * @param {string} id
   * @param {() => (() => void) | null} initFn
   * @param {{ lazy?: boolean }} [options]
   */
  register(id, initFn, options = {}) {
    this.#sections.push({ id, init: initFn, lazy: options.lazy ?? false });
    return this;
  }

  initAll() {
    this.destroyAll();

    for (const section of this.#sections) {
      if (section.lazy) {
        this.#observeLazy(section);
      } else {
        this.#initOne(section);
      }
    }

    this.#updateDebugPanel();
  }

  /**
   * @param {{ id: string, init: () => (() => void) | null }} section
   */
  #initOne(section) {
    if (this.#instances.some((i) => i.id === section.id)) return;

    const destroy = section.init();
    if (typeof destroy === 'function') {
      this.#instances.push({ id: section.id, destroy });
    }
  }

  /**
   * @param {{ id: string, init: () => (() => void) | null }} section
   */
  #observeLazy(section) {
    const el = document.getElementById(section.id);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        this.#initOne(section);
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          this.#updateDebugPanel();
        });
      },
      { rootMargin: '50% 0px', threshold: 0 }
    );

    observer.observe(el);
    this.#lazyObservers.push(observer);
  }

  destroyAll() {
    this.#lazyObservers.forEach((observer) => observer.disconnect());
    this.#lazyObservers = [];

    for (const { destroy } of this.#instances) {
      destroy();
    }
    this.#instances = [];
    this.#updateDebugPanel();
  }

  refresh() {
    ScrollTrigger.refresh();
    this.#updateDebugPanel();
  }

  pause() {
    ScrollTrigger.getAll().forEach((st) => st.disable(false));
  }

  resume() {
    ScrollTrigger.getAll().forEach((st) => st.enable(false, false));
    ScrollTrigger.update();
  }

  getStats() {
    return {
      sections: this.#instances.length,
      scrollTriggers: ScrollTrigger.getAll().length,
      registered: this.#sections.length,
    };
  }

  mountDebugPanel() {
    if (this.#debugPanel || typeof document === 'undefined') return;

    const panel = document.createElement('aside');
    panel.className = 'sf-debug';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="sf-debug__title">ScrollForge Debug</div>
      <div class="sf-debug__stat" data-stat="sections">Sections: 0</div>
      <div class="sf-debug__stat" data-stat="triggers">ScrollTriggers: 0</div>
      <div class="sf-debug__actions">
        <button type="button" data-action="refresh">Refresh ST</button>
        <button type="button" data-action="reinit">Reinit All</button>
        <button type="button" data-action="pause">Pause</button>
        <button type="button" data-action="resume">Resume</button>
      </div>
    `;

    panel.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'refresh') this.refresh();
      if (action === 'reinit') this.initAll();
      if (action === 'pause') this.pause();
      if (action === 'resume') this.resume();
    });

    document.body.appendChild(panel);
    this.#debugPanel = panel;
    this.#updateDebugPanel();
  }

  #updateDebugPanel() {
    if (!this.#debugPanel) return;

    const { sections, scrollTriggers } = this.getStats();
    this.#debugPanel.querySelector('[data-stat="sections"]').textContent =
      `Sections: ${sections}`;
    this.#debugPanel.querySelector('[data-stat="triggers"]').textContent =
      `ScrollTriggers: ${scrollTriggers}`;
  }
}
