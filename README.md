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
  - Natural Color (unfiltered camera)
  - Yellow on Black
  - Black on Yellow
  - White on Black
  - Black on White
- **6 contrast levels** — cycles from 1× to 5× in steps (1, 1.5, 2, 3, 4, 5)
- **Zoom pill** — compact zoom indicator in the top-right corner; tap it to cycle levels
- **Pinch-to-zoom** — continuous zoom gesture on the viewfinder
- **Tap-to-focus** — single tap on the viewfinder locks focus to that point (on supported devices)
- **Large, simple controls** — 2 buttons with icon + label, designed for easy use with reduced visual acuity
- **Settings persistence** — last-used color mode, brightness, and zoom level are remembered across sessions

## Technical Architecture

### Technology Stack

- **Vanilla HTML/CSS/JavaScript** — no frameworks, no build step
- **CSS filters + blend modes** for color transformations
- **getUserMedia API** for camera access
- **MediaStreamTrack.applyConstraints** for native camera zoom
- **Planned:** Capacitor wrapper for native iOS/Android apps

### Zoom Pipeline

The app uses a three-tier zoom strategy, auto-detected at startup:

1. **Tier A — Native track zoom** (preferred): `track.applyConstraints({ advanced: [{ zoom }] })` drives the camera's actual sensor/lens zoom for maximum sharpness. Available on iOS Safari 17.4+ and modern Android Chrome.

2. **Tier B — Canvas crop from high-res stream** (fallback): Captures a 4K stream and crops it in a `<canvas>` using `requestVideoFrameCallback`. Because the source is already high-resolution, this stays sharp well past what CSS upscaling can achieve.

3. **Tier C — CSS scale** (last resort): Legacy fallback for older browsers only.

The ZOOM_LEVELS array is built dynamically from device capabilities so the app never promises a zoom level it can't deliver crisply.

### How Color Modes Work

The app uses a two-layer approach to achieve color modes without hue distortion:

1. **Base layer** (`<video>` or `<canvas>`) with CSS filters:
   - `grayscale(1)` for dark-text modes
   - `invert(1) grayscale(1)` for light-text-on-dark modes
   - No filter for Natural Color mode
   - User-controlled `contrast()` appended

2. **Tint overlay** positioned absolutely over the base layer:
   - `mix-blend-mode: multiply`
   - Background color set per mode (yellow `#ffff00`, white `#ffffff`)
   - Multiply math: `white × tint = tint`, `black × tint = black`

3. **Isolation context** on the viewfinder container (`isolation: isolate`) scopes the blend mode so it doesn't affect UI controls.

This approach avoids the red hue shift that comes from using `sepia()` filters.

### Autofocus

The app requests `focusMode: { ideal: 'continuous' }` in the initial camera constraints, keeping the AF loop active as you move the phone. On devices that expose `pointsOfInterest`, a single tap on the viewfinder triggers single-shot focus on that spot, then reverts to continuous after 2 seconds.

## Project Structure

```
mmagnifier/
├── web/
│   ├── index.html            # Main app (camera, filters, controls)
│   ├── mmagnifier-logo.svg   # App icon / favicon
│   ├── logo-wordmark.svg     # Full wordmark (not used in app UI)
│   └── README.md             # This file
└── assets/
    └── logo-wordmark.ai      # Illustrator source
```

The entire app is a single HTML file with embedded CSS and JavaScript. No external dependencies, no npm packages, no build process.

## Running Locally

1. Serve the file over HTTPS (required for camera access):
   ```bash
   python3 -m http.server 8000
   # Then expose over HTTPS with ngrok or similar
   ngrok http 8000
   ```

2. Open in a mobile browser and allow camera access when prompted.

## Deployment

### Web Version (Current)

Deploy to any static host:
- **GitHub Pages** (free, recommended)
- Netlify
- Vercel
- Cloudflare Pages

The web version is and will remain free.

### Native Apps (Planned)

The paid iOS and Android versions will use **Ionic Capacitor** to wrap the web app:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

Native-only features planned:
- OCR + Text-to-Speech (read printed text aloud)
- Torch/flashlight control
- No browser chrome (true full-screen)
- Save frames to Photos
- Macro lens access (iPhone 13 Pro+ / recent Android flagships)

This differentiation justifies the paid tier and meets App Store requirements for approval.

## Controls

- **Color button** (left) — Cycles through 5 color modes
- **Brightness button** (right) — Cycles through 6 contrast levels (1× to 5×)
- **Zoom pill** (top-right) — Tap to cycle 11 zoom levels (1× to 6×)
- **Pinch gesture** (viewfinder) — Continuous zoom
- **Tap gesture** (viewfinder) — Tap-to-focus (on supported devices)

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

All Rights Reserved © 2025

This code is source-available for review but not open source. You may view it, but you may not copy, modify, distribute, or use it for commercial purposes without explicit permission.

The web version at the deployment URL is free to use.

## Why "mmagnifier"?

The "m" prefix is short for "manny" (a personal reference). The app emulates the functionality of dedicated handheld video magnifiers — and digital binoculars — at a fraction of the cost.

## Future Enhancements

**Confirmed for native apps:**
- OCR → TTS pipeline using `@capacitor-community/text-recognition` + `@capacitor-community/text-to-speech`
- Freeze frame capture
- Torch/flashlight toggle
- Macro lens access

**Under consideration:**
- Pan while zoomed (drag to move around)
- Landscape mode optimization (buttons on right edge)
- Optical zoom lens selector (ultra-wide / main / telephoto) for multi-lens devices

## Contact

For questions, feature requests, or collaboration: [Contact info TBD]
