# Noruzo site

Agency site for Noruzo: bilingual (Spanish-first) websites and patient systems for clinics that serve Spanish-speaking patients. Juan runs it as a side business; keep his name off the site.

## Positioning
- Buyer: small clinics (dental, family practice) in NYC neighborhoods like Washington Heights, Sunset Park, Queens.
- Offer: website (from $2,500), patient system with WhatsApp/SMS reminders, confirm/reschedule and missed-call text-back (setup from $1,500, price not final), care plan (from $250/month).
- Differentiator: Spanish written first, not translated; 10+ years of digital health design behind it. Sell outcomes (fewer no-shows, fewer missed calls), not "AI".
- HIPAA: reminders never include diagnoses or visit reasons; vendors must sign a BAA.

## Structure
- Astro 6, static, deployed to GitHub Pages from `main` (`.github/workflows/deploy.yml`). `base` is `/Noruzosite` in `astro.config.mjs`; change it if a custom domain is added.
- All marketing copy, EN and ES: `src/i18n/strings.ts`. Edit text there, not in components.
- Pages: `/` (EN), `/es/` (ES), case studies at `/work/<key>/` and `/es/casos/<key>/` (markdown in `src/content/case-studies/{en,es}/`, shared `key` field).
- Concept demos (fictional clinics, always keep the DemoBanner): `/demo/ceibo-dental/` (clinic site + booking) and `/demo/alameda/` (front desk + phone simulator; `?autoplay=1`, `?lang=en`, `?speed=2`).
- Demo videos and posters: `public/media/`. Contact form posts to the Supabase `lead` edge function.

## Rules
- Spanish is neutral Latin American (no "turno", "acá"); Juan is Argentine but the audience is mostly Dominican, Mexican, Central American.
- Never invent client results or testimonials. Concept work stays labeled as concept.
- Plain, short copy. No em dashes in copy.

## Open items
- Confirm patient system price and whether hello@noruzo.ai is a real inbox.
- Buy a domain, then update `site`/`base`.
- Merge `noruzo-clinics` into `main` to go live.
- Next business step: land one real clinic at a discount for a real case study.
