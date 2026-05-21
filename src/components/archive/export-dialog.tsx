'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Download,
  Layers,
  HardDrive,
  Loader2,
  Code2,
  Copy,
  Check,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import type { Sequence } from '@/types'
import {
  resolveDataUrlOrBlob,
  getFrameExtension,
  generateResponsiveHTML,
  generateStandardHTML,
  generateResponsiveReadme,
  generateStandardReadme,
} from './helpers'
import {
  generateGSAPTemplate,
  generateFramerMotionTemplate,
  generateCSSTemplate,
} from '@/lib/integration-templates'
import { resizeBlob } from '@/lib/responsive-exporter'
import { formatBytes } from '@/lib/shared-utils'

export function ExportSequenceDialog({
  sequence,
  open,
  onOpenChange,
}: {
  sequence: Sequence | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState<'assets' | 'gsap' | 'framer' | 'css'>('assets')
  const [isResponsive, setIsResponsive] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [copiedType, setCopiedType] = useState<'gsap' | 'framer' | 'css' | null>(null)

  if (!sequence) return null

  const ext = getFrameExtension(sequence.format)
  const safeName = sequence.name.replace(/[^a-zA-Z0-9_-]/g, '_')
  const templateParams = {
    name: sequence.name,
    frameCount: sequence.frameCount,
    extension: ext,
    width: sequence.width,
    height: sequence.height,
  }

  let gsapCode = generateGSAPTemplate(templateParams)
  let framerCode = generateFramerMotionTemplate(templateParams)
  let cssCode = generateCSSTemplate(templateParams)

  if (!isResponsive) {
    gsapCode = gsapCode.replaceAll('/desktop/', '/frames/')
    framerCode = framerCode.replaceAll('/desktop/', '/frames/')
                           .replaceAll('/mobile/', '/frames/')
                           .replaceAll('/tablet/', '/frames/')
    cssCode = cssCode.replaceAll('/desktop/', '/frames/')
  }

  const handleCopy = (text: string, type: 'gsap' | 'framer' | 'css') => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedType(null), 2000)
  }

  const handleBuildPackage = async () => {
    if (sequence.frames.length === 0) return
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Initializing...')

    try {
      const zip = new JSZip()
      const rootFolder = zip.folder(safeName)
      if (!rootFolder) throw new Error('Failed to create ZIP root directory')

      const frames = sequence.frames
      const total = frames.length

      if (isResponsive) {
        setGenerationStatus('Creating responsive asset folders...')
        const desktopFolder = rootFolder.folder('desktop')
        const tabletFolder = rootFolder.folder('tablet')
        const mobileFolder = rootFolder.folder('mobile')

        if (!desktopFolder || !tabletFolder || !mobileFolder) {
          throw new Error('Failed to create responsive asset buckets')
        }

        for (let i = 0; i < total; i++) {
          const frame = frames[i]
          setGenerationStatus(`Resizing frame ${i + 1} of ${total}...`)

          const sourceBlob = await resolveDataUrlOrBlob(frame.dataUrl)
          const paddedNum = String(frame.frameNumber).padStart(3, '0')
          const filename = `frame-${paddedNum}.${ext}`

          const desktopBlob = await resizeBlob(sourceBlob, 1920, sequence.format, 0.82)
          desktopFolder.file(filename, desktopBlob)

          const tabletBlob = await resizeBlob(sourceBlob, 1024, sequence.format, 0.75)
          tabletFolder.file(filename, tabletBlob)

          const mobileBlob = await resizeBlob(sourceBlob, 640, sequence.format, 0.65)
          mobileFolder.file(filename, mobileBlob)

          setGenerationProgress(Math.round(((i + 1) / total) * 85))
          await new Promise((r) => setTimeout(r, 0))
        }

        setGenerationStatus('Adding HTML demo and documentation...')
        rootFolder.file('index.html', generateResponsiveHTML(sequence.name, total, ext))
        rootFolder.file('README.md', generateResponsiveReadme(sequence.name, total, ext))

      } else {
        setGenerationStatus('Copying frames...')
        const framesFolder = rootFolder.folder('frames')
        if (!framesFolder) throw new Error('Failed to create frames directory')

        for (let i = 0; i < total; i++) {
          const frame = frames[i]
          setGenerationStatus(`Copying frame ${i + 1} of ${total}...`)

          const sourceBlob = await resolveDataUrlOrBlob(frame.dataUrl)
          const paddedNum = String(frame.frameNumber).padStart(3, '0')
          framesFolder.file(`frame-${paddedNum}.${ext}`, sourceBlob)

          setGenerationProgress(Math.round(((i + 1) / total) * 85))
          await new Promise((r) => setTimeout(r, 0))
        }

        setGenerationStatus('Adding HTML demo and documentation...')
        rootFolder.file('index.html', generateStandardHTML(sequence.name, total, ext))
        rootFolder.file('README.md', generateStandardReadme(sequence.name, total, ext))
      }

      setGenerationStatus('Bundling integration code...')
      rootFolder.file('GSAPScrollytelling.tsx', gsapCode)
      rootFolder.file('FramerMotionScrollytelling.tsx', framerCode)
      rootFolder.file('scroll-timeline.css', cssCode)

      setGenerationStatus('Compressing ZIP...')
      const content = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => {
          setGenerationProgress(85 + Math.round(metadata.percent * 0.15))
        }
      )

      const url = URL.createObjectURL(content)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${safeName}_scrollytelling.zip`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      setTimeout(() => URL.revokeObjectURL(url), 5000)

      toast.success('Package downloaded!')
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(err)
      toast.error(`Export failed: ${message}`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus('')
    }
  }

  const tabs = [
    { value: 'assets', label: 'Assets Package', icon: Package },
    { value: 'gsap', label: 'GSAP', icon: Code2 },
    { value: 'framer', label: 'Framer', icon: Code2 },
    { value: 'css', label: 'CSS', icon: Code2 },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a]/98 border border-white/[0.08] text-[#f0f0f0] max-w-4xl w-[calc(100%-2rem)] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-xl">

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Code2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white/90 tracking-tight">
                Scrollytelling Developer Exporter
              </DialogTitle>
              <DialogDescription className="text-[11px] text-white/40 font-mono mt-0.5">
                {sequence.name} &middot; {sequence.frameCount} frames &middot; {sequence.width}×{sequence.height} &middot; {ext.toUpperCase()}
              </DialogDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
            {isResponsive ? 'Responsive' : 'Single-Res'}
          </Badge>
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-2 border-b border-white/[0.04] shrink-0">
            <TabsList className="bg-white/[0.03] border border-white/[0.05] p-0.5 rounded-lg h-8 gap-0.5 w-full">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 text-[11px] gap-1.5 rounded-md transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 h-7"
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-hidden min-h-0">

            {/* Assets Package Tab */}
            <TabsContent value="assets" className="h-full m-0 p-6 overflow-y-auto space-y-5 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Left: Configuration */}
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                    Export Structure
                  </h3>

                  {/* Responsive option */}
                  <button
                    onClick={() => setIsResponsive(true)}
                    disabled={isGenerating}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      isResponsive
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                        : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${isResponsive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-white/25'}`}>
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/80">Responsive Multi-Resolution</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/10">RECOMMENDED</span>
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        Desktop (1920px), Tablet (1024px), Mobile (640px). Saves up to 82% mobile bandwidth.
                      </p>
                    </div>
                  </button>

                  {/* Single-res option */}
                  <button
                    onClick={() => setIsResponsive(false)}
                    disabled={isGenerating}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                      !isResponsive
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                        : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${!isResponsive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-white/25'}`}>
                      <HardDrive className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white/80">Original Single-Resolution</span>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        Frames at original scale in a flat directory. Best for desktop-only experiences.
                      </p>
                    </div>
                  </button>

                  {/* Progress */}
                  {isGenerating && (
                    <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-white/50 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          {generationStatus}
                        </span>
                        <span className="text-emerald-400 font-bold">{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-1.5 bg-white/[0.04]" />
                    </div>
                  )}

                  {/* Build button */}
                  {!isGenerating && (
                    <Button
                      onClick={handleBuildPackage}
                      className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs tracking-wide rounded-xl gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="h-4 w-4" />
                      Build & Download Package
                    </Button>
                  )}
                </div>

                {/* Right: Package contents */}
                <div className="lg:col-span-2 space-y-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Package Contents
                  </h4>
                  <ul className="space-y-2.5 text-[11px] text-white/45">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">Frame Bundle</strong> — {isResponsive ? '3 resolution folders' : 'single folder'} with {sequence.frameCount} frames</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">HTML Demo</strong> — Working scroll-scrubbing preview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">GSAP Component</strong> — Canvas-based ScrollTrigger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">Framer Motion</strong> — useScroll + useTransform hooks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">CSS Timeline</strong> — Zero-JS scroll-timeline animation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span><strong className="text-white/60">README</strong> — Integration documentation</span>
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-white/[0.04]">
                    <p className="text-[10px] text-white/25 font-mono">
                      {formatBytes(sequence.fileSize)} source &middot; {sequence.format.toUpperCase()} format
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Code Snippet Tabs */}
            {(['gsap', 'framer', 'css'] as const).map((type) => {
              const code = type === 'gsap' ? gsapCode : type === 'framer' ? framerCode : cssCode
              const isCopied = copiedType === type
              const labels = { gsap: 'GSAP ScrollTrigger', framer: 'Framer Motion', css: 'CSS scroll-timeline' }

              return (
                <TabsContent key={type} value={type} className="h-full m-0 flex flex-col focus-visible:outline-none overflow-hidden">
                  {/* Action bar */}
                  <div className="px-6 py-2.5 shrink-0 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.005]">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono bg-white/[0.03] text-white/40 border-white/[0.06]">
                        {labels[type]}
                      </Badge>
                      <span className="text-[10px] text-white/25">
                        {isResponsive ? 'Responsive paths' : 'Standard paths'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(code, type)}
                      className="h-7 gap-1.5 text-[11px] text-white/50 hover:text-white hover:bg-white/[0.06]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Code block */}
                  <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed text-white/70 bg-[#070707]">
                    <pre className="whitespace-pre select-all">{code}</pre>
                  </div>
                </TabsContent>
              )
            })}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
