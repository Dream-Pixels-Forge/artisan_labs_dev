/**
 * Storage Utilities
 * 
 * Helper functions for managing localStorage and handling quota errors.
 */

/**
 * Safely clear localStorage with error handling
 */
export function clearLocalStorage(): { success: boolean; error?: Error } {
  try {
    localStorage.clear()
    return { success: true }
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Safely remove a specific item from localStorage
 */
export function removeFromStorage(key: string): { success: boolean; error?: Error } {
  try {
    localStorage.removeItem(key)
    return { success: true }
  } catch (error) {
    console.error(`Failed to remove '${key}' from localStorage:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

/**
 * Check current localStorage usage
 * @returns Object with usage info in bytes and percentage
 */
export function getLocalStorageUsage(): { 
  used: number
  total: number
  percentage: number
  usedFormatted: string
} {
  let used = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length // key + value
    }
  }
  
  // Estimate: most browsers allow 5-10MB
  const estimatedTotal = 5 * 1024 * 1024 // 5MB conservative estimate
  const percentage = (used / estimatedTotal) * 100
  
  return {
    used,
    total: estimatedTotal,
    percentage: Math.round(percentage * 100) / 100,
    usedFormatted: formatBytes(used),
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Check if we're approaching localStorage quota
 * @param threshold Percentage threshold (default 80%)
 * @returns True if approaching quota
 */
export function isApproachingQuota(threshold = 80): boolean {
  const usage = getLocalStorageUsage()
  return usage.percentage >= threshold
}

/**
 * Get a warning message if approaching quota
 */
export function getQuotaWarning(): string | null {
  const usage = getLocalStorageUsage()
  
  if (usage.percentage >= 95) {
    return `⚠️ CRITICAL: localStorage is ${usage.percentage}% full (${usage.usedFormatted}). Data loss may occur.`
  }
  
  if (usage.percentage >= 80) {
    return `⚠️ WARNING: localStorage is ${usage.percentage}% full (${usage.usedFormatted}). Consider clearing old data.`
  }
  
  return null
}

/**
 * Attempt to set an item in localStorage with quota error handling
 */
export function safeSetItem(
  key: string, 
  value: string
): { success: boolean; error?: 'QUOTA_EXCEEDED' | 'UNKNOWN'; usage?: ReturnType<typeof getLocalStorageUsage> } {
  try {
    localStorage.setItem(key, value)
    return { success: true }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { 
        success: false, 
        error: 'QUOTA_EXCEEDED',
        usage: getLocalStorageUsage()
      }
    }
    
    return { 
      success: false, 
      error: 'UNKNOWN',
      usage: getLocalStorageUsage()
    }
  }
}

/**
 * Initialize storage monitoring and warnings
 * Call this once on app startup
 */
export function initStorageMonitoring(): void {
  // Log initial usage
  const usage = getLocalStorageUsage()
  console.log(`[Storage] localStorage usage: ${usage.usedFormatted} (${usage.percentage}%)`)
  
  // Check for quota warning
  const warning = getQuotaWarning()
  if (warning) {
    console.warn(`[Storage] ${warning}`)
  }
}
