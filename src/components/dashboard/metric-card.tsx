'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'

// ─── Animated Counter Hook ────────────────────────────────────────────

export function useAnimatedCounter(target: number, duration = 1500, delay = 0) {
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

// ─── Animated Metric Card ─────────────────────────────────────────────

export function AnimatedMetricCard({
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
