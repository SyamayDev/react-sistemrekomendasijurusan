/**
 * GLSL for the "Semesta Jurusan" constellation. Colours are authored in sRGB
 * and passed straight through (no colour-space chunks) so they match the CSS.
 */

export const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uEnergy;
  uniform float uPulse;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  attribute float aFocus;
  attribute float aHighlight;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHi;

  void main() {
    vec3 p = position;
    float t = uTime * 0.5 + aSeed * 6.2831;
    p += vec3(sin(t), cos(t * 0.87), sin(t * 0.61)) * 0.045;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.78 + 0.22 * sin(uTime * (0.9 + aSeed * 1.7) + aSeed * 40.0);

    // Expanding ripple when the student answers a question.
    float wave = 0.0;
    if (uPulse >= 0.0) {
      float front = uPulse * 10.0;
      wave = exp(-pow((length(position) - front) * 1.4, 2.0)) * (1.0 - uPulse);
    }

    float size = aSize * (1.0 + aFocus * 0.95 + aHighlight * 3.2 + uEnergy * 0.25 + wave * 1.3) * twinkle;
    gl_PointSize = size * uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;

    vColor = aColor;
    vHi = aHighlight;
    vAlpha = 0.5 + 0.5 * clamp(aFocus + aHighlight + wave + uEnergy * 0.2, 0.0, 1.0);
  }
`;

export const starFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uDawn;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHi;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float halo = pow(1.0 - d * 2.0, mix(2.4, 5.0, uDawn));
    float core = smoothstep(0.16, 0.0, d);
    // Spotlit star gets a soft cross flare.
    float flare = vHi * (smoothstep(0.035, 0.0, abs(c.x)) + smoothstep(0.035, 0.0, abs(c.y))) * (1.0 - d * 2.0) * 0.6;
    vec3 col = mix(vColor, vec3(1.0), (core * 0.65 + flare) * (1.0 - uDawn * 0.8));
    col = mix(col, vColor * 0.62, uDawn);
    float a = (halo * 0.9 + core * 0.6 + flare) * vAlpha * uOpacity;
    gl_FragColor = vec4(col, a);
  }
`;

export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.2 + aSeed * 30.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0));
  }
`;

export const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, pow(1.0 - d * 2.0, 2.0) * vAlpha * uOpacity);
  }
`;

export const lineVertex = /* glsl */ `
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lineFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, uOpacity);
  }
`;

export const nebulaVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float wobble = 0.04 * sin(uTime * 0.15 + c.x * 6.0) * cos(uTime * 0.11 + c.y * 5.0);
    float d = length(c) + wobble;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * uOpacity);
  }
`;
