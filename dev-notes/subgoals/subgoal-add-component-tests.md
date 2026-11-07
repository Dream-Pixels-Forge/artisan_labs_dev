# subgoal-add-component-tests.md

Derived from master GOAL.md / acceptance criterion: "Add React component tests for all screens."

## Problem
Currently only `src/lib/scroll-trigger.test.ts` (60 unit tests) exists. No React component tests exist for:
- `src/components/screens/Dashboard.tsx`
- `src/components/screens/Sequencer.tsx`
- `src/components/screens/ScrollTriggerScreen.tsx`
- `src/components/screens/Archive.tsx`

Without component tests, UI regressions can't be caught automatically.

## Goal
Add React component tests using Vitest + React Testing Library for all main screens, ensuring:
- Components render without crashing
- Key interactions work (button clicks, form inputs, navigation)
- Error states render correctly
- Loading states render correctly

## Verification Gates
- [ ] `src/components/screens/Dashboard.test.tsx` created and passing
- [ ] `src/components/screens/Sequencer.test.tsx` created and passing
- [ ] `src/components/screens/ScrollTriggerScreen.test.tsx` created and passing
- [ ] `src/components/screens/Archive.test.tsx` created and passing
- [ ] `vitest run` passes (64 + new tests)
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `next build` passes

## Files to Touch
- `src/components/screens/Dashboard.test.tsx` — NEW
- `src/components/screens/Sequencer.test.tsx` — NEW
- `src/components/screens/ScrollTriggerScreen.test.tsx` — NEW
- `src/components/screens/Archive.test.tsx` — NEW

## Non-Goals
- E2E Playwright tests (out of scope)
- Snapshot testing (output can change frequently)

## Status
pending
