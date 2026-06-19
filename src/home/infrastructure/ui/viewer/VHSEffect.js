import * as THREE from 'three';
import { Effect, BlendFunction } from 'postprocessing';

const frag = `
uniform float uTime;
uniform vec2 uResolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float t = uTime;

  // center mask — distortion fades toward edges
  vec2 center = uv - 0.5;
  float dist = length(center);
  float centerFalloff = 1.0 - smoothstep(0.0, 0.6, dist);
  float mask = centerFalloff * centerFalloff;

  // heavy sine wave distortion
  float wave1 = sin(uv.y * 40.0 + t * 30.0) * 0.04;
  float wave2 = sin(uv.x * 30.0 + t * 25.0 + 1.5) * 0.03;
  float wave3 = sin((uv.x + uv.y) * 50.0 + t * 35.0) * 0.02;
  float distort = (wave1 + wave2 + wave3) * mask;

  // aggressive horizontal tear — more intense in center
  float tear = sin(uv.y * 200.0 + t * 80.0);
  tear = clamp(tear * 2.0, -1.0, 1.0);
  distort += tear * 0.025 * mask;

  // vertical jolt
  float jolt = sin(t * 50.0) * 0.5 + 0.5;
  distort += jolt * 0.015 * sin(uv.y * 100.0) * mask;

  // chromatic aberration with center focus
  vec2 rUv = uv + vec2(distort * 1.3 + 0.01 * mask, 0.0);
  vec2 gUv = uv + vec2(distort * 0.7, 0.0);
  vec2 bUv = uv + vec2(distort * 1.8 - 0.01 * mask, distort * 0.5 * mask);

  vec4 rCol = texture(inputBuffer, rUv);
  vec4 gCol = texture(inputBuffer, gUv);
  vec4 bCol = texture(inputBuffer, bUv);

  outputColor = vec4(rCol.r, gCol.g, bCol.b, 1.0);

  // color artifacts in complementary colors (greens, cyans, yellows) — center only
  float art = sin(uv.x * 80.0 + uv.y * 60.0 + t * 40.0) * 0.5 + 0.5;
  art *= smoothstep(0.6, 1.0, art) * mask;
  vec3 artifact = mix(
    vec3(0.3, 1.0, 0.4),
    vec3(0.0, 1.0, 1.0),
    sin(uv.x * 10.0 + t) * 0.5 + 0.5
  );
  outputColor.rgb += artifact * art * 0.3;

  // horizontal noise bars — fade at edges
  float bar = sin(uv.y * 150.0 + t * 60.0) * 0.5 + 0.5;
  bar = step(0.92, bar) * mask;
  outputColor.rgb = mix(outputColor.rgb, vec3(1.0, 1.0, 1.0) * 0.5, bar * 0.8);

  // extreme displacement bursts — center only
  float burst = sin(t * 100.0) * 0.5 + 0.5;
  burst = step(0.97, burst) * mask;
  vec2 burstUv = uv + vec2(sin(uv.y * 50.0) * 0.1, 0.0) * burst;
  vec4 burstCol = texture(inputBuffer, burstUv);
  outputColor = mix(outputColor, burstCol, burst * 0.9);
}
`;

export class VHSDistortionEffect extends Effect {
  constructor() {
    super('VHSDistortionEffect', frag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uTime', new THREE.Uniform(0)],
        ['uResolution', new THREE.Uniform(new THREE.Vector2(1920, 1080))],
      ]),
    });
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('uTime').value += deltaTime;
  }
}
