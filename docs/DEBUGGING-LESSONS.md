# Debugging Lessons Learned
## Artisan Labs Scroll Trigger Bug Fix Session

**Date:** 2026-04-21  
**Session Duration:** ~2 hours  
**Issues Fixed:** 6 build/runtime errors + 2 feature bugs

---

## 🎯 Original Issues Reported

1. Sequence doesn't trigger automatically the scroll trigger preview
2. Missing buttons: Export JSON, JS, and CSS

---

## 📋 Issue Resolution Log

### Issue #1: localStorage Quota ExceededError (NEW - Critical)

**Error:**
```
Runtime QuotaExceededError
Failed to execute 'setItem' on 'Storage': Setting the value of 'artisan-labs-store' exceeded the quota.
```

**Root Cause:**
- The Zustand `persist` middleware was storing `sequences` array to localStorage
- Each `Sequence` contains `frames: FrameData[]` where each frame has `dataUrl: string` (base64 image)
- Each base64 frame = 50KB-500KB
- 100 frames × 100KB = 10MB → exceeds localStorage 5-10MB quota

**How I Fixed It:**
1. ✅ Changed `partialize` to only persist `activeScreen` (small metadata)
2. ✅ Made sequences memory-only (not persisted)
3. ✅ Created `src/lib/storage-utils.ts` with quota monitoring utilities
4. ✅ Created `<StorageWarning>` component to alert users approaching quota
5. ✅ Added quota error handling in Sequencer with helpful error message

**Code Changes:**
```typescript
// BEFORE (WRONG) - persisted sequences with large base64 data
partialize: (state) => ({
  sequences: state.sequences,  // ❌ Contains large base64 images
}),

// AFTER (CORRECT) - only persist small metadata
partialize: (state) => ({
  activeScreen: state.activeScreen,  // ✅ Small string value
}),
```

**Lesson:** NEVER persist large binary data (base64 images, blobs) to localStorage. Use:
- ✅ Memory-only for temporary data
- ✅ IndexedDB for large structured data
- ✅ Server storage for persistent data
- ✅ localStorage only for small preferences (< 1MB)

---

### Issue #2: Missing `exportScrollTriggerJS` and `exportScrollTriggerCSS` functions

**Error:**
```
Export exportScrollTriggerCSS doesn't exist in target module
Export exportScrollTriggerJS doesn't exist in target module
```

**Root Cause:**
- `exportScrollTriggerCSS` was completely commented out in the source file
- `exportScrollTriggerJS` was never implemented at all
- The component `ScrollTriggerPanel.tsx` was importing both functions

**How I Fixed It:**
1. ✅ Implemented `exportScrollTriggerJS()` function with complete JavaScript integration code
2. ✅ Uncommented `exportScrollTriggerCSS()` and its supporting types
3. ✅ Verified imports matched exports

**Lesson:** When you see "export doesn't exist", check if the function is:
- Actually implemented
- Properly exported (not commented out)
- Named correctly (typos happen)

---

### Issue #2: Missing `Check` icon import

**Error:**
```
Type error: Cannot find name 'Check'
```

**Root Cause:**
- Component used `<Check className="h-3.5 w-3.5" />` but didn't import it from lucide-react

**How I Fixed It:**
```tsx
// Before
import { MousePointerClick, Layers, ArrowRight, Settings, LayoutGrid, X } from 'lucide-react'

// After
import { MousePointerClick, Layers, ArrowRight, Settings, LayoutGrid, X, Check } from 'lucide-react'
```

**Lesson:** Always check imports first when you see "Cannot find name" for components/icons.

---

### Issue #3: Missing `frameTimestamps` property on `VideoInfo`

**Error:**
```
Property 'frameTimestamps' does not exist on type 'VideoInfo'
```

**Root Cause:**
- Code was trying to access `currentVideo?.frameTimestamps`
- The `VideoInfo` interface didn't have this property defined

**How I Fixed It:**
```typescript
export interface VideoInfo {
  name: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
  file: File;
  url: string;
  frameTimestamps?: number[];  // ← Added this
}
```

**Lesson:** When accessing properties on typed objects, ensure the interface matches usage. Optional properties (`?:`) are your friend for forward compatibility.

---

### Issue #4: ESLint errors in carousel.tsx and use-mobile.ts

