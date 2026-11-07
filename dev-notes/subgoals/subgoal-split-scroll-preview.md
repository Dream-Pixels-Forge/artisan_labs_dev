# subgoal-split-scroll-preview.md

Derived from master GOAL.md / acceptance criterion: "No files over 500 lines."

## Problem
`src/components/scroll-trigger/ScrollPreview.tsx` is 502 lines, exceeding the 500-line threshold. It contains multiple distinct preview sections that should be split into focused sub-components:
- Null state / empty state
- Fullscreen mode overlay
- Panel mode (header, trigger map, frame display + scroll rail, filmstrip, mode editor, info panel)

## Goal
Split ScrollPreview.tsx into focused sub-components, each under 500 lines, preserving all existing behavior and styling.

## Verification Gates
- [ ] ScrollPreview.tsx under 500 lines
- [ ] New sub-component files created (ScrollPreviewFullscreen.tsx, ScrollPreviewPanel.tsx, ScrollPreviewHeader.tsx)
- [ ] All exports and imports updated correctly
- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] `vitest run` passes (64/64 tests)
- [ ] `next build` passes (exit 0)
- [ ] Dev server starts without errors
- [ ] Browser verification: scroll trigger screen renders correctly at http://localhost:3000/

## Files to Touch
- `src/components/scroll-trigger/ScrollPreview.tsx` — refactor into sub-components
- `src/components/scroll-trigger/preview/ScrollPreviewFullscreen.tsx` — NEW
- `src/components/scroll-trigger/preview/ScrollPreviewPanel.tsx` — NEW
- `src/components/scroll-trigger/preview/ScrollPreviewHeader.tsx` — NEW

## Non-Goals
- Change visual appearance or behavior
- Add new features

## Status
done
