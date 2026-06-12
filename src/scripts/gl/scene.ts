import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { Color } from "three";
import vertexShader from "./fluid.vert?raw";
import trailFrag from "./trail.frag?raw";
import gooFrag from "./goo.frag?raw";

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

// The trail buffer runs at reduced resolution — the goo threshold hides it
// and the sim cost drops 6x.
const SIM_SCALE = 0.4;

/**
 * Buttermax-style goo: the mouse paints into a feedback buffer that decays
 * and slides downward each frame (melt), then a display pass thresholds it
 * into flat paint blobs. Returns a destroy function, null if WebGL fails.
 */
export function createFluidScene(canvas: HTMLCanvasElement): (() => void) | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  const styles = getComputedStyle(document.documentElement);
  const cssColor = (name: string) => new Color(styles.getPropertyValue(name).trim());

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);

  const simMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader: trailFrag,
    uniforms: {
      uPrev: { value: null },
      uResolution: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0.5, 0.6) },
      uPrevMouse: { value: new Vector2(0.5, 0.6) },
      uVelocity: { value: 0 },
      uDecay: { value: 0.972 },
    },
  });
  const drawMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader: gooFrag,
    uniforms: {
      uTrail: { value: null },
      uResolution: { value: new Vector2(1, 1) },
      uAccent: { value: cssColor("--c-accent") },
      uAccentDeep: { value: cssColor("--c-accent-deep") },
      uBlack: { value: cssColor("--c-black") },
    },
  });

  const simScene = new Scene();
  simScene.add(new Mesh(geometry, simMaterial));
  const drawScene = new Scene();
  drawScene.add(new Mesh(geometry, drawMaterial));

  const rtOptions = {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  };
  let rtA = new WebGLRenderTarget(2, 2, rtOptions);
  let rtB = new WebGLRenderTarget(2, 2, rtOptions);

  const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6, vel: 0, tvel: 0 };
  let lastX = 0.5;
  let lastY = 0.6;
  let lastPointerAt = 0;

  const onPointerMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
    lastPointerAt = performance.now();
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    drawMaterial.uniforms.uResolution.value.set(w, h);

    const sw = Math.max(2, Math.round(w * SIM_SCALE));
    const sh = Math.max(2, Math.round(h * SIM_SCALE));
    rtA.setSize(sw, sh);
    rtB.setSize(sw, sh);
    simMaterial.uniforms.uResolution.value.set(sw, sh);
  };
  resize();
  window.addEventListener("resize", resize);

  let visible = true;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  observer.observe(canvas);

  let raf = 0;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;

    // When the pointer goes quiet, a slow wandering ghost keeps the goo alive
    if (now - lastPointerAt > 1500) {
      const t = now / 1000;
      mouse.tx = 0.5 + 0.36 * Math.sin(t * 0.21);
      mouse.ty = 0.58 + 0.27 * Math.sin(t * 0.16 + 1.7);
    }

    simMaterial.uniforms.uPrevMouse.value.set(mouse.x, mouse.y);
    mouse.x = lerp(mouse.x, mouse.tx, 0.09);
    mouse.y = lerp(mouse.y, mouse.ty, 0.09);
    mouse.tvel = Math.min(1, Math.hypot(mouse.tx - lastX, mouse.ty - lastY) * 14);
    mouse.vel = lerp(mouse.vel, mouse.tvel, 0.08);
    lastX = mouse.tx;
    lastY = mouse.ty;

    simMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);
    simMaterial.uniforms.uVelocity.value = mouse.vel;

    // Feedback step: previous trail in, decayed + freshly painted trail out
    simMaterial.uniforms.uPrev.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(simScene, camera);
    renderer.setRenderTarget(null);
    [rtA, rtB] = [rtB, rtA];

    drawMaterial.uniforms.uTrail.value = rtA.texture;
    renderer.render(drawScene, camera);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    rtA.dispose();
    rtB.dispose();
    simMaterial.dispose();
    drawMaterial.dispose();
    renderer.dispose();
  };
}
