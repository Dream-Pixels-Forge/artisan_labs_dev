# subgoal-dead-code-cleanup.md

Derived from master GOAL.md / acceptance criterion: "No dead code, no no-op functions, no unused exports."

## Problem
Several no-op / redundant / unused items exist:
- `ScrollTriggerScreen.tsx`: `handleConfigChange` is a `// no-op`
- `ScrollTriggerScreen.tsx` passes both `config`/`setConfig` and `onConfigChange` to `ScrollPreview` (redundant APIs)
- `scroll-trigger.ts`: `autoDetectScenes()` implemented but never wired into UI
- `validate-env.ts`: `assertEnv()` exported, never called

## Goal
Remove dead code or wire up unused functions; keep a single clear API surface.

## Verification Gates
- [ ] `handleConfigChange` no-op removed or implemented
- [ ] `config`/`setConfig` vs `onConfigChange` redundancy resolved (pick one API)
- [ ] `autoDetectScenes` either wired into `Sequencer`/`ScrollTriggerScreen` or removed with its type
- [ ] `assertEnv` called or removed
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes on touched files

## Files to Touch
- `src/components/screens/ScrollTriggerScreen.tsx`
- `src/components/scroll-trigger/ScrollPreview.tsx`
- `src/lib/scroll-trigger.ts`
- `src/lib/validate-env.ts`

## Non-Goals
- Feature additions beyond wiring existing code

## Status
done
