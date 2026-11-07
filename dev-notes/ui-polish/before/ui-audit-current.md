# UI Audit — `/home/dimona/Dream-Pixels-Forge/Dev/app/artisan_labs_dev/src`

Files scanned: **103**

## Summary

| Signal | Count | Target |
|--------|-------|--------|
| Arbitrary Tailwind values (`x-[…]`) | 592 | ~0 in components |
| Text below 11px | 0 | 0 (badges excepted) |
| Distinct font sizes | 10 | ≤ 6 |
| Hex color literals in components | 17 | 0 |
| Distinct hex colors (all files) | 14 | ≤ ~12 (tokens) |
| Distinct radii | 9 | ≤ 3–4 |
| Inline `style={{}}` | 42 | only for dynamic values |
| `<button>` total | 17 | — |
| Icon buttons without label | 0 | 0 |
| `<img>` without alt | 2 | 0 |
| Files > 500 lines | 4 | 0 |

## Font sizes

`text-xs`×97, `text-sm`×91, `text-lg`×11, `text-xl`×9, `text-base`×6, `text-2xl`×6, `text-3xl`×3, `text-5xl`×3, `text-4xl`×2, `text-6xl`×1

## Top hex colors

`#ccc`×3, `#fff`×2, `#3b82f6`×2, `#050505`×2, `#eaeaea`×2, `#ffffff`×2, `#0a0a0a`×1, `#121212`×1, `#1a1a1a`×1, `#232323`×1, `#000`×1, `#fca5a5`×1, `#ef4444`×1, `#eab308`×1

## Radii

`full`×65, `md`×64, `lg`×47, `xl`×43, `sm`×17, `2xl`×15, `DEFAULT`×14, `3xl`×5, `none`×5

## Arbitrary values by utility

`data-[…]`×366, `group-data-[…]`×56, `h-[…]`×23, `ring-[…]`×17, `w-[…]`×16, `peer-data-[…]`×14, `shadow-[…]`×11, `min-w-[…]`×9, `group-[…]`×9, `z-[…]`×5, `top-[…]`×5, `left-[…]`×5, `has-[…]`×5, `translate-x-[…]`×5, `min-h-[…]`×4

## Worst files

| File | Lines | Buttons | Arbitrary | Tiny text | Hex | Unlabeled icon btns |
|------|-------|---------|-----------|-----------|-----|---------------------|
| `components/ui/sidebar.tsx` | 727 | 0 | 63 | 0 | 0 | 0 |
| `components/ui/navigation-menu.tsx` | 169 | 0 | 55 | 0 | 0 | 0 |
| `components/ui/menubar.tsx` | 277 | 0 | 39 | 0 | 0 | 0 |
| `components/ui/dropdown-menu.tsx` | 258 | 0 | 38 | 0 | 0 | 0 |
| `components/ui/context-menu.tsx` | 253 | 0 | 38 | 0 | 0 | 0 |
| `components/ui/drawer.tsx` | 136 | 0 | 32 | 0 | 0 | 0 |
| `components/ui/select.tsx` | 186 | 0 | 27 | 0 | 0 | 0 |
| `components/ui/toast.tsx` | 129 | 0 | 24 | 0 | 0 | 0 |
| `components/ui/calendar.tsx` | 214 | 0 | 23 | 0 | 0 | 0 |
| `components/screens/Dashboard.tsx` | 561 | 1 | 18 | 0 | 0 | 0 |
| `components/screens/Sequencer.tsx` | 433 | 0 | 16 | 0 | 0 | 0 |
| `components/ui/sheet.tsx` | 140 | 0 | 17 | 0 | 0 | 0 |

_Static heuristics: confirm in the rendered UI with dom_metrics.js before acting._
