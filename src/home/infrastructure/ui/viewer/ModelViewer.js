import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass } from 'postprocessing';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { createAsciiTexture, CustomASCIIEffect } from './ASCIIEffect.js';
import { VHSDistortionEffect } from './VHSEffect.js';

export function initModelViewer(container, config) {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) return;
  } catch (e) { return; }

  const isMulti = Array.isArray(config);
  const configs = isMulti ? config : [config];

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const parent = container;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false,
  });
  const pr = Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0.5, 5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const l1 = new THREE.DirectionalLight(0xffffff, 5); l1.position.set(3, 4, 6); scene.add(l1);
  const l2 = new THREE.DirectionalLight(0xffffff, 0.5); l2.position.set(-3, 1, 4); scene.add(l2);

  const group = new THREE.Group();
  scene.add(group);
  group.scale.setScalar(0.125);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  const scenes = [];

  configs.forEach((c, i) => {
    loader.load(c.path, gltf => {
      gltf.scene.traverse(o => {
        if (o.isMesh) {
          o.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        }
      });
      gltf.scene.rotation.set(c.rotX ?? 0, 0, c.rotZ ?? 0);
      gltf.scene.scale.setScalar(c.scale ?? 1);

      if (isMulti) {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const cx = (box.min.x + box.max.x) / 2;
        const cz = (box.min.z + box.max.z) / 2;
        gltf.scene.position.set(-cx + (c.x ?? 0), c.y ?? 0, -cz + (c.z ?? 0));
      } else {
        gltf.scene.position.set(c.x ?? 0, c.y ?? 0, c.z ?? 0);
      }

      group.add(gltf.scene);
      scenes[i] = gltf.scene;
      if (isMulti && i > 0) gltf.scene.visible = false;
    }, undefined, err => console.error('[ModelViewer] load error', c.path, err));
  });

  if (isMulti) {
    let showFirst = true;
    setInterval(() => {
      showFirst = !showFirst;
      scenes.forEach((s, i) => { if (s) s.visible = (i === 0) === showFirst; });
    }, 300);
  }

  const { texture, cols, rows } = createAsciiTexture();
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const resolution = new THREE.Vector2(1, 1);
  const asciiEffect = new CustomASCIIEffect(texture, cols, rows, 10, new THREE.Color('#ff80ff'));
  asciiEffect.uniforms.get('uResolution').value.copy(resolution);
  composer.addPass(new EffectPass(camera, asciiEffect));

  function resize() {
    const w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
    resolution.set(w, h);
    asciiEffect.uniforms.get('uResolution').value.copy(resolution);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(parent);
  renderer.setAnimationLoop(() => composer.render());

  let vhsPass = null;

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      renderer.dispose();
      composer.dispose();
      group.traverse(o => {
        if (o.isMesh) {
          o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
    },
    startVHS() {
      const vhs = new VHSDistortionEffect();
      vhsPass = new EffectPass(camera, vhs);
      composer.addPass(vhsPass);
      return vhs;
    },
    stopVHS() {
      if (vhsPass) {
        composer.removePass(vhsPass);
        vhsPass = null;
      }
    },
  };
}
