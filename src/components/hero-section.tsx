'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Premium HeroSection Component
 *
 * Modern design featuring:
 * - Glassmorphism effects with backdrop blur
 * - Gradient text animations
 * - Floating particles for visual depth
 * - Smooth scroll-based transitions
 * - Responsive design with multiple breakpoints
 * - Accessibility-first implementation
 *
 * Trending 2025 UI patterns:
 * - Gradient text titles
 * - Glassmorphism cards
 * - Subtle micro-interactions
 * - Floating particle backgrounds
 * - Gradient buttons with hover effects
 */

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  secondaryCtaText?: string
  frameUrls?: string[]
  scrollDistance?: number
  className?: string
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
}

export function HeroSection({
  title = 'Elevate Your Digital Experience',
  subtitle = 'Innovative solutions crafted for modern creators and enterprises',
  ctaText = 'Get Started',
  secondaryCtaText = 'Watch Demo',
  frameUrls = [],
  scrollDistance = 3000,
  className,
  onCtaClick,
  onSecondaryCtaClick,
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const scrollYProgress = useMotionValue(0)
  const springConfig = useMemo(() => ({ damping: 30, stiffness: 100, mass: 0.5 }), [])
  const smoothScroll = useSpring(scrollYProgress, springConfig)

  // Track mount state for client-side effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track mouse position for parallax effects
  useEffect(() => {
    if (!mounted) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mounted])

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrollPercent = window.scrollY / Math.max(window.innerHeight, 1)
    scrollYProgress.set(scrollPercent)
    setScrollY(window.scrollY)
  }, [scrollYProgress])

  useEffect(() => {
    if (!mounted) return

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted, handleScroll])

  // Transform values for parallax effects
  const backgroundY = useTransform(smoothScroll, [0, 1], [0, -50])
  const scale = useTransform(smoothScroll, [0, 0.3], [1, 1.05])

  // Floating particles for visual interest
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 3,
    }))
  }, [])

  return (
    <section
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center overflow-hidden',
        'w-full bg-background text-foreground',
        className
      )}
      style={{ height: `${scrollDistance}px` }}
    >
      {/* Background Container */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: backgroundY }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-pink-900/20" />

        {/* Glass overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
      </motion.div>

      {/* Floating Particles for visual interest */}
      <AnimatePresence>
        {mounted && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none",
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -30, 0],
              x: [0, Math.sin(particle.id) * 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content Container */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-3xl px-4 py-24 text-center"
        style={{ scale }}
      >
        {/* Main heading with gradient text */}
        <motion.h1
          className="text-5xl font-bold tracking-tighter md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl lg:text-xl/6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:px-4 lg:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.button
            onClick={onCtaClick}
            className="group relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-500/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10">{ctaText}</span>

            {/* Sparkle effect on hover */}
            <motion.div
              className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-100"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Star className="h-4 w-4" />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={onSecondaryCtaClick}
            className="group relative inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-500/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
              initial={{ borderRadius: '0px' }}
              animate={{ borderRadius: '9999px' }}
            />
            <span className="relative z-10">{secondaryCtaText}</span>
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs uppercase tracking-wider text-muted-foreground/60">
            Scroll to explore
          </span>
          <motion.div
            className="flex h-6 w-6 items-center justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-2 w-2 rounded-full bg-pink-500" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Premium badge with stats */}
      <motion.div
        className="absolute bottom-8 left-8 z-10 hidden md:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <Star className="h-4 w-4 fill-current text-pink-400" />
              </motion.div>
            ))}
          </div>
          <span className="text-muted-foreground">Trusted by 10,000+ creators</span>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection