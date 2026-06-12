precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;      // 0..1, smoothed
uniform float uVelocity;  // smoothed mouse speed
uniform vec3 uAccent;
uniform vec3 uAccentDeep;
uniform vec3 uBlack;

// --- simplex noise (Ashima / IQ public-domain pattern) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = p * 2.05 + vec2(13.7, 7.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = uv * aspect;
  vec2 m = uMouse * aspect;

  float t = uTime * 0.085;

  // Mouse influence: a soft well around the cursor that grows with velocity
  float md = distance(p, m);
  float mouseWell = smoothstep(0.55 + uVelocity * 0.6, 0.0, md);

  // Domain-warped fbm = the liquid
  vec2 warp = vec2(
    fbm(p * 1.6 + vec2(t, -t * 0.7)),
    fbm(p * 1.6 + vec2(-t * 0.8, t) + 4.2)
  );
  warp += (m - p) * mouseWell * (0.55 + uVelocity * 1.6);

  float field = fbm(p * 1.9 + warp * 0.85 + t * 0.4);
  field += mouseWell * (0.5 + uVelocity * 1.2);

  // Carve flat poster-style blobs out of the field
  float blob = smoothstep(0.12, 0.18, field);
  float core = smoothstep(0.48, 0.54, field);

  vec3 col = uBlack;
  col = mix(col, uAccentDeep, blob);
  col = mix(col, uAccent, core);

  // Thin rim where the blob meets the dark — gives the "wet edge"
  float rim = smoothstep(0.08, 0.12, field) - smoothstep(0.16, 0.2, field);
  col += rim * uAccent * 0.35;

  // Subtle grain so flat areas don't band
  float grain = (fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
