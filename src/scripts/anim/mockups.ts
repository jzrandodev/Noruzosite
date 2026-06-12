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
  // Task list: rows slide in, checkboxes pop, hold, repeat
  const tasks = document.querySelector(".mock--tasks");
  if (tasks) {
    const rows = tasks.querySelectorAll(".mock__row");
    const checks = tasks.querySelectorAll(".mock__check--done");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8, defaults: { ease: "power3.out" } });
    tl.from(rows, { autoAlpha: 0, y: 16, stagger: 0.28, duration: 0.55 })
      .from(checks, { scale: 0, stagger: 0.32, duration: 0.4, ease: "back.out(2.5)" }, "-=0.5")
      .to({}, { duration: 1.6 }); // hold before looping
    loopWhenVisible(tasks, tl);
  }

  // Chat: orb breathes constantly; prompt types itself, action chips pop
  const chat = document.querySelector(".mock--chat");
  if (chat) {
    gsap.to(chat.querySelector(".mock__orb"), {
      scale: 1.12,
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const type = chat.querySelector(".mock__type");
    const chips = chat.querySelectorAll(".mock__chips span");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl.fromTo(
      type,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 -2% 0 0)", duration: 1.6, ease: "steps(30)" },
    )
      .from(chips, { autoAlpha: 0, y: 8, stagger: 0.14, duration: 0.45, ease: "power3.out" })
      .to({}, { duration: 1.6 });
    loopWhenVisible(chat, tl);
  }

  // Code window: lines write themselves, then the deploy badge lands
  const build = document.querySelector(".mock--build");
  if (build) {
    const lines = build.querySelectorAll(".mock__code span");
    const deploy = build.querySelector(".mock__deploy");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 });
    tl.from(lines, { width: 0, stagger: 0.2, duration: 0.55, ease: "power2.out" })
      .from(deploy, { autoAlpha: 0, y: 8, duration: 0.5, ease: "power3.out" }, "+=0.2")
      .to({}, { duration: 1.8 });
    loopWhenVisible(build, tl);
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
