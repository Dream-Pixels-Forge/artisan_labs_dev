# subgoal-hydration-warning.md

Derived from master GOAL.md / acceptance criterion: "No suppressed hydration warnings; root cause fixed."

## Problem
`layout.tsx` sets `suppressHydrationWarning` on `<html>`, masking real hydration mismatches (likely the `className` string / dark-mode class applied server vs client). This hides bugs rather than fixing them.

## Goal
Identify and fix the hydration mismatch, then remove `suppressHydrationWarning`.

## Verification Gates
- [ ] `suppressHydrationWarning` removed from `<html>` in `layout.tsx`
- [ ] No hydration mismatch warnings in browser console on first load
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes on `layout.tsx`

## Files to Touch
- `src/app/layout.tsx`

## Non-Goals
- Full SSR/SSG audit

## Status
done
