'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type { ScrollTriggerMap, ScrollTriggerEvent } from '@/types'

const SCENE_COLORS = [
  'bg-orange-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-pink-500',
]

const SCENE_BORDER_COLORS = [
  'border-orange-500/40',
  'border-emerald-500/40',
  'border-sky-500/40',
  'border-violet-500/40',
  'border-rose-500/40',
  'border-amber-500/40',
  'border-teal-500/40',
  'border-pink-500/40',
]

function DensityBars({
  events,
  scrollDistancePx,
}: {
  events: ScrollTriggerEvent[]
  scrollDistancePx: number
}) {
  const segments = useMemo(() => {
    if (events.length === 0 || scrollDistancePx === 0) return []
    const numSegments = 60
    const segmentWidth = scrollDistancePx / numSegments
    const counts = new Array(numSegments).fill(0)

    for (const event of events) {
      const segIdx = Math.min(numSegments - 1, Math.floor(event.scrollPosition / segmentWidth))
      counts[segIdx]++
    }

    const maxCount = Math.max(...counts, 1)
    return counts.map((count, i) => ({
      left: (i / numSegments) * 100,
      width: (1 / numSegments) * 100 + 0.1,
      height: (count / maxCount) * 100,
      opacity: 0.1 + (count / maxCount) * 0.3,
    }))
  }, [events, scrollDistancePx])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-full flex">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-t-sm bg-orange-500"
          style={{
            left: `${seg.left}%`,
            width: `${seg.width}%`,
            height: `${seg.height}%`,
            opacity: seg.opacity,
          }}
        />
      ))}
    </div>
  )
}

export function TriggerMapVisualization({
  map,
  currentScrollPosition,
}: {
  map: ScrollTriggerMap
  currentScrollPosition: number
}) {
  const isSceneMode = map.config.mode === 'scene'
  const currentProgress = map.scrollDistancePx > 0
    ? currentScrollPosition / map.scrollDistancePx
    : 0

  const sceneSections = useMemo(() => {
    if (!isSceneMode || map.config.scenes.length === 0) return null
    const scenes = map.config.scenes
    const totalWeight = scenes.reduce((sum, s) => sum + s.weight, 0)
    let accumulated = 0
    return scenes.map((scene, i) => {
      const fraction = scene.weight / totalWeight
      const start = accumulated
      accumulated += fraction
      return {
        scene,
        startFraction: start,
        endFraction: accumulated,
        colorClass: SCENE_COLORS[i % SCENE_COLORS.length],
        borderClass: SCENE_BORDER_COLORS[i % SCENE_BORDER_COLORS.length],
      }
    })
  }, [isSceneMode, map.config.scenes])

  const dotPositions = useMemo(() => {
    if (map.events.length <= 120) return map.events
    const step = map.events.length / 120
    return map.events.filter((_, i) => i % Math.floor(step) === 0 || i === map.events.length - 1)
  }, [map.events])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Map className="h-3.5 w-3.5 text-orange-400" />
        <h3 className="text-xs font-medium uppercase tracking-widest text-white/30">
          Trigger Distribution
        </h3>
        <Badge variant="outline" className="border-white/[0.06] bg-white/[0.02] text-white/25">
          {SCROLL_MODE_INFO[map.config.mode]?.label}
        </Badge>
      </div>

      {sceneSections && (
        <div className="relative h-5">
          {sceneSections.map((section, i) => {
            const left = section.startFraction * 100
            const width = (section.endFraction - section.startFraction) * 100
            return (
              <div
                key={i}
                className="absolute top-0 flex items-center justify-center overflow-hidden"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="text-[9px] font-medium text-white/40 truncate px-1">
                  {section.scene.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="relative h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {sceneSections?.map((section, i) => {
          const left = section.startFraction * 100
          const width = (section.endFraction - section.startFraction) * 100
          return (
            <div
              key={i}
              className={`absolute top-0 bottom-0 ${section.colorClass} opacity-15`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}

        <DensityBars events={map.events} scrollDistancePx={map.scrollDistancePx} />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {dotPositions.map((event, i) => {
            const x = map.scrollDistancePx > 0
              ? (event.scrollPosition / map.scrollDistancePx) * 100
              : 0
            const y = 50
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r={isSceneMode ? '1.5' : '2'}
                fill="rgba(249, 115, 22, 0.5)"
              />
            )
          })}
        </svg>

        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
          style={{ left: `${currentProgress * 100}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-orange-400" />
        </motion.div>
      </div>

      <p className="text-[10px] text-white/20 leading-relaxed">
        {SCROLL_MODE_INFO[map.config.mode]?.description}
      </p>
    </div>
  )
}
