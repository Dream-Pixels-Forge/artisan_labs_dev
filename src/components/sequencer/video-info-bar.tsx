'use client'

import { motion } from 'framer-motion'
import { Film, Clock, Monitor, HardDrive, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBytes, formatDuration } from '@/lib/shared-utils'
import { itemVariants } from '@/lib/shared-utils'
import type { VideoInfo } from '@/types'
import { useAppStore } from '@/store/app-store'

export function VideoInfoBar({ currentVideo }: { currentVideo: VideoInfo }) {
  const { setCurrentVideo } = useAppStore()

  const handleChangeVideo = () => {
    if (currentVideo) {
      URL.revokeObjectURL(currentVideo.url)
      setCurrentVideo(null)
    }
  }

  return (
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
            className="h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Change Video
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
