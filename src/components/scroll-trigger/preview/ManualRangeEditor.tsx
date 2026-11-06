'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Plus,
  Minus,
  Pencil,
  X,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
  ScrollTriggerConfig,
  ManualFrameRange,
} from '@/types'

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const RANGE_COLORS = [
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
]

interface ManualRangeEditorProps {
  config: ScrollTriggerConfig
  frameCount: number
  disabled?: boolean
  setConfig: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
}

export function ManualRangeEditor({
  config,
  frameCount,
  disabled,
  setConfig,
}: ManualRangeEditorProps) {
  const handleAddManualRange = () => {
    setConfig((prev) => {
      const lastScrollEnd = prev.manualRanges.length > 0
        ? prev.manualRanges[prev.manualRanges.length - 1].scrollEnd
        : 0
      const newRange: ManualFrameRange = {
        startFrame: 0,
        endFrame: Math.min(10, frameCount - 1),
        label: `Range ${prev.manualRanges.length + 1}`,
        scrollStart: lastScrollEnd,
        scrollEnd: Math.min(1, lastScrollEnd + 0.2),
      }
      return { ...prev, manualRanges: [...prev.manualRanges, newRange] }
    })
  }

  const handleRemoveManualRange = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      manualRanges: prev.manualRanges.filter((_, i) => i !== index),
    }))
  }

  const handleManualRangeLabelChange = (index: number, label: string) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], label }
      return { ...prev, manualRanges: newRanges }
    })
  }

  const handleManualRangeFrameChange = (
    index: number,
    field: 'startFrame' | 'endFrame',
    value: number,
    maxFrame: number
  ) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], [field]: value }
      if (field === 'startFrame' && newRanges[index].startFrame > newRanges[index].endFrame) {
        newRanges[index].endFrame = Math.min(newRanges[index].startFrame, maxFrame)
      } else if (field === 'endFrame' && newRanges[index].endFrame < newRanges[index].startFrame) {
        newRanges[index].startFrame = Math.max(newRanges[index].endFrame, 0)
      }
      return { ...prev, manualRanges: newRanges }
    })
  }

  const handleManualRangeScrollChange = (
    index: number,
    field: 'scrollStart' | 'scrollEnd',
    value: number
  ) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], [field]: value }
      if (field === 'scrollStart' && newRanges[index].scrollStart > newRanges[index].scrollEnd) {
        newRanges[index].scrollEnd = newRanges[index].scrollStart
      } else if (field === 'scrollEnd' && newRanges[index].scrollEnd < newRanges[index].scrollStart) {
        newRanges[index].scrollStart = newRanges[index].scrollEnd
      }
      return { ...prev, manualRanges: newRanges }
    })
  }

  return (
    <AnimatePresence>
      {config.mode === 'manual' && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="h-3.5 w-3.5 text-cyan-400" />
              <h3 className="text-xs font-medium uppercase tracking-widest text-white/30">
                Manual Frame Ranges
              </h3>
              <Badge
                variant="outline"
                className="border-cyan-500/20 bg-cyan-500/[0.05] text-cyan-300/50"
              >
                {config.manualRanges.length} ranges
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddManualRange}
              disabled={disabled || frameCount === 0}
              className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Range
            </Button>
          </div>

          {/* Visual timeline bar */}
          <div className="relative">
            <div className="h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              {config.manualRanges.map((range, idx) => {
                const color = RANGE_COLORS[idx % RANGE_COLORS.length]
                const width = (range.scrollEnd - range.scrollStart) * 100
                const left = range.scrollStart * 100
                return (
                  <div
                    key={idx}
                    className={`absolute h-full ${color} opacity-40`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                )
              })}
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-px bg-white/10"
                  style={{ position: 'absolute', left: `${i * 10}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-label text-white/25 mt-0.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Range list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {config.manualRanges.length === 0 ? (
              <div className="text-center py-6 text-white/30">
                <p className="text-label mb-1">No ranges defined</p>
                <p className="text-label text-white/20">
                  Click &quot;Add Range&quot; to map frames to scroll positions
                </p>
              </div>
            ) : (
              config.manualRanges.map((range, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Input
                      value={range.label}
                      onChange={(e) => handleManualRangeLabelChange(idx, e.target.value)}
                      placeholder="Range label..."
                      disabled={disabled}
                      className="h-6 text-label bg-transparent border-white/[0.08] text-white/80 placeholder:text-white/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveManualRange(idx)}
                      disabled={disabled}
                      className="h-6 w-6 p-0 text-white/30 hover:text-red-400"
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/30"
                      >
                        Start Frame
                      </span>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[range.startFrame]}
                          min={0}
                          max={frameCount - 1}
                          step={1}
                          onValueChange={(val) =>
                            handleManualRangeFrameChange(
                              idx,
                              'startFrame',
                              val[0],
                              frameCount,
                            )
                          }
                          disabled={disabled}
                          className="flex-1"
                        />
                        <span className="text-label font-mono text-cyan-400 w-6 text-right">
                          {range.startFrame}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/30"
                      >
                        End Frame
                      </span>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[range.endFrame]}
                          min={0}
                          max={frameCount - 1}
                          step={1}
                          onValueChange={(val) =>
                            handleManualRangeFrameChange(
                              idx,
                              'endFrame',
                              val[0],
                              frameCount,
                            )
                          }
                          disabled={disabled}
                          className="flex-1"
                        />
                        <span className="text-label font-mono text-cyan-400 w-6 text-right">
                          {range.endFrame}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/30"
                      >
                        Scroll Start
                      </span>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[range.scrollStart * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(val) =>
                            handleManualRangeScrollChange(
                              idx,
                              'scrollStart',
                              val[0] / 100,
                            )
                          }
                          disabled={disabled}
                          className="flex-1"
                        />
                        <span className="text-label font-mono text-emerald-400 w-8 text-right">
                          {Math.round(range.scrollStart * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/30"
                      >
                        Scroll End
                      </span>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[range.scrollEnd * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(val) =>
                            handleManualRangeScrollChange(
                              idx,
                              'scrollEnd',
                              val[0] / 100,
                            )
                          }
                          disabled={disabled}
                          className="flex-1"
                        />
                        <span className="text-label font-mono text-emerald-400 w-8 text-right">
                          {Math.round(range.scrollEnd * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  )
}
