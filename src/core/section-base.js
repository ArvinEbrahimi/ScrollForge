import { gsap } from 'gsap';

/**
 * Runs section setup inside a scoped gsap.context for clean teardown.
 * @param {HTMLElement | null} section
 * @param {(ctx: gsap.Context) => void} setup
 * @returns {(() => void) | null}
 */
export function withSectionContext(section, setup) {
  if (!section) return null;

  const ctx = gsap.context(() => {
    setup(ctx);
  }, section);

  return () => ctx.revert();
}

/**
 * @typedef {Object} SectionModule
 * @property {string} id
 * @property {() => (() => void) | null} init
 */

/**
 * @param {string} id
 * @param {() => (() => void) | null} init
 * @returns {SectionModule}
 */
export function defineSection(id, init) {
  return { id, init };
}
