'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Settings,
  Pin,
  Film,
  LayoutGrid,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  generateScrollTriggerMap,
  scrollToPixels,
} from '@/lib/scroll-trigger'
import type {
  ScrollTriggerConfig,
  ScrollTriggerMode,
  ScrollTriggerMap,
  OvershootBehavior,
  ScrollUnit,
} from '@/types'
import { ModeSelector } from './mode-selector'
import { ModeSpecificConfig } from './mode-config'
import { TriggerStats } from './trigger-stats'

// ─── Props ──────────────────────────────────────────────────────────────────

export interface ScrollTriggerPanelProps {
  frameCount: number
  frameTimestamps?: number[]
  onConfigChange: (config: ScrollTriggerConfig) => void
  onPreviewRequest: (map: ScrollTriggerMap) => void
  disabled?: boolean
  config: ScrollTriggerConfig
  setConfig: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
}

// ─── Constants ──────────────────────────────────────────────────────────────

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
  config,
  setConfig,
}: ScrollTriggerPanelProps) {
  const [activeTab, setActiveTab] = useState<'modes' | 'settings'>('modes')

  // ── Generate scroll trigger map ────────────────────────────────────────
  const scrollMap = useMemo<ScrollTriggerMap>(() => {
    return generateScrollTriggerMap(frameCount, config, frameTimestamps)
  }, [frameCount, config, frameTimestamps])

  useEffect(() => {
    onPreviewRequest(scrollMap)
  }, [scrollMap])

  // ── Config updaters ────────────────────────────────────────────────────
  const updateConfig = useCallback(
    (partial: Partial<ScrollTriggerConfig>) => {
      setConfig((prev) => ({ ...prev, ...partial }))
    },
    []
  )

  const handleModeSelect = useCallback(
    (mode: ScrollTriggerMode) => updateConfig({ mode }),
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
      if (val[0] < config.triggerEnd) updateConfig({ triggerStart: val[0] })
    },
    [config.triggerEnd, updateConfig]
  )

  const handleTriggerEndChange = useCallback(
    (val: number[]) => {
      if (val[0] > config.triggerStart) updateConfig({ triggerEnd: val[0] })
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ════════════════════ Tab Switcher ════════════════════ */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('modes')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'modes'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
              : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Scroll Modes
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
              : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
      </div>

      {/* ════════════════════ Modes Tab ════════════════════ */}
      {activeTab === 'modes' && (
        <div className="space-y-5">
          <ModeSelector
            selectedMode={config.mode}
            onModeSelect={handleModeSelect}
            disabled={disabled}
          />

          <ModeSpecificConfig
            config={config}
            frameCount={frameCount}
            frameTimestamps={frameTimestamps}
            disabled={disabled}
            onConfigChange={updateConfig}
            setConfig={setConfig}
          />

          <TriggerStats triggerMap={scrollMap} />
        </div>
      )}

      {/* ════════════════════ Settings Tab ════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Configuration Controls */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-5">
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
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-3">
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
          </div>
        </div>
      )}
    </div>
  )
}
