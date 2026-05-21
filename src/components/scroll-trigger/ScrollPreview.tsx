'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  X,
  ChevronUp,
  Maximize2,
  Minimize2,
  Eye,
  Map,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFrameAtScroll, SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type {
  ScrollTriggerMap,
  ScrollTriggerEvent,
  FrameData,
} from '@/types'

import { FrameDisplayArea } from './preview/frame-display'
import { ScrollSimulatorRail } from './preview/scroll-rail'
import { TriggerMapVisualization } from './preview/trigger-map'
import { FilmstripSection } from './preview/filmstrip'
import { InfoPanel } from './preview/info-panel'
import { ModeEditor } from './preview/mode-editor'
import type { ScrollTriggerConfig } from '@/types'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ScrollPreviewProps {
  map: ScrollTriggerMap | null
  frames: FrameData[]
  onClose: () => void
  config?: ScrollTriggerConfig
  frameCount?: number
  frameTimestamps?: number[]
  onConfigChange?: (updates: Partial<ScrollTriggerConfig>) => void
  setConfig?: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.25 },
  },
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ScrollPreview({
  map,
  frames,
  onClose,
  config,
  frameCount,
  frameTimestamps,
  onConfigChange,
  setConfig,
}: ScrollPreviewProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isFullscreenRef = useRef(false)

  // ── Refs for drag management ───────────────────────────────────────────
  const railRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({
    isDragging: false,
    startY: 0,
    startScroll: 0,
  })

  // ── Filmstrip scroll ref ───────────────────────────────────────────────
  const filmstripRef = useRef<HTMLDivElement>(null)
  const [filmstripCanScrollLeft, setFilmstripCanScrollLeft] = useState(false)
  const [filmstripCanScrollRight, setFilmstripCanScrollRight] = useState(false)

  // ── Sync fullscreen ref ────────────────────────────────────────────────
  useEffect(() => {
    isFullscreenRef.current = isFullscreen
  }, [isFullscreen])

  // ── Current frame index from scroll position ──────────────────────────
  const currentFrameIndex = useMemo(() => {
    if (!map) return 0
    return getFrameAtScroll(scrollPosition, map.events, map.config)
  }, [map, scrollPosition])

  // ── Current scene label ────────────────────────────────────────────────
  const currentSceneLabel = useMemo(() => {
    if (!map || map.config.mode !== 'scene') return null
    const event = map.events.find((e) => e.frameIndex === currentFrameIndex)
    return event?.sceneLabel ?? null
  }, [map, currentFrameIndex])

  // ── Progress ───────────────────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!map || map.scrollDistancePx === 0) return 0
    return Math.min(1, Math.max(0, scrollPosition / map.scrollDistancePx))
  }, [map, scrollPosition])

  // ── Frames for filmstrip (max 30) ──────────────────────────────────────
  const filmstripFrames = useMemo(() => {
    if (frames.length <= 30) return frames
    // Evenly sample 30 frames
    const step = (frames.length - 1) / 29
    const sampled: FrameData[] = []
    for (let i = 0; i < 30; i++) {
      sampled.push(frames[Math.round(i * step)])
    }
    return sampled
  }, [frames])

  // ── Filmstrip scroll state ─────────────────────────────────────────────
  const updateFilmstripScrollState = useCallback(() => {
    const el = filmstripRef.current
    if (!el) return
    setFilmstripCanScrollLeft(el.scrollLeft > 2)
    setFilmstripCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    updateFilmstripScrollState()
  }, [filmstripFrames, updateFilmstripScrollState])

  // ── Scroll filmstrip to active frame ───────────────────────────────────
  useEffect(() => {
    const el = filmstripRef.current
    if (!el || frames.length === 0) return

    const displayIndex = frames.length <= 30
      ? currentFrameIndex
      : Math.round((currentFrameIndex / (frames.length - 1)) * 29)

    const thumbWidth = 72 // w-[68px] + gap
    const targetScrollLeft = displayIndex * thumbWidth - el.clientWidth / 2 + thumbWidth / 2
    el.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' })
  }, [currentFrameIndex, frames.length])

  // ── Scroll position from rail click/drag ───────────────────────────────

  const getScrollFromRailY = useCallback(
    (clientY: number) => {
      const rail = railRef.current
      if (!rail || !map) return scrollPosition
      const rect = rail.getBoundingClientRect()
      const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      return relativeY * map.scrollDistancePx
    },
    [map, scrollPosition]
  )

  const handleRailMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const pos = getScrollFromRailY(e.clientY)
      setScrollPosition(pos)
      dragStateRef.current = { isDragging: true, startY: e.clientY, startScroll: pos }
      setIsDragging(true)
    },
    [getScrollFromRailY]
  )

  const handleRailTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      const pos = getScrollFromRailY(touch.clientY)
      setScrollPosition(pos)
      dragStateRef.current = { isDragging: true, startY: touch.clientY, startScroll: pos }
      setIsDragging(true)
    },
    [getScrollFromRailY]
  )

  // Global mouse/touch move and up for drag
  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!dragStateRef.current.isDragging) return
      const rail = railRef.current
      if (!rail || !map) return
      const rect = rail.getBoundingClientRect()
      const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      const newPos = relativeY * map.scrollDistancePx
      setScrollPosition(newPos)
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault()
        handleMove(e.touches[0].clientY)
      }
    }
    const handleEnd = () => {
      dragStateRef.current.isDragging = false
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [map])

  // ── Filmstrip click to jump ────────────────────────────────────────────

  const handleFilmstripClick = useCallback(
    (frameIndex: number) => {
      if (!map || map.events.length === 0) return
      const event = map.events.find((e) => e.frameIndex === frameIndex)
      if (event) {
        setScrollPosition(event.scrollPosition)
      }
    },
    [map]
  )

  // ── Step up/down buttons ───────────────────────────────────────────────

  const handleStepUp = useCallback(() => {
    if (!map) return
    setScrollPosition((prev) => Math.max(0, prev - map.scrollDistancePx / 100))
  }, [map])

  const handleStepDown = useCallback(() => {
    if (!map) return
    setScrollPosition((prev) =>
      Math.min(map.scrollDistancePx, prev + map.scrollDistancePx / 100)
    )
  }, [map])

  // ── Filmstrip scroll buttons ───────────────────────────────────────────

  const scrollFilmstrip = useCallback((direction: 'left' | 'right') => {
    const el = filmstripRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' })
  }, [])

  // ── Keyboard support ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreenRef.current) return
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        return
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        handleStepUp()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        handleStepDown()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleStepUp, handleStepDown])

  // ─── Render ───────────────────────────────────────────────────────────────

  // Null state
  if (!map) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
            <Map className="h-6 w-6 text-white/15" />
          </div>
          <p className="text-sm text-white/30">No trigger map configured</p>
          <p className="text-xs text-white/15">
            Set up a scroll trigger configuration to preview the frame sequence
          </p>
        </div>
      </motion.div>
    )
  }

  // Empty frames state
  const hasFrames = Boolean(frames.length > 0 && frames[0]?.dataUrl)

  return (
    <AnimatePresence mode="wait">
      {isFullscreen ? (
        <motion.div
          key="fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]"
        >
          {/* Fullscreen top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                Scroll Preview
              </span>
              <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/30">
                {map.config.mode}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/20 font-mono">
                Frame {currentFrameIndex + 1} / {map.eventCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(false)}
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
              hasFrames={hasFrames}
              scrollPosition={scrollPosition}
              progress={progress}
              map={map}
              isFullscreen
            />
            <ScrollSimulatorRail
              railRef={railRef}
              map={map}
              progress={progress}
              isDragging={isDragging}
              handleRailMouseDown={handleRailMouseDown}
              handleRailTouchStart={handleRailTouchStart}
              onStepUp={handleStepUp}
              onStepDown={handleStepDown}
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
              canScrollLeft={filmstripCanScrollLeft}
              canScrollRight={filmstripCanScrollRight}
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
      ) : (
        <motion.div
          key="panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
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
                {SCROLL_MODE_INFO[map.config.mode]?.label}
              </Badge>
              <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/30">
                {map.eventCount} frames
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
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
                  hasFrames={hasFrames}
                  scrollPosition={scrollPosition}
                  progress={progress}
                  map={map}
                  isFullscreen={false}
                />
              </div>
              <ScrollSimulatorRail
                railRef={railRef}
                map={map}
                progress={progress}
                isDragging={isDragging}
                handleRailMouseDown={handleRailMouseDown}
                handleRailTouchStart={handleRailTouchStart}
                onStepUp={handleStepUp}
                onStepDown={handleStepDown}
              />
            </div>

            {/* ════════════════════ Filmstrip ════════════════════ */}
            <FilmstripSection
              filmstripRef={filmstripRef}
              filmstripFrames={filmstripFrames}
              frames={frames}
              currentFrameIndex={currentFrameIndex}
              handleFilmstripClick={handleFilmstripClick}
              canScrollLeft={filmstripCanScrollLeft}
              canScrollRight={filmstripCanScrollRight}
              onScrollLeft={() => scrollFilmstrip('left')}
              onScrollRight={() => scrollFilmstrip('right')}
              mode={map.config.mode}
            />

            {/* ════════════════════ Mode Editor (below filmstrip) ════════════════════ */}
            {config && frameCount !== undefined && onConfigChange && setConfig && (
              <ModeEditor
                config={config}
                frameCount={frameCount}
                frameTimestamps={frameTimestamps}
                disabled={false}
                onConfigChange={onConfigChange}
                setConfig={setConfig}
              />
            )}

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
      )}
    </AnimatePresence>
  )
}
