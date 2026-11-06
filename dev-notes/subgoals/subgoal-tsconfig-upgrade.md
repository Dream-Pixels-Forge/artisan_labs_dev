# subgoal-tsconfig-upgrade.md

Derived from master GOAL.md / acceptance criterion: "TypeScript config matches modern stack (ES2022 target, strict)."

## Problem
`tsconfig.json` targets `ES2017` for a Next.js 16 / React 19 project. The shared DPF base config (`/home/dimona/Dev/tsconfig.base.json`) targets ES2022. Older target is unnecessary and may transpile away modern syntax the runtime supports.

## Goal
Bump `tsconfig.json` target to ES2022 and align with DPF shared base conventions.

## Verification Gates
- [ ] `target`: `ES2022`
- [ ] `strict: true` retained
- [ ] `moduleResolution: bundler` retained
- [ ] `pnpm tsc --noEmit` passes with no new errors
- [ ] Build still succeeds (if install works)

## Files to Touch
- `tsconfig.json`

## Non-Goals
- Full migration to shared base config (extends) — optional follow-up

## Status
done
