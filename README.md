# Lulla

An Expo (React Native) app for baby sleep, first words, first foods, and early movement. Runs on iPhone through Expo Go and in the browser.

## Features

**Your Baby's Daily Play Plan** (top of the home screen)
- A personalized plan for today built from your baby's age, interests, and how much time you have (15, 30, or 45+ minutes)
- A speech game (5 minutes by default), a movement activity (10 minutes), one age-appropriate food to try, one bonding activity, and a milestone to watch for
- Age is entered once and advances automatically; the plan rotates daily and stays stable within a day
- "We're exhausted today" switches to a low-effort plan of tiny activities folded into diaper changes, meals, and laundry; it resets the next day
- Pulls from the First words, First foods, and First steps content, and links back to each

**Baby profile**
- Name, birth date (exact age down to the week) or age in months, interests, and usual play time, saved on the device
- Feeds the daily plan and the milestone windows

**Milestone tracker**
- 85 milestones across social, language, thinking, movement, and feeding for 2 to 24 months, adapted from the CDC's "Learn the Signs. Act Early." checklists
- Tap to check off with the date noted, filter by domain, and see progress through the current age list
- A gentle prompt to mention unchecked earlier skills to your pediatrician
- A compact "milestones to watch" strip on First words (language), First foods (feeding), and First steps (movement)
- The daily plan's "milestone to watch for" skips ones you have already checked

**Sleep coach** (`/coach`)
- One-tap "Start nap", "Start night sleep", and "Baby woke up", with "started 5, 15, or 30 minutes ago" for when you forgot to tap
- Today's totals and a 24-hour timeline; typical awake time, naps, and total sleep for the baby's age (AASM and National Sleep Foundation ranges)
- Plus: next sleep window predicted from the median of recent awake gaps (falls back to the age range until there are 3 samples), bedtime from recent nights, a local notification 5 to 30 minutes before the window opens, a 7-day stacked chart (naps and night) and weekly averages

**Memory book** (`/memories`, `/memory-new`, `/recap`)
- Moments ("Today they..."), milestones (from the Milestone tracker), and first words (from First words), each with up to 3 photos and a 60-second voice clip
- Timeline grouped by month; free users keep 10 memories
- Plus: monthly recap (milestones, first words, photos, average sleep) and keepsake PDFs for a month or a year, laid out and generated on the device with `expo-print`
- Photos are resized with `expo-image-manipulator` and kept only in the app's private folder

**Sick Day / When They're Sick** (`/sick` and the screens below), free for everyone
- **Medicine log** (`/sick-meds`, `/course-new`, `/course`): antibiotic courses plus as-needed medicines (fever reducers and similar). A log, not a calculator: the parent types the medicine, dose, waiting time, and any daily limit exactly as printed on the label. Lulla shows "last given" and "next allowed at" (last dose plus the interval the parent typed), warns before a double dose (too soon, or over the typed daily limit), records who gave each dose, and can send a local "next dose allowed" reminder. Courses keep their schedule, countdown, missed-dose flags, and "vomited after dose" notice. Existing antibiotic courses carry over automatically
- **Package dosing charts** (`/sick-charts`, `/chart-new`): replaces the old calculator. Parents save a photo of the chart printed on the box and/or type its table. No weight-based calculation, no suggested amounts, no built-in dose data. A "confirm with your pediatrician or pharmacist" note is shown on every chart
- **Symptom log** (`/sick-symptoms`): one log per illness with temperature (F or C, with method), fluids, wet diapers, sleep notes, behavior chips, and notes on a timeline. A fever notice follows AAP thresholds for the baby's age (any fever of 100.4 F / 38 C under 3 months, 101 F at 3 to 6 months, 103 F from 6 months, above 104 F, or 24 hours (under 2) / 72 hours (2 and up))
- **When to call the doctor** (`/sick-doctor`): a "call 911" tier and "call your pediatrician now" lists by age band, each item tagged with its source (AAP, CDC, NHS) and linked, with a not-a-diagnosis disclaimer
- **Comfort tips** (`/sick-comfort`): fluids, saline and suction, cool-mist humidifier, rest, medicine safety, filtered by age and cited
- **Doctor summary** (`/sick-summary`): one tap to share the current illness as text or a PDF (temperatures, medicines given from the log, fluids, diapers, sleep, notes)

**Sleep sounds** (20 seamless loops, generated in code, royalty free)
- Steady noise: white, pink, deep rumble
- Womb and heartbeat
- Nature: rain, beach waves, stream, crickets, cicadas, jungle night
- Home and travel: cars passing by, box fan
- Music box lullaby
- Timer (15, 30, 45 min or all night) with a 30-second fade-out, volume presets, background audio on iOS
- Every sound is labeled honestly: "Studied in babies", "Adult research" or "Comfort sound", with a short explanation and the safe-volume guidance

**First words** (24 cards across Babble, People, Routines, Animals, Things)
- A 3-round lesson modeled on what the research says works:
  1. Say the word slowly in high, sing-song "parentese"
  2. Say a short sentence around it (round 1)
  3. A visible 5-second "your turn" pause so baby can respond
  4. Immediate praise for any sound, look, or gesture
- A gesture for every word
- "App voice" or "I'll say it" mode. In the second mode the app only times the pauses and cues you, because a live caregiver is better than a recording
- Parent tips and a research panel

**First foods**
- Readiness signs and choking-safety basics
- Foods by stage with how to slice/serve, what to avoid, and evidence notes (AAP timing, iron, LEAP/peanut, round-food hazards)
- Allergen callouts and a clear “not medical advice” disclaimer

