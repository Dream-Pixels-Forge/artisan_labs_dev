'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Plus,
  Minus,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { autoDetectScenes } from '@/lib/scroll-trigger'
import type {
  ScrollTriggerConfig,
  SceneBreakpoint,
} from '@/types'

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

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

interface SceneEditorProps {
  config: ScrollTriggerConfig
  frameCount: number
  frameTimestamps?: number[]
  disabled?: boolean
  setConfig: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
  onConfigChange: (updates: Partial<ScrollTriggerConfig>) => void
}

export function SceneEditor({
  config,
  frameCount,
  frameTimestamps,
  disabled,
  setConfig,
  onConfigChange,
}: SceneEditorProps) {
  const handleSceneLabelChange = (index: number, label: string) => {
    setConfig((prev) => {
      const newScenes = [...prev.scenes]
      newScenes[index] = { ...newScenes[index], label }
      return { ...prev, scenes: newScenes }
    })
  }

  const handleSceneStartFrameChange = (index: number, value: number) => {
    setConfig((prev) => {
      const newScenes = [...prev.scenes]
      newScenes[index] = {
        ...newScenes[index],
        startFrame: Math.min(value, newScenes[index].endFrame - 1),
      }
      return { ...prev, scenes: newScenes }
    })
  }

  const handleSceneEndFrameChange = (index: number, value: number) => {
    setConfig((prev) => {
      const newScenes = [...prev.scenes]
      newScenes[index] = {
        ...newScenes[index],
        endFrame: Math.max(value, newScenes[index].startFrame + 1),
      }
      return { ...prev, scenes: newScenes }
    })
  }

  const handleSceneWeightChange = (index: number, val: number[]) => {
    setConfig((prev) => {
      const newScenes = [...prev.scenes]
      newScenes[index] = { ...newScenes[index], weight: val[0] }
      return { ...prev, scenes: newScenes }
    })
  }

  const handleAddScene = () => {
    setConfig((prev) => {
      const lastEnd = prev.scenes.length > 0
        ? Math.min(prev.scenes[prev.scenes.length - 1].endFrame + 1, frameCount - 2)
        : 0
      const newScene: SceneBreakpoint = {
        startFrame: lastEnd,
        endFrame: Math.min(
          lastEnd + Math.max(1, Math.floor(frameCount / 3)),
          frameCount - 1,
        ),
        label: `Scene ${prev.scenes.length + 1}`,
        weight: 1.0,
      }
      return { ...prev, scenes: [...prev.scenes, newScene] }
    })
  }

  const handleRemoveScene = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((_, i) => i !== index),
    }))
  }

  const handleAutoDetect = () => {
    if (!frameTimestamps || frameTimestamps.length < 3) {
      toast.error('Need at least 3 frame timestamps to auto-detect scenes')
      return
    }
    const scenes = autoDetectScenes(frameTimestamps, frameCount)
    if (scenes.length === 0) {
      toast.info('No scene boundaries detected.')
      return
    }
    onConfigChange({ scenes })
    toast.success(`Detected ${scenes.length} scenes`)
  }

  const totalSceneFrames = config.scenes.reduce(
    (sum, s) => sum + (s.endFrame - s.startFrame + 1),
    0
  )

  return (
    <AnimatePresence>
      {config.mode === 'scene' && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-400" />
              <h3 className="text-xs font-medium uppercase tracking-widest text-white/30">
                Scene Editor
              </h3>
              <Badge
                variant="outline"
                className="border-violet-500/20 bg-violet-500/[0.05] text-violet-300/50"
              >
                {config.scenes.length} scenes
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAutoDetect}
                disabled={disabled || !frameTimestamps}
                className="h-7 text-xs text-white/40 hover:text-violet-400 hover:bg-violet-500/10 gap-1.5"
              >
                <Sparkles className="h-3 w-3" />
                Auto-detect
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddScene}
                disabled={disabled}
                className="h-7 text-xs text-white/40 hover:text-violet-400 hover:bg-violet-500/10 gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Scene
              </Button>
            </div>
          </div>

          {/* Scene breakdown bar */}
          {config.scenes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-5 w-full overflow-hidden rounded-md border border-white/[0.06]">
                {config.scenes.map((scene, i) => {
                  const width =
                    totalSceneFrames > 0
                      ? ((scene.endFrame - scene.startFrame + 1) /
                          totalSceneFrames) *
                        100
                      : 100 / config.scenes.length
                  return (
                    <div
                      key={i}
                      className={`${SCENE_COLORS[i % SCENE_COLORS.length]} opacity-60 hover:opacity-100 transition-opacity`}
                      style={{ width: `${Math.max(width, 2)}%` }}
                      title={`${scene.label}: ${scene.endFrame - scene.startFrame + 1} frames`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Scene list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {config.scenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Box className="h-6 w-6 text-white/10 mb-2" />
                <p className="text-label text-white/25">No scenes defined</p>
                <p className="text-label text-white/15 mt-0.5">
                  Click &quot;Auto-detect&quot; or &quot;Add&quot; to begin
                </p>
              </div>
            ) : (
              config.scenes.map((scene, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-sm ${SCENE_COLORS[index % SCENE_COLORS.length]}`}
                      />
                      <Input
                        value={scene.label}
                        onChange={(e) =>
                          handleSceneLabelChange(index, e.target.value)
                        }
                        disabled={disabled}
                        className="h-6 w-28 text-label bg-transparent border-white/[0.08] text-white/70 focus:border-violet-500/40 focus:ring-violet-500/20 px-1.5"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScene(index)}
                      disabled={disabled || config.scenes.length <= 1}
                      className="h-6 w-6 p-0 text-white/25 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/25"
                      >
                        Start
                      </span>
                      <Input
                        type="number"
                        value={scene.startFrame}
                        onChange={(e) =>
                          handleSceneStartFrameChange(
                            index,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={disabled}
                        min={0}
                        max={frameCount - 1}
                        className="h-6 text-label font-mono bg-transparent border-white/[0.08] text-violet-400 focus:border-violet-500/40 px-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/25"
                      >
                        End
                      </span>
                      <Input
                        type="number"
                        value={scene.endFrame}
                        onChange={(e) =>
                          handleSceneEndFrameChange(
                            index,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={disabled}
                        min={0}
                        max={frameCount - 1}
                        className="h-6 text-label font-mono bg-transparent border-white/[0.08] text-violet-400 focus:border-violet-500/40 px-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <span
                        className="text-label uppercase tracking-wider text-white/25"
                      >
                        Weight
                      </span>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[scene.weight]}
                          min={0.1}
                          max={5.0}
                          step={0.1}
                          onValueChange={(val) =>
                            handleSceneWeightChange(index, val)
                          }
                          disabled={disabled}
                          className="flex-1 py-0.5"
                        />
                        <span className="text-label font-mono text-violet-400 w-5 text-right">
                          {scene.weight.toFixed(1)}
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
