const CHARSET = '01ABCDEF!@#$%';

/**
 * @param {HTMLElement} el
 * @param {string} finalText
 * @param {number} duration
 */
export function scrambleElement(el, finalText, duration = 0.6) {
  return new Promise((resolve) => {
    const frames = Math.max(1, Math.round(duration / 0.032));
    let frame = 0;

    const tick = () => {
      frame++;
      const progress = frame / frames;
      let out = '';

      for (let i = 0; i < finalText.length; i++) {
        out +=
          progress > (i + 1) / finalText.length
            ? finalText[i]
            : CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }

      el.textContent = out;

      if (frame >= frames) {
        el.textContent = finalText;
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
}

/**
 * @param {NodeListOf<HTMLElement> | HTMLElement[]} chars
 * @param {number} duration
 */
export function scrambleChars(chars, duration = 0.6) {
  const items = [...chars];
  const finals = items.map((el) => el.textContent || '');
  const frames = Math.max(1, Math.round(duration / 0.032));
  let frame = 0;

  return new Promise((resolve) => {
    const tick = () => {
      frame++;
      const progress = frame / frames;

      items.forEach((el, idx) => {
        const final = finals[idx];
        el.textContent =
          progress > 0.85
            ? final
            : CHARSET[Math.floor(Math.random() * CHARSET.length)];
      });

      if (frame >= frames) {
        items.forEach((el, idx) => {
          el.textContent = finals[idx];
        });
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
}

/**
 * @param {HTMLElement} el
 * @param {string} text
 * @param {number} charDelay
 */
export function typewriter(el, text, charDelay = 0.04) {
  return new Promise((resolve) => {
    el.textContent = '';
    let i = 0;

    const step = () => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        setTimeout(step, charDelay * 1000);
      } else {
        resolve();
      }
    };

    step();
  });
}
