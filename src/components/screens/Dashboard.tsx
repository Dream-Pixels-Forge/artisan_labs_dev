'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, type Variants } from 'framer-motion'
import {
  Film,
  Archive,
  MousePointerClick,
  Activity,
  Layers,
  HardDrive,
  ChevronRight,
  Sparkles,
  Play,
  Upload,
  Zap,
  ArrowRight,
  ArrowDown,
  Monitor,
  Image,
  ScrollText,
  Download,
  Settings2,
  Gauge,
  Box,
  Cpu,
  Clock,
  TrendingUp,
  Eye,
  Code2,
  Layers3,
  Workflow,
  Timer,
  MessageSquare,
  Check,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Sequence } from '@/types'
import { FeedbackForm } from '@/components/feedback-form'

// ─── Animation Variants ───────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const pulseGlow = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function calcStorage(sequences: Sequence[]): number {
  return sequences.reduce((sum, seq) => sum + (seq.fileSize || 0), 0)
}

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const timeout = setTimeout(() => {
      const startTime = Date.now()
      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return count
}

// Typewriter hook
function useTypewriter(texts: string[], typingSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && displayText === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setTextIndex((prev) => (prev + 1) % texts.length)
      }, 0)
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText(
            isDeleting
              ? current.substring(0, displayText.length - 1)
              : current.substring(0, displayText.length + 1)
          )
        },
        isDeleting ? typingSpeed / 2 : typingSpeed
      )
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, textIndex, texts, typingSpeed, pauseTime])

  return displayText
}

// ─── Floating Particles ──────────────────────────────────────────────

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.3 + 0.1,
      })),
    []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? 'rgba(251,146,60,0.6)'
                : p.id % 3 === 1
                ? 'rgba(248,113,113,0.5)'
                : 'rgba(251,191,36,0.4)',
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated Status Indicator ────────────────────────────────────────

function StatusDot({ color = 'emerald' }: { color?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-400',
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
  }
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorMap[color]} opacity-75`}
      />
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${colorMap[color]}`}
      />
    </span>
  )
}

// ─── Mini Scroll Demo ─────────────────────────────────────────────────

function MiniScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const progressRef = useRef(0)

  // Generate simulated frame colors (gradient simulation)
  const frameColors = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const hue = 15 + (i / 24) * 30 // orange to red range
        const lightness = 8 + Math.sin((i / 24) * Math.PI * 2) * 6
        return `hsl(${hue}, 70%, ${lightness}%)`
      }),
    []
  )

  const currentFrame = Math.min(Math.floor(scrollProgress * (frameColors.length - 1)), frameColors.length - 1)

  // Auto-play animation
  useEffect(() => {
    if (!isAutoPlaying) return
    let animId: number
    const animate = () => {
      progressRef.current += 0.004
      if (progressRef.current > 1) progressRef.current = 0
      setScrollProgress(progressRef.current)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isAutoPlaying])

  const handleManualScroll = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = (e.clientY - rect.top) / rect.height
    const clamped = Math.max(0, Math.min(1, y))
    progressRef.current = clamped
    setScrollProgress(clamped)
    setIsAutoPlaying(false)
  }, [])

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] via-transparent to-red-500/[0.03]" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-[#f0f0f0]">
              Live Scrollytelling Demo
            </h3>
            <p className="text-xs text-white/40">
              Drag the rail or watch the auto-play simulation
            </p>
          </div>
          <button
            onClick={() => {
              setIsAutoPlaying((v) => !v)
              if (isAutoPlaying) {
                progressRef.current = scrollProgress
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            {isAutoPlaying ? (
              <><Pause className="h-3 w-3" /> Pause</>
            ) : (
              <><Play className="h-3 w-3" /> Play</>
            )}
          </button>
        </div>

        {/* Preview area + Scroll rail */}
        <div className="flex gap-4 sm:gap-6">
          {/* Frame preview */}
          <div
            className="flex-1 rounded-xl overflow-hidden aspect-video relative"
            style={{ backgroundColor: frameColors[currentFrame] }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            {/* Frame counter overlay */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-mono text-white/70">
              F{String(currentFrame + 1).padStart(2, '0')}/{frameColors.length}
            </div>

            {/* Progress bar overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>

            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-8 h-8 border border-white/50 rounded-full" />
            </div>
          </div>

          {/* Scroll rail */}
          <div
            ref={containerRef}
            className="hidden sm:flex flex-col items-center gap-2 cursor-pointer py-2"
            onMouseMove={handleManualScroll}
          >
            <span className="text-[9px] font-mono text-white/30">0%</span>
            <div className="relative w-2 flex-1 bg-white/[0.06] rounded-full overflow-hidden min-h-[160px]">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-orange-500 to-red-400"
                style={{ height: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.05 }}
              />
              {/* Scrubber dot */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-orange-500/30 border-2 border-orange-400"
                style={{ bottom: `calc(${scrollProgress * 100}% - 8px)` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            <span className="text-[9px] font-mono text-white/30">100%</span>
          </div>
        </div>

        {/* Filmstrip */}
        <div className="mt-4 flex gap-1 overflow-hidden rounded-lg">
          {frameColors.map((color, i) => (
            <div
              key={i}
              className="flex-1 h-6 sm:h-8 rounded-sm transition-all duration-100"
              style={{
                backgroundColor: color,
                opacity: i <= currentFrame ? 1 : 0.2,
                boxShadow: i === currentFrame ? '0 0 8px rgba(251,146,60,0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-6 text-[10px] font-mono text-white/30">
          <span>Progress: {(scrollProgress * 100).toFixed(1)}%</span>
          <span>Frame: {currentFrame + 1}/{frameColors.length}</span>
          <span>FPS: 24</span>
          <span>Mode: Ease In-Out</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Pause icon (small) ───────────────────────────────────────────────

function Pause({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

// ─── Workflow Pipeline ────────────────────────────────────────────────

function WorkflowPipeline({ onNavigate }: { onNavigate: (screen: 'sequencer' | 'scrollTrigger' | 'archive') => void }) {
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    {
      icon: Upload,
      label: 'Upload',
      sublabel: 'Import Video',
      color: 'from-orange-500/20 to-orange-500/5',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20 hover:border-orange-500/40',
      screen: 'sequencer' as const,
    },
    {
      icon: Layers3,
      label: 'Extract',
      sublabel: 'Generate Frames',
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
      screen: 'sequencer' as const,
    },
    {
      icon: ScrollText,
      label: 'Configure',
      sublabel: 'Scroll Triggers',
      color: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
      screen: 'scrollTrigger' as const,
    },
    {
      icon: Download,
      label: 'Export',
      sublabel: 'Deploy',
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      screen: 'archive' as const,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.section variants={itemVariants} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/[0.05]">
          <Workflow className="h-4 w-4 text-white/50" />
        </div>
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Workflow Pipeline
          </h2>
          <p className="text-[10px] text-white/20 font-mono">4-step scrollytelling pipeline</p>
        </div>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06] -translate-y-1/2 hidden sm:block" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, i) => {
            const StepIcon = step.icon
            const isActive = activeStep === i
            const isPast = activeStep > i

            return (
              <motion.button
                key={step.label}
                onClick={() => onNavigate(step.screen)}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative group cursor-pointer rounded-xl border p-4 sm:p-5 backdrop-blur-sm transition-all duration-500 text-left
                  bg-gradient-to-b ${step.color}
                  ${step.borderColor}
                  ${isActive ? 'ring-1 ring-white/10' : ''}
                `}
              >
                {/* Animated border glow for active step */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -inset-px rounded-xl opacity-30"
                      style={{
                        boxShadow: `0 0 20px rgba(251,146,60,0.15), 0 0 40px rgba(251,146,60,0.05)`,
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative space-y-3">
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div
                      className={`p-2 rounded-lg transition-all duration-500 ${
                        isActive
                          ? 'bg-white/10 scale-110'
                          : isPast
                          ? 'bg-white/[0.06]'
                          : 'bg-white/[0.04]'
                      }`}
                    >
                      <StepIcon
                        className={`h-4 w-4 transition-all duration-500 ${step.iconColor} ${
                          isActive ? 'opacity-100' : 'opacity-40'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-semibold transition-colors duration-500 ${
                        isActive ? 'text-[#f0f0f0]' : 'text-white/50'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-white/25">{step.sublabel}</p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400"
                        animate={isActive ? { width: ['0%', '100%'] } : { width: isPast ? '100%' : '0%' }}
                        transition={
                          isActive
                            ? { duration: 2.5, ease: 'easeInOut' }
                            : { duration: 0.3 }
                        }
                      />
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-[9px] text-orange-400 font-mono"
                      >
                        ACTIVE
                      </motion.span>
                    )}
                    {isPast && (
                      <span className="text-[9px] text-emerald-400/60 font-mono">DONE</span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

// ─── Animated Metric Card ─────────────────────────────────────────────

function AnimatedMetricCard({
  icon: Icon,
  label,
  value,
  accent,
  subtitle,
  delay = 0,
  sparkData,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
  subtitle?: string
  delay?: number
  sparkData?: number[]
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Mini sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 group-hover:opacity-40 transition-opacity">
          <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,30 ${sparkData
                .map((v, i) => `L${(i / (sparkData.length - 1)) * 100},${30 - v * 25}`)
                .join(' ')} L100,30 Z`}
              fill={`url(#spark-${label})`}
              className={accent?.includes('emerald') ? 'text-emerald-400' : 'text-orange-400'}
            />
            <path
              d={`M${sparkData
                .map((v, i) => `${(i / (sparkData.length - 1)) * 100},${30 - v * 25}`)
                .join(' L')}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className={accent?.includes('emerald') ? 'text-emerald-400' : 'text-orange-400'}
            />
          </svg>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/35">
            {label}
          </p>
          <motion.p
            className={`text-2xl font-bold tracking-tight tabular-nums ${accent ?? 'text-[#f0f0f0]'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-[10px] text-white/25">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-white/[0.05] text-white/30 transition-colors group-hover:text-white/50 ${accent ? '' : ''}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Feature Showcase Card ────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor,
  accentBg,
  tags,
  onClick,
  index,
}: {
  icon: React.ElementType
  title: string
  description: string
  accentColor: string
  accentBg: string
  tags?: string[]
  onClick: () => void
  index: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
    >
      {/* Hover glow */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20"
        style={{ backgroundColor: accentBg }}
      />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className={`inline-flex p-3 rounded-xl ${accentBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className={`h-5 w-5 ${accentColor}`} />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>0{index + 1}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-[#f0f0f0] tracking-tight">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-white/35 group-hover:text-white/45 transition-colors">
            {description}
          </p>
        </div>

        {tags && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded-md bg-white/[0.04] text-white/25 border border-white/[0.05]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-medium text-white/20 transition-colors group-hover:text-white/50">
          <span>Explore</span>
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Live Activity Feed ───────────────────────────────────────────────

const activityTemplates = [
  { icon: Upload, text: 'Video uploaded: {name}', color: 'text-orange-400' },
  { icon: Layers, text: 'Frame extraction started: {frames} frames', color: 'text-amber-400' },
  { icon: Layers, text: 'Extraction complete: {name}', color: 'text-emerald-400' },
  { icon: Settings2, text: 'Scroll trigger configured: {mode} mode', color: 'text-rose-400' },
  { icon: Download, text: 'Sequence exported as ZIP: {size}', color: 'text-blue-400' },
  { icon: Zap, text: 'Optimization applied: {quality} quality', color: 'text-purple-400' },
]

const videoNames = ['hero-intro.mp4', 'product-demo.webm', 'brand-story.mov', 'showcase-2024.mp4']
const modeNames = ['Ease In-Out', 'Linear', 'Velocity-Aware', 'Golden Ratio', 'Step & Hold']

function LiveActivityFeed() {
  const [activities, setActivities] = useState<
    { id: string; icon: React.ElementType; text: string; color: string; time: string }[]
  >([])

  useEffect(() => {
    const generateActivity = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
      const text = template.text
        .replace('{name}', videoNames[Math.floor(Math.random() * videoNames.length)])
        .replace('{frames}', String(Math.floor(Math.random() * 200) + 20))
        .replace('{mode}', modeNames[Math.floor(Math.random() * modeNames.length)])
        .replace('{size}', formatBytes(Math.floor(Math.random() * 50000000)))
        .replace('{quality}', `${Math.floor(Math.random() * 40) + 60}%`)

      const id = crypto.randomUUID()
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

      setActivities((prev) => [
        { id, icon: template.icon, text, color: template.color, time: timeStr },
        ...prev.slice(0, 5),
      ])
    }

    // Generate initial activities
    generateActivity()
    generateActivity()
    generateActivity()

    const interval = setInterval(generateActivity, 4000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-white/30" />
            <h3 className="text-xs font-medium uppercase tracking-widest text-white/30">
              Live Activity
            </h3>
          </div>
          <StatusDot color="emerald" />
        </div>

        <div className="space-y-0 max-h-48 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <div className="mt-0.5 p-1.5 rounded-md bg-white/[0.04]">
                    <Icon className={`h-3 w-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50 leading-relaxed truncate">{activity.text}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/15 whitespace-nowrap mt-0.5">
                    {activity.time}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Capability Stats Row ─────────────────────────────────────────────

function CapabilityStats() {
  const capabilities = [
    { label: 'Scroll Modes', value: '8', icon: Gauge },
    { label: 'Export Formats', value: '6', icon: Image },
    { label: 'Output Code', value: '∞', icon: Code2 },
    { label: 'Real-time', value: '60fps', icon: Timer },
  ]

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-center gap-6 sm:gap-10 py-6 border-y border-white/[0.04]"
    >
      {capabilities.map((cap, i) => {
        const CapIcon = cap.icon
        return (
          <motion.div
            key={cap.label}
            className="flex items-center gap-2 sm:gap-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
          >
            <CapIcon className="h-3.5 w-3.5 text-white/15" />
            <div>
              <p className="text-sm sm:text-base font-bold text-white/70 font-mono">{cap.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-white/20 hidden sm:block">{cap.label}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// ─── Hero Scene Card ──────────────────────────────────────────────────

function HeroSceneCard({ onNavigate }: { onNavigate: (screen: 'sequencer') => void }) {
  const typewriterText = useTypewriter(
    [
      'Upload your video',
      'Set frame rate to 24fps',
      'Choose WebP format',
      'Extract 120 frames',
      'Configure scroll trigger',
      'Export as ZIP',
    ],
    45,
    2500
  )

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm group"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-scene.png"
          alt="Scrollytelling pipeline visualization"
          className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/40" />
      </div>

      <div className="relative px-6 py-8 sm:px-10 sm:py-12">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Quick Start
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#f0f0f0]">
              Ready to create something{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                extraordinary
              </span>
              ?
            </h2>

            {/* Terminal-style typing animation */}
            <div className="bg-black/40 rounded-lg p-4 border border-white/[0.06] max-w-md">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[9px] font-mono text-white/20">artisan-labs</span>
              </div>
              <p className="font-mono text-sm text-white/60">
                <span className="text-orange-400/80">{'>'}</span> {typewriterText}
                <span className="animate-pulse text-orange-400">|</span>
              </p>
            </div>

            <motion.button
              onClick={() => onNavigate('sequencer')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Start Creating
            </motion.button>
          </div>

          {/* Right side - 8 mode badges */}
          <div className="hidden lg:flex flex-col gap-1.5 pt-2">
            {['Linear', 'Ease-In', 'Ease-Out', 'Ease In-Out', 'Velocity', 'Scene', 'Golden', 'Step'].map(
              (mode, i) => (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.10] transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    i === 3 ? 'bg-orange-400' : 'bg-white/20'
                  }`} />
                  <span className={`text-[10px] font-mono ${i === 3 ? 'text-white/60' : 'text-white/25'}`}>
                    {mode}
                  </span>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────

export default function Dashboard() {
  const sequences = useAppStore((s) => s.sequences)
  const setActiveScreen = useAppStore((s) => s.setActiveScreen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  const navigateTo = (screen: 'dashboard' | 'sequencer' | 'scrollTrigger' | 'archive') => {
    setActiveScreen(screen)
    setSidebarOpen(false)
  }

  const totalFrames = sequences.reduce((sum, s) => sum + s.frameCount, 0)
  const storageUsed = calcStorage(sequences)
  const animatedSequences = useAnimatedCounter(sequences.length)
  const animatedFrames = useAnimatedCounter(totalFrames)

  // Sparkline data (simulated)
  const sparkSequences = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 0.8 + 0.2), [])
  const sparkFrames = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 0.7 + 0.1), [])

  const formattedStorage = formatBytes(storageUsed)

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#f0f0f0] overflow-hidden pt-14">
      {/* ── Grain Overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── Ambient Glow ── */}
      <div className="pointer-events-none absolute top-[-200px] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-orange-500/[0.06] via-red-500/[0.02] to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-200px] h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-rose-500/[0.03] to-transparent blur-3xl" />

      {/* ── Floating Particles ── */}
      <FloatingParticles />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ════════════════════ Hero ════════════════════ */}
        <motion.header className="space-y-6 text-center" variants={heroTitleVariants}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-medium tracking-widest text-white/50 uppercase">
            <Sparkles className="h-3 w-3 text-orange-400" />
            Scrollytelling Toolkit
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#f0f0f0] leading-[1.05]">
            ARTISAN{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
              LABS
            </span>
          </h1>

          <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-white/35 uppercase">
            Scrollytelling Sequence Optimizer
          </p>

          {/* Animated gradient line */}
          <div className="mx-auto w-48 h-[2px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-500 via-red-400 to-orange-500"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            />
          </div>

          <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-white/35">
            Transform videos into optimized image sequences for stunning scroll-driven storytelling experiences.
          </p>
        </motion.header>

        {/* ════════════════════ Capability Stats ════════════════════ */}
        <CapabilityStats />

        {/* ════════════════════ System Metrics ════════════════════ */}
        <section className="space-y-4">
          <motion.h2
            variants={itemVariants}
            className="text-xs font-medium uppercase tracking-widest text-white/30"
          >
            System Metrics
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatedMetricCard
              icon={Layers}
              label="Sequences"
              value={String(animatedSequences)}
              subtitle={`${sequences.length} project${sequences.length !== 1 ? 's' : ''}`}
              delay={0}
              sparkData={sparkSequences}
            />
            <AnimatedMetricCard
              icon={Film}
              label="Frames"
              value={animatedFrames.toLocaleString()}
              subtitle="Extracted images"
              delay={100}
              sparkData={sparkFrames}
            />
            <AnimatedMetricCard
              icon={HardDrive}
              label="Storage"
              value={formattedStorage}
              subtitle="Frame data"
              delay={200}
            />
            <AnimatedMetricCard
              icon={Activity}
              label="Status"
              value="ONLINE"
              accent="text-emerald-400"
              subtitle="All systems nominal"
              delay={300}
            />
          </div>
        </section>

        {/* ════════════════════ Hero CTA ════════════════════ */}
        <HeroSceneCard onNavigate={() => navigateTo('sequencer')} />

        {/* ════════════════════ Workflow Pipeline ════════════════════ */}
        <WorkflowPipeline onNavigate={navigateTo} />

        {/* ════════════════════ Live Demo + Activity Feed ════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <MiniScrollDemo />
          </div>
          <div className="lg:col-span-2">
            <LiveActivityFeed />
          </div>
        </div>

        {/* ════════════════════ Feature Showcase ════════════════════ */}
        <section className="space-y-4">
          <motion.h2
            variants={itemVariants}
            className="text-xs font-medium uppercase tracking-widest text-white/30"
          >
            Core Capabilities
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <FeatureCard
              icon={Film}
              title="Video Sequencer"
              description="Upload any video file and extract precision frames with control over format, quality, and sampling rate. Real-time progress with cancellation support."
              accentColor="text-orange-300"
              accentBg="bg-orange-500/10"
              tags={['JPEG', 'PNG', 'WebP', 'AVIF']}
              onClick={() => navigateTo('sequencer')}
              index={0}
            />
            <FeatureCard
              icon={MousePointerClick}
              title="Scroll Triggers"
              description="8 distribution modes from Linear to Golden Ratio. Configure scroll distance, trigger zones, overshoot behavior, and smoothing with live preview."
              accentColor="text-rose-300"
              accentBg="bg-rose-500/10"
              tags={['8 Modes', 'Preview', 'Export']}
              onClick={() => navigateTo('scrollTrigger')}
              index={1}
            />
            <FeatureCard
              icon={Archive}
              title="Archive & Export"
              description="Browse sequences with thumbnail previews, inline rename, and one-click ZIP export. Numbered frames ready for any web framework or CMS."
              accentColor="text-emerald-300"
              accentBg="bg-emerald-500/10"
              tags={['ZIP', 'Preview', 'Manage']}
              onClick={() => navigateTo('archive')}
              index={2}
            />
          </div>
        </section>

        {/* ════════════════════ Feedback Form ════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] via-transparent to-red-500/[0.02]" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.05]">
                    <MessageSquare className="h-4 w-4 text-white/50" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#f0f0f0]">
                    Share Your Feedback
                  </h2>
                </div>
                <p className="text-sm text-white/35 leading-relaxed">
                  Help us improve Artisan Labs! Tell us what you think, suggest features, 
                  or report any issues you've encountered while using the app.
                </p>
                <div className="flex items-center gap-4 text-xs text-white/25">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400/60" />
                    No account needed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400/60" />
                    Quick response
                  </span>
                </div>
              </div>
              <div className="max-w-md lg:ml-auto">
                <FeedbackForm />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ════════════════════ What is Scrollytelling ════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] via-transparent to-red-500/[0.02]" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#f0f0f0]">
                Why Scrollytelling?
              </h2>
              <div className="w-12 h-[2px] rounded-full bg-gradient-to-r from-orange-500 to-red-400" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Cinematic Experiences',
                  desc: 'Map video frames to scroll position, creating immersive experiences where users control playback through natural scrolling behavior.',
                  icon: Monitor,
                },
                {
                  title: 'Zero Buffering',
                  desc: 'Pre-rendered image sequences eliminate codec issues and provide instant frame seeking — no loading spinners, no stuttering, just smooth playback.',
                  icon: Gauge,
                },
                {
                  title: 'Production Ready',
                  desc: 'Smart compression, lazy loading support, and ready-to-use integration code. Export as ZIP with numbered frames for any framework.',
                  icon: Box,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-white/[0.04] w-fit">
                    <item.icon className="h-4 w-4 text-orange-400/70" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/60">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/30">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.footer
          variants={itemVariants}
          className="pt-4 pb-8 text-center"
        >
          <p className="text-[10px] text-white/15 font-mono tracking-[0.2em] uppercase">
            Artisan Labs &middot; Built for Creators &middot; v1.0
          </p>
        </motion.footer>
      </motion.div>
    </div>
  )
}
