'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ExportFormat, ExtractionParams } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: 'jpeg', label: 'JPEG', hint: 'Lossy, small files' },
  { value: 'png', label: 'PNG', hint: 'Lossless, large files' },
  { value: 'webp', label: 'WebP', hint: 'Modern, great compression' },
  { value: 'bmp', label: 'BMP', hint: 'Uncompressed' },
  { value: 'tiff', label: 'TIFF', hint: 'Print quality' },
  { value: 'avif', label: 'AVIF', hint: 'Next-gen, best ratio' },
]

const FPS_PRESETS = [
  { label: 'Smooth', fps: 4, tag: '4 FPS' },
  { label: 'Balanced', fps: 2.5, tag: '2.5 FPS' },
  { label: 'Fast', fps: 2, tag: '2 FPS' },
] as const

// ─── Component ──────────────────────────────────────────────────────────────

interface ExtractionSettingsProps {
  params: ExtractionParams
  onParamChange: (updates: Partial<ExtractionParams>) => void
  isExtracting: boolean
  videoWidth: number
  videoHeight: number
}

export function ExtractionSettings({
  params,
  onParamChange,
  isExtracting,
  videoWidth,
  videoHeight,
}: ExtractionSettingsProps) {
  const { samplingRate, quality, resizeFactor, upscaling, enhance, format } = params

  const currentFormatInfo = FORMAT_OPTIONS.find((f) => f.value === format)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 space-y-6"
    >
      <h2 className="text-xs font-medium uppercase tracking-widest text-white/30 flex items-center gap-2">
        <Zap className="h-3 w-3 text-orange-400" />
        Extraction Settings
      </h2>

      {/* Row 1: FPS Presets */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider text-white/50">
          Quick Presets
        </Label>
        <div className="flex flex-wrap gap-2">
          {FPS_PRESETS.map((preset) => (
            <button
              key={preset.fps}
              onClick={() => onParamChange({ samplingRate: preset.fps })}
              disabled={isExtracting}
              className={`
                relative rounded-lg border px-4 py-2 text-xs font-medium transition-all duration-200
                ${
                  Math.abs(samplingRate - preset.fps) < 0.01
                    ? 'border-orange-500/50 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70 hover:bg-white/[0.06]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {preset.label}
              <span className="ml-1.5 opacity-60">({preset.tag})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Sampling Rate Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-white/50">
            Sampling Rate (FPS)
          </Label>
          <span className="text-sm font-mono font-medium text-orange-400">
            {samplingRate.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[samplingRate]}
          min={0.1}
          max={10}
          step={0.1}
          onValueChange={(val) => onParamChange({ samplingRate: val[0] })}
          disabled={isExtracting}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-white/20">
          <span>0.1 FPS</span>
          <span>10 FPS</span>
        </div>
      </div>

      {/* Row 3: Format Selection */}
      <div className="space-y-2.5">
        <Label className="text-xs uppercase tracking-wider text-white/50">
          Export Format
        </Label>
        <div className="flex items-center gap-3">
          <Select
            value={format}
            onValueChange={(val) => onParamChange({ format: val as ExportFormat })}
            disabled={isExtracting}
          >
            <SelectTrigger className="w-[180px] border-white/[0.1] bg-white/[0.04] text-white/80 focus:ring-orange-500/30 focus:border-orange-500/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.1] bg-[#1a1a1a]">
              {FORMAT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-white/70 focus:text-white focus:bg-white/[0.06]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFormatInfo && (
            <Badge
              variant="outline"
              className="border-white/[0.08] bg-white/[0.03] text-white/40"
            >
              {currentFormatInfo.hint}
            </Badge>
          )}
        </div>
      </div>

      {/* Row 4: Quality Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-white/50">
            Quality
          </Label>
          <span className="text-sm font-mono font-medium text-orange-400">
            {Math.round(quality * 100)}%
          </span>
        </div>
        <Slider
          value={[quality]}
          min={0.1}
          max={1.0}
          step={0.05}
          onValueChange={(val) => onParamChange({ quality: val[0] })}
          disabled={isExtracting}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-white/20">
          <span>10%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Row 5: Resize Factor Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-white/50">
            Resize Factor
          </Label>
          <span className="text-sm font-mono font-medium text-orange-400">
            {Math.round(resizeFactor * 100)}%
          </span>
        </div>
        <Slider
          value={[resizeFactor]}
          min={0.1}
          max={2.0}
          step={0.1}
          onValueChange={(val) => onParamChange({ resizeFactor: val[0] })}
          disabled={isExtracting}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-white/20">
          <span>10%</span>
          <span>200%</span>
        </div>
        <p className="text-[11px] text-white/25">
          Output: {Math.max(1, Math.round(videoWidth * resizeFactor * upscaling))}&times;
          {Math.max(1, Math.round(videoHeight * resizeFactor * upscaling))} px
        </p>
      </div>

      {/* Row 6: Enhancement Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium text-white/60 cursor-pointer">
            Enhance Frames
          </Label>
          <p className="text-[11px] text-white/25">
            Contrast +15% &middot; Saturation +15% &middot; Brightness +5%
          </p>
        </div>
        <Switch
          checked={enhance}
          onCheckedChange={(checked) => onParamChange({ enhance: checked })}
          disabled={isExtracting}
          className="data-[state=checked]:bg-orange-500"
        />
      </div>
    </motion.div>
  )
}
