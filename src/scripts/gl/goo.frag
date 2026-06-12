precision highp float;

varying vec2 vUv;

uniform sampler2D uTrail;
uniform vec2 uResolution;
uniform vec3 uAccent;
uniform vec3 uAccentDeep;
uniform vec3 uBlack;

void main() {
  float f = texture2D(uTrail, vUv).r;

  // Hard-ish threshold gives the flat poster-paint blob edge
  float blob = smoothstep(0.22, 0.34, f);
  float core = smoothstep(0.8, 1.05, f);

  vec3 col = uBlack;
  col = mix(col, uAccent, blob);
  col = mix(col, uAccentDeep, core); // thick center reads like wet paint

  // Faint warm halo just outside the blob edge
  float rim = smoothstep(0.14, 0.22, f) - smoothstep(0.3, 0.4, f);
  col += rim * uAccent * 0.22;

  // Grain so flats don't band
  float grain = (fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
