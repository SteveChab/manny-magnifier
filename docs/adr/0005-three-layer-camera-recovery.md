# 0005 — Camera recovery uses three independent layers

**Status**: Accepted

## Context

Issue #22: pausing the app, switching away, and returning left the app frozen on its last frame
until it was force-quit. The original code released the camera on `visibilitychange` for web only,
with a comment stating the OS handled the native case automatically. It does not.

When Android reclaims the camera, the `MediaStreamTrack` is left dead. No frames are delivered, so
`requestVideoFrameCallback` never fires and the draw loop stops permanently.

## Decision

Three independent recovery paths, all calling one guarded `recoverCamera()`:

1. **`visibilitychange`** — release on hide, re-acquire on show. Both platforms.
2. **`track` `'ended'`** — the OS telling us directly that the camera is gone.
3. **A 1 Hz watchdog** — re-acquire if the draw loop has been silent > 2.5 s while visible.

## Why

Any one layer would fix the reported bug. Three are justified because the failure is *silent and
terminal* for a user who cannot diagnose a frozen screen — and because the layers fail
independently:

- `visibilitychange` is not guaranteed to fire in every WebView on every OEM's backgrounding path.
- `'ended'` does not fire when a track is stopped locally, and some stalls never end the track at all.
- The watchdog catches anything the other two miss, including another app seizing the camera.

The draw loop stamps `lastFrameAt` on **every** tick, including while frozen — the stream is still
live when paused, so a stalled tick means the camera died, not that the user pressed Pause.

`requestCamera()` sets the re-entry guard itself rather than relying on callers, so every entry
point is covered and a stray `'ended'` during teardown cannot cause recursion.

## Consequences

- A frozen frame must survive re-acquisition. It does: the canvas keeps its pixels and
  `drawCurrentFrame()` is a no-op while frozen. Do not add a canvas clear to the camera-start path.
- The watchdog runs forever at 1 Hz. It is a few comparisons and returns immediately when hidden,
  recovering, or before the camera has started.
