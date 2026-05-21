'use client'

import { useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Film,
  Archive,
  MousePointerClick,
  Activity,
  Layers,
  HardDrive,
  Sparkles,
  Upload,
  ArrowRight,
  Monitor,
  Image,
  Gauge,
  Box,
  Code2,
  Timer,
  Check,
  Aperture,
  Heart,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Sequence } from '@/types'
import { FeedbackForm } from '@/components/feedback-form'
import { formatBytes, containerVariants, itemVariants } from '@/lib/shared-utils'
import { ScrollDrivenDemo } from '@/components/dashboard/scroll-demo'
import { AnimatedMetricCard, useAnimatedCounter } from '@/components/dashboard/metric-card'
import { FeatureCard } from '@/components/dashboard/feature-card'
import { GettingStartedGuide, OpenSourceBadge } from '@/components/dashboard/getting-started'

// ─── Animation Variants ───────────────────────────────────────────────

// Dashboard uses shared containerVariants and itemVariants from @/lib/shared-utils

const heroTitleVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────

function calcStorage(sequences: Sequence[]): number {
  return sequences.reduce((sum, seq) => sum + (seq.fileSize || 0), 0)
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
      </div>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-5 flex-1">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-orange-500/[0.3] bg-orange-500/[0.1] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-orange-300/80">
                Quick Start Guide
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#f0f0f0] leading-tight">
              Ready to create something{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
                extraordinary
              </span>
              ?
            </h2>

            <p className="text-sm text-white/40 leading-relaxed max-w-md">
              Upload a video, extract frames, configure scroll triggers, and export production-ready packages — all in your browser.
            </p>

            <button
              onClick={() => onNavigate('sequencer')}
              className="group/btn inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-97 transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Start Creating</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

          {/* Right side - 9 mode badges */}
          <div className="hidden lg:flex flex-col gap-2 pt-1">
            {['Linear', 'Ease-In', 'Ease-Out', 'Ease In-Out', 'Velocity', 'Scene', 'Golden', 'Step', 'Manual'].map(
              (mode, i) => (
                <div
                  key={mode}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                    i === 3
                      ? 'bg-orange-500/[0.15] border border-orange-500/[0.3]'
                      : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === 3 ? 'bg-orange-400' : 'bg-white/20'
                    }`}
                  />
                  <span className={`text-[9px] font-mono ${i === 3 ? 'text-white/70' : 'text-white/30'}`}>
                    {mode}
                  </span>
                </div>
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
        className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-14 sm:space-y-18"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ════════════════════ 1. Hero + CTA ════════════════════ */}
        <div className="space-y-10">
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
              Turn any video into scroll-driven visual stories. Extract frames, configure scroll triggers, and export production-ready packages — all in your browser.
            </p>
          </motion.header>

          {/* CTA card */}
          <HeroSceneCard onNavigate={() => navigateTo('sequencer')} />

          {/* Open Source badge */}
          <OpenSourceBadge />
        </div>

        {/* ════════════════════ 2. Live Scroll Demo ════════════════════ */}
        <ScrollDrivenDemo />

        {/* ════════════════════ 3. Getting Started / Metrics ════════════════════ */}
        {sequences.length === 0 ? (
          <GettingStartedGuide onNavigate={navigateTo} />
        ) : (
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
        )}

        {/* ════════════════════ 3. Feature Showcase ════════════════════ */}
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
              description="9 distribution modes from Linear to Golden Ratio. Configure scroll distance, trigger zones, overshoot behavior, and smoothing with live preview."
              accentColor="text-rose-300"
              accentBg="bg-rose-500/10"
              tags={['9 Modes', 'Preview', 'Export']}
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

        {/* ════════════════════ 4. Why Scrollytelling ════════════════════ */}
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
                  desc: 'Used by Apple, Stripe, and award-winning agencies — scroll-driven storytelling turns passive viewers into active participants who control the narrative.',
                  icon: Monitor,
                  tag: 'Industry standard',
                },
                {
                  title: 'Zero Buffering',
                  desc: 'Pre-rendered image sequences eliminate codec issues and provide instant frame seeking. No loading spinners, no stuttering — 60fps on any device.',
                  icon: Gauge,
                  tag: '60fps guaranteed',
                },
                {
                  title: 'Production Ready',
                  desc: 'Export ZIP bundles with GSAP, Framer Motion, or CSS scroll-timeline code. Responsive multi-resolution packs optimized for Core Web Vitals.',
                  icon: Box,
                  tag: '3 frameworks',
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
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit transition-all duration-500 group-hover:bg-orange-500/[0.1] group-hover:border-orange-500/[0.2]">
                      <item.icon className="h-4 w-4 text-orange-400/70 transition-colors group-hover:text-orange-400" />
                    </div>
                    <span className="text-[9px] font-mono text-white/20 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white/65 group-hover:text-white/80 transition-colors">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/35 group-hover:text-white/45 transition-colors">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ════════════════════ 5. Feedback ════════════════════ */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] via-white/[0.03] to-red-500/[0.05] backdrop-blur-xl shadow-2xl shadow-orange-500/5"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/[0.1] to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-tr from-rose-500/[0.06] to-transparent blur-3xl" />

          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[10px] font-medium tracking-widest text-orange-300 uppercase">
                  <Heart className="h-3 w-3" />
                  We listen to every message
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0]">
                  Help us build{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    what you need
                  </span>
                </h2>
                <p className="text-sm text-white/40 leading-relaxed max-w-md">
                  Your ideas shape Artisan Labs. Suggest a feature, report a bug,
                  or just tell us what you love — we read and respond to every message.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    <Check className="h-3 w-3 text-emerald-400/70" />
                    No account
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    <Check className="h-3 w-3 text-emerald-400/70" />
                    24h response
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    <Check className="h-3 w-3 text-emerald-400/70" />
                    Shapes the roadmap
                  </span>
                </div>
              </div>

              <div className="max-w-md lg:ml-auto">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/60 backdrop-blur-xl p-5 sm:p-6">
                  <FeedbackForm />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.footer
          variants={itemVariants}
          className="pt-4 pb-12 text-center"
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
