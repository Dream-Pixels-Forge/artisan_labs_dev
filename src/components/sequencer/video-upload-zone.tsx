'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Film } from 'lucide-react'
import { toast } from 'sonner'
import { formatBytes, itemVariants } from '@/lib/shared-utils'

// ─── Constants ───────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// ─── Component ──────────────────────────────────────────────────────────────

export function VideoUploadZone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
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
