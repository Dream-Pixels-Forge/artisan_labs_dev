'use client'

import { motion } from 'framer-motion'
import { Film, ChevronUp, ChevronRight, Pencil, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type { FrameData, ScrollTriggerMode } from '@/types'

const MODE_STYLES: Record<string, {
  border: string
  bg: string
  iconBg: string
  iconColor: string
  textColor: string
  descColor: string
  hintColor: string
  icon: React.ReactNode
}> = {
  manual: {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/[0.05]',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    textColor: 'text-cyan-300/70',
    descColor: 'text-cyan-300/40',
    hintColor: 'text-cyan-300/30',
    icon: <Pencil className="h-3 w-3" />,
  },
  scene: {
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/[0.05]',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    textColor: 'text-violet-300/70',
    descColor: 'text-violet-300/40',
    hintColor: 'text-violet-300/30',
    icon: <Layers className="h-3 w-3" />,
  },
}

export function FilmstripSection({
  filmstripRef,
  filmstripFrames,
  frames,
  currentFrameIndex,
  handleFilmstripClick,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  mode,
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
  mode?: ScrollTriggerMode
}) {
  if (frames.length === 0) return null

  const modeInfo = mode ? SCROLL_MODE_INFO[mode] : null
  const modeStyle = mode ? MODE_STYLES[mode] : null
  const showContext = mode === 'manual' || mode === 'scene'

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
        className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}
      >
        {filmstripFrames.map((frame, i) => {
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

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
                <span className="text-[8px] font-mono text-white/60 block text-center">
                  {actualFrameIndex + 1}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Mode context below filmstrip */}
      {showContext && modeInfo && modeStyle && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border ${modeStyle.border} ${modeStyle.bg} px-4 py-3`}
        >
          <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 p-1.5 rounded ${modeStyle.iconBg} ${modeStyle.iconColor}`}>
              {modeStyle.icon}
            </div>
            <div className="space-y-1 flex-1">
              <p className={`text-xs font-medium ${modeStyle.textColor}`}>
                {modeInfo.label} Mode
              </p>
              <p className={`text-[11px] leading-relaxed ${modeStyle.descColor}`}>
                {modeInfo.description}
              </p>
              {mode === 'manual' && (
                <p className={`text-[10px] ${modeStyle.hintColor} mt-1.5`}>
                  Use the frame numbers above to define which frames appear at which scroll positions in the configuration panel.
                </p>
              )}
              {mode === 'scene' && (
                <p className={`text-[10px] ${modeStyle.hintColor} mt-1.5`}>
                  Define scene breakpoints using frame numbers from the filmstrip above. Each scene controls its own scroll space allocation.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
