export const PARTICLE_COUNT = 4600;

const SIZE_MUL = 0.72;
const ALPHA_BOOST = 1.18;

/** @param {Float32Array} sizes @param {Float32Array} alphas @param {number} count */
function finalizeParticles(sizes, alphas, count) {
  for (let i = 0; i < count; i++) {
    sizes[i] *= SIZE_MUL;
    alphas[i] = Math.min(1, alphas[i] * ALPHA_BOOST);
  }
}

/** @param {number} i @param {number} n @param {number} radius */
function fibSphere(i, n, radius) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + 5 ** 0.5) * i;
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

function rotY(x, y, z, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

function rotX(x, y, z, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

/**
 * @param {number} count
 * @returns {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }}
 */
export function buildAtom(count) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  const nucleusN = Math.floor(count * 0.14);
  const ringN = count - nucleusN;
  const rings = 3;

  for (let i = 0; i < count; i++) {
    let x;
    let y;
    let z;
    let size = 1;
    let alpha = 0.75;

    if (i < nucleusN) {
      const layer = i % 3;
      const r = 1.4 + layer * 0.45 + (i % 11) * 0.025;
      [x, y, z] = fibSphere(i, nucleusN, r);
      size = 1.6 + layer * 0.2;
      alpha = 0.95;
    } else {
      const ri = i - nucleusN;
      const ring = ri % rings;
      const idx = Math.floor(ri / rings);
      const perRing = Math.ceil(ringN / rings);
      const t = (idx / perRing) * Math.PI * 2;
      const rx = 8 + ring * 1.1;
      const ry = 5 + ring * 0.55;
      const wobble = Math.sin(t * 5 + ring) * 0.35;
      x = Math.cos(t) * (rx + wobble);
      y = Math.sin(t) * ry;
      z = Math.sin(t * 3 + ring * 0.7) * 1.8;
      const tilt = ring * (Math.PI / 2.6) - Math.PI / 5;
      [x, y, z] = rotX(x, y, z, tilt);
      [x, y, z] = rotY(x, y, z, ring * 1.05 + Math.PI / 6);

      const isElectron = idx % 18 === 0;
      size = isElectron ? 1.45 : 0.85 + (idx % 5) * 0.04;
      alpha = isElectron ? 1 : 0.55 + (ring * 0.12);
    }

    const i3 = i * 3;
    positions[i3] = x;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = z;
    sizes[i] = size;
    alphas[i] = alpha;
  }

  finalizeParticles(sizes, alphas, count);
  return { positions, sizes, alphas };
}

/**
 * @param {number} count
 * @returns {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }}
 */
export function buildRocket(count) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  const bodyN = Math.floor(count * 0.48);
  const panelN = Math.floor(count * 0.12);
  const windowN = Math.floor(count * 0.06);
  const noseN = Math.floor(count * 0.14);
  const finN = Math.floor(count * 0.08);
  const flameN = count - bodyN - panelN - windowN - noseN - finN;

  let i = 0;

  for (let j = 0; j < bodyN; j++, i++) {
    const h = j / bodyN;
    const y = -5.5 + h * 11;
    const angle = h * Math.PI * 22 + j * 0.27;
    const r = 2.35 - h * 0.4 + Math.sin(angle * 3) * 0.06;
    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = Math.sin(angle) * r;
    sizes[i] = 0.9 + (j % 4) * 0.05;
    alphas[i] = 0.7;
  }

  for (let j = 0; j < panelN; j++, i++) {
    const stripe = j % 4;
    const h = Math.floor(j / 4) / Math.ceil(panelN / 4);
    const y = -4 + h * 9;
    const angle = (stripe / 4) * Math.PI * 2;
    const r = 2.05;
    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = Math.sin(angle) * r;
    sizes[i] = 0.65;
    alphas[i] = 0.45;
  }

  for (let j = 0; j < windowN; j++, i++) {
    const t = (j / windowN) * Math.PI * 2;
    const r = 1.55;
    const y = 2.2;
    const i3 = i * 3;
    positions[i3] = Math.cos(t) * r;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = Math.sin(t) * r;
    sizes[i] = 1.1;
    alphas[i] = 0.9;
  }

  for (let j = 0; j < noseN; j++, i++) {
    const h = j / noseN;
    const y = 5.5 + h * 6;
    const angle = j * 0.61 + h * Math.PI * 8;
    const r = (1 - h) * 2.4;
    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = Math.sin(angle) * r;
    sizes[i] = 0.95 - h * 0.3;
    alphas[i] = 0.8;
  }

  for (let j = 0; j < finN; j++, i++) {
    const fin = j % 3;
    const h = (j % Math.ceil(finN / 3)) / Math.ceil(finN / 3);
    const angle = (fin / 3) * Math.PI * 2;
    const spread = h * 3.2;
    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * (2.6 + spread);
    positions[i3 + 1] = -5.5 - h * 2.8 + 1.5;
    positions[i3 + 2] = Math.sin(angle) * (2.6 + spread);
    sizes[i] = 1 + h * 0.3;
    alphas[i] = 0.75;
  }

  for (let j = 0; j < flameN; j++, i++) {
    const angle = j * 0.48;
    const h = (j % 16) / 16;
    const r = 0.8 + h * 3.2 + Math.sin(j * 0.9) * 0.5;
    const i3 = i * 3;
    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = -8.5 - h * 3.5 + 1.5;
    positions[i3 + 2] = Math.sin(angle) * r * 0.65;
    sizes[i] = 1.2 + h * 0.8;
    alphas[i] = 0.5 + (1 - h) * 0.4;
  }

  finalizeParticles(sizes, alphas, count);
  return { positions, sizes, alphas };
}

