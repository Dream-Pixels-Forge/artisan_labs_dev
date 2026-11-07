# subgoal-split-dashboard.md

Derived from master GOAL.md / acceptance criterion: "No files over 500 lines."

## Problem
`src/components/screens/Dashboard.tsx` is 560 lines, exceeding the 500-line threshold. It contains multiple distinct sections that should be split into focused sub-components:
- Hero section (hero title, CTA, mode badges)
- Live Scroll Demo
- Getting Started / Metrics
- Feature Showcase
- Why Scrollytelling
- Feedback form
- Footer

## Goal
Split Dashboard.tsx into focused sub-components, each under 500 lines, preserving all existing behavior and styling.

## Verification Gates
- [ ] Dashboard.tsx under 500 lines
- [ ] New sub-component files created (DashboardHero.tsx, DashboardScrollDemo.tsx, DashboardMetrics.tsx, DashboardFeatures.tsx, DashboardWhy.tsx, DashboardFeedback.tsx)
- [ ] All exports and imports updated correctly
- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] `vitest run` passes (64/64 tests)
- [ ] `next build` passes (exit 0)
- [ ] Dev server starts without errors
- [ ] Browser verification: dashboard renders correctly at http://localhost:3000/

## Files to Touch
- `src/components/screens/Dashboard.tsx` — refactor into sub-components
- `src/components/screens/dashboard/hero-section.tsx` — NEW (hero section)
- `src/components/screens/dashboard/scroll-demo.tsx` — NEW (live scroll demo) — may already exist
- `src/components/screens/dashboard/metric-card.tsx` — may already exist
- `src/components/screens/dashboard/feature-card.tsx` — may already exist
- `src/components/screens/dashboard/why-scrollytelling.tsx` — NEW
- `src/components/screens/dashboard/feedback-form-wrapper.tsx` — NEW
- `src/components/screens/dashboard/footer.tsx` — NEW

## Non-Goals
- Change visual appearance or behavior
- Add new features

## Status
done
