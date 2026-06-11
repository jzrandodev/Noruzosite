import gsap from "gsap";

/** Infinite ticker; scroll direction nudges its speed. */
export function initMarquee(): void {
  const track = document.querySelector<HTMLElement>("[data-marquee-track]");
  if (!track) return;

  const item = track.querySelector<HTMLElement>(".marquee__item");
  if (!item) return;

  const loop = gsap.to(track, {
    x: () => -item.offsetWidth,
    duration: 12,
    ease: "none",
    repeat: -1,
  });

  let lastScroll = window.scrollY;
  gsap.ticker.add(() => {
    const delta = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    const boost = gsap.utils.clamp(-3, 3, delta * 0.04);
    loop.timeScale(gsap.utils.interpolate(loop.timeScale(), 1 + boost, 0.1));
  });
}
