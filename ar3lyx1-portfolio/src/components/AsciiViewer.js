import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uCellSize;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float brightness = abs(vNormal.z) * 0.4 + 0.3;
  vec2 grid = floor(vUv * uCellSize);
  vec2 local = fract(vUv * uCellSize);
  float cell = grid.x + grid.y * 10.0;
  float pattern = 0.0;
  float dist = length(local - 0.5);
  float t0 = smoothstep(0.05, 0.4, brightness);
  float t1 = smoothstep(0.4, 0.7, brightness);
  float t2 = smoothstep(0.7, 1.0, brightness);
  pattern = mix(0.0, step(dist, 0.15), t0);
  pattern = mix(pattern, step(dist, 0.35), t1);
  pattern = mix(pattern, 1.0, t2);
  gl_FragColor = vec4(uColor * pattern, pattern);
}
`;

export function initAsciiViewer(container) {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
  camera.position.set(0, 0.5, 4.5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const l1 = new THREE.DirectionalLight(0xffffff, 8);
  l1.position.set(3, 4, 6);
  scene.add(l1);

  const group = new THREE.Group();
  scene.add(group);

  const asciiMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color('#ff80ff') },
      uCellSize: { value: 15.0 },
    },
    transparent: true,
  });

  const loader = new GLTFLoader();
  loader.load('/otherskull.glb', (gltf) => {
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        if (o.material) o.material.dispose();
        o.material = asciiMat.clone();
      }
    });
    group.add(gltf.scene);
    group.scale.setScalar(0.125);
  });

  function resize() {
    const w2 = container.clientWidth;
    const h2 = container.clientHeight;
    if (!w2 || !h2) return;
    renderer.setSize(w2, h2);
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);

  (function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
  })();

  return {
    dispose() {
      renderer.dispose();
    },
  };
}
