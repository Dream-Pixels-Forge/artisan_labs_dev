'use client'

import { motion } from 'framer-motion'
import { Eye, Minimize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ScrollTriggerMap, ScrollTriggerEvent } from '@/types'
import type { ScrollTriggerConfig } from '@/types'

import { FrameDisplayArea } from './frame-display'
import { ScrollSimulatorRail } from './scroll-rail'
import { FilmstripSection } from './filmstrip'
import { InfoPanel } from './info-panel'

interface ScrollPreviewFullscreenProps {
  map: ScrollTriggerMap
  frames: any[]
  config: { mode: string }
  currentFrameIndex: number
  scrollPosition: number
  progress: number
  currentSceneLabel: string | null
  frameCount: number
  mapEvents: any[]
  onExitFullscreen: () => void
  onStepUp: () => void
  onStepDown: () => void
  scrollFilmstrip: (direction: 'left' | 'right') => void
  filmstripRef: React.RefObject<HTMLDivElement | null>
  filmstripFrames: any[]
  handleFilmstripClick: (frameIndex: number) => void
  canScrollLeft: boolean
  canScrollRight: boolean
}

export function ScrollPreviewFullscreen({
  map,
  frames,
  config,
  currentFrameIndex,
  scrollPosition,
  progress,
  currentSceneLabel,
  frameCount,
  mapEvents,
  onExitFullscreen,
  onStepUp,
  onStepDown,
  scrollFilmstrip,
  filmstripRef,
  filmstripFrames,
  handleFilmstripClick,
  canScrollLeft,
  canScrollRight,
}: ScrollPreviewFullscreenProps) {
  return (
    <motion.div
      key="fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-surface-0"
    >
      {/* Fullscreen top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            Scroll Preview
          </span>
          <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/30">
            {config.mode}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/20 font-mono">
            Frame {currentFrameIndex + 1} / {map.eventCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitFullscreen}
            className="h-7 w-7 p-0 text-white/30 hover:text-white/60"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen content */}
      <div className="flex-1 flex min-h-0 relative">
        <FrameDisplayArea
          currentFrameIndex={currentFrameIndex}
          frames={frames}
          hasFrames={frames.length > 0 && frames[0]?.dataUrl}
          scrollPosition={scrollPosition}
          progress={progress}
          map={map}
          isFullscreen
        />
        <ScrollSimulatorRail
          railRef={filmstripRef}
          map={map}
          progress={progress}
          isDragging={false}
          handleRailMouseDown={() => {}}
          handleRailTouchStart={() => {}}
          onStepUp={onStepUp}
          onStepDown={onStepDown}
        />
      </div>

      {/* Fullscreen bottom: filmstrip + info */}
      <div className="shrink-0 border-t border-white/[0.06]">
        <FilmstripSection
          filmstripRef={filmstripRef}
          filmstripFrames={filmstripFrames}
          frames={frames}
          currentFrameIndex={currentFrameIndex}
          handleFilmstripClick={handleFilmstripClick}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollLeft={() => scrollFilmstrip('left')}
          onScrollRight={() => scrollFilmstrip('right')}
        />
        <InfoPanel
          scrollPosition={scrollPosition}
          currentFrameIndex={currentFrameIndex}
          progress={progress}
          currentSceneLabel={currentSceneLabel}
          map={map}
        />
      </div>
    </motion.div>
  )
}
