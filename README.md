# mmagnifier

A mobile-optimized magnifying glass and binoculars app for people with low vision. Provides camera-based magnification with high-contrast color modes and simple, accessible controls.

## What It Does

mmagnifier turns your phone into both a handheld video magnifier and a pair of digital binoculars. It's designed for users with cone-rod dystrophy and other low-vision conditions who need to:

- Read text up close — labels, medicine bottles, menus, fine print
- See at a distance — watching a live performance, concert, or sports event from a far seat; reading a whiteboard or screen across a room

The app works in both directions. Point it at something nearby to magnify it; point it at something distant and zoom in to bring it closer.

### Core Features

- **Live camera magnification** — 1× to 6× zoom (11 steps), using the camera's native zoom where available for maximum sharpness
- **5 color modes** optimized for different vision needs:
  - Color (unfiltered camera)
  - Yellow/Black
  - Black/Yellow
  - White/Black
  - Black/White
- **4 contrast levels** — cycles 1×, 2×, 3×, 4×
- **Zoom pill** — compact zoom indicator in the top-right corner; tap it to cycle levels
- **Pinch-to-zoom** — continuous zoom gesture on the viewfinder
- **Tap-to-focus** — single tap on the viewfinder locks focus to that point (on supported devices)
- **Landscape support** — buttons automatically rotate to match device orientation, even with OS rotation lock on
- **Large, simple controls** — buttons with icon + label, designed for easy use with reduced visual acuity
- **Settings persistence** — last-used color mode, brightness, and zoom level are remembered across sessions

### Native App Features (v1.0)

The paid iOS and Android apps include two additional controls not available in the browser:

- **Torch** — toggle the flashlight for illuminating close-up subjects
- **Freeze** — pause the live camera feed; tap again to resume

## Technical Architecture

### Technology Stack

- **Vanilla HTML/CSS/JavaScript** — no frameworks, no build step (web layer)
- **Ionic Capacitor** — native iOS/Android wrapper
- **CSS filters + blend modes** for color transformations
- **getUserMedia API** for camera access
- **MediaStreamTrack.applyConstraints** for native camera zoom and torch control

### Repository Structure

The git repository root is the web app itself, with the native project nested inside it.

```
mmagnifier/                           # Git root — served via GitHub Pages
├── index.html                        # Entire app: camera, filters, controls
├── mmagnifier-logo.svg               # App icon / favicon
├── README.md                         # This file
├── .github/
│   └── workflows/static.yml          # GitHub Pages deployment (excludes native/)
└── native/                           # Paid native app — Capacitor wrapper
    ├── package.json                  # npm run sync — copies web files + cap sync
    ├── capacitor.config.json         # webDir: "www"
    ├── www/                          # Auto-generated staging dir (gitignored)
    ├── ios/                          # Xcode project (git-tracked)
    └── android/                      # Android Studio project (git-tracked)
```

The web and native apps share a single `index.html`. Native-only features (torch, freeze) are gated behind `Capacitor.isNativePlatform()` and invisible in the browser. `native/` is excluded from the GitHub Pages deployment via rsync in the workflow.

### Zoom Pipeline

The app uses a two-tier zoom strategy, auto-detected at startup:

1. **Tier A — Native track zoom** (preferred): `track.applyConstraints({ advanced: [{ zoom }] })` drives the camera's actual sensor/lens zoom for maximum sharpness. Available on iOS Safari 17.4+ and modern Android Chrome.

2. **Tier B — Canvas crop from high-res stream** (fallback): Captures a 4K stream and crops it in a `<canvas>` using `requestVideoFrameCallback`. Because the source is already high-resolution, this stays sharp well past what CSS upscaling can achieve.

The zoom level array is built dynamically from device capabilities so the app never promises a level it can't deliver crisply.

### How Color Modes Work

The app uses a two-layer approach to achieve color modes without hue distortion:

1. **Base layer** (`<video>` or `<canvas>`) with CSS filters:
   - `grayscale(1)` for dark-text modes
   - `invert(1) grayscale(1)` for light-text-on-dark modes
   - No filter for Color mode
   - User-controlled `contrast()` appended

