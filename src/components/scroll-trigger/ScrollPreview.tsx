'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import type {
  ScrollTriggerMap,
  ScrollTriggerEvent,
  FrameData,
} from '@/types'
import type { ScrollTriggerConfig } from '@/types'

import { getFrameAtScroll } from '@/lib/scroll-trigger'

import { FrameDisplayArea } from './preview/frame-display'
import { ScrollSimulatorRail } from './preview/scroll-rail'
import { TriggerMapVisualization } from './preview/trigger-map'
import { FilmstripSection } from './preview/filmstrip'
import { InfoPanel } from './preview/info-panel'
import { ModeEditor } from './preview/mode-editor'
import { ScrollPreviewFullscreen } from './preview/ScrollPreviewFullscreen'
import { ScrollPreviewPanel } from './preview/ScrollPreviewPanel'

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

  // ── Render ───────────────────────────────────────────────────────────────

  // Null state
  if (!map) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
            <div className="h-6 w-6 text-white/15" />
          </div>
          <p className="text-sm text-white/30">No trigger map configured</p>
          <p className="text-xs text-white/15">
            Set up a scroll trigger configuration to preview the frame sequence
          </p>
        </div>
      </div>
    )
  }

  // Empty frames state
  const hasFrames = Boolean(frames.length > 0 && frames[0]?.dataUrl)

  return (
    <>
      {isFullscreen ? (
        <ScrollPreviewFullscreen
          map={map}
          frames={frames}
          config={config as any}
          currentFrameIndex={currentFrameIndex}
          scrollPosition={scrollPosition}
          progress={progress}
          currentSceneLabel={currentSceneLabel}
          frameCount={frameCount || 0}
          mapEvents={map.events}
          onExitFullscreen={() => setIsFullscreen(false)}
          onStepUp={handleStepUp}
          onStepDown={handleStepDown}
          scrollFilmstrip={scrollFilmstrip}
          filmstripRef={filmstripRef}
          filmstripFrames={filmstripFrames}
          handleFilmstripClick={handleFilmstripClick}
          canScrollLeft={filmstripCanScrollLeft}
          canScrollRight={filmstripCanScrollRight}
        />
      ) : (
        <ScrollPreviewPanel
          map={map}
          frames={frames}
          config={config as any}
          currentFrameIndex={currentFrameIndex}
          scrollPosition={scrollPosition}
          progress={progress}
          currentSceneLabel={currentSceneLabel}
          frameCount={frameCount || 0}
          mapEvents={map.events}
          onClose={onClose}
          onExitFullscreen={() => setIsFullscreen(false)}
          onStepUp={handleStepUp}
          onStepDown={handleStepDown}
          scrollFilmstrip={scrollFilmstrip}
          filmstripRef={filmstripRef}
          filmstripFrames={filmstripFrames}
          handleFilmstripClick={handleFilmstripClick}
          canScrollLeft={filmstripCanScrollLeft}
          canScrollRight={filmstripCanScrollRight}
        />
      )}
    </>
  )
}
