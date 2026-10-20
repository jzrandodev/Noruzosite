// All site copy lives here, one block per language.
// Edit text here, not in the components.

export type Lang = "en" | "es";

const en = {
  meta: {
    title: "Noruzo | Bilingual websites and patient systems for clinics",
    description:
      "Noruzo designs Spanish-first websites, online booking and WhatsApp reminders for clinics that serve Spanish-speaking patients. Fewer no-shows, fewer missed calls, more booked visits.",
  },
  nav: {
    services: "Services",
    process: "Process",
    work: "Work",
    contact: "Contact",
    cta: "Let's talk",
    switchLabel: "Español",
    switchShort: "ES",
  },
  hero: {
    tagline:
      "Bilingual websites and patient systems for clinics that serve Spanish-speaking families. Fewer no-shows, fewer missed calls, more booked visits.",
    scroll: "Scroll",
  },
  services: {
    chip: "What we do",
    title: 'Designed for the patients who <em class="t-tilt">actually call you</em>',
    sub: "One package, three parts. Take the whole thing or start with what hurts most.",
    items: [
      {
        kind: "site",
        chip: "Website",
        title: "Spanish-first, not translated",
        blurb:
          "A fast, mobile-first site written for Spanish-speaking patients from the first screen, with English right next to it. Hours, insurance, prices and booking where people look for them, not buried three clicks deep.",
        tags: ["Bilingual", "Mobile-first", "Online booking"],
        price: "From $2,500",
      },
      {
        kind: "chat",
        chip: "Patient system",
        title: "Fewer no-shows, no extra calls",
        blurb:
          "Reminders on WhatsApp and text in each patient's language, with one-tap confirm or reschedule. Missed a call? The patient gets a text back with a booking link before they dial the next clinic.",
        tags: ["WhatsApp reminders", "Missed-call text-back", "Confirmations"],
        price: "Setup from $1,500",
      },
      {
        kind: "dash",
        chip: "Care plan",
        title: "We keep it running",
        blurb:
          "Hosting, updates, content changes and a short monthly report: bookings, confirmations, calls recovered. If something stops working, we fix it before you notice.",
        tags: ["Hosting", "Updates", "Monthly report"],
        price: "From $250 / month",
      },
    ],
    mock: {
      siteNav: ["Inicio", "Servicios", "Seguros"],
      siteHeadline: "Tu dentista en Washington Heights",
      siteSub: "Aceptamos Medicaid y la mayoría de seguros.",
      siteCta: "Reservar cita",
      chatHeader: "Clínica · WhatsApp",
      chatMsg: "Hola María, te recordamos tu cita mañana a las 10:30 am.",
      chatConfirm: "Confirmar",
      chatChange: "Cambiar",
      chatReply: "Confirmada ✓",
      dashTitle: "This month",
      dashStats: ["Online bookings", "Visits confirmed", "Missed calls answered"],
    },
  },
  process: {
    chip: "How it works",
    title: 'Live in weeks, <em class="t-tilt">not months</em>',
    sub: "Small clinics don't have time for long projects. Here's the whole thing.",
    steps: [
      {
        n: "01",
        title: "Listen",
        blurb:
          "A free 30-minute call. We look at how patients find you, call you and book with you today, and where they drop off.",
      },
      {
        n: "02",
        title: "Design",
        blurb:
          "We design the site and patient flows in Spanish and English. You review, we adjust, you approve. No jargon.",
      },
      {
        n: "03",
        title: "Launch",
        blurb:
          "Usually 2 to 4 weeks. We connect booking and reminders to the scheduling system you already use and show your front desk how it works.",
      },
      {
        n: "04",
        title: "Care",
        blurb:
          "Every month you get a short report and we keep improving what's working. Cancel anytime.",
      },
    ],
  },
  philosophy: {
    label: "Why Noruzo",
    manifesto:
      "Most clinic websites are written in English and translated at the end. We start with the Spanish-speaking patient: how they search, how they book, how they want to be reminded. Built by a product designer with 10+ years in digital health, including hospital patient portals and FDA-regulated apps.",
  },
  cases: {
    chip: "Work",
    title: 'Example practices, <em class="t-tilt">built end to end</em>',
    sub: "Two example practices that show how we work. The clinics are fictional, the sites and systems are real and fully working.",
    conceptBadge: "Example practice",
    readMore: "See the example",
    hint: "Drag to explore →",
    back: "Back to all examples",
    disclaimer:
      "This is an example practice, not a client. It shows how we work, not results from a real clinic.",
    nextLabel: "Next example",
    deliverables: "What we designed",
    measure: "What we'd measure",
    ctaTitle: "Want this for your clinic?",
    ctaButton: "Let's talk",
  },
  cta: {
    title: "Let's talk",
    sub: "Tell us about your clinic. We reply within one business day, in English or Spanish.",
    name: "Your name (optional)",
    email: "you@yourclinic.com",
    emailLabel: "Email address",
    messageLabel: "What's going on?",
    website: "Clinic website (optional)",
    needLabel: "What do you need?",
    needPlaceholder: "What do you need…",
    needs: [
      "New bilingual website",
      "Website + patient system",
      "Patient system for my current site",
      "Not sure yet",
    ],
    message: "What's the biggest headache right now? Missed calls, no-shows, an old website… A couple of sentences is plenty.",
    submit: "Send it",
    privacy: "We only use this to reply to you. Please don't include patient information.",
    status: {
      sending: "Sending…",
      sent: "Sent ✓",
      success: "Got it. We'll be in touch within one business day.",
      badEmail: "That email doesn't look right. Try again?",
      noNeed: "Pick what you need so we can point you the right way.",
      noMessage: "Tell us a bit about what's going on.",
      notWired: "Form isn't wired up yet. Add the Supabase keys to .env.",
      failed: "Something broke on the way out. Try again in a minute?",
    },
  },
  footer: {
    rights: "Noruzo",
    top: "Back to top ↑",
  },
};

