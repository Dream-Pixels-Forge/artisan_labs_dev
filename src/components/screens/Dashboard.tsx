'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useInView, type Variants } from 'framer-motion'
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
  TrendingUp,
  Eye,
  Code2,
  Layers3,
  Workflow,
  Timer,
  MessageSquare,
  Check,
  Aperture,
  Blend,
  Focus,
  Grid3X3,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Sequence } from '@/types'
import { FeedbackForm } from '@/components/feedback-form'

// ─── Animation Variants ───────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.1,
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
                ? 'radial-gradient(circle, rgba(251,146,60,0.8), rgba(251,146,60,0))'
                : p.id % 3 === 1
                ? 'radial-gradient(circle, rgba(248,113,113,0.6), rgba(248,113,113,0))'
                : 'radial-gradient(circle, rgba(251,191,36,0.5), rgba(251,191,36,0))',
          }}
          animate={{
            y: [0, -40, 0, 30, 0],
            x: [0, 20, -15, 10, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity * 0.3, p.opacity],
            scale: [1, 1.3, 0.8, 1.1, 1],
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
      progressRef.current += 0.003
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
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20"
    >
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/[0.08] to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-500/[0.08] to-transparent blur-3xl" />

      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/[0.1] border border-orange-500/[0.2]">
                <Play className="h-3 w-3 text-orange-400" />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-[#f0f0f0]">
                Live Scrollytelling Preview
              </h3>
            </div>
            <p className="text-xs text-white/40">
              Interactive scroll-to-frame mapping demonstration
            </p>
          </div>
          <button
            onClick={() => {
              setIsAutoPlaying((v) => !v)
              if (isAutoPlaying) {
                progressRef.current = scrollProgress
              }
            }}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
          >
            {isAutoPlaying ? (
              <><Pause className="h-3.5 w-3.5" /> Pause</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Play</>
            )}
          </button>
        </div>

        {/* Preview area + Scroll rail */}
        <div className="flex gap-4 sm:gap-6">
          {/* Frame preview */}
          <div
            className="flex-1 rounded-2xl overflow-hidden aspect-video relative group"
            style={{ backgroundColor: frameColors[currentFrame] }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            {/* Vignette effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-60" />

            {/* Animated scanline */}
            <motion.div
              className="absolute inset-x-0 h-[1px] bg-white/30"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
            />

            {/* Frame counter overlay */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xl rounded-xl px-3 py-1.5 text-xs font-mono text-white/80 border border-white/[0.1]">
              <span className="text-orange-400">F{String(currentFrame + 1).padStart(2, '0')}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{frameColors.length}</span>
            </div>

            {/* Progress bar overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400"
                style={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>

            {/* Center focus point */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 border-2 border-white/40 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="absolute w-1 h-1 bg-white/60 rounded-full" />
            </div>
          </div>

          {/* Scroll rail */}
          <div
            ref={containerRef}
            className="hidden sm:flex flex-col items-center gap-3 cursor-pointer py-2"
            onMouseMove={handleManualScroll}
          >
            <span className="text-[9px] font-mono text-white/30">0%</span>
            <div className="relative w-2.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden min-h-[180px] border border-white/[0.08]">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-orange-600 via-orange-500 to-red-400"
                style={{ height: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.05 }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-50" />
              </motion.div>
              {/* Scrubber dot */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-xl shadow-orange-500/30 border-2 border-orange-400"
                style={{ bottom: `calc(${scrollProgress * 100}% - 10px)` }}
                transition={{ duration: 0.05 }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-80" />
              </motion.div>
            </div>
            <span className="text-[9px] font-mono text-white/30">100%</span>
          </div>
        </div>

        {/* Filmstrip */}
        <div className="mt-5 flex gap-1.5 overflow-hidden rounded-xl p-2 bg-white/[0.03] border border-white/[0.06]">
          {frameColors.map((color, i) => (
            <motion.div
              key={i}
              className="flex-1 h-8 rounded-md transition-all duration-200"
              style={{
                backgroundColor: color,
              }}
              animate={{
                opacity: i <= currentFrame ? 1 : 0.25,
                scale: i === currentFrame ? 1.05 : 1,
                boxShadow: i === currentFrame ? '0 0 12px rgba(251,146,60,0.5)' : 'none',
              }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-white/30">
          <div className="flex items-center gap-4">
            <span>Progress: <span className="text-orange-400">{(scrollProgress * 100).toFixed(1)}%</span></span>
            <span>Frame: <span className="text-white/50">{currentFrame + 1}/{frameColors.length}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span>FPS: <span className="text-emerald-400/60">24</span></span>
            <span>Mode: <span className="text-rose-400/60">Ease In-Out</span></span>
          </div>
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
      borderColor: 'border-orange-500/30 hover:border-orange-500/50',
      screen: 'sequencer' as const,
    },
    {
      icon: Layers3,
      label: 'Extract',
      sublabel: 'Generate Frames',
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30 hover:border-amber-500/50',
      screen: 'sequencer' as const,
    },
    {
      icon: ScrollText,
      label: 'Configure',
      sublabel: 'Scroll Triggers',
      color: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/30 hover:border-rose-500/50',
      screen: 'scrollTrigger' as const,
    },
    {
      icon: Download,
      label: 'Export',
      sublabel: 'Deploy',
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
      screen: 'archive' as const,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.section variants={itemVariants} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
          <Workflow className="h-4 w-4 text-white/50" />
        </div>
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
            Workflow Pipeline
          </h2>
          <p className="text-[10px] text-white/25 font-mono">4-step scrollytelling pipeline</p>
        </div>
      </div>

      <div className="relative">
        {/* Animated connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent -translate-y-1/2 hidden sm:block" />
        
        {/* Animated progress line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 -translate-y-1/2 hidden sm:block"
          initial={{ width: '0%' }}
          animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 0 20px rgba(251,146,60,0.5)' }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, i) => {
            const StepIcon = step.icon
            const isActive = activeStep === i
            const isPast = activeStep > i

            return (
              <motion.button
                key={step.label}
                onClick={() => onNavigate(step.screen)}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative group cursor-pointer rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-500 text-left
                  bg-gradient-to-b ${step.color}
                  ${step.borderColor}
                  ${isActive ? 'ring-1 ring-white/15 shadow-xl shadow-orange-500/10' : 'shadow-lg'}
                  hover:shadow-2xl
                `}
              >
                {/* Animated border glow for active step */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -inset-px rounded-2xl opacity-40"
                      style={{
                        background: `linear-gradient(135deg, rgba(251,146,60,0.2), transparent 50%)`,
                        boxShadow: `0 0 30px rgba(251,146,60,0.2), 0 0 60px rgba(251,146,60,0.1)`,
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Corner accent */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>

                <div className="relative space-y-4">
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between">
                    <motion.span 
                      className={`text-[10px] font-mono transition-colors duration-500 ${isActive ? 'text-orange-400/60' : 'text-white/15'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </motion.span>
                    <motion.div
                      className={`p-2.5 rounded-xl transition-all duration-500 ${
                        isActive
                          ? 'bg-white/15 scale-110 shadow-lg shadow-orange-500/20'
                          : isPast
                          ? 'bg-white/[0.08]'
                          : 'bg-white/[0.04]'
                      }`}
                      animate={isActive ? { rotate: [0, 5, -5, 0] } : { rotate: 0 }}
                      transition={isActive ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : {}}
                    >
                      <StepIcon
                        className={`h-4 w-4 transition-all duration-500 ${step.iconColor} ${
                          isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-40'
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Labels */}
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold transition-colors duration-500 ${
                        isActive ? 'text-[#f0f0f0]' : 'text-white/50 group-hover:text-white/70'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-white/30">{step.sublabel}</p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400"
                        animate={isActive ? { width: ['0%', '100%'] } : { width: isPast ? '100%' : '0%' }}
                        transition={
                          isActive
                            ? { duration: 2, ease: 'easeInOut' }
                            : { duration: 0.3 }
                        }
                      />
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-[8px] text-orange-400 font-mono tracking-wider"
                      >
                        ACTIVE
                      </motion.span>
                    )}
                    {isPast && (
                      <span className="text-[8px] text-emerald-400/70 font-mono tracking-wider">DONE</span>
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
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:border-white/[0.15] hover:shadow-2xl hover:shadow-orange-500/5"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(251,146,60,0.1), transparent 50%, rgba(248,113,113,0.05))',
        }}
      />

      {/* Inner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500/[0.08] to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Mini sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 group-hover:opacity-50 transition-opacity">
          <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,30 ${sparkData
                .map((v, i) => `L${(i / (sparkData.length - 1)) * 100},${30 - v * 28}`)
                .join(' ')} L100,30 Z`}
              fill={`url(#spark-${label})`}
              className={accent?.includes('emerald') ? 'text-emerald-400' : 'text-orange-400'}
            />
            <path
              d={`M${sparkData
                .map((v, i) => `${(i / (sparkData.length - 1)) * 100},${30 - v * 28}`)
                .join(' L')}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={accent?.includes('emerald') ? 'text-emerald-400' : 'text-orange-400'}
            />
          </svg>
        </div>
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.1] transition-all duration-500 group-hover:scale-110 group-hover:border-white/[0.2] ${accent ? '' : ''}`}>
            <Icon className={`h-4 w-4 ${accent ?? 'text-white/50'}`} />
          </div>
          {sparkData && (
            <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400/60">
              <TrendingUp className="h-3 w-3" />
              <span>+{(Math.random() * 20 + 10).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-[9px] font-medium uppercase tracking-widest text-white/35">
            {label}
          </p>
          <motion.p
            className={`text-3xl font-bold tracking-tight tabular-nums bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent ${accent ?? ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.6 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-[10px] text-white/30">{subtitle}</p>}
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
      whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl transition-all duration-700 hover:border-white/[0.15] hover:shadow-2xl hover:shadow-orange-500/5"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentBg.replace('/10', '/15')}, transparent 60%)`,
        }}
      />

      {/* Hover glow effect */}
      <div
        className="absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-25"
        style={{ backgroundColor: accentBg.replace('/10', '/30') }}
      />

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full" style={{ background: `radial-gradient(circle, ${accentBg.replace('/10', '/40')}, transparent)` }} />
      </div>

      <div className="relative p-6 space-y-5">
        <div className="flex items-start justify-between">
          <motion.div
            className={`inline-flex p-3 rounded-xl ${accentBg} transition-all duration-500 group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-orange-500/10`}
          >
            <Icon className={`h-5 w-5 ${accentColor}`} />
          </motion.div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/15 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <span>0{index + 1}</span>
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-base font-semibold text-[#f0f0f0] tracking-tight group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/55 transition-colors duration-500">
            {description}
          </p>
        </div>

        {tags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[9px] font-mono tracking-wider uppercase rounded-lg bg-white/[0.05] text-white/30 border border-white/[0.06] transition-all duration-300 group-hover:bg-white/[0.08] group-hover:text-white/45 group-hover:border-white/[0.12]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-white/20 transition-all duration-500 group-hover:text-white/60 pt-2">
          <span className="flex items-center gap-1.5">
            Explore
            <ArrowRight className="h-3 w-3 transition-all duration-500 group-hover:translate-x-1.5" />
          </span>
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
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/[0.06] to-transparent blur-3xl" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/[0.1] border border-orange-500/[0.2]">
              <Activity className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-widest text-white/35">
                Live Activity
              </h3>
              <p className="text-[9px] text-white/25 font-mono">Real-time events</p>
            </div>
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
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Icon className={`h-3.5 w-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/55 leading-relaxed truncate">{activity.text}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 whitespace-nowrap mt-0.5">
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
      className="flex items-center justify-center gap-8 sm:gap-12 py-8 border-y border-white/[0.06] backdrop-blur-sm"
    >
      {capabilities.map((cap, i) => {
        const CapIcon = cap.icon
        return (
          <motion.div
            key={cap.label}
            className="group flex flex-col items-center gap-2 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/[0.12]">
              <CapIcon className="h-4 w-4 text-white/20 transition-colors group-hover:text-orange-400/60" />
            </div>
            <div className="space-y-0.5">
              <p className="text-lg sm:text-xl font-bold text-white/80 font-mono">{cap.value}</p>
              <p className="text-[8px] uppercase tracking-wider text-white/25">{cap.label}</p>
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
      className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/30"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/hero-scene.png"
          alt="Scrollytelling pipeline visualization"
          className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/50" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-orange-500/[0.08] to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-500/[0.06] to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-5 flex-1">
            <motion.div 
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-orange-500/[0.3] bg-orange-500/[0.1] backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-orange-300/80">
                Quick Start Guide
              </span>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#f0f0f0] leading-tight">
              Ready to create something{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
                extraordinary
              </span>
              ?
            </h2>

            {/* Terminal-style typing animation */}
            <motion.div 
              className="bg-black/50 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] max-w-md shadow-xl shadow-black/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="ml-2 text-[9px] font-mono text-white/20">artisan-labs-cli</span>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-sm text-white/60">
                  <span className="text-orange-400/80">{'>'}</span> {typewriterText}
                  <motion.span 
                    className="inline-block w-[2px] h-4 ml-0.5 bg-orange-400"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={() => onNavigate('sequencer')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all cursor-pointer"
            >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Upload className="h-4 w-4" />
                </motion.div>
                <span>Start Creating</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Right side - 8 mode badges */}
          <div className="hidden lg:flex flex-col gap-2 pt-1">
            {['Linear', 'Ease-In', 'Ease-Out', 'Ease In-Out', 'Velocity', 'Scene', 'Golden', 'Step'].map(
              (mode, i) => (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-500 ${
                    i === 3 
                      ? 'bg-orange-500/[0.15] border border-orange-500/[0.3]' 
                      : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${
                      i === 3 ? 'bg-orange-400' : 'bg-white/20'
                    }`}
                    animate={i === 3 ? {
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className={`text-[9px] font-mono ${i === 3 ? 'text-white/70' : 'text-white/30'}`}>
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

      {/* ── Ambient Glow Layers ── */}
      <div className="pointer-events-none absolute top-[-300px] left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-gradient-to-b from-orange-500/[0.08] via-red-500/[0.03] to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-200px] right-[-300px] h-[500px] w-[700px] rounded-full bg-gradient-to-tl from-rose-500/[0.05] via-orange-500/[0.02] to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-[-200px] h-[400px] w-[600px] rounded-full bg-gradient-to-r from-amber-500/[0.04] to-transparent blur-3xl" />

      {/* ── Floating Particles ── */}
      <FloatingParticles />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ════════════════════ Hero ════════════════════ */}
        <motion.header className="space-y-6 text-center" variants={heroTitleVariants}>
          <motion.div 
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-[10px] font-medium tracking-widest text-white/50 uppercase backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-3 w-3 text-orange-400" />
            Scrollytelling Toolkit
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#f0f0f0] leading-[1.05]">
            ARTISAN{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
              LABS
            </span>
          </h1>

          <p className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white/35 uppercase">
            Scrollytelling Sequence Optimizer
          </p>

          {/* Animated gradient line */}
          <div className="mx-auto w-64 h-[2px] overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-orange-500 via-red-400 to-orange-500"
              animate={{ x: ['-300%', '300%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              style={{ boxShadow: '0 0 20px rgba(251,146,60,0.6)' }}
            />
          </div>

          <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-white/40">
            Transform videos into optimized image sequences for stunning scroll-driven storytelling experiences.
          </p>
        </motion.header>

        {/* ════════════════════ Capability Stats ════════════════════ */}
        <CapabilityStats />

        {/* ════════════════════ System Metrics ════════════════════ */}
        <section className="space-y-5">
          <motion.div 
            className="flex items-center gap-2"
            variants={itemVariants}
          >
            <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
              <Gauge className="h-3.5 w-3.5 text-white/40" />
            </div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
              System Metrics
            </h2>
          </motion.div>

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
        <section className="space-y-5">
          <motion.div 
            className="flex items-center gap-2"
            variants={itemVariants}
          >
            <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
              <Aperture className="h-3.5 w-3.5 text-white/40" />
            </div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
              Core Capabilities
            </h2>
          </motion.div>

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
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.05] via-transparent to-red-500/[0.03]" />
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/[0.06] to-transparent blur-3xl" />
          
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/[0.1] border border-orange-500/[0.2]">
                    <MessageSquare className="h-4 w-4 text-orange-400" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#f0f0f0]">
                    Share Your Feedback
                  </h2>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Help us improve Artisan Labs! Tell us what you think, suggest features,
                  or report any issues you've encountered while using the app.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Check className="h-3.5 w-3.5 text-emerald-400/70" />
                    No account needed
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Check className="h-3.5 w-3.5 text-emerald-400/70" />
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
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.05] via-transparent to-rose-500/[0.03]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-500/[0.06] to-transparent blur-3xl" />
          
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                  <Aperture className="h-4 w-4 text-white/40" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#f0f0f0]">
                  Why Scrollytelling?
                </h2>
              </div>
              <div className="w-16 h-[2px] rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group space-y-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500"
                >
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit transition-all duration-500 group-hover:bg-orange-500/[0.1] group-hover:border-orange-500/[0.2]">
                    <item.icon className="h-4 w-4 text-orange-400/70 transition-colors group-hover:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/65 group-hover:text-white/80 transition-colors">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/35 group-hover:text-white/45 transition-colors">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.footer
          variants={itemVariants}
          className="pt-8 pb-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-orange-500/30" />
            <div className="w-2 h-2 rounded-full bg-orange-500/40" />
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-orange-500/30" />
          </div>
          <p className="text-[10px] text-white/20 font-mono tracking-[0.25em] uppercase">
            Artisan Labs &middot; Built for Creators &middot; v1.0
          </p>
        </motion.footer>
      </motion.div>
    </div>
  )
}
