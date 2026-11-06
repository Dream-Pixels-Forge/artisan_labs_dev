# subgoal-get-frame-binary-search.md

Derived from master GOAL.md / acceptance criterion: "Scroll trigger lookup is efficient for long videos."

## Problem
`getFrameAtScroll()` in `src/lib/scroll-trigger.ts` does a linear O(n) scan over events. Fine for <200 frames but wasteful for long videos with many frames.

## Goal
Replace the linear scan with a binary search over `events` (sorted by `scrollPosition`).

## Verification Gates
- [ ] `getFrameAtScroll` uses binary search
- [ ] Tests added in `scroll-trigger.test.ts` for edge cases (before first, after last, exact match, between events)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes on `scroll-trigger.ts`

## Files to Touch
- `src/lib/scroll-trigger.ts`
- `src/lib/scroll-trigger.test.ts` (created in ci-tests subgoal)

## Non-Goals
- Interpolation / smooth scrolling between frames (handled by `smoothing` config elsewhere)

## Status
done
