# Lulla: App Store readiness, privacy, and pricing

This is an engineering checklist, not legal advice. Have the legal text reviewed before you publish.

## Free vs Lulla Plus

| Feature | Free | Lulla Plus |
| --- | --- | --- |
| Sleep sounds | 6 core sounds, 15/30/45 min timer | All 20 sounds, all-night timer |
| First words | 12 starter words, App voice | All 24 words, "My voice" recording |
| First steps | Tummy time, rolling, sitting | Crawling, standing, walking |
| Daily Play Plan | Plan by age, "We're exhausted today" mode | Interests, 15 and 45+ minute plans |
| Milestone tracker | Everything | Everything |
| First foods and choking safety | Everything | Everything |
| Medicine safety and dose log | Everything (when enabled) | Everything |
| App lock, export, delete | Everything | Everything |

Principle: safety and health-tracking features are never paywalled. Plus unlocks extra content and personalization.

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

## Privacy by design

- No accounts, no ads, no analytics, no third-party SDKs except RevenueCat (purchases only), and no tracking. No `NSPrivacyTracking`, no tracking domains, so no App Tracking Transparency prompt is needed.
- The baby profile, milestones, and dose log are stored only on the device. Nothing is sent to a Lulla server (there is none).
- Data minimization: the baby's name is optional; the dose log auto-deletes entries after 7 days; weight and birth date are validated and clamped.
- Voice recordings are saved as local files, are never uploaded, and are deleted when you remove them or use Delete all data.
- User controls in Settings: export all data (JSON), delete all data (profile, milestones, dose log, recordings, app lock), and links to the privacy policy, terms, and medical disclaimer.
- The microphone is requested only when the user taps record. Face ID is requested only if the user turns on App lock.

### App Privacy "nutrition label" (App Store Connect)

