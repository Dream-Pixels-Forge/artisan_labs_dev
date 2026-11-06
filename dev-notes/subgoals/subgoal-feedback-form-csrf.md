# subgoal-feedback-form-csrf.md

Derived from master GOAL.md / acceptance criterion: "Critical security fixes before production deploy."

## Problem
The feedback form (`src/components/feedback-form.tsx`) POSTs directly to a hardcoded Formspree endpoint with no CSRF token, no origin validation, and the endpoint ID is baked into client-side code. SECURITY.md flags this as Critical (CWE-352 CSRF, CWE-798 hardcoded credentials).

## Goal
Submit feedback through a Next.js API route proxy that validates origin and includes CSRF protection, with the Formspree endpoint moved to an environment variable.

## Verification Gates
- [ ] `NEXT_PUBLIC_FORMSPREE_ENDPOINT` removed from client code; endpoint read only from server-side env
- [ ] New POST API route at `src/app/api/feedback/route.ts` proxies to Formspree
- [ ] Origin / referer validation on the API route
- [ ] CSRF token (double-submit cookie pattern) validated on submit
- [ ] Client form reads CSRF token from cookie and sends it with each request
- [ ] Form still works in development (graceful fallback when env var missing)
- [ ] `pnpm tsc --noEmit` passes (type check)
- [ ] `pnpm lint` passes on touched files

## Files to Touch
- `src/components/feedback-form.tsx` — client form changes
- `src/app/api/feedback/route.ts` — NEW server proxy route
- `.env.example` — document `NEXT_PUBLIC_FORMSPREE_ENDPOINT` and `CSRF_SECRET`/`FORMSPREE_ENDPOINT`

## Non-Goals
- Full next-auth integration
- SameSite=Strict session cookies (out of scope for this MVP)

## Status
done
