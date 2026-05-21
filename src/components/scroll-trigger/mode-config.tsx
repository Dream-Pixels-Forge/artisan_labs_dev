'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Timer } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { SCROLL_MODE_INFO } from '@/lib/scroll-trigger'
import type { ScrollTriggerConfig } from '@/types'

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

interface ModeSpecificConfigProps {
  config: ScrollTriggerConfig
  frameCount: number
  frameTimestamps?: number[]
  disabled?: boolean
  onConfigChange: (updates: Partial<ScrollTriggerConfig>) => void
  setConfig: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
}

export function ModeSpecificConfig({
  config,
  disabled,
  onConfigChange,
}: ModeSpecificConfigProps) {
  return (
    <>
      {/* ════════════════════ Step Hold Duration ════════════════════ */}
      <AnimatePresence>
        {config.mode === 'stepHold' && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-5 sm:p-6 space-y-5"
          >
            {/* Context banner */}
            <div className="rounded-lg border border-teal-500/15 bg-teal-500/[0.05] px-4 py-3">
              <p className="text-xs leading-relaxed text-teal-300/60">
                {SCROLL_MODE_INFO.stepHold?.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-teal-400" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
                Step Hold Duration
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-white/50">
                  Hold Distance
                </Label>
                <span className="text-sm font-mono font-medium text-orange-400">
                  {config.stepHoldDuration} px
                </span>
              </div>
              <Slider
                value={[config.stepHoldDuration]}
                min={20}
                max={500}
                step={10}
                onValueChange={(val) => onConfigChange({ stepHoldDuration: val[0] })}
                disabled={disabled}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-white/20">
                <span>20px (rapid)</span>
                <span>500px (slow)</span>
              </div>
              <p className="text-[11px] text-white/20">
                Each frame holds for {config.stepHoldDuration}px of scroll before advancing
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
