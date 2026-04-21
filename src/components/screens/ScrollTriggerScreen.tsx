'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { MousePointerClick, Layers, ArrowRight, Settings, LayoutGrid, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import type { ScrollTriggerMap } from '@/types'
import ScrollTriggerPanel from '@/components/scroll-trigger/ScrollTriggerPanel'
import ScrollPreview from '@/components/scroll-trigger/ScrollPreview'
import { estimateFrameCount } from '@/lib/frame-extractor'
import { Button } from '@/components/ui/button'

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

// Side panel animation variants
const panelVariants: Variants = {
  closed: { x: '100%', opacity: 0, transition: { duration: 0.3 } },
  open: { x: '0%', opacity: 1, transition: { duration: 0.3 } },
}

export default function ScrollTriggerScreen() {
  const {
    currentVideo,
    lastSequenceFrameCount,
    setActiveScreen,
    currentSequence,
  } = useAppStore()

  const [scrollMap, setScrollMap] = useState<ScrollTriggerMap | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'modes' | 'settings'>('modes')

  // Get frames from current sequence for preview
  const currentFrames = currentSequence?.frames ?? []

  const handleScrollPreviewRequest = useCallback((map: ScrollTriggerMap) => {
    setScrollMap(map)
  }, [])

  const handleConfigChange = useCallback(() => {
    // no-op for standalone screen
  }, [])

  const handleOpenPanel = useCallback((mode: 'modes' | 'settings') => {
    setPanelMode(mode)
    setIsPanelOpen(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
  }, [])

  // Handle "Send to Archive" - navigate after configuring scroll triggers
  const handleSendToArchive = useCallback(() => {
    toast.success('Ready for export! →', {
      description: 'Frames configured with scroll triggers',
      action: {
        label: 'Go to Archive',
        onClick: () => setActiveScreen('archive'),
      },
    })
    setActiveScreen('archive')
  }, [setActiveScreen])

  // Determine frame count: prefer last extracted, then estimate from video, then default
  const frameCount = useMemo(() => {
    if (lastSequenceFrameCount > 0) return lastSequenceFrameCount
    if (currentVideo) {
      return estimateFrameCount(4, currentVideo.duration)
    }
    return 120
  }, [lastSequenceFrameCount, currentVideo])

  const hasVideo = !!currentVideo
  const hasExtractedFrames = lastSequenceFrameCount > 0

  // Auto-open panel on mount if no scrollMap is configured and we have a video
  useEffect(() => {
    if (!scrollMap && hasVideo) {
      // Defer to avoid cascading renders
      const id = requestAnimationFrame(() => {
        handleOpenPanel('modes')
      })
      return () => cancelAnimationFrame(id)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] pt-14 pb-24 md:pb-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-b from-orange-500/[0.04] via-red-500/[0.02] to-transparent blur-3xl" />

      <motion.div
        className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {hasVideo ? (
          <>
            {/* ════════════════════ Header ════════════════════ */}
            <motion.header variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                    <MousePointerClick className="h-4.5 w-4.5 text-orange-400" />
                  </div>
                  <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#f0f0f0]">
                    SCROLL TRIGGER
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPanel('modes')}
                    className="h-9 text-xs font-semibold tracking-wider uppercase text-white/50 hover:text-orange-400"
                    disabled={!hasVideo}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                    Modes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPanel('settings')}
                    className="h-9 text-xs font-semibold tracking-wider uppercase text-white/50 hover:text-orange-400"
                    disabled={!hasVideo}
                  >
                    <Settings className="h-3.5 w-3.5 mr-2" />
                    Settings
                  </Button>
                  <button
                    onClick={handleSendToArchive}
                    disabled={!hasExtractedFrames}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold
                      transition-all duration-200 cursor-pointer
                      ${hasExtractedFrames
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 hover:border-orange-500/50'
                        : 'bg-white/[0.03] text-white/30 border border-white/[0.08] cursor-not-allowed'}
                    `}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Send to Archive
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/35 pl-12">
                Design scroll-driven frame sequences with intelligent trigger distributions.
              </p>
            </motion.header>

            {/* ════════════════════ Context Info ════════════════════ */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-1.5 text-white/50">
                <Layers className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-mono">
                  {hasExtractedFrames ? (
                    <>
                      <span className="text-white/70">{lastSequenceFrameCount} frames</span>
                      <span className="text-white/25 ml-1">(from last extraction)</span>
                    </>
                  ) : hasVideo ? (
                    <>
                      Source: <span className="text-white/70">{currentVideo!.name}</span>
                      <span className="text-white/25 ml-1">&middot; {frameCount} estimated frames</span>
                    </>
                  ) : (
                    <span className="text-white/30">
                      No video loaded &mdash; using {frameCount} default frames
                    </span>
                  )}
                </span>
              </div>

              {hasVideo && !hasExtractedFrames && (
                <>
                  <div className="text-white/15">&middot;</div>
                  <span className="text-xs font-mono text-white/40">
                    {currentVideo!.duration.toFixed(1)}s duration
                  </span>
                </>
              )}

              {!hasVideo && (
                <button
                  onClick={() => setActiveScreen('sequencer')}
                  className="inline-flex items-center gap-1 text-xs text-orange-400/70 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Go to Sequencer
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </motion.div>

            {/* ════════════════════ Scroll Preview ════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ScrollPreview
                map={scrollMap}
                frames={currentFrames}
                onClose={() => { }}
              />
            </motion.div>
          </>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <Layers className="h-16 w-16 text-white/10 mb-6" />
            <h2 className="text-xl font-bold text-white/40 mb-2">No Video Uploaded</h2>
            <p className="text-white/25 mb-6">
              Please upload a video in the Sequencer to start creating scroll triggers.
            </p>
            <Button
              onClick={() => setActiveScreen('sequencer')}
              className="bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 hover:border-orange-500/50"
            >
              Go to Sequencer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* ════════════════════ Right Side Panel ════════════════════ */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/[0.08] shadow-lg p-6 overflow-y-auto"
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-[#f0f0f0] capitalize">
                {panelMode}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClosePanel}
                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.08]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="pt-6">
              <ScrollTriggerPanel
                frameCount={frameCount}
                frameTimestamps={currentVideo?.frameTimestamps}
                onConfigChange={handleConfigChange}
                onPreviewRequest={handleScrollPreviewRequest}
                disabled={false} // Adjust disabled logic if needed

              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
