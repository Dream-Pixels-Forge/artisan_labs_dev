'use client'

import { useEffect, useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/layout/Sidebar'

export function TopBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 sm:px-6 bg-black/80 backdrop-blur-xl border-b border-white/5">
        {/* Left: App name */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-orange-400" />
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              ARTISAN LABS
            </span>
          </div>
        </div>

        {/* Right: Current time */}
        <div className="font-mono text-xs text-white/40 tracking-wider">
          {time}
        </div>
      </header>

      {/* Desktop floating sidebar */}
      <Sidebar />

      {/* Mobile floating bottom nav */}
      <MobileBottomNav />
    </>
  )
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { LayoutDashboard, Film, Archive, MousePointerClick } from 'lucide-react'
import type { Screen } from '@/types'

const mobileNavItems: { icon: typeof LayoutDashboard; label: string; screen: Screen }[] = [
  { icon: LayoutDashboard, label: 'Home', screen: 'dashboard' },
  { icon: Film, label: 'Sequence', screen: 'sequencer' },
  { icon: MousePointerClick, label: 'Trigger', screen: 'scrollTrigger' },
  { icon: Archive, label: 'Archive', screen: 'archive' },
]

function MobileBottomNav() {
  const { activeScreen, setActiveScreen } = useAppStore()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      {/* Glow layer */}
      <div
        className="absolute -inset-3 rounded-full opacity-60 blur-xl animate-pulse"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(59,130,246,0.3), rgba(239,68,68,0.3), rgba(234,179,8,0.3), rgba(59,130,246,0.3))',
          animationDuration: '4s',
        }}
      />

      {/* Gradient border wrapper */}
      <div
        className="relative p-[1.5px] rounded-full overflow-hidden"
        style={{
          boxShadow: `
            0 0 15px rgba(59,130,246,0.25),
            0 0 15px rgba(239,68,68,0.25),
            0 0 15px rgba(234,179,8,0.25),
            inset 0 0 15px rgba(59,130,246,0.1),
            inset 0 0 15px rgba(239,68,68,0.1),
            inset 0 0 15px rgba(234,179,8,0.1)
          `,
        }}
      >
        {/* Rotating gradient */}
        <motion.div
          className="absolute"
          style={{
            inset: '-80%',
            background:
              'conic-gradient(from 0deg, #3B82F6, #EF4444, #EAB308, #3B82F6)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner pill content */}
        <div className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-full px-2 py-1.5 flex items-center gap-1">
          {mobileNavItems.map(({ icon: Icon, label, screen }) => {
            const isActive = activeScreen === screen

            return (
              <button
                key={screen}
                onClick={() => setActiveScreen(screen)}
                className={`
                  relative flex items-center justify-center gap-1.5
                  h-10 px-4 rounded-full
                  transition-all duration-300 cursor-pointer
                  ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active-glow"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(59,130,246,0.15), rgba(239,68,68,0.1), transparent)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <Icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10 text-[10px] font-mono tracking-wide whitespace-nowrap">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
