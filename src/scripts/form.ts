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
  const websiteInput = form.querySelector<HTMLInputElement>("input[name=website]");
  const budgetSelect = form.querySelector<HTMLSelectElement>("select[name=budget]");
  const messageInput = form.querySelector<HTMLTextAreaElement>("textarea[name=message]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const label = form.querySelector<HTMLElement>("[data-form-label]");
  const status = form.querySelector<HTMLElement>("[data-form-status]");

  // Copy comes from the page so the form speaks the page's language
  const fallback = {
    sending: "Sending…",
    sent: "Sent ✓",
    success: "Got it. We'll be in touch soon.",
    badEmail: "That email doesn't look right. Try again?",
    noNeed: "Pick what you need so we can point you the right way.",
    noMessage: "Tell us a bit about what's going on.",
    notWired: "Form isn't wired up yet. Add the Supabase keys to .env.",
    failed: "Something broke on the way out. Try again in a minute?",
  };
  let msg = fallback;
  try {
    msg = { ...fallback, ...JSON.parse(form.dataset.status ?? "{}") };
  } catch {
    /* keep fallback */
  }
  const submitText = label?.textContent ?? "Send";

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
    lang: document.documentElement.lang || "en",
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot tripped → pretend success, deliver nothing
    const honeypot = form.querySelector<HTMLInputElement>("input[name=botcheck]");
    if (honeypot?.checked) {
      setStatus(msg.success, "is-success");
      form.reset();
      return;
    }

    const shake = () =>
      gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });

    const email = emailInput?.value.trim() ?? "";
    if (!email || !emailInput?.checkValidity()) {
      setStatus(msg.badEmail, "is-error");
      shake();
      return;
    }

    const budget = budgetSelect?.value ?? "";
    if (!budget) {
      setStatus(msg.noNeed, "is-error");
      budgetSelect?.focus();
      shake();
      return;
    }

    const message = messageInput?.value.trim() ?? "";
    if (!message) {
      setStatus(msg.noMessage, "is-error");
      messageInput?.focus();
      shake();
      return;
    }

    if (!supabaseUrl || !anonKey) {
      setStatus(msg.notWired, "is-error");
      return;
    }

    if (button) button.disabled = true;
    if (label) label.textContent = msg.sending;

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
          website: websiteInput?.value.trim() || null,
          budget,
          message,
          source,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus(msg.success, "is-success");
      if (label) label.textContent = msg.sent;
      form.reset();
    } catch {
      setStatus(msg.failed, "is-error");
      if (label) label.textContent = submitText;
      if (button) button.disabled = false;
    }
  });
}
