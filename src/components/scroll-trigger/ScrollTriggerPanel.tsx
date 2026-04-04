'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Scroll,
  Settings,
  Download,
  Copy,
  Check,
  Plus,
  Minus,
  Box,
  Layers,
  Activity,
  Zap,
  Film,
  Sparkles,
  Gauge,
  ArrowDownUp,
  Pin,
  Waves,
  Timer,
  LayoutGrid,
  Pencil,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  generateScrollTriggerMap,
  exportScrollTriggerJSON,
  exportScrollTriggerCSS,
  autoDetectScenes,
  SCROLL_MODE_INFO,
  scrollToPixels,
} from '@/lib/scroll-trigger'
import type {
  ScrollTriggerConfig,
  ScrollTriggerMode,
  ScrollTriggerMap,
  OvershootBehavior,
  ScrollUnit,
  SceneBreakpoint,
  ManualFrameRange,
} from '@/types'
import { DEFAULT_SCROLL_CONFIG } from '@/types'

// ─── Props ──────────────────────────────────────────────────────────────────

export interface ScrollTriggerPanelProps {
  frameCount: number
  frameTimestamps?: number[]
  onConfigChange: (config: ScrollTriggerConfig) => void
  onPreviewRequest: (map: ScrollTriggerMap) => void
  disabled?: boolean
  activeTab?: 'modes' | 'settings' | 'preview'
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const modeCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

// ─── Mode Icon Mapper ───────────────────────────────────────────────────────

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

const OVERSHOOT_OPTIONS: { value: OvershootBehavior; label: string; desc: string }[] = [
  { value: 'clamp', label: 'Clamp', desc: 'Stop at last frame' },
  { value: 'loop', label: 'Loop', desc: 'Wrap around continuously' },
  { value: 'bounce', label: 'Bounce', desc: 'Reverse at boundaries' },
  { value: 'none', label: 'None', desc: 'No boundary handling' },
]

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ScrollTriggerPanel({
  frameCount,
  frameTimestamps,
  onConfigChange,
  onPreviewRequest,
  disabled = false,
  activeTab = 'modes',
}: ScrollTriggerPanelProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [config, setConfig] = useState<ScrollTriggerConfig>({
    ...DEFAULT_SCROLL_CONFIG,
  })
  const [copiedJSON, setCopiedJSON] = useState(false)
  const [copiedCSS, setCopiedCSS] = useState(false)

  // ── Generate scroll trigger map ────────────────────────────────────────
  const scrollMap = useMemo<ScrollTriggerMap>(() => {
    const map = generateScrollTriggerMap(frameCount, config, frameTimestamps)
    return map
  }, [frameCount, config, frameTimestamps])

  // Notify parent on map changes
  useEffect(() => {
    onConfigChange(config)
    onPreviewRequest(scrollMap)
  }, [scrollMap, config, onConfigChange, onPreviewRequest])

  // ── Config updaters ────────────────────────────────────────────────────

  const updateConfig = useCallback(
    (partial: Partial<ScrollTriggerConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial }
        return next
      })
    },
    []
  )

  const handleModeSelect = useCallback(
    (mode: ScrollTriggerMode) => {
      updateConfig({ mode })
    },
    [updateConfig]
  )

  const handleScrollDistanceChange = useCallback(
    (val: number[]) => updateConfig({ scrollDistance: val[0] }),
    [updateConfig]
  )

  const handleScrollUnitChange = useCallback(
    (val: string) => updateConfig({ scrollUnit: val as ScrollUnit }),
    [updateConfig]
  )

  const handleTriggerStartChange = useCallback(
    (val: number[]) => {
      const newStart = val[0]
      if (newStart < config.triggerEnd) {
        updateConfig({ triggerStart: newStart })
      }
    },
    [config.triggerEnd, updateConfig]
  )

  const handleTriggerEndChange = useCallback(
    (val: number[]) => {
      const newEnd = val[0]
      if (newEnd > config.triggerStart) {
        updateConfig({ triggerEnd: newEnd })
      }
    },
    [config.triggerStart, updateConfig]
  )

  const handleOvershootChange = useCallback(
    (val: string) => updateConfig({ overshootBehavior: val as OvershootBehavior }),
    [updateConfig]
  )

  const handleSmoothingChange = useCallback(
    (val: number[]) => updateConfig({ smoothing: val[0] }),
    [updateConfig]
  )

  const handleStepHoldDurationChange = useCallback(
    (val: number[]) => updateConfig({ stepHoldDuration: val[0] }),
    [updateConfig]
  )

  // ── Scene management ───────────────────────────────────────────────────

  const handleSceneLabelChange = useCallback(
    (index: number, label: string) => {
      setConfig((prev) => {
        const newScenes = [...prev.scenes]
        newScenes[index] = { ...newScenes[index], label }
        return { ...prev, scenes: newScenes }
      })
    },
    []
  )

  const handleSceneStartFrameChange = useCallback(
    (index: number, value: number) => {
      setConfig((prev) => {
        const newScenes = [...prev.scenes]
        newScenes[index] = { ...newScenes[index], startFrame: Math.min(value, newScenes[index].endFrame - 1) }
        return { ...prev, scenes: newScenes }
      })
    },
    []
  )

  const handleSceneEndFrameChange = useCallback(
    (index: number, value: number) => {
      setConfig((prev) => {
        const newScenes = [...prev.scenes]
        newScenes[index] = { ...newScenes[index], endFrame: Math.max(value, newScenes[index].startFrame + 1) }
        return { ...prev, scenes: newScenes }
      })
    },
    []
  )

  const handleSceneWeightChange = useCallback(
    (index: number, val: number[]) => {
      setConfig((prev) => {
        const newScenes = [...prev.scenes]
        newScenes[index] = { ...newScenes[index], weight: val[0] }
        return { ...prev, scenes: newScenes }
      })
    },
    []
  )

  const handleAddScene = useCallback(() => {
    setConfig((prev) => {
      const lastEnd = prev.scenes.length > 0
        ? Math.min(prev.scenes[prev.scenes.length - 1].endFrame + 1, frameCount - 2)
        : 0
      const newScene: SceneBreakpoint = {
        startFrame: lastEnd,
        endFrame: Math.min(lastEnd + Math.max(1, Math.floor(frameCount / 3)), frameCount - 1),
        label: `Scene ${prev.scenes.length + 1}`,
        weight: 1.0,
      }
      return { ...prev, scenes: [...prev.scenes, newScene] }
    })
  }, [frameCount])

  const handleRemoveScene = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((_, i) => i !== index),
    }))
  }, [])

  const handleAutoDetect = useCallback(() => {
    if (!frameTimestamps || frameTimestamps.length < 3) {
      toast.error('Need at least 3 frame timestamps to auto-detect scenes')
      return
    }
    const scenes = autoDetectScenes(frameTimestamps, frameCount)
    if (scenes.length === 0) {
      toast.info('No scene boundaries detected. Try a different sensitivity.')
      return
    }
    updateConfig({ scenes })
    toast.success(`Detected ${scenes.length} scenes`)
  }, [frameTimestamps, frameCount, updateConfig])

  // Manual range handlers
  const handleAddManualRange = useCallback(() => {
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
  }, [frameCount])

  const handleRemoveManualRange = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      manualRanges: prev.manualRanges.filter((_, i) => i !== index),
    }))
  }, [])

  const handleManualRangeLabelChange = useCallback((index: number, label: string) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], label }
      return { ...prev, manualRanges: newRanges }
    })
  }, [])

  const handleManualRangeFrameChange = useCallback((
    index: number, 
    field: 'startFrame' | 'endFrame', 
    value: number,
    maxFrame: number
  ) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], [field]: value }
      // Ensure start <= end
      if (field === 'startFrame' && newRanges[index].startFrame > newRanges[index].endFrame) {
        newRanges[index].endFrame = Math.min(newRanges[index].startFrame, maxFrame)
      } else if (field === 'endFrame' && newRanges[index].endFrame < newRanges[index].startFrame) {
        newRanges[index].startFrame = Math.max(newRanges[index].endFrame, 0)
      }
      return { ...prev, manualRanges: newRanges }
    })
  }, [])

  const handleManualRangeScrollChange = useCallback((
    index: number,
    field: 'scrollStart' | 'scrollEnd',
    value: number
  ) => {
    setConfig((prev) => {
      const newRanges = [...prev.manualRanges]
      newRanges[index] = { ...newRanges[index], [field]: value }
      // Ensure scrollStart <= scrollEnd
      if (field === 'scrollStart' && newRanges[index].scrollStart > newRanges[index].scrollEnd) {
        newRanges[index].scrollEnd = newRanges[index].scrollStart
      } else if (field === 'scrollEnd' && newRanges[index].scrollEnd < newRanges[index].scrollStart) {
        newRanges[index].scrollStart = newRanges[index].scrollEnd
      }
      return { ...prev, manualRanges: newRanges }
    })
  }, [])

  // ── Export actions ─────────────────────────────────────────────────────

  // Helper to download a file
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const handleExportJSON = useCallback(async () => {
    try {
      const json = exportScrollTriggerJSON(scrollMap)
      const filename = `scroll-trigger-config-${Date.now()}.json`
      downloadFile(json, filename, 'application/json')
      toast.success(`Downloaded ${filename}`)
    } catch {
      toast.error('Failed to export JSON')
    }
  }, [scrollMap, downloadFile])

  const handleExportCSS = useCallback(async () => {
    try {
      const css = exportScrollTriggerCSS(scrollMap)
      const filename = `scroll-trigger-styles-${Date.now()}.css`
      downloadFile(css, filename, 'text/css')
      toast.success(`Downloaded ${filename}`)
    } catch {
      toast.error('Failed to export CSS')
    }
  }, [scrollMap, downloadFile])

  // ── Scene total frames check ───────────────────────────────────────────

  const totalSceneFrames = useMemo(
    () => config.scenes.reduce((sum, s) => sum + (s.endFrame - s.startFrame + 1), 0),
    [config.scenes]
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ════════════════════ 1. Mode Selector Grid ════════════════════ */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible"
        className={activeTab !== 'modes' ? 'hidden' : ''}
      >
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="h-3.5 w-3.5 text-orange-400" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Scroll Mode
          </h2>
          <Badge
            variant="outline"
            className="ml-auto border-white/[0.08] bg-white/[0.03] text-white/40"
          >
            {SCROLL_MODE_INFO[config.mode]?.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.entries(SCROLL_MODE_INFO) as [ScrollTriggerMode, typeof SCROLL_MODE_INFO[string]][]).map(
            ([mode, info]) => {
              const isActive = config.mode === mode
              const iconEl = MODE_ICONS[mode]
              const colorClass = MODE_COLORS[mode]

              return (
                <motion.button
                  key={mode}
                  variants={modeCardVariants}
                  whileHover={{ scale: disabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled ? 1 : 0.97 }}
                  onClick={() => !disabled && handleModeSelect(mode)}
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
      </motion.div>

      {/* ════════════════════ 2. Configuration Controls ════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-6 ${activeTab !== 'settings' ? 'hidden' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-3.5 w-3.5 text-orange-400" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Configuration
          </h2>
        </div>

        {/* Scroll Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-white/50">
              Scroll Distance
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium text-orange-400">
                {config.scrollDistance.toLocaleString()}
              </span>
              <Select
                value={config.scrollUnit}
                onValueChange={handleScrollUnitChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-[70px] h-7 text-xs border-white/[0.1] bg-white/[0.04] text-white/70 focus:ring-orange-500/30 focus:border-orange-500/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/[0.1] bg-[#1a1a1a]">
                  <SelectItem value="px" className="text-white/70 focus:text-white focus:bg-white/[0.06]">px</SelectItem>
                  <SelectItem value="vh" className="text-white/70 focus:text-white focus:bg-white/[0.06]">vh</SelectItem>
                  <SelectItem value="vw" className="text-white/70 focus:text-white focus:bg-white/[0.06]">vw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Slider
            value={[config.scrollDistance]}
            min={100}
            max={10000}
            step={50}
            onValueChange={handleScrollDistanceChange}
            disabled={disabled}
            className="py-1"
          />
          <div className="flex justify-between text-[10px] text-white/20">
            <span>100</span>
            <span>10,000 {config.scrollUnit}</span>
          </div>
          <p className="text-[11px] text-white/20">
            ≈ {scrollToPixels(config.scrollDistance, config.scrollUnit).toLocaleString()} px
          </p>
        </div>

        {/* Trigger Zone */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-white/50">
            Trigger Zone
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/35">Start</span>
                <span className="text-xs font-mono text-orange-400">
                  {(config.triggerStart * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[config.triggerStart]}
                min={0}
                max={config.triggerEnd - 0.01}
                step={0.01}
                onValueChange={handleTriggerStartChange}
                disabled={disabled}
                className="py-1"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/35">End</span>
                <span className="text-xs font-mono text-orange-400">
                  {(config.triggerEnd * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[config.triggerEnd]}
                min={config.triggerStart + 0.01}
                max={1}
                step={0.01}
                onValueChange={handleTriggerEndChange}
                disabled={disabled}
                className="py-1"
              />
            </div>
          </div>
        </div>

        {/* Overshoot Behavior */}
        <div className="space-y-2.5">
          <Label className="text-xs uppercase tracking-wider text-white/50">
            Overshoot Behavior
          </Label>
          <Select
            value={config.overshootBehavior}
            onValueChange={handleOvershootChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full border-white/[0.1] bg-white/[0.04] text-white/80 focus:ring-orange-500/30 focus:border-orange-500/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.1] bg-[#1a1a1a]">
              {OVERSHOOT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-white/70 focus:text-white focus:bg-white/[0.06]"
                >
                  <span className="flex items-center justify-between gap-8">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-white/30">{opt.desc}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pin Element Switch */}
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3 space-y-0">
            <Pin className="h-4 w-4 text-white/25" />
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-white/60 cursor-pointer">
                Pin Element
              </Label>
              <p className="text-[11px] text-white/25">
                Fix element to viewport during scroll trigger
              </p>
            </div>
          </div>
          <Switch
            checked={config.pinElement}
            onCheckedChange={(val) => updateConfig({ pinElement: val })}
            disabled={disabled}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>

        {/* Smoothing Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-white/50">
              Smoothing
            </Label>
            <span className="text-sm font-mono font-medium text-orange-400">
              {config.smoothing.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[config.smoothing]}
            min={0}
            max={0.95}
            step={0.01}
            onValueChange={handleSmoothingChange}
            disabled={disabled}
            className="py-1"
          />
          <div className="flex justify-between text-[10px] text-white/20">
            <span>Instant (0)</span>
            <span>Very smooth (0.95)</span>
          </div>
        </div>

        {/* Snap to Frame Switch */}
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3 space-y-0">
            <Film className="h-4 w-4 text-white/25" />
            <div className="space-y-0.5">
              <Label className="text-xs font-medium text-white/60 cursor-pointer">
                Snap to Frame
              </Label>
              <p className="text-[11px] text-white/25">
                Snap scroll position to nearest frame boundary
              </p>
            </div>
          </div>
          <Switch
            checked={config.snapToFrame}
            onCheckedChange={(val) => updateConfig({ snapToFrame: val })}
            disabled={disabled}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </motion.div>

      {/* ════════════════════ 3. Scene Editor ════════════════════ */}
      <AnimatePresence>
        {config.mode === 'scene' && activeTab === 'settings' && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-orange-400" />
                <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
                  Scene Editor
                </h2>
                <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/40">
                  {config.scenes.length} scenes
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoDetect}
                      disabled={disabled || !frameTimestamps}
                      className="h-7 text-xs text-white/40 hover:text-orange-400 hover:bg-orange-500/10 gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto-detect
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-[#1a1a1a] border-white/[0.1] text-white/60">
                    Detect scene boundaries from frame timestamps
                  </TooltipContent>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddScene}
                  disabled={disabled}
                  className="h-7 text-xs text-white/40 hover:text-orange-400 hover:bg-orange-500/10 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Scene
                </Button>
              </div>
            </div>

            {/* Scene breakdown bar */}
            {config.scenes.length > 0 && (
              <div className="space-y-2">
                <div className="flex h-6 w-full overflow-hidden rounded-md border border-white/[0.06]">
                  {config.scenes.map((scene, i) => {
                    const width = totalSceneFrames > 0
                      ? ((scene.endFrame - scene.startFrame + 1) / totalSceneFrames) * 100
                      : 100 / config.scenes.length
                    return (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <div
                            className={`${SCENE_COLORS[i % SCENE_COLORS.length]} opacity-70 hover:opacity-100 transition-opacity cursor-default`}
                            style={{ width: `${Math.max(width, 2)}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#1a1a1a] border-white/[0.1] text-white/60 text-[10px]">
                          {scene.label}: {scene.endFrame - scene.startFrame + 1} frames (w: {scene.weight.toFixed(1)})
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
                <p className="text-[10px] text-white/20">
                  Proportional scene breakdown · {totalSceneFrames} total frames mapped
                </p>
              </div>
            )}

            {/* Scene list */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {config.scenes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Box className="h-8 w-8 text-white/10 mb-3" />
                  <p className="text-xs text-white/25">No scenes defined</p>
                  <p className="text-[10px] text-white/15 mt-1">
                    Click &quot;Auto-detect&quot; or &quot;Add Scene&quot; to begin
                  </p>
                </div>
              )}

              {config.scenes.map((scene, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-sm ${SCENE_COLORS[index % SCENE_COLORS.length]}`}
                      />
                      <Input
                        value={scene.label}
                        onChange={(e) => handleSceneLabelChange(index, e.target.value)}
                        disabled={disabled}
                        className="h-7 w-36 text-xs bg-transparent border-white/[0.08] text-white/70 focus:border-orange-500/40 focus:ring-orange-500/20 px-2"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveScene(index)}
                      disabled={disabled || config.scenes.length <= 1}
                      className="h-7 w-7 p-0 text-white/25 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/25">
                        Start Frame
                      </span>
                      <Input
                        type="number"
                        value={scene.startFrame}
                        onChange={(e) => handleSceneStartFrameChange(index, parseInt(e.target.value) || 0)}
                        disabled={disabled}
                        min={0}
                        max={frameCount - 1}
                        className="h-7 text-xs font-mono bg-transparent border-white/[0.08] text-orange-400 focus:border-orange-500/40 focus:ring-orange-500/20 px-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/25">
                        End Frame
                      </span>
                      <Input
                        type="number"
                        value={scene.endFrame}
                        onChange={(e) => handleSceneEndFrameChange(index, parseInt(e.target.value) || 0)}
                        disabled={disabled}
                        min={0}
                        max={frameCount - 1}
                        className="h-7 text-xs font-mono bg-transparent border-white/[0.08] text-orange-400 focus:border-orange-500/40 focus:ring-orange-500/20 px-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/25">
                        Weight
                      </span>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[scene.weight]}
                          min={0.1}
                          max={5.0}
                          step={0.1}
                          onValueChange={(val) => handleSceneWeightChange(index, val)}
                          disabled={disabled}
                          className="flex-1 py-1"
                        />
                        <span className="text-[10px] font-mono text-orange-400 w-6 text-right">
                          {scene.weight.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ 4. Step Hold Duration ════════════════════ */}
      <AnimatePresence>
        {config.mode === 'stepHold' && activeTab === 'settings' && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-orange-400" />
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
                onValueChange={handleStepHoldDurationChange}
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

      {/* ════════════════════ 4. Manual Range Editor ════════════════════ */}
      <AnimatePresence>
        {config.mode === 'manual' && activeTab === 'settings' && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5 text-orange-400" />
                <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
                  Manual Frame Ranges
                </h2>
                <Badge variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white/40">
                  {config.manualRanges.length} ranges
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddManualRange}
                  disabled={disabled || frameCount === 0}
                  className="h-7 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Range
                </Button>
              </div>
            </div>

            {/* Visual timeline bar */}
            <div className="relative">
              <div className="h-12 rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                {/* Range visualization bars */}
                {config.manualRanges.map((range, idx) => {
                  const colors = ['bg-orange-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500']
                  const color = colors[idx % colors.length]
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
                {/* Frame count markers */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="h-2 w-px bg-white/10" style={{ position: 'absolute', left: `${i * 10}%` }} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Range list */}
            <div className="space-y-3">
              {config.manualRanges.length === 0 ? (
                <div className="text-center py-6 text-white/30">
                  <p className="text-sm mb-2">No ranges defined</p>
                  <p className="text-xs text-white/20">
                    Click "Add Range" to define which frames appear at which scroll positions
                  </p>
                </div>
              ) : (
                config.manualRanges.map((range, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        value={range.label}
                        onChange={(e) => handleManualRangeLabelChange(idx, e.target.value)}
                        placeholder="Range label..."
                        disabled={disabled}
                        className="h-8 text-xs bg-transparent border-white/[0.08] text-white/80 placeholder:text-white/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveManualRange(idx)}
                        disabled={disabled}
                        className="h-7 w-7 p-0 text-white/30 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Frame */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-white/40">
                          Start Frame
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[range.startFrame]}
                            min={0}
                            max={frameCount - 1}
                            step={1}
                            onValueChange={(val) => handleManualRangeFrameChange(idx, 'startFrame', val[0], frameCount)}
                            disabled={disabled}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-orange-400 w-8 text-right">
                            {range.startFrame}
                          </span>
                        </div>
                      </div>
                      
                      {/* End Frame */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-white/40">
                          End Frame
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[range.endFrame]}
                            min={0}
                            max={frameCount - 1}
                            step={1}
                            onValueChange={(val) => handleManualRangeFrameChange(idx, 'endFrame', val[0], frameCount)}
                            disabled={disabled}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-orange-400 w-8 text-right">
                            {range.endFrame}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Scroll Start */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-white/40">
                          Scroll Start %
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[range.scrollStart * 100]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(val) => handleManualRangeScrollChange(idx, 'scrollStart', val[0] / 100)}
                            disabled={disabled}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-emerald-400 w-8 text-right">
                            {Math.round(range.scrollStart * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Scroll End */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-white/40">
                          Scroll End %
                        </Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[range.scrollEnd * 100]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(val) => handleManualRangeScrollChange(idx, 'scrollEnd', val[0] / 100)}
                            disabled={disabled}
                            className="flex-1"
                          />
                          <span className="text-xs font-mono text-emerald-400 w-8 text-right">
                            {Math.round(range.scrollEnd * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-white/30 pt-1 border-t border-white/[0.06]">
                      <span>Frames: {range.startFrame} - {range.endFrame}</span>
                      <span>Scroll: {Math.round(range.scrollStart * 100)}% - {Math.round(range.scrollEnd * 100)}%</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ 5. Live Stats Display ════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5 ${activeTab !== 'preview' ? 'hidden' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-orange-400" />
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Live Statistics
          </h2>
          <Badge variant="outline" className="ml-auto border-white/[0.08] bg-white/[0.03] text-white/40">
            {scrollMap.eventCount} events
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Min Spacing"
            value={`${scrollMap.stats.minSpacing} px`}
            icon={<ArrowDownUp className="h-3 w-3" />}
          />
          <StatCard
            label="Max Spacing"
            value={`${scrollMap.stats.maxSpacing} px`}
            icon={<ArrowDownUp className="h-3 w-3" />}
          />
          <StatCard
            label="Avg Spacing"
            value={`${scrollMap.stats.avgSpacing} px`}
            icon={<Activity className="h-3 w-3" />}
          />
          <StatCard
            label="Std Deviation"
            value={`${scrollMap.stats.stdDevSpacing} px`}
            icon={<Waves className="h-3 w-3" />}
          />
          <StatCard
            label="Max Density"
            value={`${scrollMap.stats.maxDensity} f/100px`}
            icon={<Gauge className="h-3 w-3" />}
          />
          <StatCard
            label="Min Density"
            value={`${scrollMap.stats.minDensity} f/100px`}
            icon={<Gauge className="h-3 w-3" />}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] text-white/20 font-mono">
            {scrollMap.scrollDistancePx.toLocaleString()} px total scroll distance
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
      </motion.div>

      {/* ════════════════════ 6. Export Actions ════════════════════ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className={`flex flex-col sm:flex-row gap-3 ${activeTab !== 'preview' ? 'hidden' : ''}`}
      >
        <Button
          onClick={handleExportJSON}
          disabled={disabled || frameCount === 0}
          className={`
            flex-1 h-10 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-200
            gap-2 border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          <Download className="h-3.5 w-3.5" />
          Download JSON
        </Button>

        <Button
          onClick={handleExportCSS}
          disabled={disabled || frameCount === 0}
          className={`
            flex-1 h-10 rounded-lg border text-xs font-semibold tracking-wider transition-all duration-200
            gap-2 border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          <Download className="h-3.5 w-3.5" />
          Download CSS
        </Button>
      </motion.div>
    </div>
  )
}

// ─── Sub-component: Stat Card ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5 text-white/25">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-mono font-bold text-[#f0f0f0]">{value}</p>
    </div>
  )
}
