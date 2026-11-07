# subgoal-ci-verification.md

Derived from master GOAL.md / acceptance criterion: "CI pipeline passes on GitHub Actions."

## Problem
The `.github/workflows/ci.yml` workflow exists but has never been triggered in GitHub Actions. We need to verify it actually runs successfully on a clean checkout.

## Goal
Verify CI passes end-to-end on GitHub Actions by pushing a test commit or triggering the workflow manually.

## Verification Gates
- [ ] CI workflow triggers on push to master
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `next build` passes
- [ ] CI workflow marked as "passed" on GitHub

## Files to Touch
- None (may need to fix workflow if it fails)

## Non-Goals
- Modify CI workflow unless it fails

## Status
pending
