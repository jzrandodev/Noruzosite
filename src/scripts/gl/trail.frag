precision highp float;

varying vec2 vUv;

uniform sampler2D uPrev;
uniform vec2 uResolution;
uniform vec2 uMouse;      // 0..1, smoothed
uniform vec2 uPrevMouse;  // last frame's smoothed position
uniform float uVelocity;  // smoothed mouse speed
uniform float uDecay;

// Distance to the mouse's segment this frame, so fast moves leave a
// continuous smear instead of dotted splats.
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 texel = 1.0 / uResolution;

  // Melt: pull from slightly above so the goo slides downward,
  // with a soft 5-tap blur that rounds the edges into goo.
  vec2 drip = vec2(0.0, texel.y * 1.4);
  float c = texture2D(uPrev, vUv + drip).r * 0.5;
  c += texture2D(uPrev, vUv + drip + vec2(texel.x * 1.5, 0.0)).r * 0.175;
  c += texture2D(uPrev, vUv + drip - vec2(texel.x * 1.5, 0.0)).r * 0.175;
  c += texture2D(uPrev, vUv + drip + vec2(0.0, texel.y * 1.5)).r * 0.075;
  c += texture2D(uPrev, vUv + drip - vec2(0.0, texel.y * 1.5)).r * 0.075;
  c *= uDecay;

  // Paint along the mouse path — fatter and stronger when moving fast
  float d = segDist(vUv * aspect, uPrevMouse * aspect, uMouse * aspect);
  float radius = 0.035 + uVelocity * 0.13;
  c += smoothstep(radius, 0.0, d) * (0.22 + uVelocity * 0.4);

  gl_FragColor = vec4(vec3(min(c, 1.5)), 1.0);
}
