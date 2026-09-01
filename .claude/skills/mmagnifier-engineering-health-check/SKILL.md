---
name: mmagnifier-engineering-health-check
description: >
  Pre-flight safety gate and engineering maturity skill for the mmagnifier low-vision mobile app.
  ALWAYS run before touching any code, proposing any change, or answering any technical question
  about mmagnifier — even small ones. Also run on demand for audits, bottleneck analysis, or
  "where are we" reviews. Trigger phrases: "make a change", "fix this bug", "add this feature",
  "update mmagnifier", "project audit", "health check". Never skip — skipping causes regressions.
---

# mmagnifier Engineering Health Check

Runs automatically before every change and on demand for audits. Three phases: **Pre-flight → Implement → Document**.

---

## Constraints (memorize before every change)

**Stack**: Vanilla HTML/CSS/JS + Capacitor 8 (iOS/Android). No frameworks. No build step for the web layer. Static files on GitHub Pages. Camera via `getUserMedia()` → `<video>` → `<canvas>`. No third-party camera libs.

**Toolchain floor** (get this wrong and nothing works):
- `cd web/native && nvm use` before any `npm run sync` — the Capacitor 8 CLI hard-fails on Node 20; `.nvmrc` pins Node 24. The machine default is still Node 20.
- Gradle needs a modern JDK. The system default is Java 8; use Android Studio's bundled JDK 21:
  `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- Android: compileSdk 36 / targetSdk 36 / minSdk 24. targetSdk 36 is a **Google Play requirement** for new apps as of 31 Aug 2026 — never lower it.
- Dependency versions in `native/package.json` are **pinned exactly, on purpose**. `patches/` targets exact versions; a caret range can install a version the patch cannot apply to and break the release build. Do not "tidy" them back into ranges.

**Color modes — 7, exact, in order:**

| # | Mode | Filter stack |
|---|------|-------------|
| 1 | Natural Color | none (cyan `#00ffff` icon) |
| 2 | Yellow on Black | `invert(1)` + yellow tint |
| 3 | Black on Yellow | yellow tint only |
| 4 | Green on Black | `invert(1)` + green tint `#00ff00` |
| 5 | Black on Green | green tint `#00ff00` only |
| 6 | Purple on Black | `invert(1) grayscale(1) brightness(1.1)` + purple tint `#9900ff` |
| 7 | Black on Purple | `grayscale(1) brightness(0.8)` + purple tint `#9900ff` |

Tints: `mix-blend-mode: multiply` inside `isolation: isolate`. White tint = no-op. **`sepia()` is banned** (red hue shifts).

**UI**: A bottom toolbar plus a zoom pill in the top-right.
- Web: **Color** (shows mode name), **Brightness**, and the **Zoom pill**.
- Native adds three more: **Light** (torch), **Read** (OCR + TTS), **Pause** (freeze frame) — six controls total, gated on `Capacitor.isNativePlatform()`.

**Zoom**: levels are rebuilt from `track.getCapabilities().zoom` at camera start — 0.5× steps to 6×, then 1× steps to the hardware max (10× or more on capable phones). The hard-coded `[1 … 6]` array in the source is only the pre-capability fallback; never describe the range as fixed.

**Brightness button = CSS `contrast()`.** The button is labelled "Brightness", the levels are 1×/2×/3×/4×, and the implementation is `contrast()` (the `BRIGHT` array uses a `cont` key). The docs call these "contrast levels". This naming is inconsistent and user-facing — if you touch it, unify rather than deepen it. Sun icon: fixed 8 rays, does not change.

Landscape → buttons stack vertically on the right via media query. No mode bar.

**Native**: OCR (`@capacitor-community/text-recognition`) + TTS. Required for App Store. Do not remove.

**A11y**: Low-vision users. Touch targets ≥ 44×44px. ARIA labels on all controls. High-contrast button labels. No color-only state communication.

---

## Phase 1 — Pre-Flight Gate

### 1a. Read the repo (local files; `gh` CLI for Issues)
1. `TESTING.md` — coverage and known gaps
2. `CHANGELOG.md` — recent changes
3. Open Issues tagged `bug` or `regression`
4. The file(s) about to change

The repo is a local checkout — read it with normal file tools. Issues come from `gh issue list`
(the GitHub MCP connector is not authorised; the CLI is). Flag any missing files to Steve.

### 1b. Classify risk

| Type | Regression risk |
|------|----------------|
| Cosmetic (labels, icons) | Low |
| Behavioral (button logic, zoom, brightness) | Medium |
| Layout (positions, landscape media query) | Medium |
| Color system, Camera, Native/Capacitor, A11y | **High** |

Dependency order (upstream changes ripple down):
```
camera → color filters → brightness overlay → UI buttons → landscape layout → OCR/TTS
```

