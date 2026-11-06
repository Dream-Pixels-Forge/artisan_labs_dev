# subgoal-ci-tests.md

Derived from master GOAL.md / acceptance criterion: "CI pipeline with tests, lint, and type check on every PR."

## Problem
No `__tests__`, no `*.test.ts`, and no `.github/workflows/ci.yml`. The only quality gate is a manual `pnpm lint` that timed out on dependency install. SECURITY.md recommends CI but none exists.

## Goal
Add Vitest unit tests (starting with the pure `scroll-trigger.ts` engine) and a GitHub Actions CI workflow that runs type-check + lint + build + tests on every PR.

## Verification Gates
- [ ] Vitest installed as devDependency
- [ ] `src/lib/scroll-trigger.test.ts` covers all 8 scroll trigger modes + `getFrameAtScroll` + exports
- [ ] `.github/workflows/ci.yml` runs: `pnpm install --frozen-lockfile`, `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`
- [ ] CI triggers on `pull_request` to `main`
- [ ] `pnpm test` runs all tests and passes locally
- [ ] `pnpm lint` passes on touched files

## Files to Touch
- `package.json` — add `vitest`, `@vitejs/plugin-react` (or next-compatible test setup), test script
- `vitest.config.ts` — NEW vitest config
- `src/lib/scroll-trigger.test.ts` — NEW tests
- `.github/workflows/ci.yml` — NEW CI workflow

## Non-Goals
- E2E Playwright tests (out of scope for this sprint)
- 100% coverage target

## Status
done
