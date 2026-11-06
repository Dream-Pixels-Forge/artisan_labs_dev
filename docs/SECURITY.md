# Security Audit Report

**Project:** Artisan Labs Dev  
**Location:** `Dev/app/artisan_labs_dev`  
**Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4, Zustand + IndexedDB  
**Audit Date:** (current)  
**Project Type:** Client-side scrollytelling sequence optimizer (no auth, no database in current build)

---

## Executive Summary

This audit reviews the current state of the Artisan Labs codebase. The application is a client-heavy Next.js app that extracts video frames, maps them to scroll-trigger events, and exports JSON/JS/CSS configs. It persists data in IndexedDB (not localStorage) and Zustand memory.

Identified issues: **1 Critical**, **1 High**, **2 Medium**, **3 Low**.

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| CSRF / Form submission | 1 | 0 | 0 | 0 |
| Environment validation | 0 | 1 | 0 | 0 |
| CI / Testing | 0 | 0 | 1 | 0 |
| Documentation accuracy | 0 | 0 | 1 | 0 |
| Package manager | 0 | 0 | 0 | 1 |
| TS target / dead code | 0 | 0 | 0 | 2 |
| **TOTAL** | **1** | **1** | **2** | **3** |

---

## Vulnerability Findings

### Critical — Fix before production deploy

#### 1. Feedback form submits to hardcoded external endpoint without CSRF

**Severity:** Critical  
**Location:** `src/components/feedback-form.tsx` (pre-fix), `src/app/api/feedback/route.ts` (fix)  
**CWE:** CWE-352: Cross-Site Request Forgery, CWE-798: Use of Hard-coded Credentials

**Finding:** The form POSTed directly to a hardcoded Formspree endpoint (`https://formspree.io/f/xaqllokg`) baked into client code, with no CSRF token or origin validation. A malicious site could trigger forged submissions from a logged-in visitor's browser.

**Remediation (implemented):**
- New server proxy route `src/app/api/feedback/route.ts` that:
  - Validates `Origin`/`Referer` against `ALLOWED_ORIGINS`
  - Validates a double-submit CSRF cookie (`csrf_token`) echoed as `X-CSRF-Token` header
  - Forwards to Formspree using server-side secret `FORMSPREE_ENDPOINT`
- New `src/app/api/csrf-token/route.ts` that issues the CSRF cookie (`SameSite=strict`)
- Client form reads `/api/csrf-token` on mount and sends `X-CSRF-Token` with the POST
- Endpoint moved out of client code into `.env` (`FORMSPREE_ENDPOINT`, `ALLOWED_ORIGINS`)

**Status:** Fixed (see `dev-notes/subgoals/subgoal-feedback-form-csrf.md`)

---

### High — Fix this sprint

#### 2. Environment variable validation was a no-op

**Severity:** High  
**Location:** `src/lib/validate-env.ts`, `src/app/layout.tsx`  
**CWE:** CWE-258: Empty Password Field (missing secret enforcement)

**Finding:** `validateEnv()` had an empty `requiredEnvVars` array; `NEXTAUTH_SECRET` and `DATABASE_URL` were listed as optional and never enforced. `assertEnv()` existed but was never called. The app could start in production without required secrets.

**Remediation (implemented):**
- `requiredEnvVars` now includes `NEXTAUTH_SECRET`
- `validateSecretStrength()` enforces >=32 chars with mixed case and a digit
- `assertEnv()` throws on missing/weak required vars and is called server-side in `layout.tsx`
- `.env.example` documents required + optional vars

**Status:** Fixed (see `dev-notes/subgoals/subgoal-env-validation.md`)

---

### Medium — Plan to fix

#### 3. No CI pipeline or automated tests

**Severity:** Medium  
**Location:** repo root (no `.github/workflows`), no `*.test.ts`

**Finding:** No type-check, lint, test, or build gate runs on PRs. The only quality check was a manual `pnpm lint`. Regressions can merge undetected.

