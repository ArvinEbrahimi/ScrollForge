export const supportsViewTransitions =
  typeof document !== 'undefined' && typeof document.startViewTransition === 'function';

/**
 * @param {() => void} updateDOM
 * @returns {Promise<void>}
 */
export function runViewTransition(updateDOM) {
  if (!supportsViewTransitions) {
    updateDOM();
    return Promise.resolve();
  }

  const transition = document.startViewTransition(() => {
    updateDOM();
  });

  return transition.finished.catch(() => {});
}
