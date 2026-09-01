# 0003 — Vanilla HTML/CSS/JS, no framework, no build step

**Status**: Accepted

## Context

The entire app is one ~1,100-line `app/index.html`. Every instinct says to split it up and add a
bundler.

## Decision

Keep it as a single file with no build step. Capacitor copies that one file into `native/www/`.

## Why

- The app is one screen with one job. There is no routing, no state management, no data layer —
  the things a framework earns its cost on.
- No build step means the file that is debugged is the file that ships. With the WebView debugger
  attached, what you read in devtools is what is in the repo.
- The GitHub Pages deploy is a file copy. Fewer moving parts between a fix and a live site.
- Camera, filters, and canvas work are DOM-level anyway; a framework would sit in the way.

## Consequences

- The file is long. Navigate it by the `// ── Section ──` comment banners.
- No transpilation: use only what the target WebViews support (Android Chrome 90+, iOS Safari 14+).
- If this file ever grows a second screen, revisit this record rather than quietly adding a bundler.
