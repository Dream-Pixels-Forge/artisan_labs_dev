'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Archive as ArchiveIcon,
  Trash2,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Film,
  ImageIcon,
  Clock,
  HardDrive,
  Layers,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { useAppStore } from '@/store/app-store'
import type { Sequence, ExportFormat, FrameData } from '@/types'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ─── Animation Variants ───────────────────────────────────────────────

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

const fadeInVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

// ─── Helper Functions ─────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds} seconds ago`
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFormatBadge(format: ExportFormat): { label: string; className: string } {
  switch (format) {
    case 'webp':
      return { label: 'WebP', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' }
    case 'png':
      return { label: 'PNG', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' }
    case 'jpeg':
      return { label: 'JPEG', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
    case 'bmp':
      return { label: 'BMP', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20' }
    case 'tiff':
      return { label: 'TIFF', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' }
    case 'avif':
      return { label: 'AVIF', className: 'bg-orange-500/15 text-orange-400 border-orange-500/20' }
  }
}

function getFrameExtension(format: ExportFormat): string {
  if (format === 'jpeg') return 'jpg'
  return format
}

// ─── Sub-components ───────────────────────────────────────────────────

function EmptyState({ onGoToSequencer }: { onGoToSequencer: () => void }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6"
    >
      <div className="relative">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <ArchiveIcon className="h-12 w-12 text-white/20" />
        </div>
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/[0.02] to-transparent blur-xl pointer-events-none" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl tracking-tight text-white/60">
          No Sequences Yet
        </h2>
        <p className="max-w-sm text-sm text-white/30 leading-relaxed">
          Extract frames from a video in the Sequencer to see them here.
        </p>
      </div>

      <Button
        onClick={onGoToSequencer}
        className="gap-2 bg-white/[0.08] border border-white/[0.12] text-white/80 hover:bg-white/[0.12] hover:text-white hover:border-white/20"
      >
        <Film className="h-4 w-4" />
        Go to Sequencer
      </Button>
    </motion.div>
  )
}

// ─── Sequence Card ────────────────────────────────────────────────────

function SequenceCard({
  sequence,
  index,
  onPreview,
  onDownload,
  onDelete,
  onRename,
}: {
  sequence: Sequence
  index: number
  onPreview: (seq: Sequence) => void
  onDownload: (seq: Sequence) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(sequence.name)
  const [isDownloading, setIsDownloading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setEditValue(sequence.name)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== sequence.name) {
      onRename(sequence.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditValue(sequence.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') handleCancelEdit()
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload(sequence)
    } finally {
      setIsDownloading(false)
    }
  }

  const formatBadge = getFormatBadge(sequence.format)
  const thumbnail = sequence.frames[0]?.dataUrl

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-colors hover:border-white/[0.15] hover:bg-white/[0.05]"
    >
      {/* ── Thumbnail ── */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gradient-to-br from-white/[0.05] to-white/[0.01]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={sequence.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <ImageIcon className="h-10 w-10 text-white/10" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        {/* Frame count badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-black/60 text-white/80 border-white/10 text-[10px] backdrop-blur-sm">
            {sequence.frameCount} frames
          </Badge>
        </div>
      </div>

      {/* ── Info Section ── */}
      <div className="p-4 space-y-3">
        {/* Editable Name */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                className="h-7 text-sm bg-white/[0.06] border-white/[0.1] text-[#f0f0f0]"
                maxLength={64}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveEdit}
                className="h-7 w-7 shrink-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-7 w-7 shrink-0 text-white/40 hover:text-white/60 hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 text-left group/name min-w-0 flex-1"
            >
              <h3 className="truncate text-sm font-semibold text-[#f0f0f0] tracking-tight">
                {sequence.name}
              </h3>
              <Pencil className="h-3 w-3 shrink-0 text-white/20 transition-colors group-hover/name:text-white/50" />
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${formatBadge.className}`}
          >
            {formatBadge.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <Layers className="h-3 w-3" />
            <span>{sequence.width}×{sequence.height}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <HardDrive className="h-3 w-3" />
            <span>{formatBytes(sequence.fileSize)}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/20">
          <Clock className="h-3 w-3" />
          <span>{timeAgo(sequence.timestamp)}</span>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(sequence)}
            className="flex-1 gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.08]"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            disabled={isDownloading || sequence.frames.length === 0}
            className="flex-1 gap-1.5 text-xs text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            ZIP
          </Button>

          <DeleteSequenceButton onDelete={() => onDelete(sequence.id)} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Delete Button with Confirmation ──────────────────────────────────

function DeleteSequenceButton({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-white/30 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#141414] border-white/[0.08] text-[#f0f0f0]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sequence</AlertDialogTitle>
          <AlertDialogDescription className="text-white/40">
            This will permanently remove this sequence and all its frames. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/[0.05] border-white/[0.1] text-white/60 hover:bg-white/[0.1] hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-500/80 text-white hover:bg-red-500 border-0"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Clear All Button ─────────────────────────────────────────────────

function ClearAllButton({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-white/30 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#141414] border-white/[0.08] text-[#f0f0f0]">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Sequences</AlertDialogTitle>
          <AlertDialogDescription className="text-white/40">
            This will permanently delete all {count} {count === 1 ? 'sequence' : 'sequences'} and their frame data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/[0.05] border-white/[0.1] text-white/60 hover:bg-white/[0.1] hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onClear}
            className="bg-red-500/80 text-white hover:bg-red-500 border-0"
          >
            Clear All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Frame Preview Dialog ─────────────────────────────────────────────

function FramePreviewDialog({
  sequence,
  open,
  onOpenChange,
}: {
  sequence: Sequence | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const filmstripRef = useRef<HTMLDivElement>(null)
  const MAX_VISIBLE = 100
  const visibleFrames = sequence ? sequence.frames.slice(0, MAX_VISIBLE) : []

  // Keyboard navigation
  useEffect(() => {
    if (!open || !sequence) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, visibleFrames.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, sequence, visibleFrames.length])

  // Scroll filmstrip to active frame
  useEffect(() => {
    if (!filmstripRef.current || !sequence) return
    const activeThumb = filmstripRef.current.children[selectedIndex] as HTMLElement | undefined
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedIndex, sequence])

  if (!sequence) return null

  const currentFrame = visibleFrames[selectedIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-white/[0.08] text-[#f0f0f0] max-w-5xl w-[calc(100%-2rem)] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {sequence.name}
              </DialogTitle>
              <DialogDescription className="text-white/30">
                {sequence.frameCount} frames &middot; {sequence.width}×{sequence.height} &middot; {getFormatBadge(sequence.format).label}
              </DialogDescription>
            </div>
            {sequence.frames.length > MAX_VISIBLE && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                Showing first {MAX_VISIBLE} of {sequence.frames.length} frames
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ── Frame Counter ── */}
        <div className="px-6 pb-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-white/40">
            <span>Frame {selectedIndex + 1} of {visibleFrames.length}</span>
            <span className="text-white/20">Use arrow keys to navigate</span>
          </div>
        </div>

        {/* ── Main Frame Display ── */}
        <div className="flex-1 flex items-center justify-center px-6 min-h-0">
          <div className="relative w-full h-full flex items-center justify-center bg-white/[0.02] rounded-lg overflow-hidden">
            {currentFrame ? (
              <img
                src={currentFrame.dataUrl}
                alt={`Frame ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/20 text-sm">No frame data</div>
            )}

            {/* Nav arrows */}
            {visibleFrames.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={selectedIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.min(prev + 1, visibleFrames.length - 1))}
                  disabled={selectedIndex === visibleFrames.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Filmstrip ── */}
        <div className="shrink-0 border-t border-white/[0.06] pt-3 pb-4 px-4">
          <div
            ref={filmstripRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          >
            {visibleFrames.map((frame, idx) => (
              <button
                key={frame.frameNumber}
                onClick={() => setSelectedIndex(idx)}
                className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? 'border-orange-400/80 ring-1 ring-orange-400/30 scale-105'
                    : 'border-white/[0.08] hover:border-white/30 opacity-60 hover:opacity-90'
                }`}
              >
                <img
                  src={frame.dataUrl}
                  alt={`Frame ${frame.frameNumber}`}
                  className="h-14 w-auto object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Archive Screen ──────────────────────────────────────────────

export default function Archive() {
  const sequences = useAppStore((s) => s.sequences)
  const removeSequence = useAppStore((s) => s.removeSequence)
  const renameSequence = useAppStore((s) => s.renameSequence)
  const clearSequences = useAppStore((s) => s.clearSequences)
  const setActiveScreen = useAppStore((s) => s.setActiveScreen)
  const currentSequence = useAppStore((s) => s.currentSequence)

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSequence, setPreviewSequence] = useState<Sequence | null>(null)

  // When coming from scroll trigger, show the current sequence
  const displaySequences = useMemo(() => {
    if (currentSequence) {
      // Check if current sequence is already in the list
      const exists = sequences.find(s => s.id === currentSequence.id)
      if (!exists) {
        return [currentSequence, ...sequences]
      }
    }
    return sequences
  }, [sequences, currentSequence])

  const handlePreview = useCallback((seq: Sequence) => {
    setPreviewSequence(seq)
    setPreviewOpen(true)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      removeSequence(id)
      toast.success('Sequence deleted')
    },
    [removeSequence]
  )

  const handleClearAll = useCallback(() => {
    clearSequences()
    toast.success('All sequences cleared')
  }, [clearSequences])

  const handleDownload = useCallback(async (sequence: Sequence) => {
    if (sequence.frames.length === 0) return

    const ext = getFrameExtension(sequence.format)
    const toastId = toast.loading(`Preparing "${sequence.name}" for download...`)

    try {
      const zip = new JSZip()
      const folder = zip.folder(sequence.name.replace(/[^a-zA-Z0-9_-]/g, '_'))

      const frames = sequence.frames
      const total = frames.length

      for (let i = 0; i < total; i++) {
        const frame = frames[i]
        const blob = dataUrlToBlob(frame.dataUrl)
        const paddedNum = String(frame.frameNumber).padStart(3, '0')
        const filename = `frame-${paddedNum}.${ext}`

        if (folder) {
          folder.file(filename, blob)
        } else {
          zip.file(filename, blob)
        }

        // Update progress every 10 frames
        if (i % 10 === 0 || i === total - 1) {
          const pct = Math.round(((i + 1) / total) * 100)
          toast.loading(`Compressing "${sequence.name}"... ${pct}%`, {
            id: toastId,
          })
          // Yield to UI thread
          await new Promise((r) => setTimeout(r, 0))
        }
      }

      toast.loading(`Generating ZIP for "${sequence.name}"...`, { id: toastId })

      const content = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => {
          toast.loading(`Compressing "${sequence.name}"... ${Math.round(metadata.percent)}%`, {
            id: toastId,
          })
        }
      )

      // Trigger download
      const url = URL.createObjectURL(content)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${sequence.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)

      // Cleanup blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 5000)

      toast.success(`"${sequence.name}" downloaded successfully!`, { id: toastId })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error(`Failed to download "${sequence.name}"`, { id: toastId })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] pt-14 pb-24 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <AnimatePresence mode="wait">
          {sequences.length === 0 ? (
            <EmptyState key="empty" onGoToSequencer={() => setActiveScreen('sequencer')} />
          ) : (
            <motion.div
              key="archive-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* ════════════════════ Archive Header ════════════════════ */}
              <motion.div
                variants={itemVariants}
                className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05]">
                      <ArchiveIcon className="h-5 w-5 text-white/50" />
                    </div>
                    <h1 className="font-display text-xl tracking-tight text-white/80 font-semibold">
                      ARCHIVE
                    </h1>
                  </div>
                  <p className="text-sm text-white/30 ml-11">
                    Manage and export your extracted sequences
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono text-white/40">
                      {displaySequences.length} {displaySequences.length === 1 ? 'sequence' : 'sequences'}
                    </span>
                    <ClearAllButton count={displaySequences.length} onClear={handleClearAll} />
                  </div>
                </div>
              </motion.div>

              <Separator className="bg-white/[0.06]" />

              {/* ════════════════════ Sequences Grid ════════════════════ */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
              >
                <AnimatePresence>
                  {displaySequences.map((seq, idx) => (
                    <SequenceCard
                      key={seq.id}
                      sequence={seq}
                      index={idx}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onRename={renameSequence}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Frame Preview Dialog ── */}
      <FramePreviewDialog
        key={previewSequence?.id ?? 'none'}
        sequence={previewSequence}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