2. **Tint overlay** positioned absolutely over the base layer:
   - `mix-blend-mode: multiply`
   - Background color set per mode (yellow `#ffff00`, white `#ffffff`)
   - Multiply math: `white × tint = tint`, `black × tint = black`

3. **Isolation context** on the viewfinder container (`isolation: isolate`) scopes the blend mode so it doesn't affect UI controls.

This approach avoids the red hue shift that comes from using `sepia()` filters.

### Torch Implementation

The torch uses `track.applyConstraints({ advanced: [{ torch: bool }] })` as the primary method — this works while the camera is already open via WebRTC. The Capacitor torch plugin is used as a fallback. Calling the plugin directly (which uses `CameraManager.setTorchMode()`) can throw a `CameraAccessException` on Android when the camera is already in use by the web stream.

### Autofocus

The app requests `focusMode: { ideal: 'continuous' }` in the initial camera constraints, keeping the AF loop active as you move the phone. On devices that expose `pointsOfInterest`, a single tap on the viewfinder triggers single-shot focus on that spot, then reverts to continuous after 2 seconds.

## Running Locally

### Web app
```bash
python3 -m http.server 8000
# Expose over HTTPS for camera access:
ngrok http 8000
```
Open on a mobile browser and allow camera access.

### Native app (requires Xcode + Android Studio)
```bash
cd native
npm run sync          # copy latest web files into www/, then cap sync
npx cap open ios      # open in Xcode
npx cap open android  # open in Android Studio
```

After editing `index.html`, run `npm run sync` from `native/` to push changes into both native projects.

## Deployment

### Web Version — free, always will be

The repository root is the web app. Push to `main` and GitHub Actions deploys automatically. Can also be self-hosted on any static host (Netlify, Vercel, Cloudflare Pages, etc.).

### Native Apps — paid

iOS and Android apps are built with Ionic Capacitor. The native projects live in `native/` and use `native/www/` as the web asset staging directory (auto-populated by `npm run sync`). The native apps are distributed through the App Store and Google Play at a one-time price.

## Controls

### Web + native
- **Color button** (left) — Cycles through 5 color modes
- **Brightness button** (right) — Cycles through 4 contrast levels (1×, 2×, 3×, 4×)
- **Zoom pill** (top-right) — Tap to cycle zoom levels (1× to 6×)
- **Pinch gesture** (viewfinder) — Continuous zoom
- **Tap gesture** (viewfinder) — Tap-to-focus (on supported devices)

### Native app only
- **Torch button** — Toggle flashlight on/off
- **Freeze button** — Pause/resume the live camera feed

All buttons show their current state in the label beside the icon.

## Browser Compatibility

- **iOS Safari** — Full support (17.4+ for native zoom; 14+ for canvas fallback)
- **Android Chrome** — Full support (90+)
- **Desktop Chrome/Edge** — Works; native zoom varies by device
- **Firefox** — Mix-blend-mode support required (115+)

The app is mobile-first. Desktop use is not the primary target.

## Accessibility

- **Large touch targets** — 72px tall buttons with 38px icons and side-by-side labels
- **High contrast UI** — White on black, 2px borders
- **Bold serif labels** — 15px Times New Roman for readability
- **ARIA labels** — All buttons properly labeled for screen readers
- **No time-based interactions** — Everything is tap/click based

The UI itself is designed to be readable even when viewed through the app's own filters and magnification.

## License

All Rights Reserved © 2025–2026

This code is source-available for review but not open source. You may view it, but you may not copy, modify, distribute, or use it for commercial purposes without explicit permission.

The web version is free to use. The native apps are paid.

## Roadmap

### Native app v1.1
- OCR → Text-to-Speech (read printed text aloud)

### Native app v1.2
- Macro lens access (iPhone 13 Pro+ / recent Android flagships)

### Under consideration
- Pan while zoomed (drag to move around)
- Optical zoom lens selector (ultra-wide / main / telephoto)
- Bookmarklet for browser injection
- Desktop browser extension

## Contact

For questions, feature requests, or collaboration: [Contact info TBD]
