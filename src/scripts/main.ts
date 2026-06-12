import { runPreloader } from "./anim/preloader";
import { initSmoothScroll, initScrollAnimations } from "./anim/scroll";
import { initCursor } from "./anim/cursor";
import { initContactForm } from "./form";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function boot() {
  initContactForm();

  if (reducedMotion) {
    // Keep the site fully usable with zero motion: no smooth scroll,
    // no WebGL, no reveals — the CSS fallback gradient carries the hero.
    await runPreloader(true);
    return;
  }

  // Shader loads lazily so first paint isn't blocked by three.js
  const glCanvas = document.querySelector<HTMLCanvasElement>("[data-gl]");
  if (glCanvas) {
    import("./gl/scene").then(({ createFluidScene }) => createFluidScene(glCanvas));
  }

  initSmoothScroll();
  await runPreloader(false);
  initScrollAnimations();
  initCursor();
}

boot();
