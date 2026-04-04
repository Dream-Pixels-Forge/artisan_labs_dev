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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const glowVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

export function Sidebar() {
  const { activeScreen, setActiveScreen } = useAppStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:block"
    >
      {/* Glow layer */}
      <motion.div
        className="absolute -inset-3 rounded-full"
        animate={{
          boxShadow: [
            '0 0 30px rgba(251,146,60,0.15), 0 0 60px rgba(239,68,68,0.1)',
            '0 0 40px rgba(251,146,60,0.2), 0 0 80px rgba(239,68,68,0.15)',
            '0 0 30px rgba(251,146,60,0.15), 0 0 60px rgba(239,68,68,0.1)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251,146,60,0.08), transparent 70%)',
        }}
      />

      {/* Gradient border wrapper */}
      <motion.div
        className="relative p-[1.5px] rounded-full overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, rgba(251,146,60,0.4), rgba(239,68,68,0.3), rgba(251,191,36,0.3))',
          boxShadow: `
            0 4px 20px rgba(251,146,60,0.15),
            0 4px 20px rgba(239,68,68,0.1),
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Rotating gradient */}
        <motion.div
          className="absolute opacity-40"
          style={{
            inset: '-60%',
            background:
              'conic-gradient(from 0deg, rgba(251,146,60,0.8), rgba(239,68,68,0.6), rgba(251,191,36,0.6), rgba(251,146,60,0.8))',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner pill content */}
        <motion.div
          variants={containerVariants}
          className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-full px-1.5 py-6 flex flex-col gap-4 items-center"
        >
          {navItems.map(({ icon: Icon, label, screen, description }) => {
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
                      w-10 h-10 rounded-full
                      transition-all duration-300 cursor-pointer
                      ${isActive
                        ? 'text-white'
                        : 'text-white/35 hover:text-white/75'
                      }
                    `}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Active glow effect */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-glow"
                          variants={glowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'radial-gradient(circle, rgba(251,146,60,0.25), rgba(239,68,68,0.15), transparent)',
                            boxShadow: '0 0 20px rgba(251,146,60,0.3), inset 0 0 15px rgba(251,146,60,0.1)',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Hover glow effect */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 rounded-full bg-white/[0.05]"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active ring */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute inset-0 rounded-full border border-orange-500/30"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>

                    <Icon className="h-[17px] w-[17px] relative z-10" />
                  </motion.button>
                </TooltipTrigger>

                {/* Enhanced tooltip */}
                <TooltipContent
                  side="right"
                  sideOffset={14}
                  className="bg-[#141414]/95 border border-white/[0.08] backdrop-blur-xl p-0 overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Sparkles className="h-3 w-3 text-orange-400" />
                      )}
                      <span className="text-white text-xs font-semibold tracking-wide">
                        {label}
                      </span>
                    </div>
                    <p className="text-white/35 text-[10px] mt-0.5 font-mono">
                      {description}
                    </p>
                  </motion.div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </motion.div>
      </motion.div>
    </motion.aside>
  )
}
