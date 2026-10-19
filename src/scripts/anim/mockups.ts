import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Loop a timeline only while its mockup is on screen. */
function loopWhenVisible(trigger: Element, tl: gsap.core.Timeline): void {
  tl.pause();
  ScrollTrigger.create({
    trigger,
    start: "top 95%",
    end: "bottom 5%",
    onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
  });
}

/** Short looping animations inside the service mockup cards. */
export function initMockupAnimations(): void {
  // Website: headline + button land, a time slot gets picked, hold, repeat
  const site = document.querySelector(".mock--site");
  if (site) {
    const parts = site.querySelectorAll(".mock__headline, .mock__sub, .mock__btn");
    const slots = site.querySelectorAll(".mock__slots span");
    const picked = site.querySelector(".mock__slots .is-on");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8, defaults: { ease: "power3.out" } });
    tl.from(parts, { autoAlpha: 0, y: 14, stagger: 0.2, duration: 0.55 })
      .from(slots, { autoAlpha: 0, y: 8, stagger: 0.1, duration: 0.4 }, "-=0.2")
      .from(picked, { scale: 0.85, duration: 0.45, ease: "back.out(3)" }, "+=0.3")
      .to({}, { duration: 1.6 });
    loopWhenVisible(site, tl);
  }

  // WhatsApp: reminder arrives, buttons pop, patient confirms
  const wa = document.querySelector(".mock--wa");
  if (wa) {
    const bubble = wa.querySelector(".mock__bubble:not(.mock__bubble--me)");
    const actions = wa.querySelectorAll(".mock__actions span");
    const reply = wa.querySelector(".mock__bubble--me");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: "power3.out" } });
    tl.from(bubble, { autoAlpha: 0, y: 16, scale: 0.96, transformOrigin: "left top", duration: 0.55 })
      .from(actions, { autoAlpha: 0, y: 6, stagger: 0.12, duration: 0.4 })
      .from(reply, { autoAlpha: 0, y: 12, scale: 0.9, transformOrigin: "right top", duration: 0.5, ease: "back.out(2)" }, "+=0.9")
      .to({}, { duration: 1.8 });
    loopWhenVisible(wa, tl);
  }

  // Dashboard: meters fill to their targets, hold, repeat
  const dash = document.querySelector(".mock--dash");
  if (dash) {
    const meters = dash.querySelectorAll(".mock__meter i");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
    tl.from(meters, { width: 0, stagger: 0.22, duration: 1.2, ease: "expo.out" }).to({}, { duration: 1.8 });
    loopWhenVisible(dash, tl);
  }
}
