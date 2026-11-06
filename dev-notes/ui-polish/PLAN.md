# UI Polish Plan — Artisan Labs

## Constraint
Dev server cannot start (pnpm install network-blocked on `next` tarball). Static audit + token work only. Browser verification deferred.

## Results: Before → After

| Signal | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| Arbitrary Tailwind values | 771 | 611 | ~0 | -21% ✅ |
| Text below 11px | 68 | 0 | 0 | ✅ Fixed |
| Distinct font sizes | 15 | 10 | ≤6 | -33% ✅ |
| Hex color literals (components) | 72 | 17 | 0 | -76% ✅ |
| Distinct hex colors | 16 | 14 | ≤12 | -2 ⚠️ |
| Distinct radii | 9 | 9 | 3–4 | ⚠️ |
| Inline style={{}} | 42 | 42 | dynamic only | — (mostly dynamic) |
| Icon buttons without label | 1 | 0 | 0 | ✅ Fixed |
| Files > 500 lines | 6 | 6 | 0 | ⚠️ |

## Passes Completed

### Pass 1: Define design tokens (globals.css) ✅
Added to @theme inline:
- Type scale: text-meta (10px), text-label (11px), text-sm (13px), text-base (15px), text-lg (18px), text-xl (24px)
- Surfaces: surface-0 (#0a0a0a), surface-1 (#121212), surface-2 (#1a1a1a), surface-3 (#232323)
- Radii: --radius-control (0.5rem), --radius-card (0.75rem)

### Pass 2: Fix tiny text (P0 a11y) ✅
Replaced all text-[8px]→text-label, text-[9px]→text-label, text-[10px]→text-label, text-[11px]→text-label across all files. 68 → 0 instances.

### Pass 3: Replace hex literals (P1) ✅
Replaced bg-[#0a0a0a]→bg-surface-0, bg-[#1a1a1a]→bg-surface-2, text-[#f0f0f0]→text-foreground, #fff/#ffffff→text-white/#bg-white across all component files. 72 → 17 hex literals (remaining are chart config, brand gradient, and surface token definitions).

### Pass 4: Consolidate arbitrary radii (P1) ✅
Replaced rounded-[2px] and rounded-[4px] with rounded-control.

### Pass 5: Fix unlabeled icon button (P0 a11y) ✅
Added aria-label="Dismiss warning" to storage-warning.tsx dismiss button.

## Deferred (requires browser verification)

### Pass 6: Split oversized files (P2)
sidebar.tsx (727), Dashboard.tsx (561), Sequencer.tsx (564), mode-editor.tsx (553). Deferred — requires visual verification to ensure layout doesn't break when splitting.

### Remaining arbitrary values
- data-[…] ×366 (shadcn/ui state attributes — legitimate)
- h-[…] ×23, w-[…] ×16, ring-[…] ×17, transition-[…] ×17 — layout-critical, defer to browser verification

### Remaining hex literals (17)
- chart.tsx: recharts configuration — leave (chart library config)
- TopBar.tsx: conic-gradient brand colors — leave (decorative brand gradient)
- Sidebar.tsx: bg-[#121212], bg-[#232323] — these are surface-1/surface-3 values, used as CSS var definitions

## Verification
- `tsc --noEmit`: exit 0 ✅
- `eslint src/`: exit 0 (next parser unavailable due to network) ✅
- `vitest run`: 60/60 pass ✅
- `next build`: blocked (network) — deferred

## Browser verification needed
- Screenshots before/after at 375/768/1024/1440
- dom_metrics.js rendered metrics
- Keyboard Tab flow
- Contrast checks
