# Storage Quota Fix - localStorage QuotaExceededError

## Problem

Users encountered a critical error when extracting frames:

```
Runtime QuotaExceededError
Failed to execute 'setItem' on 'Storage': Setting the value of 'artisan-labs-store' exceeded the quota.
```

## Root Cause

The app was storing **sequences with base64-encoded frame images** to localStorage:

- Each `Sequence` contains `frames: FrameData[]`
- Each `FrameData.dataUrl` is a base64-encoded image (50KB-500KB)
- 100 frames × 100KB average = **10MB**
- localStorage quota = **5-10MB** (browser dependent)

## Solution

### 1. Stop Persisting Large Data

**File:** `src/store/app-store.ts`

Changed the `persist` configuration to only store small metadata:

```typescript
// BEFORE (❌ WRONG)
partialize: (state) => ({
  sequences: state.sequences,  // Contains large base64 images
}),

// AFTER (✅ CORRECT)
partialize: (state) => ({
  activeScreen: state.activeScreen,  // Small string only
}),
```

**Impact:** Sequences are now stored in memory only (not persisted across page reloads)

### 2. Created Storage Utilities

**File:** `src/lib/storage-utils.ts`

New utility functions for storage management:

- `getLocalStorageUsage()` - Check current usage
- `isApproachingQuota()` - Check if near limit
- `getQuotaWarning()` - Get warning message
- `safeSetItem()` - Set with error handling
- `clearLocalStorage()` - Clear with error handling
- `initStorageMonitoring()` - Initialize monitoring

### 3. Added Storage Warning Component

**File:** `src/components/storage-warning.tsx`

New component that:
- Monitors localStorage usage
- Shows warning when approaching quota (>80%)
- Provides "Clear Storage" button to resolve issues
- Displays usage statistics

**Integrated in:** `src/app/layout.tsx`

### 4. Better Error Handling

**File:** `src/components/screens/Sequencer.tsx`

Added specific error handling for quota errors:

```typescript
} else if (
  err instanceof DOMException && 
  err.name === 'QuotaExceededError'
) {
  toast.error('Storage quota exceeded', {
    description: 'Too many sequences stored. Clear old sequences from the Archive and try again.',
    duration: 8000,
  })
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/store/app-store.ts` | Changed persistence to only store `activeScreen` |
| `src/lib/storage-utils.ts` | **NEW** - Storage utilities |
| `src/components/storage-warning.tsx` | **NEW** - Warning component |
| `src/app/layout.tsx` | Added `<StorageWarning />` component |
| `src/components/screens/Sequencer.tsx` | Added quota error handling |
| `docs/DEBUGGING-LESSONS.md` | Documented the issue and fix |

## User Impact

### Before Fix
- ❌ App crashes when extracting frames after multiple sequences
- ❌ No warning before quota exceeded
- ❌ No way to clear storage from UI
- ❌ Poor error messages

### After Fix
- ✅ No more crashes (sequences not persisted)
- ✅ Warning shown when approaching quota
- ✅ One-click storage clearing
- ✅ Helpful error messages with recovery steps

## Trade-offs

### Lost Functionality
- Sequences no longer persist across page reloads
- Users must re-extract if they refresh the page

### Why This Is Acceptable
1. **Better than crashing:** Memory-only is better than quota errors
2. **Typical workflow:** Users extract → configure → export in one session
3. **Archive still works:** Extracted sequences in Archive remain accessible
4. **Future solution:** Can implement IndexedDB for persistence without quota limits

## Future Improvements

### Recommended Next Steps

1. **IndexedDB Integration**
   - Use `idb` library for large data storage
   - Store sequences with frames in IndexedDB
   - Keep only metadata in Zustand store
   - No quota issues (IndexedDB allows 100MB+)

2. **Selective Persistence**
   - Persist sequence metadata only (name, settings)
   - Lazy-load frame data when needed
   - Cache frames in IndexedDB

3. **Storage Management UI**
   - Add storage settings page
   - Show per-sequence storage usage
   - Allow selective deletion
   - Export/import sequences as files

4. **Server Storage**
   - Upload sequences to server
   - Store only references in client
   - Enable cross-device sync

## Testing

### Manual Test Steps

1. Clear browser localStorage: `localStorage.clear()`
2. Extract multiple sequences (100+ frames each)
3. Monitor storage warning in bottom-right corner
4. Verify warning appears at ~80% quota
5. Click "Clear Storage" and verify app resets

### Verification Commands

```bash
# Check TypeScript
pnpm tsc --noEmit

# Check linting
pnpm lint

# Run dev server
pnpm dev

# Check localStorage usage (in browser console)
localStorage.length
Object.keys(localStorage).forEach(k => console.log(k, localStorage[k].length))
```

## Monitoring

The app now logs storage usage on startup:

```
[Storage] localStorage usage: 2.5 KB (0.05%)
```

And warns if approaching quota:

```
[Storage] ⚠️ WARNING: localStorage is 82.5% full (4.1 MB). Consider clearing old data.
```

---

**Fixed:** 2026-04-21  
**Issue Type:** Runtime QuotaExceededError  
**Severity:** Critical (blocking core functionality)  
**Status:** ✅ Resolved
