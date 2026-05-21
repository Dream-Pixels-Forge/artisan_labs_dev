'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ScrollTriggerMap } from '@/types'

export function ScrollSimulatorRail({
  railRef,
  map,
  progress,
  isDragging,
  handleRailMouseDown,
  handleRailTouchStart,
  onStepUp,
  onStepDown,
}: {
  railRef: React.RefObject<HTMLDivElement | null>
  map: ScrollTriggerMap
  progress: number
  isDragging: boolean
  handleRailMouseDown: (e: React.MouseEvent) => void
  handleRailTouchStart: (e: React.TouchEvent) => void
  onStepUp: () => void
  onStepDown: () => void
}) {
  const eventMarkers = useMemo(() => {
    if (map.events.length <= 80) return map.events
    const step = map.events.length / 80
    return map.events.filter((_, i) => i % Math.floor(step) === 0 || i === map.events.length - 1)
  }, [map.events])

  return (
    <div className="flex flex-col items-center gap-2 py-1 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onStepUp}
        className="h-6 w-6 p-0 text-white/25 hover:text-orange-400 hover:bg-orange-500/10 rounded-md"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </Button>

      <div
        ref={railRef}
        className={`
          relative w-4 rounded-full cursor-pointer
          ${isDragging ? 'bg-white/[0.12]' : 'bg-white/[0.06]'}
          transition-colors duration-150
        `}
        style={{ height: '100%', minHeight: '200px' }}
        onMouseDown={handleRailMouseDown}
        onTouchStart={handleRailTouchStart}
      >
        <div className="absolute top-0 left-0 right-0 rounded-full bg-orange-500/20"
          style={{ height: `${progress * 100}%` }}
        />

        {eventMarkers.map((event, i) => {
          const dotProgress = map.scrollDistancePx > 0
            ? event.scrollPosition / map.scrollDistancePx
            : 0
          return (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20"
              style={{ top: `${dotProgress * 100}%` }}
            />
          )
        })}

        <motion.div
          className={`
            absolute left-1/2 -translate-x-1/2 z-10
            w-5 h-2.5 rounded-full shadow-lg
            ${isDragging
              ? 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
              : 'bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.3)]'
            }
          `}
          style={{ top: `${progress * 100}%`, marginTop: '-5px' }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
          <GripVertical className="h-3 w-3 text-white/30" />
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onStepDown}
        className="h-6 w-6 p-0 text-white/25 hover:text-orange-400 hover:bg-orange-500/10 rounded-md"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
