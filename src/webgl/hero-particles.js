import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PARTICLE_COUNT,
  buildAtom,
  buildRocket,
  buildHelix,
  buildBurst,
  sampleMorph,
  HERO_PHASES,
} from './hero-shapes.js';

// Fine white dust with soft specular shine
const PARTICLE_WHITE = new THREE.Color(0xffffff);
const PARTICLE_SHINE = new THREE.Color(0xfffef5);
const POINT_SIZE_SCALE = 0.58;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPixelRatio;
  uniform float uSizeBoost;
  uniform float uSizeScale;
  uniform float uTime;
  varying float vAlpha;
  varying float vBright;
  varying float vSparkle;

  void main() {
    vAlpha = aAlpha;
    vBright = aSize > 1.05 ? 1.0 : 0.78;

    vec3 p = position;
    vSparkle = sin(uTime * (1.4 + aSize * 0.35) + p.x * 2.7 + p.y * 4.1 + p.z * 1.9);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uSizeBoost * uSizeScale * uPixelRatio * (240.0 / max(-mv.z, 1.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform vec3 uShineColor;
  varying float vAlpha;
  varying float vBright;
  varying float vSparkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    float core = (1.0 - smoothstep(0.0, 0.1, dist)) * vBright;
    float halo = smoothstep(0.46, 0.18, dist) * (1.0 - core);

    vec2 shineUv = uv - vec2(-0.07, 0.09);
    float shine = exp(-dot(shineUv, shineUv) * 95.0) * vBright;
    float twinkle = 0.9 + 0.1 * vSparkle;

    vec3 col = mix(uColor, uShineColor, core * 0.35 + shine * 0.65);
    col *= 0.94 + core * 0.38 + shine * 0.42;
    col *= twinkle;

    float alpha = (core * 0.98 + halo * 0.16 + shine * 0.28) * vAlpha;
    if (alpha < 0.015) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

const CONTACT_INNER_NDC = 0.042;
const CONTACT_OUTER_NDC = 0.118;
const SCATTER_STRENGTH = 3.35;
const SCATTER_MAX_OFFSET = 5.2;
const REPULSE_STIFFNESS = 0.14;
const REPULSE_DAMPING = 0.8;

/** @param {number} screenDist */
function contactFalloff(screenDist) {
  if (screenDist >= CONTACT_OUTER_NDC) return 0;
  if (screenDist <= CONTACT_INNER_NDC) return 1;
  const t = 1 - (screenDist - CONTACT_INNER_NDC) / (CONTACT_OUTER_NDC - CONTACT_INNER_NDC);
  return t * t * (3 - 2 * t);
}

/**
 * @param {HTMLElement} host
 * @param {string} scrollTriggerId
 * @param {HTMLElement | null} interactionRoot pinned hero surface for mouse bounds
 */
export function initHeroParticles(host, scrollTriggerId = 'hero-scroll', interactionRoot = null) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !host) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__particles';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 120);
  camera.position.set(0, 1, 24);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const atom = buildAtom(PARTICLE_COUNT);
  const rocket = buildRocket(PARTICLE_COUNT);
  const helix = buildHelix(PARTICLE_COUNT);
  const burst = buildBurst(PARTICLE_COUNT, helix.positions);

  const morphTarget = {
    positions: new Float32Array(PARTICLE_COUNT * 3),
    sizes: new Float32Array(PARTICLE_COUNT),
    alphas: new Float32Array(PARTICLE_COUNT),
  };

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));


  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: PARTICLE_WHITE },
      uShineColor: { value: PARTICLE_SHINE },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uSizeBoost: { value: 1 },
      uSizeScale: { value: POINT_SIZE_SCALE },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
  const boundsEl = interactionRoot ?? host.parentElement ?? host;
  const raycaster = new THREE.Raycaster();
  const mouseNdc = new THREE.Vector2();
  const cursorLocal = new THREE.Vector3();
  const cursorHit = new THREE.Vector3();
  const shapeCenter = new THREE.Vector3(0, 1.5, 0);
  const viewDir = new THREE.Vector3();
  const cursorPlane = new THREE.Plane();
  const particleNdc = new THREE.Vector3();
  const repulse = new Float32Array(PARTICLE_COUNT * 3);
  const repulseVel = new Float32Array(PARTICLE_COUNT * 3);
  let prevMouseX = 0;
  let prevMouseY = 0;
  let scrollProgress = 0;
  let prevScrollProgress = 0;
  let intro = 1;
  let orbitPhase = 0;
  const burstStart = HERO_PHASES.burst[0];

  const applyMorph = (p) => {
    sampleMorph(p, atom, rocket, helix, burst, morphTarget, PARTICLE_COUNT);
    const burstT = p >= burstStart ? (p - burstStart) / (1 - burstStart) : 0;
    material.uniforms.uSizeBoost.value = 1 + burstT * 0.35;
  };

  const setProgress = (p) => {
    const clamped = gsap.utils.clamp(0, 1, p);
    prevScrollProgress = scrollProgress;
    scrollProgress = clamped;
    applyMorph(scrollProgress);
  };

  applyMorph(0);

  for (let i = 0; i < PARTICLE_COUNT * 3; i++) positions[i] = morphTarget.positions[i];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    sizes[i] = morphTarget.sizes[i];
    alphas[i] = morphTarget.alphas[i];
  }

  const readScrollProgress = () => {
    const st = ScrollTrigger.getById(scrollTriggerId);
    return st ? gsap.utils.clamp(0, 1, st.progress) : scrollProgress;
  };

  const setSize = () => {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    if (w < 2 || h < 2) return;
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    material.uniforms.uPixelRatio.value = pr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  setSize();

  const onMouseMove = (e) => {
    const rect = boundsEl.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inside) {
      mouse.tx = 0;
      mouse.ty = 0;
      mouse.inside = false;
      return;
    }

    mouse.inside = true;
    mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const updateCursorLocal = () => {
    if (!mouse.inside) {
      cursorLocal.set(9999, 9999, 0);
      return;
    }

    points.updateMatrixWorld(true);
    mouseNdc.set(mouse.x, -mouse.y);
    raycaster.setFromCamera(mouseNdc, camera);

    shapeCenter.set(0, 1.5, 0);
    shapeCenter.applyMatrix4(points.matrixWorld);
    camera.getWorldDirection(viewDir);
    cursorPlane.setFromNormalAndCoplanarPoint(viewDir, shapeCenter);

    if (!raycaster.ray.intersectPlane(cursorPlane, cursorHit)) {
      cursorLocal.set(9999, 9999, 0);
      return;
    }

    cursorLocal.copy(cursorHit);
    points.worldToLocal(cursorLocal);
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  const render = () => {
    const p = readScrollProgress();
    const scrollingBack = p < prevScrollProgress - 0.001;

    if (Math.abs(p - scrollProgress) > 0.00001) {
      prevScrollProgress = scrollProgress;
      scrollProgress = p;
      applyMorph(scrollProgress);
    }

    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;

    const mouseVelX = mouse.x - prevMouseX;
    const mouseVelY = mouse.y - prevMouseY;
    prevMouseX = mouse.x;
    prevMouseY = mouse.y;
    const moveBoost = 1 + Math.min(Math.hypot(mouseVelX, mouseVelY) * 14, 1.1);

    const burstT = scrollProgress >= burstStart
      ? (scrollProgress - burstStart) / (1 - burstStart)
      : 0;
    const repulseStrength = (mouse.inside ? 1 : 0) * (1 - burstT * 0.6);

    updateCursorLocal();

    const pos = geometry.attributes.position.array;
    const sz = geometry.attributes.aSize.array;
    const al = geometry.attributes.aAlpha.array;
    const t = performance.now() * 0.001;
    const inAtom = scrollProgress < 0.2;
    const floatAmp = 0.015;

    let snap = scrollingBack ? 0.38 : 0.11;
    if (scrollProgress >= burstStart) snap = 0.15;

    orbitPhase += inAtom ? 0.004 : 0.001;

    points.updateMatrixWorld(true);
    const mouseNdcY = -mouse.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let tx = morphTarget.positions[i3];
      let ty = morphTarget.positions[i3 + 1];
      let tz = morphTarget.positions[i3 + 2];

      if (inAtom && i >= Math.floor(PARTICLE_COUNT * 0.14)) {
        const ring = (i - Math.floor(PARTICLE_COUNT * 0.14)) % 3;
        const orbitOffset = orbitPhase * (1 + ring * 0.15);
        const ox = tx;
        const oz = tz;
        tx = ox * Math.cos(orbitOffset) - oz * Math.sin(orbitOffset);
        tz = ox * Math.sin(orbitOffset) + oz * Math.cos(orbitOffset);
      }

      const pdx = tx - cursorLocal.x;
      const pdy = ty - cursorLocal.y;
      const pdz = tz - cursorLocal.z;

      let targetRx = 0;
      let targetRy = 0;
      let targetRz = 0;

      if (mouse.inside && repulseStrength > 0) {
        particleNdc.set(tx, ty, tz);
        particleNdc.applyMatrix4(points.matrixWorld);
        particleNdc.project(camera);

        const screenDist = Math.hypot(
          particleNdc.x - mouse.x,
          particleNdc.y - mouseNdcY,
        );

        const falloff = contactFalloff(screenDist);

        if (falloff > 0) {
          const dist3d = Math.hypot(pdx, pdy, pdz);
          const push = falloff * falloff * SCATTER_STRENGTH * repulseStrength * moveBoost;

          let dirX;
          let dirY;
          let dirZ;

          if (dist3d > 0.08) {
            dirX = pdx / dist3d;
            dirY = pdy / dist3d;
            dirZ = pdz / dist3d;
          } else {
            const a = i * 0.73;
            const b = i * 0.41;
            dirX = Math.cos(a) * Math.sin(b);
            dirY = Math.sin(a) * 0.85;
            dirZ = Math.cos(a) * Math.cos(b);
          }

          targetRx = dirX * push;
          targetRy = dirY * push;
          targetRz = dirZ * push;
        }
      }

      const stiffness = mouse.inside ? REPULSE_STIFFNESS : REPULSE_STIFFNESS * 0.55;

      repulseVel[i3] += (targetRx - repulse[i3]) * stiffness;
      repulseVel[i3 + 1] += (targetRy - repulse[i3 + 1]) * stiffness;
      repulseVel[i3 + 2] += (targetRz - repulse[i3 + 2]) * stiffness;
      repulseVel[i3] *= REPULSE_DAMPING;
      repulseVel[i3 + 1] *= REPULSE_DAMPING;
      repulseVel[i3 + 2] *= REPULSE_DAMPING;
      repulse[i3] += repulseVel[i3];
      repulse[i3 + 1] += repulseVel[i3 + 1];
      repulse[i3 + 2] += repulseVel[i3 + 2];

      const rLen = Math.hypot(repulse[i3], repulse[i3 + 1], repulse[i3 + 2]);
      if (rLen > SCATTER_MAX_OFFSET) {
        const scale = SCATTER_MAX_OFFSET / rLen;
        repulse[i3] *= scale;
        repulse[i3 + 1] *= scale;
        repulse[i3 + 2] *= scale;
        repulseVel[i3] *= 0.5;
        repulseVel[i3 + 1] *= 0.5;
        repulseVel[i3 + 2] *= 0.5;
      }

      tx += repulse[i3];
      ty += repulse[i3 + 1];
      tz += repulse[i3 + 2];

      const dx = tx - pos[i3];
      const dy = ty - pos[i3 + 1];
      const dz = tz - pos[i3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (scrollingBack && dist > 18) {
        pos[i3] = tx;
        pos[i3 + 1] = ty;
        pos[i3 + 2] = tz;
        repulse[i3] = 0;
        repulse[i3 + 1] = 0;
        repulse[i3 + 2] = 0;
        repulseVel[i3] = 0;
        repulseVel[i3 + 1] = 0;
        repulseVel[i3 + 2] = 0;
        sz[i] = morphTarget.sizes[i];
        al[i] = morphTarget.alphas[i];
        continue;
      }

      const adaptive = Math.min(0.45, snap + dist * 0.012);

      pos[i3] += dx * adaptive + Math.sin(t * 1.1 + i * 0.07) * floatAmp;
      pos[i3 + 1] += dy * adaptive + Math.cos(t * 0.85 + i * 0.04) * floatAmp;
      pos[i3 + 2] += dz * adaptive;

      if (!Number.isFinite(pos[i3])) pos[i3] = tx;
      if (!Number.isFinite(pos[i3 + 1])) pos[i3 + 1] = ty;
      if (!Number.isFinite(pos[i3 + 2])) pos[i3 + 2] = tz;

      sz[i] += (morphTarget.sizes[i] - sz[i]) * adaptive;
      al[i] += (morphTarget.alphas[i] - al[i]) * adaptive;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;

    points.rotation.y = t * 0.018;
    points.rotation.x = Math.sin(t * 0.35) * 0.02;
    camera.position.set(0, 1, 24);
    camera.lookAt(0, 1, 0);

    material.uniforms.uTime.value = t;
    renderer.render(scene, camera);
  };

  gsap.ticker.add(render);

  const ro = new ResizeObserver(setSize);
  ro.observe(host);

  const destroy = () => {
    gsap.ticker.remove(render);
    window.removeEventListener('mousemove', onMouseMove);
    ro.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return {
    setProgress,
    refresh: setSize,
    destroy,
  };
}