**First steps**
- Floor-play progressions from tummy time and neck turning through rolling, sitting, crawling, cruising, and walking
- PT-style coaching steps with what to avoid (including no baby walkers)
- WHO/AAP-informed milestone framing and when to ask a clinician

Lulla is not affiliated with any TV show and does not imitate anyone's voice. First Words uses pre-recorded neural caregiver clips (warm, slower parentese). Device text-to-speech is only a fallback. Your own voice in "I'll say it" mode is still the best option for babies.

## Free and Plus tiers

Safety and health tracking are always free (milestones, first foods and choking safety, the whole Sick Day section with its dose reminders, privacy and security controls). Lulla Plus is sold around sleep, memories, and family keepsakes, plus extra content.

| | Free | Lulla Plus |
| --- | --- | --- |
| Sleep coach | One-tap logging, today's view, typical wake windows | Predicted next sleep window, reminder before it opens, daily and weekly charts |
| Memory book | 10 memories with photos and voice clips | Unlimited, monthly recap, month or year keepsake PDF |
| Sleep sounds | 6 core sounds, 15/30/45 min timer | All 20 sounds, all-night timer |
| First words | 12 starter words | All 24 words, "My voice" recording |
| First steps | Tummy time, rolling, sitting | Crawling, standing, walking |
| Daily Play Plan | By age, "We're exhausted" mode | Interests, 15 and 45+ minute plans |

Pricing (set in App Store Connect; the app shows store prices): Yearly $29.99 with a 7-day free trial, Monthly $4.99, Lifetime $59.99. Purchases use RevenueCat (entitlement `plus`). Preview builds can simulate purchases with `EXPO_PUBLIC_ENABLE_MOCK_PURCHASES=true`; production builds without a RevenueCat key cannot unlock Plus.

## Privacy and security

- No accounts, ads, analytics, or tracking. Baby data stays on the device. Reminders are local notifications, and PDFs are generated on the phone.
- Profile, sleep log, medicine log, symptom log, package chart text, and memory text are stored in the iOS Keychain / Android Keystore (`expo-secure-store`, device-only), with validation on every read.
- Optional app lock with Face ID / passcode; the app is covered in the app switcher.
- Settings has data export, delete-all, and the privacy policy, terms, and medical disclaimer.
- There is no dose calculator. The old weight-based page, its data tables, and the weight field were removed, so nothing is gated by a flag (App Store Guideline 1.4.1, see docs/APP_STORE.md). The one-time migration turns any old dose-log entries into as-needed medicine log items (times only) and drops the stored weight.

See [docs/APP_STORE.md](docs/APP_STORE.md) for the App Store checklist, privacy label answers, purchase setup, and known risks. Copy `.env.example` to `.env.local` to configure.

## Run it

```bash
npm install
npm start          # scan the QR code with Expo Go on your iPhone
npm run ios        # iOS Simulator (macOS)
npm run web        # browser preview on port 3847
```

Other scripts: `npm run legal` (exports the policy documents to `docs/`), `npm run typecheck`, `npm run lint`, `npm run sounds` (regenerates sleep WAVs), `npm run voices` (regenerates First Words speech clips; needs `pip install edge-tts`).

To share a browser preview from a remote machine: `npx expo export --platform web`, serve `dist/`, and expose it with a tunnel.

## Project layout

- `src/app/`: screens (Expo Router): home, plan, profile, milestones, sleep, coach, memories, memory-new, recap, sick, sick-meds, sick-symptoms, sick-doctor, sick-comfort, sick-charts, chart-new, sick-summary, course-new, course, words, foods, steps, paywall, settings, legal
- `src/providers/`: purchases/entitlement and app lock
- `src/lib/`: secure storage, profile/sleep/course/memory stores, `sleepCoach.ts` (wake windows and prediction), `courseLogic.ts` (schedule, missed and double-dose checks), `reminders.ts` (local notifications), `keepsake.ts` and `pdf.ts`, `media.ts`, purchase engine, data export/delete
- `src/data/pricing.ts` and `src/data/legal.ts`: tiers, pricing, and legal text
- `src/data/sickGuide.ts`: cited red flags by age, comfort tips, and safe-use text for Sick Day
- `src/lib/illnessLogic.ts`, `illnessStore.ts`, `illnessExport.ts`: symptom log, fever notices by age, and the doctor summary (text and PDF)
- `src/lib/chartStore.ts`: package dosing charts (photo and typed table)
- `src/data/milestones.ts`: milestone checklist data and helpers
- `src/data/plan.ts`: the daily plan generator (pure function), bonding ideas, CDC-style milestones
- `src/hooks/useBabyProfile.ts`: saved baby profile and today's plan
- `src/hooks/useLesson.ts`: the speak, pause, cheer lesson engine
- `src/data/`: sound and word catalogs, including the research notes
- `scripts/generate-sounds.mjs`: procedural sound generator
- `assets/sounds/`: the generated loops

## Research referenced in the app

- Spencer et al., 1990: white noise and newborn sleep onset (small study)
- Hugh et al., Pediatrics 2014: infant sleep machines can exceed safe volumes
- Zhou et al., 2012: pink noise and sleep (adults)
- Loewy et al., Pediatrics 2013: parent-sung lullabies in premature infants
- Ramírez-Esparza et al., 2014: parentese and later vocabulary
- Romeo et al., 2018: conversational turns and language development
- Goldstein and Schwade, 2008: responding to babbling
- Rowe and Goldin-Meadow, 2009: early gesture and later vocabulary
- Kuhl et al., 2003: live interaction beats recordings for learning speech sounds

General information only, not medical advice.
