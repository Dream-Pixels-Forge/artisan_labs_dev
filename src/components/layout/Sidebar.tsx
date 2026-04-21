'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Film, Archive, MousePointerClick, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Screen } from '@/types'
import { useState } from 'react'

const navItems: { icon: typeof LayoutDashboard; label: string; screen: Screen; description: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', screen: 'dashboard', description: 'Overview & metrics' },
  { icon: Film, label: 'Sequencer', screen: 'sequencer', description: 'Extract video frames' },
  { icon: MousePointerClick, label: 'Scroll Trigger', screen: 'scrollTrigger', description: 'Configure effects' },
  { icon: Archive, label: 'Archive', screen: 'archive', description: 'Export sequences' },
]

const containerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
    },
  },
}

const glowVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.5, opacity: 0 },
}

export function Sidebar() {
  const { activeScreen, setActiveScreen } = useAppStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block"
    >
      {/* Ambient glow layer */}
      <motion.div
        className="absolute -inset-4 rounded-2xl blur-2xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251,146,60,0.12), rgba(239,68,68,0.06), transparent 70%)',
        }}
      />

      {/* Main container with elegant border */}
      <motion.div
        className="relative p-[2px] rounded-2xl overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(145deg, rgba(251,146,60,0.4), rgba(239,68,68,0.25), rgba(251,191,36,0.2))',
          boxShadow: `
            0 8px 32px rgba(251,146,60,0.12),
            0 4px 16px rgba(239,68,68,0.08),
            inset 0 1px 0 rgba(255,255,255,0.15)
          `,
        }}
      >
        {/* Rotating single glow line */}
        <motion.div
          className="absolute"
          style={{
            inset: '-1px',
            background: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(251,146,60,1), rgba(251,191,36,0.8), transparent)',
              boxShadow: '0 0 24px rgba(251,146,60,0.8), 0 0 48px rgba(251,146,60,0.4)',
              borderRadius: '2px',
            }}
          />
        </motion.div>

        {/* Inner content */}
        <motion.div
          variants={containerVariants}
          className="relative bg-[#0a0a0a]/97 backdrop-blur-2xl rounded-2xl px-2 py-8 flex flex-col gap-5 items-center"
        >
          {/* Top accent line */}
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

          {navItems.map(({ icon: Icon, label, screen, description }, index) => {
            const isActive = activeScreen === screen
            const isHovered = hoveredItem === screen

            return (
              <Tooltip key={screen} delayDuration={0}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => setActiveScreen(screen)}
                    onMouseEnter={() => setHoveredItem(screen)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      relative flex items-center justify-center
                      w-12 h-12 rounded-xl
                      transition-all duration-300 cursor-pointer
                      ${isActive
                        ? 'text-white'
                        : 'text-white/30 hover:text-white/70'
                      }
                    `}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Active state background glow */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-glow"
                          variants={glowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(239,68,68,0.12))',
                            boxShadow: `
                              0 0 28px rgba(251,146,60,0.35),
                              inset 0 0 20px rgba(251,146,60,0.08)
                            `,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Hover state */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.06] to-transparent"
                          transition={{ duration: 0.25 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active indicator ring */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 rounded-xl border border-orange-400/35"
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      )}
                    </AnimatePresence>

                    <Icon className="h-5 w-5 relative z-10" />
                  </motion.button>
                </TooltipTrigger>

                {/* Premium tooltip */}
                <TooltipContent
                  side="right"
                  sideOffset={16}
                  className="bg-[#0f0f0f]/98 border border-orange-500/20 backdrop-blur-xl p-0 overflow-hidden shadow-2xl shadow-orange-900/10"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                        </motion.div>
                      )}
                      <span className="text-white text-[11px] font-semibold tracking-wide">
                        {label}
                      </span>
                    </div>
                    <p className="text-white/30 text-[10px] mt-1 font-medium tracking-wide">
                      {description}
                    </p>
                    {/* Bottom accent */}
                    <div className="w-full h-[1px] mt-2.5 bg-gradient-to-r from-orange-500/30 via-orange-500/15 to-transparent" />
                  </motion.div>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Bottom accent line */}
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        </motion.div>
      </motion.div>
    </motion.aside>
  )
}
