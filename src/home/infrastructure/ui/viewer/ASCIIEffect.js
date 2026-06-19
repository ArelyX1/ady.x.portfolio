import * as THREE from 'three';
import { Effect, BlendFunction } from 'postprocessing';

const characters = ' ░#0▒&8%▓B@WMQ█';

export function createAsciiTexture() {
  const cols = 16;
  const cellSize = 32;
  const rows = Math.ceil(characters.length / cols);
  const w = cols * cellSize;
  const h = rows * cellSize;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < characters.length; i++) {
    const x = (i % cols) * cellSize + cellSize / 2;
    const y = Math.floor(i / cols) * cellSize + cellSize / 2;
    ctx.fillText(characters[i], x, y);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return { texture, cols, rows };
}

const frag = `
uniform sampler2D uAsciiTex;
uniform float uCellSize;
uniform vec3 uColor;
uniform float uCols;
uniform float uRows;
uniform float uNumChars;
uniform vec2 uResolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 cellCount = uResolution / uCellSize;
  vec2 cellUv = floor(uv * cellCount);
  vec2 cellCenter = (cellUv + 0.5) / cellCount;
  vec4 texel = texture(inputBuffer, cellCenter);
  if (texel.a < 0.5) {
    outputColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  float lum = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
  lum = clamp(lum, 0.0, 1.0);
  float idx = floor(lum * (uNumChars - 1.0));
  float col = mod(idx, uCols);
  float row = floor(idx / uCols);
  vec2 localUv = fract(uv * cellCount);
  vec2 glyphUv = vec2((col + localUv.x) / uCols, (row + localUv.y) / uRows);
  vec4 glyph = texture(uAsciiTex, glyphUv);
  float charVal = glyph.a;
  outputColor = vec4(uColor * charVal, max(texel.a, charVal));
}
`;

export class CustomASCIIEffect extends Effect {
  constructor(texture, cols, rows, cellSize, color) {
    super('CustomASCIIEffect', frag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uAsciiTex', new THREE.Uniform(texture)],
        ['uCellSize', new THREE.Uniform(cellSize)],
        ['uColor', new THREE.Uniform(color)],
        ['uCols', new THREE.Uniform(cols)],
        ['uRows', new THREE.Uniform(rows)],
        ['uNumChars', new THREE.Uniform(characters.length)],
        ['uResolution', new THREE.Uniform(new THREE.Vector2(1920, 1080))],
      ]),
    });
  }
}
