'use client'

import { motion } from 'framer-motion'
import { Eye, Maximize2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ScrollTriggerMap } from '@/types'
import type { ScrollTriggerConfig } from '@/types'

import { FrameDisplayArea } from './frame-display'
import { ScrollSimulatorRail } from './scroll-rail'
import { TriggerMapVisualization } from './trigger-map'
import { FilmstripSection } from './filmstrip'
import { InfoPanel } from './info-panel'
import { ModeEditor } from './mode-editor'

interface ScrollPreviewPanelProps {
  map: ScrollTriggerMap
  frames: any[]
  config: { mode: string }
  currentFrameIndex: number
  scrollPosition: number
  progress: number
  currentSceneLabel: string | null
  frameCount: number
  mapEvents: any[]
  onClose: () => void
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

export function ScrollPreviewPanel({
  map,
  frames,
  config,
  currentFrameIndex,
  scrollPosition,
  progress,
  currentSceneLabel,
  frameCount,
  mapEvents,
  onClose,
  onExitFullscreen,
  onStepUp,
  onStepDown,
  scrollFilmstrip,
  filmstripRef,
  filmstripFrames,
  handleFilmstripClick,
  canScrollLeft,
  canScrollRight,
}: ScrollPreviewPanelProps) {
  return (
    <motion.div
      key="panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
    >
      {/* ════════════════════ Header ════════════════════ */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-orange-400" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Scroll Preview
          </h2>
          <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/30 ml-1">
            {config.mode}
          </Badge>
          <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/30">
            {map.eventCount} frames
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitFullscreen}
            className="h-7 w-7 p-0 text-white/25 hover:text-orange-400 hover:bg-orange-500/10"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-white/25 hover:text-white/50 hover:bg-white/[0.06]"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ════════════════════ Trigger Map Visualization ════════════════════ */}
        <TriggerMapVisualization map={map} currentScrollPosition={scrollPosition} />

        {/* ════════════════════ Frame Display + Scroll Rail ════════════════════ */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <FrameDisplayArea
              currentFrameIndex={currentFrameIndex}
              frames={frames}
              hasFrames={frames.length > 0 && frames[0]?.dataUrl}
              scrollPosition={scrollPosition}
              progress={progress}
              map={map}
              isFullscreen={false}
            />
          </div>
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

        {/* ════════════════════ Filmstrip ════════════════════ */}
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

        {/* ════════════════════ Mode Editor (below filmstrip) ════════════════════ */}
        <ModeEditor
          config={config as any}
          frameCount={frameCount}
          frameTimestamps={frames.map((f: any) => f.timestamp)}
          disabled={false}
          setConfig={() => {}}
          onConfigChange={() => {}}
        />

        {/* ════════════════════ Info Panel ════════════════════ */}
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
