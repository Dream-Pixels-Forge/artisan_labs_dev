'use client'

import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'

// ─── Feature Showcase Card ────────────────────────────────────────────

export function FeatureCard({
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