**Remediation (implemented):**
- `.github/workflows/ci.yml`: `pnpm install --frozen-lockfile` → `tsc --noEmit` → `lint` → `test` → `build` on every PR
- `vitest.config.ts` + `src/lib/scroll-trigger.test.ts` covering all 8 scroll-trigger modes, `getFrameAtScroll`, and exports
- `package.json`: `test` script + `vitest` devDependency

**Status:** Fixed (see `dev-notes/subgoals/subgoal-ci-tests.md`)

#### 4. SECURITY.md previously listed phantom dependencies

**Severity:** Medium  
**Location:** `docs/SECURITY.md` (previous version)

**Finding:** The prior audit reported `react-syntax-highlighter`/PrismJS CVE-2024-53382, `next-auth`, and `radix-ui` — none of which appear in `package.json`. This misleads maintainers about actual risk.

**Remediation:** Rewrote `docs/SECURITY.md` to reflect the real dependency tree and current findings; removed phantom CVE entries.

**Status:** Fixed (this document)

---

### Low — Nice to have

#### 5. Package manager not standardized

**Severity:** Low  
**Location:** `vercel.json`, `README.md`, `bun.lock`, `pnpm-lock.yaml`

**Finding:** `pnpm-lock.yaml` exists (DPF standard is pnpm), but `vercel.json` and `README` referenced `bun install`/`bun run`, and `bun.lock` was committed. Mixed signals break reproducible installs.

**Remediation:** Standardized on pnpm everywhere (`vercel.json`, `README`), removed `bun.lock`, kept `pnpm-lock.yaml`.

**Status:** Fixed (see `dev-notes/subgoals/subgoal-package-manager-standardize.md`)

#### 6. TypeScript target older than necessary

**Severity:** Low  
**Location:** `tsconfig.json`

**Finding:** `target` was `ES2017` for a Next.js 16 / React 19 project; DPF shared base uses `ES2022`.

**Remediation:** Bumped `target` to `ES2022`.

**Status:** Fixed (see `dev-notes/subgoals/subgoal-tsconfig-upgrade.md`)

#### 7. `suppressHydrationWarning` masked hydration mismatches

**Severity:** Low  
**Location:** `src/app/layout.tsx`

**Finding:** `<html>` carried `suppressHydrationWarning`, hiding real server/client hydration mismatches.

**Remediation:** Removed the flag so mismatches surface in the console.

**Status:** Fixed (see `dev-notes/subgoals/subgoal-hydration-warning.md`)

---

## Remaining Technical Debt (tracked in dev-notes/subgoals/)

| Item | Subgoal | Priority |
|------|---------|----------|
| Remove no-op `handleConfigChange`; unify `config`/`onConfigChange` APIs | `subgoal-dead-code-cleanup.md` | Low |
| Replace O(n) `getFrameAtScroll` scan with binary search | `subgoal-get-frame-binary-search.md` | Low |
| Document `exportScrollTriggerJS` as a template (replace frame URLs) | `subgoal-export-js-docs.md` | Low |
| Replace `currentVideo!.` non-null assertions | `subgoal-non-null-assertions.md` | Low |

---

## Dependency Security Assessment

No known-vulnerable direct dependencies were found at time of audit. Keep dependencies current with `pnpm audit` on a regular cadence.

---

## Testing Recommendations

1. Run `pnpm test` (vitest) in CI on every PR.
2. Run `pnpm audit` periodically; act on high/critical advisories.
3. Verify security headers via `securityheaders.com` before production deploy.
4. Test CSRF behavior: submit the feedback form from a different origin — it must be rejected with 403.

---

## Conclusion

Critical CSRF and env-validation issues are fixed. CI and tests are in place. Remaining items are low-priority cleanup tracked as subgoals. The app is closer to production-ready but should not be deployed until the Critical/High gates pass and a staging smoke test is completed.
