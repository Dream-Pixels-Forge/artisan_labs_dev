# UI Audit — `/home/dimona/Dream-Pixels-Forge/Dev/app/artisan_labs_dev/src`

Files scanned: **98**

## Summary

| Signal | Count | Target |
|--------|-------|--------|
| Arbitrary Tailwind values (`x-[…]`) | 771 | ~0 in components |
| Text below 11px | 68 | 0 (badges excepted) |
| Distinct font sizes | 15 | ≤ 6 |
| Hex color literals in components | 72 | 0 |
| Distinct hex colors (all files) | 16 | ≤ ~12 (tokens) |
| Distinct radii | 9 | ≤ 3–4 |
| Inline `style={{}}` | 42 | only for dynamic values |
| `<button>` total | 17 | — |
| Icon buttons without label | 1 | 0 |
| `<img>` without alt | 2 | 0 |
| Files > 500 lines | 6 | 0 |

## Font sizes

`text-xs`×97, `text-sm`×89, `10px`×45, `11px`×32, `9px`×19, `text-lg`×9, `text-xl`×7, `text-2xl`×6, `8px`×4, `text-base`×4, `text-3xl`×3, `text-4xl`×2, `text-5xl`×2, `text-6xl`×1, `48px`×1

## Top hex colors

`#f0f0f0`×28, `#0a0a0a`×20, `#1a1a1a`×3, `#ccc`×3, `#141414`×2, `#fff`×2, `#3b82f6`×2, `#050505`×2, `#eaeaea`×2, `#ffffff`×2, `#000`×1, `#fca5a5`×1, `#ef4444`×1, `#eab308`×1, `#0f0f0f`×1, `#070707`×1

## Radii

`full`×65, `md`×64, `lg`×47, `xl`×43, `sm`×17, `2xl`×15, `DEFAULT`×14, `3xl`×5, `none`×5

## Arbitrary values by utility

`data-[…]`×366, `text-[…]`×131, `group-data-[…]`×56, `h-[…]`×23, `bg-[…]`×22, `ring-[…]`×17, `transition-[…]`×17, `w-[…]`×16, `peer-data-[…]`×14, `shadow-[…]`×11, `min-w-[…]`×9, `group-[…]`×9, `z-[…]`×5, `top-[…]`×5, `left-[…]`×5

## Worst files

| File | Lines | Buttons | Arbitrary | Tiny text | Hex | Unlabeled icon btns |
|------|-------|---------|-----------|-----------|-----|---------------------|
| `components/ui/sidebar.tsx` | 727 | 0 | 67 | 0 | 0 | 0 |
| `components/ui/navigation-menu.tsx` | 169 | 0 | 56 | 0 | 0 | 0 |
| `components/scroll-trigger/preview/mode-editor.tsx` | 553 | 0 | 21 | 15 | 0 | 0 |
| `components/screens/Dashboard.tsx` | 561 | 1 | 35 | 7 | 10 | 0 |
| `components/screens/Sequencer.tsx` | 564 | 0 | 31 | 3 | 8 | 0 |
| `components/ui/menubar.tsx` | 277 | 0 | 39 | 0 | 0 | 0 |
| `components/ui/dropdown-menu.tsx` | 258 | 0 | 38 | 0 | 0 | 0 |
| `components/ui/context-menu.tsx` | 253 | 0 | 38 | 0 | 0 | 0 |
| `components/archive/export-dialog.tsx` | 419 | 2 | 21 | 6 | 3 | 0 |
| `components/ui/drawer.tsx` | 136 | 0 | 32 | 0 | 0 | 0 |
| `components/ui/select.tsx` | 186 | 0 | 28 | 0 | 0 | 0 |
| `components/ui/toast.tsx` | 129 | 0 | 24 | 0 | 0 | 0 |

_Static heuristics: confirm in the rendered UI with dom_metrics.js before acting._
