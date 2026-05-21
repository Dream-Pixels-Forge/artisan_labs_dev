'use client'

import { motion, type Variants } from 'framer-motion'
import {
  ArrowDownUp,
  Activity,
  Gauge,
  Waves,
  Zap,
  Box,
  Sparkles,
  Timer,
  Pencil,
  LayoutGrid,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type { ScrollTriggerMode } from '@/types'

const modeCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  linear: <ArrowDownUp className="h-5 w-5" />,
  easeIn: <Activity className="h-5 w-5" />,
  easeOut: <Gauge className="h-5 w-5" />,
  easeInOut: <Waves className="h-5 w-5" />,
  velocity: <Zap className="h-5 w-5" />,
  scene: <Box className="h-5 w-5" />,
  goldenRatio: <Sparkles className="h-5 w-5" />,
  stepHold: <Timer className="h-5 w-5" />,
  manual: <Pencil className="h-5 w-5" />,
}

const MODE_COLORS: Record<string, string> = {
  linear: 'text-emerald-400',
  easeIn: 'text-orange-400',
  easeOut: 'text-sky-400',
  easeInOut: 'text-amber-400',
  velocity: 'text-rose-400',
  scene: 'text-violet-400',
  goldenRatio: 'text-yellow-300',
  stepHold: 'text-teal-400',
  manual: 'text-cyan-400',
}

export function ModeSelector({
  selectedMode,
  onModeSelect,
  disabled,
}: {
  selectedMode: ScrollTriggerMode
  onModeSelect: (mode: ScrollTriggerMode) => void
  disabled?: boolean
}) {
  const selectedInfo = SCROLL_MODE_INFO[selectedMode]

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-3.5 w-3.5 text-orange-400" />
        <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
          Scroll Mode
        </h2>
        <Badge
          variant="outline"
          className="ml-auto border-white/[0.08] bg-white/[0.03] text-white/40"
        >
          {selectedInfo?.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {(Object.entries(SCROLL_MODE_INFO) as [ScrollTriggerMode, typeof SCROLL_MODE_INFO[string]][]).map(
          ([mode, info]) => {
            const isActive = selectedMode === mode
            const iconEl = MODE_ICONS[mode]
            const colorClass = MODE_COLORS[mode]

            return (
              <motion.button
                key={mode}
                variants={modeCardVariants}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.97 }}
                onClick={() => !disabled && onModeSelect(mode)}
                disabled={disabled}
                className={`
                  relative group rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-250
                  cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  ${
                    isActive
                      ? 'border-orange-500/60 bg-orange-500/[0.08] shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
                  }
                `}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeModeDot"
                    className="absolute top-3 right-3 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                  />
                )}

                {/* Icon */}
                <div
                  className={`
                    mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg
                    transition-colors duration-200
                    ${isActive ? 'bg-orange-500/20 text-orange-400' : `bg-white/[0.04] ${colorClass} opacity-60 group-hover:opacity-80`}
                  `}
                >
                  {iconEl}
                </div>

                {/* Label */}
                <p
                  className={`text-xs font-semibold mb-1 transition-colors ${
                    isActive ? 'text-orange-300' : 'text-white/60 group-hover:text-white/80'
                  }`}
                >
                  {info.label}
                </p>

                {/* Best for */}
                <p className="text-[10px] leading-snug text-white/25 group-hover:text-white/35 transition-colors">
                  {info.bestFor}
                </p>
              </motion.button>
            )
          }
        )}
      </div>

      {/* Selected mode description */}
      {selectedInfo && (
        <motion.div
          key={selectedMode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded ${MODE_COLORS[selectedMode]} opacity-60`}>
              {MODE_ICONS[selectedMode]}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-white/60">{selectedInfo.label}</p>
              <p className="text-[11px] leading-relaxed text-white/35">
                {selectedInfo.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
