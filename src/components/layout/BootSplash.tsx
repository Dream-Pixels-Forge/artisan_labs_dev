'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/app-store'

export function BootSplash() {
  const setBooting = useAppStore((s) => s.setBooting)
  const [phase, setPhase] = useState<'booting' | 'ready' | 'done'>('booting')

  // Single effect: boot → ready (1.5s) → done (2.1s total)
  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setPhase('ready')
      setBooting(false)
    }, 1500)

    const doneTimer = setTimeout(() => {
      setPhase('done')
    }, 2100)

    return () => {
      clearTimeout(readyTimer)
      clearTimeout(doneTimer)
    }
  }, [setBooting])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Subtle pulsing radial glow behind the text */}
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="w-96 h-48 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(249,115,22,0.4) 0%, rgba(220,38,38,0.2) 40%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-8">
            {/* ARTISAN LABS title */}
            <motion.h1
              className="font-display text-4xl md:text-5xl tracking-tight text-[#f0f0f0] select-none"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              ARTISAN LABS
            </motion.h1>

            {/* Animated progress bar */}
            <div className="w-64 md:w-80">
              <motion.div
                className="h-[2px] rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(249,115,22,0.3) 0%, rgba(249,115,22,1) 50%, rgba(220,38,38,0.8) 100%)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 1.2,
                  delay: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              />
            </div>

            {/* Status text */}
            <motion.p
              className="font-sans text-xs tracking-[0.25em] text-white/40 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {phase === 'booting' ? (
                'INITIALIZING...'
              ) : (
                <motion.span
                  className="text-orange-500/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  READY
                </motion.span>
              )}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
