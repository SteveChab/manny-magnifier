# Architecture Decision Records

Short notes on decisions that are expensive to rediscover — the ones where the obvious-looking
change is wrong for a reason that isn't visible in the code.

If you find yourself about to "clean up" something here, read the relevant record first.

| # | Decision | Status |
|---|---|---|
| [0001](0001-no-sepia-filter.md) | `sepia()` is banned from colour modes | Accepted |
| [0002](0002-canvas-is-the-display-layer.md) | Canvas is always the display layer; native zoom is a quality supplement | Accepted |
| [0003](0003-vanilla-no-build-step.md) | Vanilla HTML/CSS/JS, no framework, no build step | Accepted |
| [0004](0004-exact-pinned-dependencies.md) | Native dependency versions are pinned exactly | Accepted |
| [0005](0005-three-layer-camera-recovery.md) | Camera recovery uses three independent layers | Accepted |
