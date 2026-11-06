# subgoal-package-manager-standardize.md

Derived from master GOAL.md / acceptance criterion: "Single package manager standard (pnpm) across config, CI, and docs."

## Problem
`pnpm-lock.yaml` exists (pnpm is the DPF standard), but `vercel.json` says `installCommand: bun install`, README says `bun install`, and `bun.lock` is committed. Mixed signals break reproducible installs and CI.

## Goal
Standardize on pnpm everywhere: remove `bun.lock`, update `vercel.json` and README to use `pnpm install` / `pnpm dev`.

## Verification Gates
- [ ] `bun.lock` removed
- [ ] `vercel.json` `installCommand` = `pnpm install`, `buildCommand` = `pnpm build`
- [ ] README install + scripts use `pnpm` not `bun`
- [ ] `pnpm-lock.yaml` retained and up to date
- [ ] `pnpm install --frozen-lockfile` succeeds (offline cache permitting)

## Files to Touch
- `vercel.json`
- `README.md`
- `bun.lock` — delete

## Non-Goals
- Migrating to bun as the standard (team decision, not this task)

## Status
done