export type Strings = typeof en;

const es: Strings = {
  meta: {
    title: "Noruzo | Sitios web bilingües y sistemas para pacientes",
    description:
      "Noruzo diseña sitios web en español primero, reservas en línea y recordatorios por WhatsApp para clínicas que atienden a pacientes hispanohablantes. Menos ausencias, menos llamadas perdidas, más citas.",
  },
  nav: {
    services: "Servicios",
    process: "Proceso",
    work: "Trabajo",
    contact: "Contacto",
    cta: "Hablemos",
    switchLabel: "English",
    switchShort: "EN",
  },
  hero: {
    tagline:
      "Sitios web bilingües y sistemas para pacientes, para clínicas que atienden a familias hispanohablantes. Menos ausencias, menos llamadas perdidas, más citas.",
    scroll: "Bajar",
  },
  services: {
    chip: "Qué hacemos",
    title: 'Diseñado para los pacientes que <em class="t-tilt">de verdad te llaman</em>',
    sub: "Un paquete, tres partes. Contrata todo o empieza por lo que más te duele.",
    items: [
      {
        kind: "site",
        chip: "Sitio web",
        title: "En español primero, no traducido",
        blurb:
          "Un sitio rápido, pensado para el celular y escrito para pacientes hispanohablantes desde la primera pantalla, con el inglés al lado. Horarios, seguros, precios y reservas donde la gente los busca, no escondidos a tres clics.",
        tags: ["Bilingüe", "Para celular", "Reservas en línea"],
        price: "Desde $2,500",
      },
      {
        kind: "chat",
        chip: "Sistema para pacientes",
        title: "Menos ausencias, sin más llamadas",
        blurb:
          "Recordatorios por WhatsApp y texto en el idioma de cada paciente, para confirmar o cambiar la cita con un toque. ¿Llamada perdida? El paciente recibe un mensaje con un enlace para reservar antes de llamar a otra clínica.",
        tags: ["Recordatorios por WhatsApp", "Respuesta a llamadas perdidas", "Confirmaciones"],
        price: "Instalación desde $1,500",
      },
      {
        kind: "dash",
        chip: "Plan de mantenimiento",
        title: "Nosotros lo mantenemos",
        blurb:
          "Hosting, actualizaciones, cambios de contenido y un reporte mensual corto: reservas, confirmaciones, llamadas recuperadas. Si algo deja de funcionar, lo arreglamos antes de que lo notes.",
        tags: ["Hosting", "Actualizaciones", "Reporte mensual"],
        price: "Desde $250 / mes",
      },
    ],
    mock: {
      siteNav: ["Inicio", "Servicios", "Seguros"],
      siteHeadline: "Tu dentista en Washington Heights",
      siteSub: "Aceptamos Medicaid y la mayoría de seguros.",
      siteCta: "Reservar cita",
      chatHeader: "Clínica · WhatsApp",
      chatMsg: "Hola María, te recordamos tu cita mañana a las 10:30 am.",
      chatConfirm: "Confirmar",
      chatChange: "Cambiar",
      chatReply: "Confirmada ✓",
      dashTitle: "Este mes",
      dashStats: ["Reservas en línea", "Citas confirmadas", "Llamadas perdidas respondidas"],
    },
  },
  process: {
    chip: "Cómo funciona",
    title: 'Listo en semanas, <em class="t-tilt">no en meses</em>',
    sub: "Las clínicas pequeñas no tienen tiempo para proyectos largos. Esto es todo.",
    steps: [
      {
        n: "01",
        title: "Escuchar",
        blurb:
          "Una llamada gratis de 30 minutos. Vemos cómo te encuentran, te llaman y reservan tus pacientes hoy, y dónde se pierden.",
      },
      {
        n: "02",
        title: "Diseñar",
        blurb:
          "Diseñamos el sitio y los flujos para pacientes en español e inglés. Revisas, ajustamos, apruebas. Sin tecnicismos.",
      },
      {
        n: "03",
        title: "Lanzar",
        blurb:
          "Normalmente de 2 a 4 semanas. Conectamos reservas y recordatorios al sistema de citas que ya usas y le enseñamos a tu recepción cómo funciona.",
      },
      {
        n: "04",
        title: "Mantener",
        blurb:
          "Cada mes recibes un reporte corto y seguimos mejorando lo que funciona. Cancelas cuando quieras.",
      },
    ],
  },
  philosophy: {
    label: "Por qué Noruzo",
    manifesto:
      "La mayoría de los sitios de clínicas se escriben en inglés y se traducen al final. Nosotros empezamos por el paciente hispanohablante: cómo busca, cómo reserva, cómo quiere que le recuerden su cita. Hecho por un diseñador de producto con más de 10 años en salud digital, incluyendo portales de pacientes de hospitales y apps reguladas por la FDA.",
  },
  cases: {
    chip: "Trabajo",
    title: 'Clínicas de ejemplo, <em class="t-tilt">de punta a punta</em>',
    sub: "Dos clínicas de ejemplo que muestran cómo trabajamos. Las clínicas son ficticias, los sitios y sistemas funcionan de verdad.",
    conceptBadge: "Clínica de ejemplo",
    readMore: "Ver el ejemplo",
    hint: "Desliza para explorar →",
    back: "Volver a todos los ejemplos",
    disclaimer:
      "Esta es una clínica de ejemplo, no un cliente. Muestra cómo trabajamos, no resultados de una clínica real.",
    nextLabel: "Siguiente ejemplo",
    deliverables: "Qué diseñamos",
    measure: "Qué mediríamos",
    ctaTitle: "¿Quieres esto para tu clínica?",
    ctaButton: "Hablemos",
  },
  cta: {
    title: "Hablemos",
    sub: "Cuéntanos sobre tu clínica. Respondemos en un día hábil, en español o en inglés.",
    name: "Tu nombre (opcional)",
    email: "tu@tuclinica.com",
    emailLabel: "Correo electrónico",
    messageLabel: "¿Qué está pasando?",
    website: "Sitio web de la clínica (opcional)",
    needLabel: "¿Qué necesitas?",
    needPlaceholder: "Qué necesitas…",
    needs: [
      "Sitio web bilingüe nuevo",
      "Sitio web + sistema para pacientes",
      "Sistema para pacientes para mi sitio actual",
      "Todavía no sé",
    ],
    message: "¿Cuál es el mayor dolor de cabeza hoy? Llamadas perdidas, ausencias, un sitio viejo… Con un par de frases basta.",
    submit: "Enviar",
    privacy: "Solo lo usamos para responderte. Por favor, no incluyas información de pacientes.",
    status: {
      sending: "Enviando…",
      sent: "Enviado ✓",
      success: "Listo. Te respondemos en un día hábil.",
      badEmail: "Ese correo no parece correcto. ¿Lo intentas de nuevo?",
      noNeed: "Elige qué necesitas para orientarte mejor.",
      noMessage: "Cuéntanos un poco qué está pasando.",
      notWired: "El formulario todavía no está conectado. Agrega las claves de Supabase al .env.",
      failed: "Algo falló al enviar. ¿Lo intentas en un minuto?",
    },
  },
  footer: {
    rights: "Noruzo",
    top: "Volver arriba ↑",
  },
};

export const strings: Record<Lang, Strings> = { en, es };

/** Join a path onto the site base, e.g. url("es/") → "/Noruzosite/es/". */
export function url(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const clean = path.replace(/^\/+/, "");
  return `${base}/${clean}`;
}

/** Home page for a language. */
export const home = (lang: Lang) => (lang === "es" ? url("es/") : url(""));

/** Case study URL for a language + slug. */
export const caseUrl = (lang: Lang, slug: string) =>
  lang === "es" ? url(`es/casos/${slug}/`) : url(`work/${slug}/`);
