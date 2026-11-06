# subgoal-non-null-assertions.md

Derived from master GOAL.md / acceptance criterion: "No non-null assertions; strict-safe optional chaining instead."

## Problem
`ScrollTriggerScreen.tsx` uses `currentVideo!.name` and `currentVideo!.duration` non-null assertions. ESLint has `no-non-null-assertion` disabled, but TS strict mode would flag these; they're fragile if `currentVideo` becomes null between checks and use.

## Goal
Replace non-null assertions with optional chaining or early guards.

## Verification Gates
- [ ] No `!` non-null assertions in `ScrollTriggerScreen.tsx`
- [ ] Equivalent behavior preserved (render falls back gracefully when no video)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes on `ScrollTriggerScreen.tsx`

## Files to Touch
- `src/components/screens/ScrollTriggerScreen.tsx`

## Non-Goals
- Strict-null-checks audit across whole codebase (follow-up)

## Status
done
