import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import vertexShader from "./fluid.vert?raw";
import fragmentShader from "./fluid.frag?raw";

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

/**
 * Fullscreen liquid-shader plane behind the hero.
 * Returns a destroy function, or null when WebGL isn't available.
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

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uVelocity: { value: 0 },
      uAccent: { value: cssColor("--c-accent") },
      uAccentDeep: { value: cssColor("--c-accent-deep") },
      uBlack: { value: cssColor("--c-black") },
    },
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vel: 0, tvel: 0 };
  let lastX = 0.5;
  let lastY = 0.5;

  const onPointerMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    material.uniforms.uResolution.value.set(w, h);
  };
  resize();
  window.addEventListener("resize", resize);

  // Pause rendering while the hero is offscreen
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  observer.observe(canvas);

  let raf = 0;
  let start = performance.now();
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;

    mouse.x = lerp(mouse.x, mouse.tx, 0.055);
    mouse.y = lerp(mouse.y, mouse.ty, 0.055);
    mouse.tvel = Math.min(1, Math.hypot(mouse.tx - lastX, mouse.ty - lastY) * 18);
    mouse.vel = lerp(mouse.vel, mouse.tvel, 0.045);
    lastX = mouse.tx;
    lastY = mouse.ty;

    material.uniforms.uTime.value = (now - start) / 1000;
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    material.uniforms.uVelocity.value = mouse.vel;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    material.dispose();
    renderer.dispose();
  };
}
