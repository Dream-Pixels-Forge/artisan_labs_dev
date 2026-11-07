'use client'

import { motion } from 'framer-motion'
import { Gauge, Image, Code2, Timer } from 'lucide-react'
import { itemVariants } from '@/lib/shared-utils'

export function CapabilityStats() {
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
              <p className="text-xs font-mono uppercase tracking-widest text-white/25">{cap.label}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
