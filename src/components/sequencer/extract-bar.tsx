'use client'

import { Loader2, Play, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { formatElapsed } from '@/lib/shared-utils'

interface ExtractBarProps {
  isExtracting: boolean
  progressPercent: number
  progressCount: number
  progressTotal: number
  elapsedMs: number
  onExtract: () => void
  onCancel: () => void
}

export function ExtractBar({
  isExtracting,
  progressPercent,
  progressCount,
  progressTotal,
  elapsedMs,
  onExtract,
  onCancel,
}: ExtractBarProps) {
  return (
    <div className="mt-4 sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-6 pt-3 bg-gradient-to-t from-surface-0 via-surface-0 to-transparent">
      {!isExtracting ? (
        <Button
          onClick={onExtract}
          className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wider transition-all duration-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.3)] active:scale-[0.98]"
        >
          <Play className="h-4 w-4 mr-2" />
          EXTRACT SEQUENCE
        </Button>
      ) : (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.04] px-5 py-4 space-y-3">
          <Progress
            value={progressPercent}
            className="h-2 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
              <p className="text-sm text-white/70">
                Frame{' '}
                <span className="font-mono text-orange-400">{progressCount}</span>
                {' '}of{' '}
                <span className="font-mono text-orange-400">{progressTotal}</span>
                <span className="text-white/30 ml-2">
                  {progressPercent}% &middot; {formatElapsed(elapsedMs)}
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-7 text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
