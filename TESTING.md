# Testing

---

## Feature Coverage

| Feature | Automated | Manual | Notes |
|---|---|---|---|
| 7 color modes, correct order | ✅ `app.spec.js` | — | Cycles all 7, asserts short labels in order |
| 4 brightness levels | ✅ `app.spec.js` | — | |
| Zoom pill label format | ✅ `app.spec.js` | — | Asserts ends with `×` |
| `lastAppliedZoom` guard (rapid zoom timing) | ✅ `app.spec.js` | — | 3 rapid taps < 2 s |
| Pause → draw loop stops | ✅ `app.spec.js` | — | Timestamp-based |
| Resume → draw loop restarts | ✅ `app.spec.js` | — | Timestamp-based |
| Color mode works while paused | ✅ `app.spec.js` | — | |
| Zoom pill works while paused (label) | ✅ `app.spec.js` | — | Label only; visual not tested |
| OCR reentrancy guard | ✅ `app.spec.js` | — | Cancel immediately, assert no stale blocks |
| localStorage mode persistence | ✅ `app.spec.js` | — | Restart app, assert mode restored |
| localStorage brightness persistence | ✅ `app.spec.js` | — | Restart app, assert brightness restored |
| localStorage zoom persistence | ❌ | Manual | Not yet in suite |
| Camera live feed | ❌ | Manual | Glance at screen on open |
| Torch LED illuminates | ❌ | Manual | Tap Torch, check physical LED |
| Tap-to-focus | ❌ | Manual | iOS only (Android: known Chromium limitation, Issue #4) |
| Landscape layout | ❌ | Manual | Rotate device, check vertical button stack |
| OCR reads real text | ❌ | Manual | Depends on camera/text |
| TTS audio speaks | ❌ | Manual | Listen when Read tapped |
| **Zoom out while frozen (full image)** | ❌ | Manual | `frozenVideoFrame` async capture path |
| **Pan while frozen** | ❌ | Manual | Crop-offset pan in `drawFrozenAtZoom` |
| **OCR outlines track through zoom/pan** | ❌ | Manual | `updateOCROverlayTransform` / `ocrBlockZoom` |
| **Read mode: zoom out reveals full image** | ❌ | Manual | Same path as Pause — must be identical |
| **TTS continues through zoom changes** | ❌ | Manual | `clearOCR()` must not be called on zoom |

---

## Manual Test Protocol

### Smoke (run after every change to `app/index.html`)
1. Camera feed visible, no console errors on open
2. Cycle all 7 color modes — correct labels in order, no red/pink hue in any mode
3. Zoom 1× → 6× → 1× via pill — label updates, no crash or layout break
4. Brightness 1× → 4× → 1× — label updates
5. Rotate to landscape — buttons shift to right vertical strip; rotate back

### Freeze / Zoom / Pan (run when `freezeFrame`, `drawFrozenAtZoom`, or `cycleZoom` touched)
1. Live feed at 1×: tap Pause → image freezes
2. While paused at 1×: zoom to 3× → image zooms in to show center crop
3. While paused at 3×: zoom back to 1× → **full image must be visible** (not a tiny rectangle on black)
4. While paused and zoomed in: drag to pan → image pans smoothly without black bars
5. Tap Resume → live feed restores at correct zoom; no ghost CSS transforms
6. Live feed at 3×: tap Pause → zoom to 1× → full image visible (same as step 3 but frozen while zoomed)

### Read / OCR (run when `runOCR`, `renderOCRBlocks`, `updateOCROverlayTransform`, or `clearOCR` touched)
1. Point at printed text; tap Read → frame freezes, OCR runs, TTS starts
2. While reading, zoom in → outlines **remain visible** over the correct text; TTS **continues uninterrupted**
3. While reading, zoom out → outlines scale down and stay over text; full image revealed at 1×
4. While reading, drag to pan → outlines move with the content
5. Tap Stop → outlines clear, TTS stops, frame stays frozen
6. Tap Resume → live feed restores
7. Tap Read again immediately after it starts (reentrancy) → OCR cancels, no stale outlines after 1 s

### Color system (run when MODES array or filter logic touched)
1. Each of 7 modes: verify correct foreground/background color, no red or pink hue
2. `sepia()` absent from all computed styles (open browser devtools → Elements → Computed)

### A11y spot-check (run when any button HTML or label changes)
1. All button touch targets ≥ 44×44 px (measure in devtools)
2. ARIA labels present on Color, Zoom, Brightness, Torch, Pause, Read buttons
3. Labels readable at max brightness and in inverted color modes

---

## Automated Suite Setup

## One-Time Machine Setup

### 1. Enable USB debugging on your Android device
Settings → About phone → tap Build number 7 times → Developer options → USB debugging: ON

### 2. Install Appium and the Android driver (global, one-time)
```bash
npm install -g appium
appium driver install uiautomator2
```

### 3. Rebuild the Android project
The `WebView.setWebContentsDebuggingEnabled` change in `MainActivity.java` requires a rebuild before Appium can see inside the WebView. Build the debug APK in Android Studio and install it on your device.

### 4. Install test dependencies
```bash
cd web/tests
npm install
```

---

## Running the Tests

1. Plug in the Android device via USB
2. Confirm it's visible: `adb devices`
3. Make sure the app is installed on the device
4. Run:
```bash
cd web/tests
npm test
```

Appium starts automatically, runs the full suite, and prints results. Takes ~2–3 minutes.

---

## Workflow

After making changes to `web/app/index.html`:
1. `cd web/native && npm run sync`
2. Build + install debug APK in Android Studio
3. `cd web/tests && npm test`

---

## What the Tests Don't Cover

These features require manual eyeballing — they're stable, not regression-prone:
- Camera shows a live image (glance at the screen when the app opens)
- Torch LED illuminates (tap Torch, look at the physical LED)
- OCR reads actual text correctly (depends on real text in frame)
- TTS audio speaks (listen when Read is tapped)

Crashes in any of these will still appear in the Appium logcat output.
