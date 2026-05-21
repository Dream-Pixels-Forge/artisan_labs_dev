'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Film } from 'lucide-react'
import type { FrameData, ScrollTriggerMap } from '@/types'

const frameVariants: Variants = {
  initial: { opacity: 0.7, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.01, transition: { duration: 0.1 } },
}

const frameVariantsReduced: Variants = {
  initial: { opacity: 0.9 },
  animate: { opacity: 1, transition: { duration: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.05 } },
}

export function FrameDisplayArea({
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

      {/* Frame counter overlay */}
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

      {/* Scroll position overlay */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <div className="rounded-md bg-black/70 backdrop-blur-sm border border-white/[0.08] px-2.5 py-1">
          <span className="text-[11px] font-mono text-white/50">
            {Math.round(scrollPosition)} px
          </span>
        </div>
      </div>

      {/* Progress bar */}
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
