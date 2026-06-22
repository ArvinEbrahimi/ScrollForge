import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class ScrollOrchestrator {
  /** @type {import('./section-base.js').SectionModule[]} */
  #sections = [];

  /** @type {{ id: string, destroy: () => void }[]} */
  #instances = [];

  #debugPanel = null;

  /**
   * @param {string} id
   * @param {() => (() => void) | null} initFn
   */
  register(id, initFn) {
    this.#sections.push({ id, init: initFn });
    return this;
  }

  initAll() {
    this.destroyAll();

    for (const { id, init } of this.#sections) {
      const destroy = init();
      if (typeof destroy === 'function') {
        this.#instances.push({ id, destroy });
      }
    }

    this.#updateDebugPanel();
  }

  destroyAll() {
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
