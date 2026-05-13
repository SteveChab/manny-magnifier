# Testing Setup

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
