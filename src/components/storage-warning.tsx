'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { getQuotaWarning, clearLocalStorage, removeFromStorage } from '@/lib/storage-utils'
import { Button } from '@/components/ui/button'

/**
 * Storage Warning Component
 * 
 * Displays a warning toast if localStorage is approaching quota limits.
 * Provides options to clear storage and resolve quota issues.
 */
export function StorageWarning() {
  const [warning, setWarning] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    // Check for quota warning on mount
    const quotaWarning = getQuotaWarning()
    if (quotaWarning) {
      // Defer to avoid cascading renders
      const id = requestAnimationFrame(() => {
        setWarning(quotaWarning)
      })
      return () => cancelAnimationFrame(id)
    }

    // Also listen for storage errors
    const handleStorageError = (event: StorageEvent) => {
      console.error('Storage error:', event)
      const newWarning = getQuotaWarning()
      if (newWarning) {
        const id = requestAnimationFrame(() => {
          setWarning(newWarning)
        })
        return () => cancelAnimationFrame(id)
      }
    }

    window.addEventListener('error', handleStorageError as any)
    return () => window.removeEventListener('error', handleStorageError as any)
  }, [])

  const handleClearStorage = () => {
    const result = clearLocalStorage()
    if (result.success) {
      setWarning(null)
      setShowClearConfirm(false)
      // Reload to reset app state
      window.location.reload()
    } else {
      console.error('Failed to clear storage:', result.error)
    }
  }

  const handleDismiss = () => {
    setWarning(null)
    setShowClearConfirm(false)
  }

  if (!warning && !showClearConfirm) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md">
      {!showClearConfirm ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-amber-400">Storage Quota Warning</p>
              <p className="text-xs text-white/70">{warning}</p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowClearConfirm(true)}
                  className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                >
                  Clear Storage
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 text-xs text-white/50 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/25 hover:text-white/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Clear All Storage?</p>
                <p className="text-xs text-white/70 mt-1">
                  This will remove all saved sequences and preferences. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleClearStorage}
                className="h-8 text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              >
                Yes, Clear Everything
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="h-8 text-xs text-white/50 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
