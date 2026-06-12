import gsap from "gsap";

/** Lerped blob cursor that swells over [data-hover] targets. */
export function initCursor(): void {
  // Skip on touch-only devices
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const el = document.querySelector<HTMLElement>(".cursor");
  if (!el) return;

  document.documentElement.classList.add("has-custom-cursor");

  const setX = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
  const setY = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });

  window.addEventListener(
    "pointermove",
    (e) => {
      setX(e.clientX);
      setY(e.clientY);
      el.classList.add("is-visible");
    },
    { passive: true },
  );

  document.addEventListener("pointerover", (e) => {
    if ((e.target as Element).closest("[data-hover]")) el.classList.add("is-hover");
  });
  document.addEventListener("pointerout", (e) => {
    if ((e.target as Element).closest("[data-hover]")) el.classList.remove("is-hover");
  });
  document.addEventListener("pointerleave", () => el.classList.remove("is-visible"));
}
