const STORAGE_KEY = 'scrollforge:sound';

class SoundEngine {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.unlocked = false;
    this.lastWhoosh = 0;
    this.mutedByDefault = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.enabled = !this.mutedByDefault && localStorage.getItem(STORAGE_KEY) === 'on';
  }

  async unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.unlocked = true;
  }

  /**
   * @param {boolean} on
   */
  setEnabled(on) {
    this.enabled = on;
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  }

  isEnabled() {
    return this.enabled;
  }

  /**
   * @param {number} freq
   * @param {number} duration
   * @param {OscillatorType} type
   * @param {number} volume
   */
  tone(freq, duration, type = 'sine', volume = 0.06) {
    if (!this.enabled || !this.unlocked || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  tick() {
    this.tone(920, 0.035, 'sine', 0.04);
  }

  chime() {
    this.tone(523, 0.1, 'sine', 0.05);
    setTimeout(() => this.tone(784, 0.14, 'sine', 0.04), 70);
  }

  whoosh() {
    const now = Date.now();
    if (now - this.lastWhoosh < 400) return;
    this.lastWhoosh = now;

    if (!this.enabled || !this.unlocked || !this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(t);
  }
}

export const sound = new SoundEngine();

/**
 * @param {import('lenis').default | null} lenis
 * @returns {(() => void) | null}
 */
export function initSound(lenis) {
  if (sound.mutedByDefault) return null;

  const panel = document.createElement('div');
  panel.className = 'site-controls';
  panel.innerHTML = `
    <button type="button" class="site-controls__btn site-controls__btn--sound" aria-label="Enable sound" aria-pressed="false">
      <span class="site-controls__icon site-controls__icon--off" aria-hidden="true">♪</span>
      <span class="site-controls__icon site-controls__icon--on" aria-hidden="true">♫</span>
    </button>
  `;

  document.body.appendChild(panel);

  const btn = panel.querySelector('.site-controls__btn--sound');

  const syncUI = () => {
    const on = sound.isEnabled();
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Disable sound' : 'Enable sound');
  };

  syncUI();

  const onToggle = async () => {
    await sound.unlock();
    sound.setEnabled(!sound.isEnabled());
    syncUI();
    if (sound.isEnabled()) sound.tick();
  };

  btn.addEventListener('click', onToggle);

  const onFirstInteraction = async () => {
    await sound.unlock();
    document.removeEventListener('pointerdown', onFirstInteraction);
  };
  document.addEventListener('pointerdown', onFirstInteraction, { once: true });

  const onScroll = (e) => {
    const velocity = typeof e === 'object' && e !== null && 'velocity' in e ? Math.abs(e.velocity) : 0;
    if (velocity > 1.5) sound.whoosh();
  };
  if (lenis) {
    lenis.on('scroll', onScroll);
  }

  const nav = document.querySelector('.scroll-nav');
  const onNavHover = (e) => {
    if (e.target.closest('[data-section]')) sound.tick();
  };
  nav?.addEventListener('mouseover', onNavHover);

  return () => {
    btn.removeEventListener('click', onToggle);
    document.removeEventListener('pointerdown', onFirstInteraction);
    nav?.removeEventListener('mouseover', onNavHover);
    if (lenis) lenis.off('scroll', onScroll);
    panel.remove();
  };
}
