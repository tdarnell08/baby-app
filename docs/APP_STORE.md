# Lulla: App Store readiness, privacy, and pricing

This is an engineering checklist, not legal advice. Have the legal text reviewed before you publish.

## Free vs Lulla Plus

| Feature | Free | Lulla Plus |
| --- | --- | --- |
| Sleep coach | One-tap nap and night logging, today's view, typical wake windows by age | Predicted next sleep window from recent patterns, local reminder before the window opens, daily (7-day) and weekly charts |
| Sleep help (troubleshooter, tonight's plan, wake windows, routine builder, 3 a.m. mode, night wake log, safe sleep) | Everything, with sources | Everything, plus weekly night-wake patterns and the guided routine timer |
| Kid Mode (calm offline games for ages 1 to 5) | Pop bubbles, Animal friends, Breathing buddy | Match the holes, Paint and trace, Peekaboo, 5/10/15 min calm-down timer, new games with updates |
| Memory book | Save up to 10 memories with photos and a voice clip, view the timeline | Unlimited memories, monthly recap, month or year keepsake PDF (made on device) |
| Sleep sounds | 6 core sounds, 15/30/45 min timer | All 20 sounds, all-night timer |
| First words | 12 starter words, App voice | All 24 words, "My voice" recording |
| First steps | Tummy time, rolling, sitting | Crawling, standing, walking |
| Daily Play Plan | Plan by age, "We're exhausted today" mode | Interests, 15 and 45+ minute plans |
| Sick Day (medicine log with antibiotic courses, symptom log, when to call the doctor, comfort tips, package dosing charts, doctor summary) | Everything, including dose reminders | Everything |
| Milestone tracker | Everything | Everything |
| First foods and choking safety | Everything | Everything |
| App lock, export, delete | Everything | Everything |

Principle: safety and health-tracking features (milestones, food safety, the whole Sick Day section and its reminders, privacy controls) are never paywalled. Plus is sold around sleep, memories, and family-friendly keepsakes, plus extra content and personalization.

"Family-friendly" in the paywall means keepsake PDFs to share with grandparents and caregivers, voice clips from relatives in the memory book, and caregiver names on the medicine log. There is no cross-device family sync, because there are no accounts. Do not advertise syncing or shared logins.

### Pricing (US starting points)

| Plan | Product ID | Price | Notes |
| --- | --- | --- | --- |
| Yearly | `lulla_plus_annual` | $29.99 / year | 7-day free trial (introductory offer), about $2.50/month |
| Monthly | `lulla_plus_monthly` | $4.99 / month | No trial |
| Lifetime | `lulla_plus_lifetime` | $59.99 one time | Non-consumable |

The app shows prices from the store (`product.priceString`), so local currency and tax are always correct. The prices above are only the fallback shown in preview builds. Change them in App Store Connect, not in code.

### Setting up purchases

1. App Store Connect: create a subscription group "Lulla Plus" with the monthly and yearly products, add the 7-day free introductory offer to yearly, and create the lifetime non-consumable. Complete the Paid Apps agreement, tax, and banking.
2. RevenueCat: create a project and an iOS app, import the three products, create the entitlement `plus` (the ID is `ENTITLEMENT_ID` in `src/data/pricing.ts`), attach all three products, and create a current offering containing the monthly, annual, and lifetime packages.
3. Put the public iOS SDK key (`appl_...`) in `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (EAS environment variable). It is a public key, not a secret.
4. Test with a sandbox tester on a development build. Purchases cannot be tested in Expo Go or in the browser.

Purchase modes (`src/lib/purchases.ts`):
- `revenuecat`: a native build with a key. Real purchases.
- `mock`: only when `__DEV__` or `EXPO_PUBLIC_ENABLE_MOCK_PURCHASES=true` (development and preview EAS profiles). Lets you test gating without the store.
- `unavailable`: a production build without a key. The paywall says purchases are unavailable and never unlocks anything.

Production builds can never unlock Plus through the mock path.

## Why Sick Day stays on the safe side of Guideline 1.4.1

Guideline 1.4.1 targets apps whose inaccurate data or information could cause physical harm, and Apple has rejected apps that calculate drug doses unless they come from a qualifying publisher or have regulatory approval. Sick Day is built so that Lulla never produces, selects, or validates an amount:

- **No calculation, no suggestion.** There is no weight field (it was deleted), no age-to-amount logic, no unit conversion, and no embedded dosing data. The old calculator, its tables, its flag, and its stored weight are gone.
- **Every amount comes from the label.** The parent types the label dose and the label's waiting time (and optional daily limit). Dose text is stored as free text and only echoed back. Package charts are a photo the parent took or a table the parent typed. Lulla does not read the photo, does not pick a row for the baby, and ships no sample numbers (field placeholders say "as printed on the package").
- **The "next allowed" time is timing, not dosage.** It is the last logged time plus the interval the parent typed. It never says how much to give, and the double-dose warning only compares log times with the typed interval and limit. It points the parent back to the label, pharmacist, and pediatrician.
- **Confirm-with-a-professional is prominent.** It appears on every chart and photo (including the full-screen view), on the medicine screens, and in the medical disclaimer. Under 3 months, the medicine screens tell parents to call before giving any medicine.
- **Non-dosing safety rules only**, each cited: no aspirin, check active ingredients, use the supplied syringe, call before medicine under 3 months, no over-the-counter cough and cold medicine under 4, no honey under 12 months, lock medicine away, Poison Control number.
- **Guidance is informational and cited.** Red flags and comfort tips quote AAP, CDC, FDA, and NHS pages, show the source on every item, and say they are not a diagnosis. There is a "call 911" tier.
- **Residual risk.** Apple decides case by case. If a reviewer treats timing checks as dosing help, the fallback in known risk 1 applies.

## Privacy by design

- No accounts, no ads, no analytics, no third-party SDKs except RevenueCat (purchases only), and no tracking. No `NSPrivacyTracking`, no tracking domains, so no App Tracking Transparency prompt is needed.
- The baby profile, milestones, and Sick Day logs are stored only on the device. Nothing is sent to a Lulla server (there is none).
- New in this version, all local: sleep log (90 days), Sleep help data (tonight's plan, bedtime routine, night wakes for 60 days), Kid Mode settings (age range, sound, setup flag; nothing a child does is stored), Sick Day logs (medicine log, symptom log, package chart text and photos), memory text, photos, and voice clips. Reminders are local notifications created on the phone and routed through no server. Keepsake and doctor PDFs are generated on the device by `expo-print`.
- Notifications never reveal the medicine name or baby's information: medicine reminders say "Medicine reminder", sleep reminders say a window is opening.
- Data minimization: the baby's name is optional; Lulla no longer asks for or stores the baby's weight (it was only used by the removed calculator, and an old stored value is erased on first launch); illness logs are kept for one year, finished medicines about five months; birth date is validated and clamped.
- Photos are resized before saving (`expo-image-manipulator`) and kept only in the app's private folder. Memory voice clips are limited to 60 seconds. Voice recordings are saved as local files, are never uploaded, and are deleted when you remove them or use Delete all data.
- User controls in Settings: export all data (JSON), delete all data (profile, milestones, sleep, Sleep help, Sick Day logs and package charts, memories, recordings, app lock), and links to the privacy policy, terms, and medical disclaimer.
- The microphone is requested only when the user taps record. The photo library and camera are requested only when the user taps Choose photos or Take a photo (the picker is limited to the photos the user selects). Notifications are requested only when the user turns on a reminder. Face ID is requested only if the user turns on App lock. The notifications plugin is set with `enableRemoteNotifications: false`, so there is no push entitlement and no APNs registration.

### App Privacy "nutrition label" (App Store Connect)

- Tracking: No.
- Data collected and linked to the user: with RevenueCat enabled, **Purchases** and **User ID** (RevenueCat's anonymous app user ID), used for App Functionality only. Not used for tracking.
- Diagnostics/device data sent to RevenueCat (IP address, device type) is processed by them to deliver the service. Confirm the exact answers against RevenueCat's current "Apple privacy labels" guide before submitting.
- Everything else (health, contacts, identifiers, usage, location): Data Not Collected. Baby information never leaves the device.
- If you remove RevenueCat (for example a free-only release), the label becomes "Data Not Collected".

The in-app privacy policy (`src/data/legal.ts`) matches this. Export it for hosting with `npm run legal` (writes `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/MEDICAL_DISCLAIMER.md`). Apple requires a **public privacy policy URL** in App Store Connect and in the app: host the file and set `EXPO_PUBLIC_PRIVACY_URL` and `EXPO_PUBLIC_TERMS_URL`.

## Security by design

- Sensitive data (baby profile, sleep log, Sleep help data, medicine log, symptom log, package chart text, memory text, app-lock flag) is in the iOS Keychain / Android Keystore via `expo-secure-store`, with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` so it is not synced to iCloud or restored to another device. Values are chunked to stay within store limits (`src/lib/secureStorage.ts`).
- Existing data from earlier versions is migrated from AsyncStorage into secure storage once and the legacy copy is removed.
- Everything read from storage is validated and clamped (`sanitizeProfile`, `sanitizeCourse`, `sanitizeIllness`, `sanitizeCharts`) so corrupt or tampered values cannot crash the app. Lulla never produces a dose, so there is no computed amount to corrupt.
- Photos and voice clips are files in the app sandbox, protected by the phone's device encryption (they are not Keychain items, and may be in encrypted device backups). Only bare file names are stored in the memory records, so references survive iOS container path changes. `Delete all data` removes the folder.
- Optional App lock with Face ID / Touch ID / device passcode (`expo-local-authentication`). The app is covered while locked and when it goes to the background, so the app-switcher preview shows no data.
- Android auto-backup is disabled (`allowBackup: false`), and iOS secure items are device-only, so health-adjacent data is not copied into cloud backups.
- No network calls other than the store/RevenueCat purchase check. No remote code, no WebViews, no secrets in the bundle (`EXPO_PUBLIC_*` values are public by definition).
- The App Store export-compliance answer is preset (`ITSAppUsesNonExemptEncryption: false`): the app uses only standard OS encryption/HTTPS.
- iOS note: Keychain items can survive an uninstall. Use Settings > Delete all data before removing the app (the privacy policy says so).

## App Store guideline map

| Guideline | How it is handled |
| --- | --- |
| 1.4.1 Physical harm (medical info): Sick Day | Sick Day is a tracker and a reference to public guidance, not a dosing tool. See "Why Sick Day stays on the safe side of Guideline 1.4.1" above. |
| 2.1 Completeness | No placeholder content, working restore, demo notes below. |
| 3.1.1 / 3.1.2 In-App Purchase and subscriptions | Store-native IAP via RevenueCat. Paywall shows price, billing period, trial length, the auto-renewal disclosure, Restore Purchases, Terms and Privacy links, and a Manage subscription link. |
| 4.2 Minimum functionality | Many native features: audio with background playback, offline content, secure storage, biometrics. |
| 4.5.4 Push notifications | Only local notifications, requested in context, never required to use the app, and not used for marketing. |
| 5.1.1 Data collection and storage | Policy, permission purpose strings, no collection beyond purchases, in-app data deletion. |
| 5.1.1(v) Account deletion | No accounts. Delete all data covers local data. |
| 5.1.2 Data use and sharing | No sharing, no tracking. |
| Kids Category | Not targeted. The app is for parents and caregivers (do not choose the Kids Category). Set age rating via the questionnaire; the medical/treatment content typically yields 12+ or 4+ depending on your answers. |
| Privacy manifest | Declared in `app.json` (`ios.privacyManifests`) with no tracking and required-reason APIs for UserDefaults, file timestamp, boot time, and disk space. Verify against Apple's warning emails after the first upload, since libraries can add requirements. |

### Known risks and open items

1. **Medicine content (Guideline 1.4.1).** The old weight-based calculator and its dosing tables were removed entirely, so there is no flag to flip and nothing dose-related to disable in production. The remaining risk is a reviewer reading the medicine log as a dosing feature. The reasoning that it is not one is below. Mitigations: keep the review notes, never add amounts, weight, or age-based recommendations, and keep every entry typed by the parent from the label. If Apple still objects, the lowest-risk fallback is removing the "next allowed" timing and keeping only the log.
2. **Voice clips.** The bundled First words clips were generated with `edge-tts` (Microsoft neural voices). Check that license allows commercial redistribution inside an app before release, or regenerate with a voice you license (ElevenLabs, Azure TTS with a commercial plan, or a recorded voice actor) using `npm run voices`.
3. **Legal entity and bundle ID.** `com.lulla.app` is a placeholder. Use your real bundle ID and your legal name in the policy and terms, and fill in a support email and contact.
4. **Hosted policy URLs** are required (see above). Add a support URL in App Store Connect.
5. **Store assets.** Replace the icon/splash if needed, and add screenshots for 6.9" and 6.5" iPhones and iPad (the app supports tablets).
6. **Real purchases are untested here.** Only the mock path was exercised in the browser. Run a sandbox purchase, restore, and a trial on a device build before submitting.
7. **Native-only features** (Keychain, Face ID, background lock, local notifications and the 64-notification iOS limit, photo picker, camera, saving and reading photo/voice files, expo-print PDF files, sharing sheet) were typechecked and linted and the logic was unit-tested with scripts, but only the browser build was exercised end to end. Test each on a device before submitting, especially: a dose reminder firing with the app closed, a sleep reminder, and a keepsake PDF with several photos.
8. **Keepsake PDF size.** A year export embeds up to 48 re-compressed photos (700 px) to keep the file reasonable; the app tells the user if photos were left out.
9. **Reminder reliability.** Local notifications can fail if the user denies permission or enables Focus modes. The UI says reminders are an aid and the log is the record. iOS keeps at most 64 pending notifications, so Lulla schedules the next 6 doses per course (each with a 45-minute follow-up) plus one sleep reminder.
10. **Sleep guidance.** Wake windows are widely used coaching ranges, not clinical standards (total sleep ranges cite AASM and the National Sleep Foundation). The UI labels them as typical ranges and repeats safe-sleep guidance.
11. **Sleep help content.** The troubleshooter, safe sleep, and "talk to your pediatrician" content is general guidance summarized from AAP and CHOP pages, each item tagged with its source (some are general ideas with no source, and are shown that way). It makes no diagnosis or medical claim. Have a pediatrician or sleep clinician review `src/data/sleepHelp.ts` before release. In App Store Connect, answer health-related questions conservatively: no diagnosis, no treatment, no data sharing. 3 a.m. mode plays the free Balanced noise and Womb sounds loops quietly and stops after 30 minutes (verify on a device that audio ducks other apps as expected).
12. **Kid Mode and the Kids Category.** Kid Mode is a section inside a parent-focused app, so the app itself is not in the Kids Category and the age rating should stay as chosen for the whole app. If you ever want the Kids Category, the whole app would need to meet Guideline 1.3 (no third-party analytics or ads, parental gate before purchases and links). Kid Mode already follows those rules in spirit: no ads, no analytics, no outside links, no purchases, a parental gate (3-second hold plus an adult math question) for exits and settings, and nothing collected from the child. Note that the app as a whole still uses RevenueCat (anonymous app user ID and purchase status) for the parent's Plus purchase, and Kid Mode does not pass anything to it. Answer the App Privacy questions to match the whole app. Also note COPPA applies to apps directed to children under 13; have counsel confirm how Kid Mode is characterized before release. Test on a device: Guided Access and Android pinning steps, the Android back button, silent switch behavior, and that notifications stay silent while Kid Mode is open.
13. **Dependency audit.** `npm audit` reports moderate issues only in build/lint tooling (Expo CLI, eslint: `glob`, `minimatch`). They are not shipped in the app. The remaining fixes need `--force` (breaking), so wait for Expo SDK patch releases.
14. **Clinical content review.** The red-flag lists and comfort tips in `src/data/sickGuide.ts` summarize AAP (HealthyChildren.org), CDC, FDA, and NHS pages as they read when written (October 2026), and each item shows its source. Thresholds differ slightly between organizations (for example 3 to 6 months: AAP says to call at 101 F / 38.3 C, the NHS at 102.2 F / 39 C). Lulla uses the AAP numbers and says so. Have a pediatrician or pharmacist review the wording before release, and re-check the source pages periodically.
15. Legal text is a good-faith draft written for this app's behavior. A lawyer should review it, especially the medical disclaimer, and refund wording.

### Suggested review notes (App Store Connect)

> Lulla is a parenting app: sleep sounds and a sleep log, Sleep help, Kid Mode (simple offline games a parent can hand to a young child, no data collected), a memory book, early-language and movement activities, a milestone checklist, a food safety guide, and Sick Day, a free section with a medicine log, a symptom log, cited "when to call the doctor" lists, comfort tips, saved package dosing charts, and a doctor summary. Sick Day does not calculate, suggest, convert, or verify any dose or amount: the parent types the medicine, label dose, and waiting time from the label, or saves a photo or typed copy of the chart printed on the package, and every chart carries a "confirm with your pediatrician or pharmacist" note. It does not diagnose. It has no accounts. All baby information stays on the device. Lulla Plus (monthly, yearly with 7-day trial, lifetime) unlocks extra sounds, words, steps, sleep predictions, and unlimited memories; safety content is always free. To test: open Home > Sick Day, add a medicine from a label, log a dose, and start a symptom log. To test purchases, tap Lulla Plus on Home and use the sandbox account. Medical information is general guidance cited to the AAP, CDC, FDA, and NHS and is not a substitute for a clinician.

## Release checklist

```bash
npm run typecheck && npx eslint src && npx expo-doctor
npm run legal                          # regenerate hosted policy files
bunx eas-cli build --profile preview   # test builds (mock purchases on)
bunx eas-cli build --profile production
bunx eas-cli submit --profile production
```
