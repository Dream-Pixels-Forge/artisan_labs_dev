'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { MousePointerClick, Layers, ArrowRight, LayoutGrid, Settings, Eye, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import type { ScrollTriggerMap } from '@/types'
import ScrollTriggerPanel from '@/components/scroll-trigger/ScrollTriggerPanel'
import ScrollPreview from '@/components/scroll-trigger/ScrollPreview'
import { estimateFrameCount } from '@/lib/frame-extractor'

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

const TABS = [
  { value: 'modes', icon: LayoutGrid, label: 'Modes' },
  { value: 'settings', icon: Settings, label: 'Settings' },
  { value: 'preview', icon: Eye, label: 'Preview' },
] as const

type TabValue = (typeof TABS)[number]['value']

export default function ScrollTriggerScreen() {
  const {
    currentVideo,
    lastSequenceFrameCount,
    setActiveScreen,
    currentSequence,
  } = useAppStore()

  const [scrollMap, setScrollMap] = useState<ScrollTriggerMap | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('modes')

  // Get frames from current sequence for preview
  const currentFrames = currentSequence?.frames ?? []

  const handleScrollPreviewRequest = useCallback((map: ScrollTriggerMap) => {
    setScrollMap(map)
  }, [])

  const handleConfigChange = useCallback(() => {
    // no-op for standalone screen
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] pt-14 pb-24 md:pb-8">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-b from-orange-500/[0.04] via-red-500/[0.02] to-transparent blur-3xl" />

      <motion.div
        className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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

        {/* ════════════════════ Tab Bar ════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="w-full h-auto p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl flex gap-1">
            {TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2
                  h-9 rounded-lg text-xs font-medium tracking-wider uppercase
                  transition-all duration-200 cursor-pointer border
                  ${
                    activeTab === value
                      ? 'bg-orange-500/15 text-orange-300 border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.1)]'
                      : 'text-white/40 hover:text-white/60 border-transparent'
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════ Single Panel Instance (state shared across tabs) ════════════════════ */}
        <motion.div variants={itemVariants}>
          <ScrollTriggerPanel
            frameCount={frameCount}
            onConfigChange={handleConfigChange}
            onPreviewRequest={handleScrollPreviewRequest}
            disabled={false}
            activeTab={activeTab}
          />
        </motion.div>

        {/* ════════════════════ Scroll Preview (only on Preview tab) ════════════════════ */}
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ScrollPreview
              map={scrollMap}
              frames={currentFrames}
              onClose={() => {}}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
