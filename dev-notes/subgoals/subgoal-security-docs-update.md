# subgoal-security-docs-update.md

Derived from master GOAL.md / acceptance criterion: "Documentation reflects actual code state; no phantom findings."

## Problem
`docs/SECURITY.md` lists vulnerabilities (`react-syntax-highlighter`/PrismJS CVE-2024-53382, `next-auth`, `radix-ui`) that do not exist in `package.json`. It describes a different state of the project and would mislead future maintainers.

## Goal
Update `docs/SECURITY.md` to match the actual dependency tree and current security posture, or retire it if superseded by `dev-notes/security/`.

## Verification Gates
- [ ] `docs/SECURITY.md` dependency table matches `package.json` (no phantom packages)
- [ ] Actual findings (CSRF, env validation, missing CI) are listed with correct severity
- [ ] Remediation plan phases match work actually being done
- [ ] Link from `docs/SECURITY.md` to `dev-notes/security/` if governance copy exists

## Files to Touch
- `docs/SECURITY.md` — rewrite dependency + findings sections

## Non-Goals
- Full security re-audit

## Status
done