### 1c. Block or proceed

**High risk OR 2+ components touched** → STOP:

> ⛔ **Regression Risk Detected**
> Touches: [components]
> Could break: [downstream]
> Verify first: [specific steps]
> Proceed? (yes / no)

**Low/Medium, single component** → proceed; note risk level.

---

## Phase 2 — Implementation Checklist

- [ ] Re-read the target function/component (don't rely on memory)
- [ ] Color mode filter stacks unchanged (unless explicitly requested)
- [ ] No new dependencies without discussion
- [ ] Touch targets ≥ 44×44px if UI touched
- [ ] ARIA labels updated if element text or role changes
- [ ] Landscape media query verified if layout touched
- [ ] Smallest diff possible — don't refactor adjacent code
- [ ] Note which `TESTING.md` steps cover this change

---

## Phase 3 — Post-Change Docs (automatic, no need to ask)

**Append to `TESTING.md`:**
```markdown
## [Component] — [Date]
**Change**: [one line]  **Risk**: Low/Medium/High
**Tests run**: [list]  **Result**: Pass/Fail
**Gaps**: [anything untested and why]
```

**Prepend to `CHANGELOG.md`:**
```markdown
## [YYYY-MM-DD] — [Title]
**Type**: Fix/Feature/Refactor/Docs
**Changed**: [one paragraph]
**Regression checked**: [yes/no + what]  **Tests**: Pass/Partial/Untested
```

Create either file if it doesn't exist.

---

## Verifying Without a Physical Device

An Android emulator (`Pixel_10` AVD) plus the WebView debugger covers far more than eyeballing:

```bash
$ANDROID_HOME/emulator/emulator -avd Pixel_10 -camera-back virtualscene &
adb install -r .../app-debug.apk
adb shell pm grant com.mmagnifier.app android.permission.CAMERA
adb forward tcp:9222 localabstract:webview_devtools_remote_$(adb shell pidof com.mmagnifier.app)
```

Debug builds enable `WebView.setWebContentsDebuggingEnabled`, so the page is reachable over the
Chrome DevTools Protocol at `localhost:9222`. From there you can drive `window.nextMode()` etc.,
read `video.currentTime` to prove the draw loop is alive, and call the Capacitor plugins directly
to prove TTS and ML Kit still bind. Camera liveness is `srcObject.getVideoTracks()[0].readyState`.

Still requires real hardware: torch LED, OCR against real-world print, TTS audio quality,
tap-to-focus, and anything about actual camera image quality.

---

## Manual Test Protocol

Always tell Steve which sections apply to the current change.

**Smoke (every change)**
1. Camera feed visible, no console errors
2. Cycle all 7 color modes — no red/pink hue in any
3. Zoom 1× → 6× → 1× — no jump or broken layout
4. Brightness 1× → 4× — label cycles (1×/2×/3×/4×); sun icon stays fixed 8 rays
5. Rotate landscape — buttons shift to right vertical stack

**Color system (if color modes touched)**
1–6. Each mode: correct colors, no red tint
7. `sepia()` absent from all computed styles

**A11y spot-check (if UI touched)**
1. All button touch targets ≥ 44×44px
2. ARIA labels present on Color, Zoom, Brightness
3. Labels visible at max brightness and inverted

**Native (if Capacitor/OCR/TTS touched)**
1. Build to device — OCR trigger works
2. TTS reads captured text without crash
3. Permissions requested on first run

---

## On-Demand Audit

When Steve asks "where are we" or requests a health check:

Read: `TESTING.md`, `CHANGELOG.md`, open Issues, top-level source.

Report:
1. **Stable** — covered features with no recent regressions
2. **At risk** — recently changed but undertested, or flagged in Issues
3. **Bottlenecks** — repeated fixes in same component, reopened Issues, re-litigated decisions
4. **Doc gaps** — missing entries, undocumented decisions, Issues without acceptance criteria
5. **Next actions** — ranked, concrete (e.g. "add computed-style check for all 7 color modes" not "improve testing")

---

## Maturity Roadmap

Work in order — CI before tests just automates chaos.

| # | Item | Why |
|---|------|-----|
| 1 | ~~Formalize `TESTING.md`~~ ✅ done | Prerequisite for everything below |
| 2 | ADRs (Architectural Decision Records) | Capture *why* (no sepia, white no-op, etc.) so AI sessions don't re-litigate |
| 3 | GitHub Issue templates | Enforce acceptance criteria + regression surface on every issue |
| 4 | PR checklist template | Enforce Phase 2 checklist on every merge |
| 5 | ~~Automated smoke test~~ ✅ done — 15 Appium specs in `tests/` | Script the smoke test above |
| 6 | GitHub Actions CI | Run tests + lint on every push |
| 7 | Branch protection on main | Require passing CI before merge |