/**
 * @param {number} count
 * @returns {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }}
 */
export function buildHelix(count) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  const rungN = Math.floor(count * 0.22);
  const strandN = count - rungN;
  const half = Math.floor(strandN / 2);
  const turns = 4;
  const height = 17;
  const radius = 4.2;
  const rungSteps = 16;

  let i = 0;

  for (let s = 0; s < strandN; s++, i++) {
    const strand = s < half ? 0 : 1;
    const idx = strand === 0 ? s : s - half;
    const n = strand === 0 ? half : strandN - half;
    const t = (idx / n) * Math.PI * 2 * turns;
    const y = -height / 2 + (idx / n) * height;
    const phase = strand * Math.PI;
    const ripple = Math.sin(t * 6) * 0.15;
    const i3 = i * 3;
    positions[i3] = Math.cos(t + phase) * (radius + ripple);
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = Math.sin(t + phase) * (radius + ripple);
    sizes[i] = 0.88 + (idx % 3) * 0.06;
    alphas[i] = 0.72;
  }

  for (let r = 0; r < rungN; r++, i++) {
    const rungIdx = r % rungSteps;
    const t = (rungIdx / rungSteps) * Math.PI * 2 * turns;
    const y = -height / 2 + (rungIdx / rungSteps) * height;
    const along = (r % 8) / 8;
    const x1 = Math.cos(t) * radius;
    const z1 = Math.sin(t) * radius;
    const x2 = Math.cos(t + Math.PI) * radius;
    const z2 = Math.sin(t + Math.PI) * radius;
    const i3 = i * 3;
    positions[i3] = x1 + (x2 - x1) * along;
    positions[i3 + 1] = y + 1.5;
    positions[i3 + 2] = z1 + (z2 - z1) * along;
    sizes[i] = 0.5;
    alphas[i] = 0.38;
  }

  finalizeParticles(sizes, alphas, count);
  return { positions, sizes, alphas };
}

/**
 * @param {number} count
 * @param {{ positions: Float32Array } | Float32Array} fromShape
 * @returns {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }}
 */
export function buildBurst(count, fromShape) {
  const from = fromShape.positions ?? fromShape;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const angle = (i / count) * Math.PI * 2 + (i % 23) * 0.14;
    const spread = 6 + (i % 29) * 0.4;
    const fx = from[i3] ?? 0;
    const fy = from[i3 + 1] ?? 0;
    const fz = from[i3 + 2] ?? 0;
    positions[i3] = fx + Math.cos(angle) * spread;
    positions[i3 + 1] = fy + Math.sin(angle * 0.5) * spread * 0.35;
    positions[i3 + 2] = fz + Math.sin(angle) * spread * 0.8;
    sizes[i] = 0.95 + (i % 4) * 0.08;
    alphas[i] = 0.8;
  }

  finalizeParticles(sizes, alphas, count);
  return { positions, sizes, alphas };
}

export const HERO_PHASES = {
  hold1: [0, 0.18],
  morph1: [0.18, 0.32],
  hold2: [0.32, 0.5],
  morph2: [0.5, 0.64],
  hold3: [0.64, 0.78],
  burst: [0.78, 1],
};

/**
 * @param {number} progress
 * @param {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }} atom
 * @param {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }} rocket
 * @param {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }} helix
 * @param {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }} burst
 * @param {{ positions: Float32Array, sizes: Float32Array, alphas: Float32Array }} out
 * @param {number} count
 */
export function sampleMorph(progress, atom, rocket, helix, burst, out, count) {
  const p = Math.max(0, Math.min(1, progress));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  const lerpShape = (from, to, t) => {
    const e = ease(t);
    for (let i = 0; i < count * 3; i++) {
      out.positions[i] = from.positions[i] + (to.positions[i] - from.positions[i]) * e;
    }
    for (let i = 0; i < count; i++) {
      out.sizes[i] = from.sizes[i] + (to.sizes[i] - from.sizes[i]) * e;
      out.alphas[i] = from.alphas[i] + (to.alphas[i] - from.alphas[i]) * e;
    }
  };

  const [, h1b] = HERO_PHASES.hold1;
  const [m1a, m1b] = HERO_PHASES.morph1;
  const [, h2b] = HERO_PHASES.hold2;
  const [m2a, m2b] = HERO_PHASES.morph2;
  const [, h3b] = HERO_PHASES.hold3;
  const [ba] = HERO_PHASES.burst;

  if (p <= h1b) {
    out.positions.set(atom.positions);
    out.sizes.set(atom.sizes);
    out.alphas.set(atom.alphas);
  } else if (p <= m1b) {
    lerpShape(atom, rocket, (p - m1a) / (m1b - m1a));
  } else if (p <= h2b) {
    out.positions.set(rocket.positions);
    out.sizes.set(rocket.sizes);
    out.alphas.set(rocket.alphas);
  } else if (p <= m2b) {
    lerpShape(rocket, helix, (p - m2a) / (m2b - m2a));
  } else if (p <= h3b) {
    out.positions.set(helix.positions);
    out.sizes.set(helix.sizes);
    out.alphas.set(helix.alphas);
  } else {
    lerpShape(helix, burst, (p - ba) / (1 - ba));
  }
}
