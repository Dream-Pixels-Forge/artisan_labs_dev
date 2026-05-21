'use client'

import { motion } from 'framer-motion'
import { Upload, MousePointerClick, Download, ChevronRight, Sparkles, Code2, ArrowRight } from 'lucide-react'
import { containerVariants, itemVariants } from '@/lib/shared-utils'

// ─── Social Proof Bar ─────────────────────────────────────────────────

export function OpenSourceBadge() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex justify-center"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium tracking-wide text-white/40 backdrop-blur-sm">
        <Code2 className="h-3 w-3 text-orange-400/60" />
        Open Source &middot; Apache 2.0
      </div>
    </motion.div>
  )
}

// ─── Getting Started Guide ────────────────────────────────────────────

export function GettingStartedGuide({ onNavigate }: { onNavigate: (screen: 'sequencer' | 'scrollTrigger' | 'archive') => void }) {
  const steps = [
    {
      icon: Upload,
      title: 'Upload a Video',
      desc: 'Drop any video file to extract frames. Supports MP4, WebM, MOV, and more.',
      screen: 'sequencer' as const,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      glow: 'from-orange-500/[0.06]',
    },
    {
      icon: MousePointerClick,
      title: 'Configure Scroll Trigger',
      desc: 'Choose from 9 distribution modes and preview how frames map to scroll.',
      screen: 'scrollTrigger' as const,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'from-rose-500/[0.06]',
    },
    {
      icon: Download,
      title: 'Export & Deploy',
      desc: 'Download a ZIP with frames, HTML demo, and ready-to-use React components.',
      screen: 'archive' as const,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'from-emerald-500/[0.06]',
    },
  ]

  return (
    <motion.section variants={itemVariants} className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
          <Sparkles className="h-3.5 w-3.5 text-orange-400/60" />
        </div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-white/30">
          Getting Started
        </h2>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Connecting line (desktop) */}
        <div className="absolute top-1/2 left-[16.67%] right-[16.67%] h-[1px] bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-emerald-500/20 -translate-y-1/2 hidden sm:block" />

        {steps.map((step, i) => (
          <motion.button
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(step.screen)}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 text-left backdrop-blur-xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06] hover:shadow-xl"
          >
            {/* Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${step.glow} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            {/* Step number */}
            <div className="absolute top-4 right-4 text-[48px] font-bold text-white/[0.03] leading-none select-none">
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Connecting arrow (mobile) */}
            {i < steps.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 sm:hidden z-10">
                <ChevronRight className="h-4 w-4 text-white/15 rotate-90" />
              </div>
            )}

            <div className="relative space-y-4">
              {/* Icon + Step label */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex p-3 rounded-xl ${step.bg} border ${step.border} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white/80 tracking-tight group-hover:text-white/90 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/45 transition-colors">
                  {step.desc}
                </p>
              </div>

              {/* CTA row */}
              <div className="flex items-center gap-1.5 text-[10px] text-white/20 group-hover:text-orange-400/70 transition-colors pt-1">
                <span>Get started</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}
