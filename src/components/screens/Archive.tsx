'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive as ArchiveIcon,
  Trash2,
  Download,
  Eye,
  Film,
  ImageIcon,
  Clock,
  HardDrive,
  Layers,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import type { Sequence } from '@/types'
import {
  formatBytes,
  containerVariants,
  itemVariants,
  fadeInVariants,
} from '@/lib/shared-utils'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
import { getFormatBadge, timeAgo } from '@/components/archive/helpers'
import { FramePreviewDialog } from '@/components/archive/frame-preview-dialog'
import { ExportSequenceDialog } from '@/components/archive/export-dialog'

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

  const handleDownload = () => {
    onDownload(sequence)
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
            disabled={sequence.frames.length === 0}
            className="flex-1 gap-1.5 text-xs text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export
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

  // Exporter dialog state
  const [exportOpen, setExportOpen] = useState(false)
  const [exportSequence, setExportSequence] = useState<Sequence | null>(null)

  // When coming from scroll trigger, show the current sequence
  const displaySequences = useMemo(() => {
    let result = sequences

    if (currentSequence) {
      const exists = sequences.find(s => s.id === currentSequence.id)
      if (!exists) {
        result = [currentSequence, ...sequences]
      }
    }

    // Deduplicate by ID to prevent duplicate key errors
    const seen = new Set<string>()
    return result.filter((s) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
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

  const handleDownload = useCallback((sequence: Sequence) => {
    setExportSequence(sequence)
    setExportOpen(true)
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

      {/* ── Scrollytelling Export Dialog ── */}
      <ExportSequenceDialog
        key={exportSequence?.id ?? 'export-none'}
        sequence={exportSequence}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </div>
  )
}
