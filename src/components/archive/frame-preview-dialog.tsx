'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Sequence } from '@/types'
import { getFormatBadge } from './helpers'

export function FramePreviewDialog({
  sequence,
  open,
  onOpenChange,
}: {
  sequence: Sequence | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const filmstripRef = useRef<HTMLDivElement>(null)
  const MAX_VISIBLE = 100
  const visibleFrames = sequence ? sequence.frames.slice(0, MAX_VISIBLE) : []

  // Keyboard navigation
  useEffect(() => {
    if (!open || !sequence) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, visibleFrames.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, sequence, visibleFrames.length])

  // Scroll filmstrip to active frame
  useEffect(() => {
    if (!filmstripRef.current || !sequence) return
    const activeThumb = filmstripRef.current.children[selectedIndex] as HTMLElement | undefined
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedIndex, sequence])

  if (!sequence) return null

  const currentFrame = visibleFrames[selectedIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/[0.08] text-[#f0f0f0] max-w-5xl w-[calc(100%-2rem)] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {sequence.name}
              </DialogTitle>
              <DialogDescription className="text-white/30">
                {sequence.frameCount} frames &middot; {sequence.width}×{sequence.height} &middot; {getFormatBadge(sequence.format).label}
              </DialogDescription>
            </div>
            {sequence.frames.length > MAX_VISIBLE && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                Showing first {MAX_VISIBLE} of {sequence.frames.length} frames
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Frame Counter ── */}
        <div className="px-6 pb-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-white/40">
            <span>Frame {selectedIndex + 1} of {visibleFrames.length}</span>
            <span className="text-white/20">Use arrow keys to navigate</span>
          </div>
        </div>

        {/* ── Main Frame Display ── */}
        <div className="flex-1 flex items-center justify-center px-6 min-h-0">
          <div className="relative w-full h-full flex items-center justify-center bg-white/[0.02] rounded-lg overflow-hidden">
            {currentFrame ? (
              <img
                src={currentFrame.dataUrl}
                alt={`Frame ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/20 text-sm">No frame data</div>
            )}

            {/* Nav arrows */}
            {visibleFrames.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={selectedIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, visibleFrames.length - 1))}
                  disabled={selectedIndex === visibleFrames.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Filmstrip ── */}
        <div className="shrink-0 border-t border-white/[0.06] pt-3 pb-4 px-4">
          <div
            ref={filmstripRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          >
            {visibleFrames.map((frame, idx) => (
              <button
                key={frame.frameNumber}
                onClick={() => setSelectedIndex(idx)}
                className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? 'border-orange-400/80 ring-1 ring-orange-400/30 scale-105'
                    : 'border-white/[0.08] hover:border-white/30 opacity-60 hover:opacity-90'
                }`}
              >
                <img
                  src={frame.dataUrl}
                  alt={`Frame ${frame.frameNumber}`}
                  className="h-14 w-auto object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
