import gsap from "gsap";

const ENDPOINT = "https://api.web3forms.com/submit";

/** Email capture → Web3Forms. Needs PUBLIC_WEB3FORMS_KEY in .env. */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return;

  const input = form.querySelector<HTMLInputElement>("input[name=email]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const label = form.querySelector<HTMLElement>("[data-form-label]");
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const key = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

  const setStatus = (text: string, state: "" | "is-error" | "is-success") => {
    form.classList.remove("is-error", "is-success");
    if (state) form.classList.add(state);
    if (status) {
      status.textContent = text;
      gsap.fromTo(status, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 });
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = input?.value.trim() ?? "";
    if (!email || !input?.checkValidity()) {
      setStatus("That email doesn't look right — try again?", "is-error");
      gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      return;
    }

    if (!key || key === "YOUR_ACCESS_KEY_HERE") {
      setStatus("Form isn't wired up yet — add PUBLIC_WEB3FORMS_KEY to .env.", "is-error");
      return;
    }

    if (button) button.disabled = true;
    if (label) label.textContent = "Sending…";

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          email,
          subject: "New lead from noruzo.ai",
          from_name: "Noruzo AI landing page",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? "Submission failed");

      setStatus("Got it. We'll be in touch soon.", "is-success");
      if (label) label.textContent = "Sent ✓";
      form.reset();
    } catch {
      setStatus("Something broke on the way out — email us instead: hello@noruzo.ai", "is-error");
      if (label) label.textContent = "Send it";
      if (button) button.disabled = false;
    }
  });
}
