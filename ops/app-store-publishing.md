# App Store & Google Play Publishing

Contact: contact@mmagnifier.com
Privacy policy: https://mmagnifier.com/privacy
Landing page: https://mmagnifier.com

---

## Pre-Flight

1. `cd web/native && nvm use` — the Capacitor 8 CLI requires Node >= 22; `.nvmrc` pins Node 24.
   The machine default is still Node 20, so this step is **not** optional.
2. `npm run sync` (or `npx cap sync android` — iOS pod install currently fails, see the iOS section)
3. Android SDK levels: compileSdk 36, targetSdk 36, minSdk 24 ✅ DONE
   **Google Play requires targetSdk 36 for new apps as of 31 August 2026.** An extension to
   1 November 2026 can be requested in the Console, but we already meet the bar.
4. build.gradle proguard fix → proguard-android-optimize.txt ✅ DONE
5. Test torch, pause, and read on a **real device** — the emulator has no LED, and OCR/TTS
   behave differently on real hardware.
6. Run the regression suite: `cd web/tests && npm test` (needs a USB-attached device)

---

## Step 1: Signed AAB

⚠️ **The keystore does not exist yet.** The path referenced in earlier drafts
(`~/Desktop/mmagnifier.jks`) was never created. Nothing has been published, so generating a
fresh one costs nothing.

Android Studio → Build → Generate Signed App Bundle → Android App Bundle → **Create new…**

- Location: somewhere outside the repo (the repo ignores `*.jks`, but don't rely on that)
- Alias: `mmagnifier`
- Validity: 25 years
- Build type: release
- Output: `web/native/android/app/release/app-release.aab`

**Immediately after creating it:** store the `.jks` file, both passwords, and the alias in
1Password.

⚠️ Once the app is published, losing this keystore means you can **never update the app again**.
You would have to publish a brand-new listing under a new package name and abandon your existing
users. This is the single least recoverable mistake available in this whole process.

---

## Step 2: Assets

**Already generated** — in `assets/play-store/`:

| File | Spec | Use |
|---|---|---|
| `icon-512.png` | 512×512, opaque | Play listing icon |
| `feature-graphic-1024x500.png` | 1024×500 | Play feature graphic |

The in-app launcher icon and splash screens were regenerated from `assets/logo-wordmark.svg`
across all five densities (they previously shipped the stock Capacitor logo). The adaptive-icon
background is brand black `#000000`.

**Screenshots** (min 2, max 8; 16:9 or 9:16; 320–3840 px per side):

```bash
adb exec-out screencap -p > shot-1.png
```

Shoot from the **signed release build**, on a real device, against real subject matter:

1. Natural colour on printed text
2. Yellow-on-Black on a medicine label ← the shot that sells this app
3. Zoomed hard on fine print
4. Read mode with the yellow OCR outlines visible
5. Landscape, showing the vertical button stack

**Promo video** (optional): Google Play takes a **YouTube URL**, not a file upload. Record with
`adb shell screenrecord /sdcard/demo.mp4` (no audio, 3-minute cap), pull it, then upload to
YouTube — unlisted is fine — and paste the link.

---

## Step 3: Create Play Store Listing

play.google.com/console → Create app

- App name: mmagnifier
- Language: English (United States)
- Type: App
- Pricing: Paid — $2.99
- Accept policies → Create app

---

## Step 4: Store Listing Copy

**Short description** (80 chars max):
> Turn your phone into a powerful magnifier for low vision.

**Full description:**
> mmagnifier turns your phone into both a handheld video magnifier and a pair of digital
> binoculars, designed for people with low vision, macular degeneration, cone-rod dystrophy, and
> other visual impairments.
>
> Features: live camera magnification up to your device's optical maximum; 7 high-contrast colour
> modes; 4 contrast levels; pinch-to-zoom; continuous autofocus; torch/flashlight; pause frame;
> read text aloud (on-device OCR + text-to-speech — no internet required); landscape auto-rotate;
> large accessible controls; settings saved; no ads, no subscriptions, no data collection.
>
> Perfect for: medicine labels, fine print, menus, price tags, whiteboards, live performances,
> sheet music.
>
> Free web version at mmagnifier.com to try before you buy. The paid app adds torch, pause frame,
> and read text aloud.

- Category: Medical
- Tags: magnifier, low vision, accessibility, visual impairment, zoom

> **Copy accuracy:** it is 7 colour modes, not 5. Do **not** claim "tap to focus" — it never fires
> on Android (Issue #4: Chromium never wired `pointsOfInterest` to Camera2). Continuous autofocus
> is always on, and that is the honest phrasing.

---

## Step 5: Data Safety

Select: **This app does not collect any user data.**

Camera is on-device only. OCR and TTS are fully on-device — no image or recognized text leaves
the phone.

> **Read before certifying.** The app declares `INTERNET` and `ACCESS_NETWORK_STATE`. Those come
> from Google's ML Kit, which pulls in `com.google.android.datatransport` and uses the network
> once, at install time, to fetch the text-recognition model from Play. Play's Data Safety form
> covers data collected by third-party SDKs as well as your own code, so confirm ML Kit's current
> data-handling disclosure before you sign off. Our own code makes no network requests.

---

## Step 6: Content Rating

IARC questionnaire → Utility → no violence / sexual content / UGC / location
Result: Everyone (E)

---

## Step 7: Upload and Submit

1. Store listing → upload icon, feature graphic, screenshots
2. App releases → Production → Create new release → upload the `.aab`
3. Privacy policy URL: https://mmagnifier.com/privacy
4. **Launch day:** un-comment the Google Play badge in `web/index.html` (search "LAUNCH DAY") and
   push — the site currently shows "Coming soon" instead of linking to a 404.
5. All sections green → Send for review (typically 1–3 days)

---

## Versioning

Current: `versionCode 1`, `versionName "1.1"` (in `web/native/android/app/build.gradle`).

`versionCode` must increase on **every** upload and can never be reused — even for a build that
was rejected. `versionName` is the string users see.

---

## iOS — not ready

`pod install` fails: GoogleMLKit/TextRecognition 8.0.0 requires a higher deployment target than
the project's `platform :ios, '15.0'` / `IPHONEOS_DEPLOYMENT_TARGET = 14.0`. `Podfile.lock` shows
the TTS and ML Kit pods have never resolved, so iOS has never built with OCR or read-aloud.

Raising the iOS deployment target is the first step whenever iOS becomes the priority. One bonus
waiting there: tap-to-focus most likely **works** on iOS, since WebKit implemented the camera
control API that Chromium never did.
