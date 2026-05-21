'use client'

import { SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type { ScrollTriggerMap } from '@/types'

export function InfoPanel({
  scrollPosition,
  currentFrameIndex,
  progress,
  currentSceneLabel,
  map,
}: {
  scrollPosition: number
  currentFrameIndex: number
  progress: number
  currentSceneLabel: string | null
  map: ScrollTriggerMap
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <InfoCard
        label="Scroll Position"
        value={`${Math.round(scrollPosition)} px`}
        sub={`of ${map.scrollDistancePx.toLocaleString()} px`}
      />
      <InfoCard
        label="Current Frame"
        value={`${currentFrameIndex + 1}`}
        sub={`of ${map.eventCount}`}
      />
      <InfoCard
        label="Progress"
        value={`${(progress * 100).toFixed(1)}%`}
        sub={
          <div className="w-full h-1 rounded-full bg-white/[0.06] mt-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        }
      />
      <InfoCard
        label={currentSceneLabel ? 'Active Scene' : 'Mode'}
        value={currentSceneLabel ?? SCROLL_MODE_INFO[map.config.mode]?.label ?? map.config.mode}
        sub={currentSceneLabel ? 'Scene mode' : SCROLL_MODE_INFO[map.config.mode]?.bestFor ?? ''}
        highlight={!!currentSceneLabel}
      />
    </div>
  )
}

function InfoCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string
  value: string | React.ReactNode
  sub: string | React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-white/25 block">
        {label}
      </span>
      <p className={`text-sm font-mono font-bold ${highlight ? 'text-orange-400' : 'text-[#f0f0f0]'}`}>
        {value}
      </p>
      <div className="text-[10px] text-white/20 leading-snug">{sub}</div>
    </div>
  )
}