- Tracking: No.
- Data collected and linked to the user: with RevenueCat enabled, **Purchases** and **User ID** (RevenueCat's anonymous app user ID), used for App Functionality only. Not used for tracking.
- Diagnostics/device data sent to RevenueCat (IP address, device type) is processed by them to deliver the service. Confirm the exact answers against RevenueCat's current "Apple privacy labels" guide before submitting.
- Everything else (health, contacts, identifiers, usage, location): Data Not Collected. Baby information never leaves the device.
- If you remove RevenueCat (for example a free-only release), the label becomes "Data Not Collected".

The in-app privacy policy (`src/data/legal.ts`) matches this. Export it for hosting with `npm run legal` (writes `docs/PRIVACY_POLICY.md`, `docs/TERMS_OF_USE.md`, `docs/MEDICAL_DISCLAIMER.md`). Apple requires a **public privacy policy URL** in App Store Connect and in the app: host the file and set `EXPO_PUBLIC_PRIVACY_URL` and `EXPO_PUBLIC_TERMS_URL`.

## Security by design

- Sensitive data (baby profile, dose log, app-lock flag) is in the iOS Keychain / Android Keystore via `expo-secure-store`, with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` so it is not synced to iCloud or restored to another device. Values are chunked to stay within store limits (`src/lib/secureStorage.ts`).
- Existing data from earlier versions is migrated from AsyncStorage into secure storage once and the legacy copy is removed.
- Everything read from storage is validated and clamped (`sanitizeProfile`, `sanitize` in the dose log) so corrupt or tampered values cannot crash the app or produce unsafe doses.
- Optional App lock with Face ID / Touch ID / device passcode (`expo-local-authentication`). The app is covered while locked and when it goes to the background, so the app-switcher preview shows no data.
- Android auto-backup is disabled (`allowBackup: false`), and iOS secure items are device-only, so health-adjacent data is not copied into cloud backups.
- No network calls other than the store/RevenueCat purchase check. No remote code, no WebViews, no secrets in the bundle (`EXPO_PUBLIC_*` values are public by definition).
- The App Store export-compliance answer is preset (`ITSAppUsesNonExemptEncryption: false`): the app uses only standard OS encryption/HTTPS.
- iOS note: Keychain items can survive an uninstall. Use Settings > Delete all data before removing the app (the privacy policy says so).

## App Store guideline map

| Guideline | How it is handled |
| --- | --- |
| 1.4.1 Physical harm (medical info) | Medicine dosing page uses published AAP tables, enforces age limits, and has a disclaimer and sources. **High review risk, see below.** |
| 2.1 Completeness | No placeholder content, working restore, demo notes below. |
| 3.1.1 / 3.1.2 In-App Purchase and subscriptions | Store-native IAP via RevenueCat. Paywall shows price, billing period, trial length, the auto-renewal disclosure, Restore Purchases, Terms and Privacy links, and a Manage subscription link. |
| 4.2 Minimum functionality | Many native features: audio with background playback, offline content, secure storage, biometrics. |
| 5.1.1 Data collection and storage | Policy, permission purpose strings, no collection beyond purchases, in-app data deletion. |
| 5.1.1(v) Account deletion | No accounts. Delete all data covers local data. |
| 5.1.2 Data use and sharing | No sharing, no tracking. |
| Kids Category | Not targeted. The app is for parents and caregivers (do not choose the Kids Category). Set age rating via the questionnaire; the medical/treatment content typically yields 12+ or 4+ depending on your answers. |
| Privacy manifest | Declared in `app.json` (`ios.privacyManifests`) with no tracking and required-reason APIs for UserDefaults, file timestamp, boot time, and disk space. Verify against Apple's warning emails after the first upload, since libraries can add requirements. |

### Known risks and open items

1. **Medicine dosing (Guideline 1.4.1).** Apple has rejected apps that calculate drug doses unless published by a hospital, insurer, pharmacy, or similar qualifying organization, or backed by regulatory approval. The page is behind `EXPO_PUBLIC_ENABLE_MEDICINE_DOSES` and the **production EAS profile turns it off**. When it is off, the page shows a neutral "not available" message. To ship it, you need a qualifying publisher, or a review-notes justification Apple accepts. Test with `preview` builds; decide before flipping the production flag.
2. **Voice clips.** The bundled First words clips were generated with `edge-tts` (Microsoft neural voices). Check that license allows commercial redistribution inside an app before release, or regenerate with a voice you license (ElevenLabs, Azure TTS with a commercial plan, or a recorded voice actor) using `npm run voices`.
3. **Legal entity and bundle ID.** `com.lulla.app` is a placeholder. Use your real bundle ID and your legal name in the policy and terms, and fill in a support email and contact.
4. **Hosted policy URLs** are required (see above). Add a support URL in App Store Connect.
5. **Store assets.** Replace the icon/splash if needed, and add screenshots for 6.9" and 6.5" iPhones and iPad (the app supports tablets).
6. **Real purchases are untested here.** Only the mock path was exercised in the browser. Run a sandbox purchase, restore, and a trial on a device build before submitting.
7. **Native-only security features** (Keychain, Face ID, background lock) were typechecked but not run in this environment (browser only). Test them on a device.
8. **Dependency audit.** `npm audit` reports moderate issues only in build/lint tooling (Expo CLI, eslint: `glob`, `minimatch`). They are not shipped in the app. The remaining fixes need `--force` (breaking), so wait for Expo SDK patch releases.
9. Legal text is a good-faith draft written for this app's behavior. A lawyer should review it, especially the medical disclaimer, and refund wording.

### Suggested review notes (App Store Connect)

> Lulla is a parenting app: sleep sounds, early-language and movement activities, a milestone checklist, and a food safety guide. It has no accounts. All baby information stays on the device. Lulla Plus (monthly, yearly with 7-day trial, lifetime) unlocks extra sounds, words, and steps; safety content is always free. To test: open Home, tap Lulla Plus or any locked item, and use the sandbox account to buy or restore. Medical information is general guidance cited to the AAP and CDC and is not a substitute for a clinician.

## Release checklist

```bash
npm run typecheck && npx eslint src && npx expo-doctor
npm run legal                          # regenerate hosted policy files
bunx eas-cli build --profile preview   # test builds (mock purchases on)
bunx eas-cli build --profile production
bunx eas-cli submit --profile production
```
