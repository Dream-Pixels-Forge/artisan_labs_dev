'use client'

import { motion, type Variants } from 'framer-motion'
import {
  Sparkles,
  Upload,
  ArrowRight,
} from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'

interface HeroSceneCardProps {
  onNavigate: (screen: 'sequencer') => void
}

export function HeroSceneCard({ onNavigate }: HeroSceneCardProps) {
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/85 to-surface-0/50" />
      </div>

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex items-start justify-between gap-8">
          <div className="space-y-5 flex-1">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-orange-500/[0.3] bg-orange-500/[0.1] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-orange-300/80">
                Quick Start Guide
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">
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
                  <span className={`text-xs font-mono ${i === 3 ? 'text-white/70' : 'text-white/30'}`}>
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
