import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** Wrap each word of an element in overflow-clipped spans for reveals. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const words = (el.textContent ?? "").trim().split(/\s+/);
  el.textContent = "";
  return words.map((word, i) => {
    const line = document.createElement("span");
    line.className = "w-line";
    const inner = document.createElement("span");
    inner.className = "w-word";
    inner.textContent = word;
    line.appendChild(inner);
    el.appendChild(line);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
}

export function initSmoothScroll(): Lenis {
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function initScrollAnimations(): void {
  // Simple label fade-ups
  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    gsap.from(el, {
      autoAlpha: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  }

  // Service rows slide up with stagger as each enters
  const rows = gsap.utils.toArray<HTMLElement>("[data-service-row]");
  for (const row of rows) {
    gsap.from(row, {
      autoAlpha: 0,
      y: 60,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: row, start: "top 88%" },
    });
  }

  // Manifesto / CTA word-by-word reveals
  for (const el of document.querySelectorAll<HTMLElement>("[data-split]")) {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110,
      duration: 0.7,
      ease: "expo.out",
      stagger: 0.025,
      scrollTrigger: { trigger: el, start: "top 80%" },
    });
  }

  // Body background flips as themed sections take the viewport
  for (const section of document.querySelectorAll<HTMLElement>("[data-theme-section]")) {
    const theme = section.dataset.themeSection ?? "dark";
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (self.isActive) document.body.dataset.theme = theme;
      },
    });
  }
}
