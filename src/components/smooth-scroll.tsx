'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'

interface SmoothScrollProps {
  children: React.ReactNode
  options?: {
    duration?: number
    easing?: (t: number) => number
    gestureOrientation?: 'vertical' | 'horizontal'
    gestureDirection?: 'normal' | 'reverse'
    lerp?: number
  }
}

export function SmoothScroll({ 
  children, 
  options = {} 
}: SmoothScrollProps) {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      // Skip smooth scrolling for users who prefer reduced motion
      return
    }

    // Initialize Lenis with proper options for v1.x
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing: options.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      lerp: options.lerp ?? 0.1,
    })

    lenisRef.current = lenis

    // Sync Lenis with Next.js router
    lenis.on('scroll', () => {
      // Could dispatch custom event here if needed
    })

    // Animation frame loop
    const animate = (time: number) => {
      lenis.raf(time * 1000)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      lenis.destroy()
      lenisRef.current = null
    }
  }, [pathname, options.duration, options.easing, options.lerp])

  return <>{children}</>
}

// Hook for using Lenis in components
export function useSmoothScroll() {
  return {
    // Could expose lenis methods if needed
  }
}