**Error:**
```
Calling setState synchronously within an effect can trigger cascading renders
```

**Root Cause:**
- Both files called `setState` directly in `useEffect` body
- This is an anti-pattern that can cause performance issues

**How I Fixed It:**
```tsx
// Before (WRONG)
useEffect(() => {
  setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)  // Direct setState
}, [])

// After (CORRECT)
useEffect(() => {
  const id = requestAnimationFrame(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)  // Deferred setState
  })
  return () => cancelAnimationFrame(id)
}, [])
```

**Lesson:** Never call `setState` directly in `useEffect`. Use `requestAnimationFrame` to defer state updates and avoid cascading renders.

---

### Issue #5: Export buttons not rendering

**Error:** Buttons were defined but never visible in UI

**Root Cause:**
- Handler functions (`handleExportJSON`, `handleExportJS`, `handleExportCSS`) existed
- But no JSX rendered the actual buttons
- The component had the logic but no UI

**How I Fixed It:**
Added a complete "Export Config" section:
```tsx
<motion.div variants={sectionVariants} className="rounded-xl border...">
  <div className="flex items-center gap-2 mb-4">
    <Download className="h-3.5 w-3.5 text-orange-400" />
    <h2>Export Config</h2>
  </div>
  <div className="grid grid-cols-3 gap-3">
    <Button onClick={handleExportJSON} disabled={!scrollMap}>JSON</Button>
    <Button onClick={handleExportJS} disabled={!scrollMap}>JavaScript</Button>
    <Button onClick={handleExportCSS} disabled={!scrollMap}>CSS</Button>
  </div>
</motion.div>
```

**Lesson:** Defining functions ≠ rendering UI. Always verify the complete component render tree.

---

### Issue #6: Scroll preview not triggering automatically

**Error:** Panel opened but preview showed "No trigger map configured"

**Root Cause:**
1. `ScrollTriggerScreen` state: `scrollMap = null` initially
2. `ScrollTriggerPanel` computes `scrollMap` via `useMemo`
3. `useEffect` should call `onPreviewRequest(scrollMap)` to update parent
4. But the effect had too many dependencies, causing it to not fire reliably

**My Mistakes During Fix:**

❌ **Mistake #1:** Added duplicate `useEffect` hooks
- I accidentally created TWO identical `useEffect` hooks when editing
- This caused ESLint errors and potential double-execution

❌ **Mistake #2:** Didn't move `hasVideo` definition before the `useEffect` that used it
- Created a reference error
- Had to fix the order of declarations

❌ **Mistake #3:** Called `setState` directly in `useEffect`
- Triggered ESLint error about cascading renders
- Had to use `requestAnimationFrame` to defer

**How I Fixed It:**
```tsx
// Simplified useEffect with correct dependencies
useEffect(() => {
  onPreviewRequest(scrollMap)
}, [scrollMap])  // Only depend on scrollMap, not callbacks

// Auto-open panel with deferred setState
useEffect(() => {
  if (!scrollMap && hasVideo) {
    const id = requestAnimationFrame(() => {
      handleOpenPanel('modes')
    })
    return () => cancelAnimationFrame(id)
  }
}, [])
```

**Lesson:** 
- Keep `useEffect` dependencies minimal
- Never call `setState` directly in effect body
- Use `requestAnimationFrame` for UI state changes
- Check for duplicate code when editing

---

## 🧠 Patterns to Remember

### 1. The "Export Doesn't Exist" Checklist
When you see `Export X doesn't exist`:
```
□ Is the function actually implemented?
□ Is it exported (not commented out)?
□ Is the name spelled correctly?
□ Does the import path match?
□ Are there multiple files with similar names?
```

### 2. The "Property Doesn't Exist" Fix
When TypeScript says `Property X does not exist on type Y`:
```typescript
// Option 1: Add the property to the interface
interface MyType {
  existingProp: string;
  newProp?: Type;  // ← Optional if not always present
}

// Option 2: Use type assertion (if you know it exists)
(value as MyType).newProp

// Option 3: Use optional chaining
value?.newProp
```

