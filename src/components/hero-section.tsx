'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * HeroSection - A scroll-driven hero section that uses Artisan Labs'
 * scroll-trigger configuration to animate frames as the user scrolls.
 *
 * This component consumes the output of the MCP `create_hero_section` tool
 * or can be used standalone with a scrollTriggerMap.
 *
 * Props:
 *   - frameUrls: Array of frame image URLs (ordered)
 *   - scrollDistance: Total scroll distance in pixels (default: 3000)
 *   - mode: Scroll trigger calculation mode (default: 'easeInOut')
 *   - title: Hero heading text
 *   - subtitle: Hero subtitle text
 *   - className: Additional Tailwind classes
 *
 * Example usage with MCP output:
 *   const mcpResult = await mcpCall('tools/call', {
 *     name: 'create_hero_section',
 *     arguments: { frameUrls, mode: 'easeInOut', scrollDistance: 2000 }
 *   })
 *   const { html, css, config } = JSON.parse(mcpResult.content[0].text)
 *   <HeroSection frameUrls={frameUrls} scrollDistance={2000} mode="easeInOut" />
 */

interface HeroSectionProps {
  frameUrls: string[]
  scrollDistance?: number
  mode?:
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'velocity'
    | 'scene'
    | 'goldenRatio'
    | 'stepHold'
    | 'manual'
  title?: string
  subtitle?: string
  className?: string
}

export function HeroSection({
  frameUrls,
  scrollDistance = 3000,
  mode = 'easeInOut',
  title = 'Hero Section',
  subtitle,
  className,
}: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Compute which frame should be visible based on scroll position
  useEffect(() => {
    if (frameUrls.length === 0) return

    // Simple linear mapping: scrollY / scrollDistance maps to frame index
    const progress = Math.min(1, Math.max(0, scrollY / scrollDistance))
    const index = Math.min(
      frameUrls.length - 1,
      Math.floor(progress * (frameUrls.length - 1)),
    )
    setCurrentFrameIndex(index)
  }, [scrollY, scrollDistance, frameUrls.length])

  return (
    <section
      className={[
        'relative w-full overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
      style={{ height: `${scrollDistance}px` }}
    >
      {/* Background container that stays fixed during scroll */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ height: `${scrollDistance}px` }}
      >
        {/* Frames - only one visible at a time based on scroll position */}
        {frameUrls.map((url, i) => (
          <motion.img
            key={i}
            src={url}
            alt={`Frame ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                i === currentFrameIndex ? 1 : 0,
              transition: {
                duration: 0.3,
                ease: 'easeInOut',
              },
            }}
            style={{ pointerEvents: 'none' }}
          />
        ))}
      </div>

      {/* Content overlay - stays in place while frames change behind */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {subtitle}
          </p>
        )}
        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 text-white/60 text-sm">
          <p>Scroll to reveal frames</p>
          <div className="w-1 h-4 bg-white/40 rounded-full relative overflow-hidden">
            <motion.div
              className="h-full bg-white"
              animate={{
                width: [0, currentFrameIndex / Math.max(frameUrls.length - 1, 1)],
                transition: { duration: 0.2 },
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
