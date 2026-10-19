---
lang: en
key: alameda-family
order: 2
kind: system
title: A reminder system that cuts no-shows without adding calls
clinic: Alameda Family Health
place: Sunset Park, Brooklyn
summary: Bilingual booking, WhatsApp reminders and missed-call text-back for a busy family practice where the phone never stops and empty appointment slots cost real money.
highlights:
  - Reminders in each patient's language on WhatsApp or text
  - One-tap confirm or reschedule
  - Every missed call gets a text back with a booking link
deliverables:
  - Reminder flow at 48 hours and 2 hours before each visit
  - Missed-call text-back in ES and EN
  - Reschedule flow that fills the freed slot
  - Front desk view of today's confirmations
  - Message templates written for both languages
measure:
  - No-show rate, before and after
  - Missed calls that turn into booked visits
  - Front desk time spent on reminder calls
---

## The situation

Alameda Family Health is a fictional family practice in Sunset Park with three providers and a front desk of two. Think of a practice where the phone rings all morning, half the calls go to voicemail, and every no-show is an empty slot that someone else needed.

The front desk tries to call everyone the day before. They reach maybe half. Voicemails in English go unanswered by patients who prefer Spanish. And when a new patient calls during the lunch rush and nobody picks up, they simply call the next clinic on the list.

## The system

**1. Missed call, instant text back.** When a call goes unanswered, the caller gets a text within a minute, in Spanish or English based on the number's history or their first reply: "Sorry we missed you. Book here, or reply and we'll call you back." The patient who was about to dial another clinic has a reason to stay.

**2. Reminders that people actually read.** 48 hours before the visit, a WhatsApp message (or SMS if they prefer) in the patient's language with two buttons: Confirm or Change. Two hours before, a short nudge with the address and a map link.

**3. Rescheduling fills the gap.** If a patient taps Change, they pick a new time on the spot and the freed slot opens up for someone on the waitlist. The front desk doesn't touch it.

**4. One screen for the front desk.** A simple view of today's visits: confirmed, not yet confirmed, rescheduled. The team only calls the handful who never answered.

## Privacy by design

Messages never include diagnoses, test results or the reason for the visit. Just the time, the place and the buttons. The system runs on messaging and scheduling vendors that sign a HIPAA Business Associate Agreement, and patient records stay in the practice's existing system. We connect to it, we don't copy it.

## Design decisions worth calling out

- WhatsApp first, SMS as backup. For many Latino families WhatsApp is the main way they communicate, and messages there get read.
- Messages are written in each language by a person, not run through a translator. "Tu cita es mañana" lands very differently from a stiff machine translation.
- Two buttons, never a "reply YES to confirm". Fewer steps, fewer mistakes.
- The front desk can switch any patient's language or channel in one click, because the system will guess wrong sometimes.
