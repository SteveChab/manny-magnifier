# 0001 — `sepia()` is banned from colour modes

**Status**: Accepted

## Context

The seven colour modes tint a greyscale image. `sepia()` looks like the natural CSS filter for
this, and it is what most tutorials reach for.

## Decision

Never use `sepia()`. Tinting is done with a solid-colour overlay set to `mix-blend-mode: multiply`,
inside a container with `isolation: isolate`.

## Why

`sepia()` applies a fixed warm colour matrix. Composed with `invert()` and `grayscale()` it pushes
hues toward red and pink, which is precisely the distortion these modes exist to eliminate — a
low-vision user picking Green-on-Black is asking for maximum luminance separation, not a warm cast.

The multiply approach is exact: `white × tint = tint`, `black × tint = black`. A white tint is a
deliberate no-op, which is how Natural Colour mode works without a special case.

`isolation: isolate` scopes the blend to the viewfinder so it cannot bleed onto the UI controls.

## Consequences

- Adding a colour mode means adding a tint colour, not a filter recipe.
- `TESTING.md` asserts `sepia()` is absent from all computed styles. Keep that check.
