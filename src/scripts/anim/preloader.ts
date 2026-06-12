import gsap from "gsap";

/** Counter + curtain intro; resolves when the hero is revealed. */
export function runPreloader(reducedMotion: boolean): Promise<void> {
  const el = document.querySelector<HTMLElement>("[data-preloader]");
  if (!el) return Promise.resolve();

  if (reducedMotion) {
    el.remove();
    return Promise.resolve();
  }

  const count = el.querySelector<HTMLElement>("[data-preloader-count]");
  const chars = document.querySelectorAll<HTMLElement>("[data-hero-title] .char");
  const tagline = document.querySelector<HTMLElement>("[data-hero-tagline]");

  document.documentElement.style.overflow = "hidden";
  gsap.set(chars, { yPercent: 110 });
  gsap.set(tagline, { autoAlpha: 0, y: 24 });

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        document.documentElement.style.overflow = "";
        resolve();
      },
    });

    const counter = { v: 0 };
    tl.to(counter, {
      v: 100,
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        if (count) count.textContent = String(Math.round(counter.v));
      },
    })
      .to(el.querySelector(".preloader__inner"), {
        yPercent: -30,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.inOut",
      })
      .to(el, {
        yPercent: -100,
        duration: 1.1,
        ease: "expo.inOut",
      }, "-=0.25")
      .to(chars, {
        yPercent: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.06,
      }, "-=0.55")
      .to(tagline, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
      }, "-=0.8");
  });
}