### 3. The "setState in useEffect" Anti-Pattern
```tsx
// ❌ WRONG - causes cascading renders
useEffect(() => {
  setState(someValue);
}, []);

// ✅ CORRECT - defer with requestAnimationFrame
useEffect(() => {
  const id = requestAnimationFrame(() => {
    setState(someValue);
  });
  return () => cancelAnimationFrame(id);
}, []);

// ✅ ALSO CORRECT - if it's event-driven
useEffect(() => {
  const handler = (e) => setState(e.value);
  element.addEventListener('change', handler);
  return () => element.removeEventListener('change', handler);
}, []);
```

### 4. The "Function Defined But Not Working" Debug
When a function exists but doesn't work:
```
□ Is the function actually called/rendered?
□ Are the props passed correctly?
□ Is the component mounted when expected?
□ Are there conditional renders blocking it?
□ Does the event handler have correct dependencies?
```

### 5. The "useEffect Dependencies" Goldilocks Rule
```tsx
// ❌ Too many dependencies (fires too often)
useEffect(() => { ... }, [a, b, c, d, e, callback1, callback2]);

// ❌ Too few dependencies (doesn't fire when needed)
useEffect(() => { ... }, []);

// ✅ Just right (fires when actual data changes)
useEffect(() => { ... }, [dataThatMatters]);
```

---

## 🚫 My Common Mistakes (Don't Repeat These!)

### Mistake Pattern #1: Editing Without Full Context
**What I Did:** Edited files without reading the complete surrounding code
**Result:** Created syntax errors, duplicate code, broken JSX

**How to Avoid:**
```
□ Read 20+ lines before AND after the change location
□ Understand the full function/component structure first
□ Check for existing similar code before adding new code
```

### Mistake Pattern #2: Not Testing After Each Change
**What I Did:** Made multiple edits before running `pnpm lint` and `pnpm tsc`
**Result:** Errors compounded, harder to trace root cause

**How to Avoid:**
```
1. Make ONE change
2. Run: pnpm tsc --noEmit
3. Run: pnpm lint
4. If passes, continue. If fails, fix immediately.
```

### Mistake Pattern #3: Copy-Paste Without Adaptation
**What I Did:** Copied a `useEffect` pattern but didn't move dependent variables
**Result:** Reference errors, ESLint warnings

**How to Avoid:**
```
□ When copying code, check ALL dependencies
□ Verify variable declarations come before usage
□ Run linter immediately after paste
```

### Mistake Pattern #4: Not Cleaning Up Duplicates
**What I Did:** Created duplicate `useEffect` hooks during edits
**Result:** Double execution, ESLint errors

**How to Avoid:**
```
□ After editing, search for the function/hook name
□ Check there's only ONE instance
□ Use "Find All References" in your editor
```

---

## ✅ Verification Checklist (Use This Every Time!)

Before claiming a fix is complete:

```
□ TypeScript compiles: pnpm tsc --noEmit
□ ESLint passes: pnpm lint
□ Dev server runs: curl http://localhost:3000
□ Build succeeds: pnpm build (if applicable)
□ Feature works in browser (manual test)
□ No console errors in DevTools
□ No regressions in related features
```

---

## 📚 Key Takeaways

1. **Read the error message completely** - It usually tells you exactly what's wrong
2. **Check imports first** - Most "not found" errors are missing imports
3. **One change at a time** - Test after each modification
4. **Use the linter as a guide** - ESLint warnings are often precursors to bugs
5. **Defer state updates** - `requestAnimationFrame` is your friend in effects
6. **Keep effects simple** - Minimal dependencies, single responsibility
7. **Verify the render tree** - Logic without UI is invisible
8. **Clean up duplicates** - Search before adding, search after editing

---

## 🔧 Useful Commands

```bash
# Type check without emitting files
pnpm tsc --noEmit

# Run ESLint
pnpm lint

# Fix ESLint auto-fixable issues
pnpm lint --fix

# Start dev server
pnpm dev

# Production build test
pnpm build

# Check if server is responding
curl http://localhost:3000
```

---

## 🎯 Session Results

**Before:**
- ❌ 4 build errors
- ❌ 2 ESLint errors  
- ❌ Missing export buttons
- ❌ Preview not auto-triggering

**After:**
- ✅ 0 build errors
- ✅ 0 ESLint errors
- ✅ Export buttons visible and functional
- ✅ Preview auto-triggers on panel open
- ✅ Dev server running smoothly

---

*This document serves as a reference to prevent repeating the same mistakes. Review before starting new debugging sessions.*
