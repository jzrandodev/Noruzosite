import gsap from "gsap";

/**
 * Lead capture → Supabase Edge Function (validates, stores the lead,
 * emails Juan via Resend). Needs PUBLIC_SUPABASE_URL and
 * PUBLIC_SUPABASE_ANON_KEY in .env — both are public-safe by design.
 */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return;

  const emailInput = form.querySelector<HTMLInputElement>("input[name=email]");
  const nameInput = form.querySelector<HTMLInputElement>("input[name=name]");
  const messageInput = form.querySelector<HTMLTextAreaElement>("textarea[name=message]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const label = form.querySelector<HTMLElement>("[data-form-label]");
  const status = form.querySelector<HTMLElement>("[data-form-status]");

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  const setStatus = (text: string, state: "" | "is-error" | "is-success") => {
    form.classList.remove("is-error", "is-success");
    if (state) form.classList.add(state);
    if (status) {
      status.textContent = text;
      gsap.fromTo(status, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 });
    }
  };

  // Where did this lead come from? Captured once per page load.
  const params = new URLSearchParams(location.search);
  const source = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    referrer: document.referrer || null,
    path: location.pathname,
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot tripped → pretend success, deliver nothing
    const honeypot = form.querySelector<HTMLInputElement>("input[name=botcheck]");
    if (honeypot?.checked) {
      setStatus("Got it. We'll be in touch soon.", "is-success");
      form.reset();
      return;
    }

    const email = emailInput?.value.trim() ?? "";
    if (!email || !emailInput?.checkValidity()) {
      setStatus("That email doesn't look right — try again?", "is-error");
      gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      return;
    }

    if (!supabaseUrl || !anonKey) {
      setStatus("Form isn't wired up yet — add the Supabase keys to .env.", "is-error");
      return;
    }

    if (button) button.disabled = true;
    if (label) label.textContent = "Sending…";

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          email,
          name: nameInput?.value.trim() || null,
          message: messageInput?.value.trim() || null,
          source,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus("Got it. We'll be in touch soon.", "is-success");
      if (label) label.textContent = "Sent ✓";
      form.reset();
    } catch {
      setStatus("Something broke on the way out — try again in a minute?", "is-error");
      if (label) label.textContent = "Send it";
      if (button) button.disabled = false;
    }
  });
}
