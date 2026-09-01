# 0004 — Native dependency versions are pinned exactly

**Status**: Accepted

## Context

`native/package.json` lists exact versions (`8.5.0`) rather than ranges (`^8.5.0`). This looks like
an oversight and invites tidying.

## Decision

Keep exact pins. Do not reintroduce caret ranges.

## Why

`native/patches/` contains `patch-package` patches that target an exact version string — the
filename itself encodes it (`@pantrist+…+8.0.0.patch`). With a caret range, a routine `npm install`
can pull a newer patch version, the patch silently fails to apply, and the *release* build breaks
with a confusing ProGuard error while debug builds keep working.

That failure mode is expensive: it appears late, only in release, and looks nothing like a
dependency problem.

## Consequences

- Upgrades are deliberate: bump the version, re-check whether the patch is still needed (upstream
  may have fixed it — the text-to-speech patch was deleted this way), regenerate it if it is.
- CI runs `npm ci`, so a broken patch fails there rather than in a release build.
