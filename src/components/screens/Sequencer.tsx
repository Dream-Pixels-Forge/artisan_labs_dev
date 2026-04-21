'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Upload,
  Film,
  Play,
  Clock,
  Monitor,
  HardDrive,
  RefreshCw,
  Loader2,
  Zap,
  Layers,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, createSequenceId } from '@/store/app-store'
import type { ExportFormat, ExtractionParams, VideoInfo } from '@/types'
import {
  extractFrames,
  estimateFrameCount,
  estimateFileSize,
} from '@/lib/frame-extractor'

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// ─── Animation Variants ───────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 10)
  return `${m}:${s.toString().padStart(2, '0')}.${ms}`
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

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

// ─── Sub-components ───────────────────────────────────────────────────────

function VideoUploadZone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (!file) return
      
      if (!file.type.startsWith('video/')) {
        toast.error('Please drop a valid video file')
        return
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`)
        return
      }
      
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelected(file)
    },
    [onFileSelected]
  )

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full max-w-2xl cursor-pointer rounded-2xl border-2 border-dashed
          p-12 sm:p-16 text-center transition-all duration-300
          ${
            isDragging
              ? 'border-orange-400/60 bg-orange-500/[0.06] scale-[1.01]'
              : 'border-white/10 bg-white/[0.02] hover:border-orange-400/40 hover:bg-white/[0.04]'
          }
        `}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
            isDragging ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative space-y-5">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 ${
              isDragging
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-white/[0.06] text-white/30'
            }`}
          >
            <Upload className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#f0f0f0]">
              {isDragging ? 'Drop your video here' : 'Upload a Video'}
            </h2>
            <p className="text-sm text-white/35">
              Drag & drop or click to browse. Supports MP4, WebM, MOV, and more.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/40">
            <Film className="h-3 w-3" />
            Video files only
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Sequencer ───────────────────────────────────────────────────────

export default function Sequencer() {
  const {
    currentVideo,
    setCurrentVideo,
    isExtracting,
    setIsExtracting,
    extractedCount,
    setExtractedCount,
    addSequence,
    setActiveScreen,
    setLastSequenceFrameCount,
    setCurrentSequence,
  } = useAppStore()

  // Active tab
  const [activeTab, setActiveTab] = useState('video')

  // Extraction parameters state
  const [samplingRate, setSamplingRate] = useState(4)
  const [quality, setQuality] = useState(0.8)
  const [resizeFactor, setResizeFactor] = useState(0.5)
  const [upscaling, setUpscaling] = useState(1.0)
  const [enhance, setEnhance] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('webp')

  // Progress tracking
  const [progressCount, setProgressCount] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  // Cancellation
  const abortRef = useRef<AbortController | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  // ── Handle file selection ───────────────────────────────────────────────

  const handleFileSelected = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`)
        return
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Invalid file type. Please upload a video file.')
        return
      }

      const url = URL.createObjectURL(file)

      try {
        // Extract video metadata — use loadeddata for reliable duration
        const video = document.createElement('video')
        video.preload = 'auto'
        video.muted = true
        video.playsInline = true

        await new Promise<void>((resolve, reject) => {
          let settled = false
          const done = (fn: () => void) => {
            if (settled) return
            settled = true
            clearTimeout(timeout)
            fn()
          }

          const onLoaded = () => done(resolve)
          const onError = () => done(() => reject(new Error('Failed to load video')))
          const timeout = setTimeout(() => {
            // If we have basic metadata, proceed anyway
            if (video.readyState >= 1 && video.duration > 0) {
              done(resolve)
            } else {
              done(() => reject(new Error('Video load timeout')))
            }
          }, 15_000)

          video.addEventListener('loadeddata', onLoaded)
          video.addEventListener('error', onError)
          video.src = url
        })

        const info: VideoInfo = {
          name: file.name,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size,
          type: file.type,
          file,
          url,
        }

        setCurrentVideo(info)
        toast.success(`Loaded: ${file.name}`)
      } catch (err) {
        URL.revokeObjectURL(url)
        toast.error(err instanceof Error ? err.message : 'Failed to load video')
      }
    },
    [setCurrentVideo]
  )

  // ── Change video (cleanup old URL) ──────────────────────────────────────

  const handleChangeVideo = useCallback(() => {
    if (currentVideo) {
      URL.revokeObjectURL(currentVideo.url)
      setCurrentVideo(null)
    }
  }, [currentVideo, setCurrentVideo])

  // ── Build extraction params ─────────────────────────────────────────────

  const buildParams = useCallback((): ExtractionParams => {
    return {
      samplingRate,
      quality,
      resizeFactor,
      upscaling,
      enhance,
      format,
    }
  }, [samplingRate, quality, resizeFactor, upscaling, enhance, format])

  // ── Handle FPS preset click ─────────────────────────────────────────────

  const handlePresetClick = useCallback((fps: number) => {
    setSamplingRate(fps)
  }, [])

  // ── Start extraction ────────────────────────────────────────────────────

  const handleExtract = useCallback(async () => {
    if (!currentVideo || isExtracting) return

    const params = buildParams()
    const estimatedFrames = estimateFrameCount(params.samplingRate, currentVideo.duration)

    setIsExtracting(true)
    setExtractedCount(0)
    setProgressCount(0)
    setProgressTotal(estimatedFrames)
    setStartTime(Date.now())
    setElapsedMs(0)

    // Start elapsed timer
    elapsedTimerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime)
    }, 200)

    // Create abort controller
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const frames = await extractFrames(
        currentVideo.file,
        params,
        (count, total) => {
          setExtractedCount(count)
          setProgressCount(count)
        },
        controller.signal
      )

      // Stop timer
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }
      setElapsedMs(Date.now() - startTime)

      // Create sequence object
      const outWidth = Math.max(
        1,
        Math.round(currentVideo.width * params.resizeFactor * params.upscaling)
      )
      const outHeight = Math.max(
        1,
        Math.round(currentVideo.height * params.resizeFactor * params.upscaling)
      )

      const sequence = {
        id: createSequenceId(),
        name: currentVideo.name.replace(/\.[^.]+$/, ''),
        timestamp: new Date().toISOString(),
        frames,
        videoName: currentVideo.name,
        format: params.format,
        frameCount: frames.length,
        width: outWidth,
        height: outHeight,
        fileSize: estimateFileSize(params, currentVideo.duration),
      }

      // Add to archive and set as current working sequence
      addSequence(sequence)
      setCurrentSequence(sequence)
      setLastSequenceFrameCount(frames.length)

      toast.success('Frames extracted! Configure scroll triggers →', {
        description: `${frames.length} frames ready`,
        action: {
          label: 'Scroll Trigger',
          onClick: () => setActiveScreen('scrollTrigger'),
        },
      })

      // Auto-navigate to scroll trigger for effect configuration
      setTimeout(() => {
        setActiveScreen('scrollTrigger')
      }, 1500)
    } catch (err) {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
        elapsedTimerRef.current = null
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        toast.info('Extraction cancelled')
      } else if (
        err instanceof DOMException && 
        err.name === 'QuotaExceededError'
      ) {
        // Handle localStorage quota exceeded
        toast.error('Storage quota exceeded', {
          description: 'Too many sequences stored. Clear old sequences from the Archive and try again.',
          duration: 8000,
        })
      } else {
        toast.error(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        )
      }
    } finally {
      setIsExtracting(false)
      abortRef.current = null
    }
  }, [
    currentVideo,
    isExtracting,
    buildParams,
    setIsExtracting,
    setExtractedCount,
    addSequence,
    setActiveScreen,
    setLastSequenceFrameCount,
  ])

  // ── Cancel extraction ───────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }
  }, [])

  // ── Computed estimations ────────────────────────────────────────────────

  const estimatedFrames = currentVideo
    ? estimateFrameCount(samplingRate, currentVideo.duration)
    : 0
  const estimatedSize = currentVideo
    ? estimateFileSize(
        { samplingRate, quality, resizeFactor, upscaling, enhance, format },
        currentVideo.duration
      )
    : 0
  const estimatedTime = estimatedFrames * 50 // ~50ms per frame

  const progressPercent =
    progressTotal > 0 ? Math.round((progressCount / progressTotal) * 100) : 0

  const currentFormatInfo = FORMAT_OPTIONS.find((f) => f.value === format)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] pt-14">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/3 h-[400px] w-[600px] rounded-full bg-gradient-to-b from-orange-500/[0.05] via-red-500/[0.02] to-transparent blur-3xl" />

      <motion.div
        className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ════════════════════ Header ════════════════════ */}
        <motion.header variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <Film className="h-4.5 w-4.5 text-orange-400" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]">
              SEQUENCER
            </h1>
          </div>
          <p className="text-sm text-white/35 pl-12">
            Upload a video, configure extraction settings, and generate an image sequence.
          </p>
        </motion.header>

        {/* ════════════════════ Section A: Upload (no video) ════════════════════ */}
        <AnimatePresence mode="wait">
          {!currentVideo && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <VideoUploadZone onFileSelected={handleFileSelected} />
            </motion.div>
          )}

          {/* ════════════════════ Section B: Tabbed Content (video loaded) ════════════════════ */}
          {currentVideo && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Video info bar (always visible above tabs) ── */}
              <motion.div variants={itemVariants} className="mb-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/60 gap-1.5">
                    <Film className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{currentVideo.name}</span>
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/60 gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDuration(currentVideo.duration)}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/60 gap-1.5">
                    <Monitor className="h-3 w-3" />
                    {currentVideo.width}&times;{currentVideo.height}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/60 gap-1.5">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(currentVideo.size)}
                  </Badge>

                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleChangeVideo}
                      disabled={isExtracting}
                      className="h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Change Video
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* ── Tabbed panels ── */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                {/* Tab triggers */}
                <TabsList className="w-full h-auto p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl gap-1">
                  <TabsTrigger
                    value="video"
                    disabled={isExtracting}
                    className="flex-1 h-9 rounded-lg gap-2 text-xs font-medium tracking-wider uppercase data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-300 data-[state=active]:border-orange-500/30 data-[state=active]:shadow-[0_0_12px_rgba(249,115,22,0.1)] text-white/40 data-[state=active]:text-orange-300 hover:text-white/60 transition-all duration-200 border border-transparent data-[state=active]:border-orange-500/30"
                  >
                    <Film className="h-3.5 w-3.5" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    disabled={isExtracting}
                    className="flex-1 h-9 rounded-lg gap-2 text-xs font-medium tracking-wider uppercase data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-300 data-[state=active]:border-orange-500/30 data-[state=active]:shadow-[0_0_12px_rgba(249,115,22,0.1)] text-white/40 data-[state=active]:text-orange-300 hover:text-white/60 transition-all duration-200 border border-transparent data-[state=active]:border-orange-500/30"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Settings
                  </TabsTrigger>

                </TabsList>

                {/* ── Tab: Video Preview ── */}
                <TabsContent value="video" className="mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                      <video
                        src={currentVideo.url}
                        controls
                        className="w-full max-h-[60vh] object-contain"
                        playsInline
                        preload="metadata"
                      />
                    </div>

                    {/* Quick estimations below video */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-white/30">
                          <Layers className="h-3 w-3" />
                          <span className="text-[10px] uppercase tracking-wider">
                            Est. Frames
                          </span>
                        </div>
                        <p className="text-lg font-mono font-bold text-[#f0f0f0]">
                          {estimatedFrames.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-white/30">
                          <HardDrive className="h-3 w-3" />
                          <span className="text-[10px] uppercase tracking-wider">
                            Est. Size
                          </span>
                        </div>
                        <p className="text-lg font-mono font-bold text-[#f0f0f0]">
                          {formatBytes(estimatedSize)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-white/30">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] uppercase tracking-wider">
                            Est. Time
                          </span>
                        </div>
                        <p className="text-lg font-mono font-bold text-[#f0f0f0]">
                          {estimatedTime >= 60000
                            ? `${Math.ceil(estimatedTime / 60000)}m ${Math.round((estimatedTime % 60000) / 1000)}s`
                            : `${Math.ceil(estimatedTime / 1000)}s`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* ── Tab: Extraction Settings ── */}
                <TabsContent value="settings" className="mt-4">
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
                            onClick={() => handlePresetClick(preset.fps)}
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
                        onValueChange={(val) => setSamplingRate(val[0])}
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
                          onValueChange={(val) => setFormat(val as ExportFormat)}
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
                        onValueChange={(val) => setQuality(val[0])}
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
                        onValueChange={(val) => setResizeFactor(val[0])}
                        disabled={isExtracting}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-white/20">
                        <span>10%</span>
                        <span>200%</span>
                      </div>
                      <p className="text-[11px] text-white/25">
                        Output: {Math.max(1, Math.round(currentVideo.width * resizeFactor * upscaling))}&times;
                        {Math.max(1, Math.round(currentVideo.height * resizeFactor * upscaling))} px
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
                        onCheckedChange={setEnhance}
                        disabled={isExtracting}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </motion.div>
                </TabsContent>

              </Tabs>

              {/* ════════════════════ Sticky Extract Bar ════════════════════ */}
              <div className="mt-4 sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-6 pt-3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
                {!isExtracting ? (
                  <Button
                    onClick={handleExtract}
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm tracking-wider transition-all duration-200 hover:shadow-[0_0_24px_rgba(249,115,22,0.3)] active:scale-[0.98]"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    EXTRACT SEQUENCE
                  </Button>
                ) : (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.04] px-5 py-4 space-y-3">
                    <Progress
                      value={progressPercent}
                      className="h-2 bg-white/[0.06] [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                        <p className="text-sm text-white/70">
                          Frame{' '}
                          <span className="font-mono text-orange-400">{progressCount}</span>
                          {' '}of{' '}
                          <span className="font-mono text-orange-400">{progressTotal}</span>
                          <span className="text-white/30 ml-2">
                            {progressPercent}% &middot; {formatElapsed(elapsedMs)}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-7 text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
