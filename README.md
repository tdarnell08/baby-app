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

**Medicine doses**
- Weight-based acetaminophen and ibuprofen doses (mL and mg) from the AAP's published dosing tables, with every band checked in code against the 10 to 15 mg/kg and 5 to 10 mg/kg per-dose ranges
- Age limits enforced: no ibuprofen under 6 months, and a "call your pediatrician first" message for acetaminophen under 12 weeks
- A dose log that shows the last dose, the earliest next dose, and the 24-hour dose count, and warns when a dose would be too soon or over the daily limit
- "Call first" red flags, safe-use rules, what not to give, vitamin D and iron notes, sources, and a not-medical-advice disclaimer
- US product strengths only (160 mg/5 mL acetaminophen, 100 mg/5 mL ibuprofen); the page warns that other countries and infant ibuprofen drops differ

**Sleep sounds** (14 seamless loops, generated in code, royalty free)
- Steady noise: white, pink, deep rumble
- Womb and heartbeat
- Nature: rain, beach waves, stream, crickets, cicadas, jungle night
- Home and travel: cars passing by, box fan
- Music box lullaby
- Timer (15, 30, 45 min or all night) with a 30-second fade-out, volume presets, background audio on iOS
- Every sound is labeled honestly: "Studied in babies", "Adult research" or "Comfort sound", with a short explanation and the safe-volume guidance

**First words** (28 cards across Babble, People, Routines, Animals, Things)
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

## Run it

```bash
npm install
npm start          # scan the QR code with Expo Go on your iPhone
npm run ios        # iOS Simulator (macOS)
npm run web        # browser preview on port 3847
```

Other scripts: `npm run typecheck`, `npm run lint`, `npm run sounds` (regenerates sleep WAVs), `npm run voices` (regenerates First Words speech clips; needs `pip install edge-tts`).

To share a browser preview from a remote machine: `npx expo export --platform web`, serve `dist/`, and expose it with a tunnel.

## Project layout

- `src/app/`: screens (Expo Router): home, plan, sleep, words, foods, steps
- `src/data/medications.ts`: dosing tables, safety rules, and the dose calculation
- `src/hooks/useMedLog.ts`: the on-device dose log
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
