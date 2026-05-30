# Changelog

---

## 2026-05-29 — Zoom/Pan/OCR Freeze Overhaul

**Type**: Fix (multiple bugs + regressions)

**Changed**: Rewrote the freeze-frame zoom and pan subsystem to support full zoom-in/out on paused images and to preserve OCR text outlines during zoom and pan. Previously, zooming out while paused showed a tiny image surrounded by black (the frozen canvas was CSS-scaled below 1×). The core fix: at freeze time, the native camera zoom is silently reset to minimum in the background, a full-resolution video frame (`frozenVideoFrame`) is captured asynchronously (~250 ms), and all subsequent zoom operations redraw the canvas directly from that full-res frame via `drawFrozenAtZoom()`. Pan is implemented as a source-crop offset inside `drawFrozenAtZoom` rather than a CSS transform, so it works correctly at any zoom level. OCR text-outline boxes are kept alive during zoom and pan via `updateOCROverlayTransform()`, which applies a CSS `translate + scale` to the overlay proportional to how much the zoom changed from when OCR ran (`ocrBlockZoom`). TTS is never interrupted by zoom or pan changes. Pause and Read share identical freeze/zoom/pan logic — the only difference is Read also triggers OCR.

**Fixes**: Issue #1 (zoom out while paused), Issue #2 (zoom stops TTS / clears OCR outlines)

**Regressions fixed in same session**: pan broken after canvas-redraw switch; OCR outlines disappearing on zoom in Read mode; Read mode zoom-out still showing black bars.

**Regression checked**: yes — color mode cycling, brightness cycling, Pause/Resume draw loop, OCR reentrancy guard, localStorage persistence all unaffected. Zoom and pan behavior verified by hand on device.

**Tests**: Partial — existing automated suite (color, brightness, Pause/Resume, OCR reentrancy, persistence) passes. New zoom-while-frozen, pan-while-frozen, and OCR-overlay-on-zoom behaviors are not yet covered by automated tests (tracked as a gap).

---

## 2026-05-29 — Automated Test Suite Added

**Type**: Feature (testing infrastructure)

**Changed**: Added WebDriverIO + Mocha end-to-end test suite (`tests/`) driven by Appium against the Android Capacitor build. Covers: color mode cycling (all 7 modes, correct order), brightness cycling (all 4 levels), zoom pill responsiveness (label format + `lastAppliedZoom` guard timing), Pause/Resume draw loop (timestamp-based), color mode while paused, zoom while paused (label only), OCR reentrancy (stale result discard), localStorage persistence across app restart (mode + brightness).

**Regression checked**: yes — suite was written alongside the fixes it guards.

**Tests**: Pass

---

## Prior work (pre-changelog)

See `git log` for earlier history. Notable commits:
- `8bc97e4` — add Purple/Black and Black/Purple modes; sharpen image; fix rotation bug
- `38f14a8` — OCR + TTS (Read button)
- `5281a6a` — always-canvas mode with native zoom as quality supplement (two-tier zoom pipeline)
