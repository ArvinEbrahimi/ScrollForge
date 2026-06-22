import * as THREE from 'three';
import { gsap } from 'gsap';

const PARTICLE_COUNT = 1600;
const ACCENT = 0xc8f04e;

/**
 * @param {HTMLElement} section
 * @returns {(() => void) | null}
 */
export function initHeroParticles(section) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__particles';
  canvas.dataset.depth = '0.5';
  canvas.setAttribute('aria-hidden', 'true');
  section.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const base = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const x = (Math.random() - 0.5) * 55;
    const y = (Math.random() - 0.5) * 35;
    const z = (Math.random() - 0.5) * 25;
    positions[i3] = base[i3] = x;
    positions[i3 + 1] = base[i3 + 1] = y;
    positions[i3 + 2] = base[i3 + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: ACCENT,
    size: 0.14,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let dispersion = 0;

  const setSize = () => {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  };

  setSize();

  const onMouseMove = (e) => {
    const rect = section.getBoundingClientRect();
    mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    dispersion = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll, { passive: true });

  const render = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    const pos = geometry.attributes.position.array;
    const t = performance.now() * 0.001;
    const spread = 1 + dispersion * 2.2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = base[i3] * spread + Math.sin(t + i * 0.1) * 0.04;
      pos[i3 + 1] = base[i3 + 1] * spread + Math.cos(t * 0.7 + i) * 0.04;
      pos[i3 + 2] = base[i3 + 2] * spread;
    }
    geometry.attributes.position.needsUpdate = true;

    points.rotation.y = t * 0.04 + mouse.x * 0.12;
    points.rotation.x = mouse.y * 0.08;
    camera.position.x = mouse.x * 1.2;
    camera.position.y = -mouse.y * 0.8;
    material.opacity = 0.5 * (1 - dispersion * 0.85);

    renderer.render(scene, camera);
  };

  gsap.ticker.add(render);

  const ro = new ResizeObserver(setSize);
  ro.observe(section);

  return () => {
    gsap.ticker.remove(render);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    ro.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
