# subgoal-env-validation.md

Derived from master GOAL.md / acceptance criterion: "Environment variables validated at startup; secrets never hardcoded."

## Problem
`src/lib/validate-env.ts` has an empty `requiredEnvVars` array and `optionalEnvVars` lists secrets (`NEXTAUTH_SECRET`, `DATABASE_URL`) that are never enforced. `validateEnv()` runs at import in `layout.tsx` but is a no-op; `assertEnv()` is exported but never called. SECURITY.md flags missing env validation as High.

## Goal
Make env validation meaningful: required vars enforced at build/startup, secret strength checked, warnings surfaced in production.

## Verification Gates
- [ ] `requiredEnvVars` includes `NEXTAUTH_SECRET` (and `DATABASE_URL` if DB is used)
- [ ] `validateEnv()` checks secret strength (>=32 chars, mixed case, digit)
- [ ] `assertEnv()` called on server startup in `layout.tsx` (guarded `typeof window === 'undefined'`)
- [ ] Missing required vars in production throw a clear error at build/startup, not silently ignored
- [ ] `.env.example` lists all required + optional vars with placeholder values
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes on touched files

## Files to Touch
- `src/lib/validate-env.ts` — required vars, strength check, assert call
- `src/app/layout.tsx` — call `assertEnv()` server-side
- `.env.example` — document required vars

## Non-Goals
- Runtime env var rotation
- Vault / external secret manager integration

## Status
done
