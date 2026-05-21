'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowDown, Loader2 } from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'

// ─── Constants ────────────────────────────────────────────────────────

const DEMO_TOTAL_FRAMES = 32
const DEMO_FRAME_PATHS = Array.from(
  { length: DEMO_TOTAL_FRAMES },
  (_, i) => `/sequences/desktop/frame-${String(i + 1).padStart(3, '0')}.webp`
)

// ─── Scroll-Driven Demo ───────────────────────────────────────────────

export function ScrollDrivenDemo() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const progressRef = useRef(0)
  const directionRef = useRef(1)
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  // Preload images
  useEffect(() => {
    let loaded = 0
    DEMO_FRAME_PATHS.forEach((src) => {
      const img = new window.Image()
      img.onload = () => {
        loaded++
        if (loaded >= DEMO_TOTAL_FRAMES) setImagesLoaded(true)
      }
      img.src = src
    })
    const timeout = setTimeout(() => setImagesLoaded(true), 3000)
    return () => clearTimeout(timeout)
  }, [])

  // Auto-play loop (simulates downward scroll)
  useEffect(() => {
    if (!isPlaying || isDragging || isHovering || !imagesLoaded) return
    let animId: number
    const animate = () => {
      progressRef.current += directionRef.current * 0.003
      if (progressRef.current >= 1) {
        progressRef.current = 1
        directionRef.current = -1
      } else if (progressRef.current <= 0) {
        progressRef.current = 0
        directionRef.current = 1
      }
      setProgress(progressRef.current)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, isDragging, isHovering, imagesLoaded])

  const currentFrame = Math.min(
    DEMO_TOTAL_FRAMES - 1,
    Math.floor(progress * (DEMO_TOTAL_FRAMES - 1))
  )

  // Vertical scroll wheel handler — maps wheel to frame progress
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY * 0.0015
      const next = Math.max(0, Math.min(1, progressRef.current + delta))
      progressRef.current = next
      setProgress(next)
      setIsPlaying(false)
    },
    []
  )

  // Vertical drag on the track
  const handleTrackInteraction = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      progressRef.current = y
      setProgress(y)
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setIsPlaying(false)
      handleTrackInteraction(e.clientY)
    },
    [handleTrackInteraction]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      setIsPlaying(false)
      handleTrackInteraction(e.touches[0].clientY)
    },
    [handleTrackInteraction]
  )

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      handleTrackInteraction(clientY)
    }
    const handleUp = () => {
      setIsDragging(false)
      setTimeout(() => setIsPlaying(true), 2500)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, handleTrackInteraction])

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20"
    >
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/[0.08] to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-500/[0.06] to-transparent blur-3xl" />

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/[0.1] border border-orange-500/[0.2]">
              <Play className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[#f0f0f0]">
                Live Scroll-to-Frame Demo
              </h3>
              <p className="text-[10px] text-white/30 font-mono">
                32 frames &middot; Scroll down to scrub &middot; Real output
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying((v) => !v)
                if (!isPlaying) directionRef.current = 1
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-[10px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              {isPlaying ? (
                <><PauseIcon className="h-3 w-3" /> Pause</>
              ) : (
                <><Play className="h-3 w-3" /> Play</>
              )}
            </button>
          </div>
        </div>

        {/* Main area: viewport + vertical scrub rail */}
        <div className="flex gap-3 sm:gap-4">
          {/* Frame viewport — captures wheel events for vertical scroll */}
          <div
            ref={viewportRef}
            className="relative flex-1 aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] select-none"
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false)
              if (!isDragging) setTimeout(() => setIsPlaying(true), 1500)
            }}
          >
            {!imagesLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading frames...
                </div>
              </div>
            )}

            {/* All frames stacked — only current is visible */}
            {DEMO_FRAME_PATHS.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Frame ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-75 ${
                  i === currentFrame ? 'opacity-100' : 'opacity-0'
                }`}
                draggable={false}
              />
            ))}

            {/* Frame counter overlay */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xl rounded-xl px-3 py-1.5 text-xs font-mono border border-white/[0.1] z-10">
              <span className="text-orange-400 font-bold">
                F{String(currentFrame + 1).padStart(2, '0')}
              </span>
              <span className="text-white/30 mx-1">/</span>
              <span className="text-white/50">{DEMO_TOTAL_FRAMES}</span>
            </div>

            {/* Scroll direction hint */}
            {isHovering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl rounded-lg px-3 py-1.5 text-[10px] font-mono text-white/40 border border-white/[0.1] z-10 flex items-center gap-1.5"
              >
                <ArrowDown className="h-3 w-3 animate-bounce" />
                Scroll to scrub
              </motion.div>
            )}

            {/* Progress bar overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/[0.06] z-10">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-red-400 to-orange-500 transition-[width] duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none z-[5]" />
          </div>

          {/* Vertical scrub rail — tall, beside the viewport */}
          <div className="hidden sm:flex flex-col items-center gap-2 py-1">
            <span className="text-[8px] font-mono text-white/20">100%</span>
            <div
              ref={trackRef}
              className="relative w-3 flex-1 rounded-full bg-white/[0.06] border border-white/[0.08] cursor-pointer select-none touch-none min-h-[200px]"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Filled portion (from top) */}
              <div
                className="absolute top-0 left-0 right-0 rounded-full bg-gradient-to-b from-orange-500 via-red-400 to-orange-500 transition-[height] duration-75"
                style={{ height: `${progress * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 rounded-full" />
              </div>
              {/* Thumb */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-lg shadow-orange-500/30 border-2 border-orange-400 transition-[bottom] duration-75 hover:scale-110 z-10"
                style={{ bottom: `calc(${progress * 100}% - 12px)` }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
              </div>
              {/* Tick marks */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <div
                  key={tick}
                  className="absolute left-0 right-0 h-[1px] bg-white/[0.1]"
                  style={{ bottom: `${tick * 100}%` }}
                />
              ))}
            </div>
            <span className="text-[8px] font-mono text-white/20">0%</span>
          </div>
        </div>

        {/* Filmstrip */}
        <div className="mt-3 flex gap-1 overflow-hidden rounded-xl p-1.5 bg-white/[0.03] border border-white/[0.06]">
          {DEMO_FRAME_PATHS.map((src, i) => (
            <button
              key={src}
              onClick={() => {
                progressRef.current = i / (DEMO_TOTAL_FRAMES - 1)
                setProgress(progressRef.current)
                setIsPlaying(false)
                setTimeout(() => setIsPlaying(true), 2500)
              }}
              className={`relative flex-1 aspect-video rounded-md overflow-hidden transition-all duration-150 cursor-pointer border ${
                i === currentFrame
                  ? 'ring-2 ring-orange-400 border-orange-400/50 scale-105 z-10'
                  : i < currentFrame
                  ? 'border-white/[0.06] opacity-70'
                  : 'border-white/[0.04] opacity-30'
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}
