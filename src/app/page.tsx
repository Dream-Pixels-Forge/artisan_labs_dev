'use client'

import { useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BootSplash } from '@/components/layout/BootSplash'
import Dashboard from '@/components/screens/Dashboard'
import Sequencer from '@/components/screens/Sequencer'
import ScrollTriggerScreen from '@/components/screens/ScrollTriggerScreen'
import Archive from '@/components/screens/Archive'
import { useAppStore } from '@/store/app-store'

const screens = {
  dashboard: Dashboard,
  sequencer: Sequencer,
  scrollTrigger: ScrollTriggerScreen,
  archive: Archive,
} as const

export default function Home() {
  const activeScreen = useAppStore((s) => s.activeScreen)
  const isBooting = useAppStore((s) => s.isBooting)
  const setActiveScreen = useAppStore((s) => s.setActiveScreen)
  const ActiveScreenComponent = screens[activeScreen]

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger when using browser/OS shortcuts
      if (e.metaKey || e.ctrlKey) return

      // Don't trigger when focused on input elements
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'd':
        case 'D':
          setActiveScreen('dashboard')
          break
        case 's':
        case 'S':
          setActiveScreen('sequencer')
          break
        case 't':
        case 'T':
          setActiveScreen('scrollTrigger')
          break
        case 'a':
        case 'A':
          setActiveScreen('archive')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveScreen])

  return (
    <>
      <BootSplash />
      {!isBooting && (
        <>
          <TopBar />
          <main>
            <ActiveScreenComponent />
          </main>
        </>
      )}
    </>
  )
}
