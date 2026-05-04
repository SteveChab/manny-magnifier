# mmagnifier

A mobile-optimized magnifying glass app for people with low vision. Provides camera-based magnification with high-contrast color modes and simple, accessible controls.

## What It Does

mmagnifier turns your phone into a handheld video magnifier, similar to dedicated devices like the Juno handheld magnifier. It's designed for users with cone-rod dystrophy and other low-vision conditions who need to magnify text, labels, medicine bottles, and other fine detail.

### Core Features

- **Live camera magnification** — 1× to 6× zoom in 0.5× increments (11 levels total)
- **7 color modes** optimized for different vision needs:
  - Natural Color (unfiltered camera)
  - Yellow on Black
  - Black on Yellow  
  - Green on Black (chartreuse)
  - Black on Green
  - White on Black
  - Black on White
- **6 brightness/contrast levels** — cycles from 1× to 5× contrast
- **Large, simple controls** — 3 buttons with labels, designed for easy use with reduced visual acuity

## Technical Architecture

### Technology Stack

- **Vanilla HTML/CSS/JavaScript** — no frameworks, no build step
- **CSS filters + blend modes** for color transformations
- **getUserMedia API** for camera access
- **Planned:** Capacitor wrapper for native iOS/Android apps

### How Color Modes Work

The app uses a two-layer approach to achieve color modes without hue distortion:

1. **Base video element** with CSS filters:
   - `grayscale(1)` for dark-text modes
   - `invert(1) grayscale(1)` for light-text-on-dark modes
   - No filter for Natural Color mode
   - User-controlled `brightness()` and `contrast()` appended

2. **Tint overlay** positioned absolutely over the video:
   - `mix-blend-mode: multiply`
   - Background color set per mode (yellow `#ffff00`, chartreuse `#7fff00`, white `#ffffff`)
   - Multiply math: `white × tint = tint`, `black × tint = black`
   - White tint acts as a neutral no-op for white/black modes

3. **Isolation context** wraps both layers:
   - `isolation: isolate` on the viewfinder container
   - Scopes the blend mode so it doesn't affect UI controls

This approach avoids the red hue shift that comes from using `sepia()` filters.

### Why Not Sepia?

Early iterations used `sepia(1) saturate(5)` for yellow modes, but this introduces unwanted red tones and reduces contrast. The grayscale + multiply blend approach keeps colors pure and maintains better text clarity.

## Project Structure

```
mmagnifier/
├── index.html          # Main app (camera, filters, controls)
├── mmagnifier-logo.svg # App icon (referenced in HTML)
└── README.md           # This file
```

The entire app is a single HTML file with embedded CSS and JavaScript. No external dependencies, no npm packages, no build process.

## Running Locally

1. Serve the file over HTTPS (required for camera access):
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Then use ngrok or similar to expose over HTTPS
   ngrok http 8000
   ```

2. Open in a mobile browser (camera permissions won't work on desktop in most cases)

3. Allow camera access when prompted

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
- Torch control
- No browser chrome (true full-screen)
- Save frames to Photos

This differentiation justifies the paid tier and meets App Store requirements for approval.

## Controls

- **Color button** (left) — Cycles through 7 color modes
- **Zoom button** (center) — Cycles through 11 zoom levels (1× to 6×)
- **Brightness button** (right) — Cycles through 6 contrast levels (1× to 5×)

All buttons show their current state in the label beneath the icon.

## Browser Compatibility

- **iOS Safari** — Full support (14+)
- **Android Chrome** — Full support (90+)
- **Desktop Chrome/Edge** — Works but camera support varies
- **Firefox** — Mix-blend-mode support required (115+)

The app is mobile-first. Desktop use is not the primary target.

## Accessibility

- **Large touch targets** — 120px tall buttons with 54px icons
- **High contrast UI** — White on black, 2px borders
- **Bold serif labels** — 14-18px Times New Roman for readability
- **ARIA labels** — All buttons properly labeled for screen readers
- **No time-based interactions** — Everything is tap/click based

The UI itself is designed to be readable even when viewed through the app's own filters and magnification.

## License

All Rights Reserved © 2025

This code is source-available for review but not open source. You may view it, but you may not copy, modify, distribute, or use it for commercial purposes without explicit permission.

The web version at the deployment URL is free to use.

## Why "mmagnifier"?

The "m" prefix is short for "manny" (a personal reference). The app emulates the functionality of dedicated handheld video magnifiers at a fraction of the cost.

## Future Enhancements

**Confirmed for native apps:**
- OCR → TTS pipeline using `@capacitor-community/text-recognition` + `@capacitor-community/text-to-speech`
- Freeze frame capture
- Torch/flashlight toggle

**Under consideration:**
- Pinch-to-zoom gesture support
- Pan while zoomed (drag to move around)
- Color mode presets saved to localStorage
- Landscape mode optimization (buttons on right edge)

## Contact

For questions, feature requests, or collaboration: [Contact info TBD]
