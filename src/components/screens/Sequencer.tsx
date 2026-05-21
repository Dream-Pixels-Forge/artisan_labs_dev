'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film,
  Play,
  Clock,
  Monitor,
  HardDrive,
  RefreshCw,
  Loader2,
  Layers,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAppStore, createSequenceId } from '@/store/app-store'
import type { ExportFormat, ExtractionParams, VideoInfo } from '@/types'
import {
  extractFrames,
  estimateFrameCount,
  estimateFileSize,
} from '@/lib/frame-extractor'
import {
  formatBytes,
  formatDuration,
  formatElapsed,
  containerVariants,
  itemVariants,
} from '@/lib/shared-utils'
import { VideoUploadZone, MAX_FILE_SIZE } from '@/components/sequencer/video-upload-zone'
import { ExtractionSettings } from '@/components/sequencer/extraction-settings'

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

  // ── Handle param changes from ExtractionSettings ─────────────────────────

  const handleParamChange = useCallback((updates: Partial<ExtractionParams>) => {
    if (updates.samplingRate !== undefined) setSamplingRate(updates.samplingRate)
    if (updates.quality !== undefined) setQuality(updates.quality)
    if (updates.resizeFactor !== undefined) setResizeFactor(updates.resizeFactor)
    if (updates.upscaling !== undefined) setUpscaling(updates.upscaling)
    if (updates.enhance !== undefined) setEnhance(updates.enhance)
    if (updates.format !== undefined) setFormat(updates.format)
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
                  <ExtractionSettings
                    params={{ samplingRate, quality, resizeFactor, upscaling, enhance, format }}
                    onParamChange={handleParamChange}
                    isExtracting={isExtracting}
                    videoWidth={currentVideo.width}
                    videoHeight={currentVideo.height}
                  />
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
