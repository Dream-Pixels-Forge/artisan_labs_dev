'use client'

import type { ScrollTriggerMap } from '@/types'
import { Layers, Activity, ArrowDownUp, Zap } from 'lucide-react'

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5 text-white/25">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-mono font-bold text-[#f0f0f0]">{value}</p>
    </div>
  )
}

export function TriggerStats({ triggerMap }: { triggerMap: ScrollTriggerMap | null }) {
  if (!triggerMap) return null

  const { stats, eventCount } = triggerMap

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      <StatCard
        label="Min Spacing"
        value={`${stats.minSpacing.toFixed(1)}px`}
        icon={<ArrowDownUp className="h-3 w-3" />}
      />
      <StatCard
        label="Max Spacing"
        value={`${stats.maxSpacing.toFixed(1)}px`}
        icon={<ArrowDownUp className="h-3 w-3" />}
      />
      <StatCard
        label="Avg Spacing"
        value={`${stats.avgSpacing.toFixed(1)}px`}
        icon={<Activity className="h-3 w-3" />}
      />
      <StatCard
        label="Std Deviation"
        value={stats.stdDevSpacing.toFixed(2)}
        icon={<Zap className="h-3 w-3" />}
      />
      <StatCard
        label="Total Events"
        value={String(eventCount)}
        icon={<Layers className="h-3 w-3" />}
      />
      <StatCard
        label="Max Density"
        value={`${stats.maxDensity.toFixed(1)} / 100px`}
        icon={<Activity className="h-3 w-3" />}
      />
    </div>
  )
}
