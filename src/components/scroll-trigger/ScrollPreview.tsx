'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Film,
  Map,
  Maximize2,
  Minimize2,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getFrameAtScroll, SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type {
  ScrollTriggerMap,
  ScrollTriggerEvent,
  FrameData,
} from '@/types'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ScrollPreviewProps {
  map: ScrollTriggerMap | null
  frames: FrameData[]
  onClose: () => void
}

// ─── Scene colors for timeline sections ─────────────────────────────────────

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

// Enhanced frame variants with reduced motion support
const frameVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      // Respect reduced motion preference
    } 
  },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(2px)' },
}

// Reduced motion variants for accessibility
const frameVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0 },
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ScrollPreview({
  map,
  frames,
  onClose,
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
              scrollPosition={scrollPosition}
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
                scrollPosition={scrollPosition}
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
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-component: Frame Display Area
// ═══════════════════════════════════════════════════════════════════════════════

function FrameDisplayArea({
  currentFrameIndex,
  frames,
  hasFrames,
  scrollPosition,
  progress,
  map,
  isFullscreen,
}: {
  currentFrameIndex: number
  frames: FrameData[]
  hasFrames: boolean
  scrollPosition: number
  progress: number
  map: ScrollTriggerMap
  isFullscreen: boolean
}) {
  const currentFrame = hasFrames ? frames[currentFrameIndex] : null
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false
  const activeVariants = prefersReducedMotion ? frameVariantsReduced : frameVariants

  return (
    <div
      className={`
        relative rounded-xl border border-white/[0.08] bg-black overflow-hidden
        ${isFullscreen ? 'flex-1 rounded-none border-x-0 border-t-0' : 'aspect-video'}
      `}
    >
      {/* Frame image */}
      <AnimatePresence mode="popLayout">
        {currentFrame?.dataUrl ? (
          <motion.img
            key={currentFrameIndex}
            variants={activeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            src={currentFrame.dataUrl}
            alt={`Frame ${currentFrameIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Film className="h-10 w-10 text-white/8 mb-3" />
            <p className="text-xs text-white/20">No frames extracted yet</p>
            <p className="text-[10px] text-white/10 mt-1">
              Extract frames from a video to preview the scroll trigger
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Frame counter overlay - top left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/[0.08] px-2.5 py-1">
          <Film className="h-3 w-3 text-orange-400" />
          <span className="text-[11px] font-mono font-medium text-white/80">
            {currentFrameIndex + 1}
          </span>
          <span className="text-[11px] font-mono text-white/30">/</span>
          <span className="text-[11px] font-mono text-white/40">
            {map.eventCount}
          </span>
        </div>
      </div>

      {/* Scroll position overlay - top right */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <div className="rounded-md bg-black/70 backdrop-blur-sm border border-white/[0.08] px-2.5 py-1">
          <span className="text-[11px] font-mono text-white/50">
            {Math.round(scrollPosition)} px
          </span>
        </div>
      </div>

      {/* Progress bar overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06]">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-component: Scroll Simulator Rail
// ═══════════════════════════════════════════════════════════════════════════════

function ScrollSimulatorRail({
  railRef,
  map,
  scrollPosition,
  progress,
  isDragging,
  handleRailMouseDown,
  handleRailTouchStart,
  onStepUp,
  onStepDown,
}: {
  railRef: React.RefObject<HTMLDivElement | null>
  map: ScrollTriggerMap
  scrollPosition: number
  progress: number
  isDragging: boolean
  handleRailMouseDown: (e: React.MouseEvent) => void
  handleRailTouchStart: (e: React.TouchEvent) => void
  onStepUp: () => void
  onStepDown: () => void
}) {
  // Sample event markers for the rail (max 80 dots)
  const eventMarkers = useMemo(() => {
    if (map.events.length <= 80) return map.events
    const step = map.events.length / 80
    return map.events.filter((_, i) => i % Math.floor(step) === 0 || i === map.events.length - 1)
  }, [map.events])

  return (
    <div className="flex flex-col items-center gap-2 py-1 shrink-0">
      {/* Step up button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onStepUp}
        className="h-6 w-6 p-0 text-white/25 hover:text-orange-400 hover:bg-orange-500/10 rounded-md"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </Button>

      {/* Rail */}
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
        {/* Track fill */}
        <div className="absolute top-0 left-0 right-0 rounded-full bg-orange-500/20"
          style={{ height: `${progress * 100}%` }}
        />

        {/* Event dots */}
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

        {/* Active position indicator */}
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

        {/* Grip indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
          <GripVertical className="h-3 w-3 text-white/30" />
        </div>
      </div>

      {/* Step down button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onStepDown}
        className="h-6 w-6 p-0 text-white/25 hover:text-orange-400 hover:bg-orange-500/10 rounded-md"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>

      {/* Label */}
      <span className="text-[9px] font-mono text-white/15 uppercase tracking-wider">
        {Math.round(scrollPosition)}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-component: Trigger Map Visualization
// ═══════════════════════════════════════════════════════════════════════════════

function TriggerMapVisualization({
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

  // Build scene sections for scene mode
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

  // Sample dots for visualization (max 120)
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

      {/* Scene labels (only in scene mode) */}
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

      {/* Visualization bar */}
      <div className="relative h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Scene colored backgrounds */}
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

        {/* Density bars - show frame density per section */}
        <DensityBars events={map.events} scrollDistancePx={map.scrollDistancePx} />

        {/* Event dots */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {dotPositions.map((event, i) => {
            const x = map.scrollDistancePx > 0
              ? (event.scrollPosition / map.scrollDistancePx) * 100
              : 0
            // Vertical position based on local density (centered)
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

        {/* Current position line */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
          style={{ left: `${currentProgress * 100}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        >
          {/* Triangle indicator */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-orange-400" />
        </motion.div>
      </div>

      {/* Mode description */}
      <p className="text-[10px] text-white/20 leading-relaxed">
        {SCROLL_MODE_INFO[map.config.mode]?.description}
      </p>
    </div>
  )
}

// ─── Density Bars (sub-sub component) ──────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-component: Filmstrip
// ═══════════════════════════════════════════════════════════════════════════════

function FilmstripSection({
  filmstripRef,
  filmstripFrames,
  frames,
  currentFrameIndex,
  handleFilmstripClick,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: {
  filmstripRef: React.RefObject<HTMLDivElement | null>
  filmstripFrames: FrameData[]
  frames: FrameData[]
  currentFrameIndex: number
  handleFilmstripClick: (frameIndex: number) => void
  canScrollLeft: boolean
  canScrollRight: boolean
  onScrollLeft: () => void
  onScrollRight: () => void
}) {
  if (frames.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-3.5 w-3.5 text-orange-400" />
          <h3 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Frame Filmstrip
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            className="h-6 w-6 p-0 text-white/20 hover:text-orange-400 hover:bg-orange-500/10 disabled:opacity-0"
          >
            <ChevronUp className="h-3 w-3 rotate-[-90deg]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onScrollRight}
            disabled={!canScrollRight}
            className="h-6 w-6 p-0 text-white/20 hover:text-orange-400 hover:bg-orange-500/10 disabled:opacity-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Badge variant="outline" className="border-white/[0.06] bg-white/[0.02] text-white/25 ml-1">
            {frames.length} total
            {frames.length > 30 && ' · showing 30'}
          </Badge>
        </div>
      </div>

      <div
        ref={filmstripRef}
        onScroll={(e) => {
          const el = e.currentTarget
          // Update can scroll states via a more immediate check
          // We debounce this in the parent
        }}
        className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}
      >
        {filmstripFrames.map((frame, i) => {
          // For sampled frames, map back to actual frame index
          const actualFrameIndex = frames.length <= 30
            ? i
            : Math.round((i / 29) * (frames.length - 1))

          const isActive = actualFrameIndex === currentFrameIndex

          return (
            <motion.button
              key={`${actualFrameIndex}-${i}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilmstripClick(actualFrameIndex)}
              className={`
                relative shrink-0 w-[68px] h-[44px] rounded-md overflow-hidden border-2
                transition-colors duration-150 cursor-pointer
                ${
                  isActive
                    ? 'border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.25)]'
                    : 'border-white/[0.06] hover:border-white/20'
                }
              `}
            >
              {frame.dataUrl ? (
                <img
                  src={frame.dataUrl}
                  alt={`Frame ${actualFrameIndex + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                  <Film className="h-3 w-3 text-white/10" />
                </div>
              )}

              {/* Frame number */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
                <span className="text-[8px] font-mono text-white/60 block text-center">
                  {actualFrameIndex + 1}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-component: Info Panel
// ═══════════════════════════════════════════════════════════════════════════════

function InfoPanel({
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
        sub={currentSceneLabel ? `Scene mode` : SCROLL_MODE_INFO[map.config.mode]?.bestFor ?? ''}
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
