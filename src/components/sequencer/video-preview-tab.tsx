'use client'

import { motion } from 'framer-motion'
import { Layers, HardDrive, Clock } from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'
import { formatBytes, formatDuration, formatElapsed } from '@/lib/shared-utils'

interface VideoPreviewTabProps {
  currentVideo: {
    duration: number
    size: number
    width: number
    height: number
    url: string
  }
  estimatedFrames: number
  estimatedSize: number
  estimatedTime: number
}

export function VideoPreviewTab({
  currentVideo,
  estimatedFrames,
  estimatedSize,
  estimatedTime,
}: VideoPreviewTabProps) {
  return (
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
            <span className="text-label uppercase tracking-wider">
              Est. Frames
            </span>
          </div>
          <p className="text-lg font-mono font-bold text-foreground">
            {estimatedFrames.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-white/30">
            <HardDrive className="h-3 w-3" />
            <span className="text-label uppercase tracking-wider">
              Est. Size
            </span>
          </div>
          <p className="text-lg font-mono font-bold text-foreground">
            {formatBytes(estimatedSize)}
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-1">
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock className="h-3 w-3" />
            <span className="text-label uppercase tracking-wider">
              Est. Time
            </span>
          </div>
          <p className="text-lg font-mono font-bold text-foreground">
            {estimatedTime >= 60000
              ? `${Math.ceil(estimatedTime / 60000)}m ${Math.round(
                  (estimatedTime % 60000) / 1000,
                )}s`
              : `${Math.ceil(estimatedTime / 1000)}s`}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
