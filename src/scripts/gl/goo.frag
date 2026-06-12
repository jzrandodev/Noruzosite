precision highp float;

varying vec2 vUv;

uniform sampler2D uTrail;
uniform vec2 uResolution;
uniform vec3 uAccent;
uniform vec3 uAccentDeep;
uniform vec3 uBg;

void main() {
  float f = texture2D(uTrail, vUv).r;

  // Wide smoothsteps give the smear a soft, buttery edge instead of
  // the hard poster cut
  float blob = smoothstep(0.1, 0.5, f);
  float core = smoothstep(0.75, 1.25, f);

  vec3 col = uBg;
  col = mix(col, uAccent, blob);
  col = mix(col, uAccentDeep, core); // thick center reads like wet paint

  // Warm tint feathering out past the blob edge
  float halo = smoothstep(0.02, 0.1, f) - smoothstep(0.3, 0.55, f);
  col = mix(col, uAccent, halo * 0.12);

  // Grain so flats don't band — kept subtle on the light field
  float grain = (fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
