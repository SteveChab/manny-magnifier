## What changed

<!-- One or two sentences. What behaviour is different for a user? -->

## Risk level

<!-- Per .claude/skills/mmagnifier-engineering-health-check -->

- [ ] **Low** — labels, icons, copy
- [ ] **Medium** — button logic, zoom, contrast, layout, landscape
- [ ] **High** — colour system, camera, native/Capacitor, accessibility

Dependency order (a change ripples *downstream*):
`camera → colour filters → contrast overlay → UI buttons → landscape layout → OCR/TTS`

## Checklist

- [ ] Re-read the target function rather than working from memory
- [ ] Colour-mode filter stacks unchanged (or the change is the point of this PR)
- [ ] `sepia()` still absent — it reintroduces the red hue shift
- [ ] No new dependencies without discussion; versions still pinned exactly
- [ ] Touch targets ≥ 44×44 px if any UI changed
- [ ] `aria-label` updated if any element's text or role changed
- [ ] Landscape media query checked if layout changed
- [ ] Smallest possible diff — no refactoring of adjacent code

## Testing

- [ ] `cd native && nvm use && npm run sync`, rebuilt, installed
- [ ] `cd tests && npm test` (15 specs) — or state why not
- [ ] Manual protocols from `TESTING.md` that apply to this change:

<!-- Which ones, and what happened? "Untested" is an acceptable answer; a silent gap is not. -->

## Docs

- [ ] `CHANGELOG.md` entry added
- [ ] `TESTING.md` updated with what was run and what is still uncovered
