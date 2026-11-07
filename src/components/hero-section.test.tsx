import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroSection } from './hero-section'

// Mock framer-motion with proper React elements
vi.mock('framer-motion', () => {
  const React = require('react')
  const motion = {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    AnimatePresence: ({ children }: any) => children,
  }
  return {
    motion,
    AnimatePresence: motion.AnimatePresence,
    useMotionValue: () => ({ set: vi.fn() }),
    useSpring: () => ({ set: vi.fn() }),
    useTransform: () => ({ set: vi.fn() }),
  }
})

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Star: () => <span data-testid="icon-star" />,
  Check: () => <span data-testid="icon-check" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Send: () => <span data-testid="icon-send" />,
  Mail: () => <span data-testid="icon-mail" />,
  MessageSquare: () => <span data-testid="icon-message-square" />,
  Lightbulb: () => <span data-testid="icon-lightbulb" />,
  Bug: () => <span data-testid="icon-bug" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Heart: () => <span data-testid="icon-heart" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Home: () => <span data-testid="icon-home" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Refresh: () => <span data-testid="icon-refresh-2" />,
}))

// Mock zustand store
vi.mock('@/store/app-store', () => ({
  useAppStore: vi.fn(),
}))

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders with default title', () => {
    render(<HeroSection />)
    expect(screen.getByText('Elevate Your Digital Experience')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(<HeroSection title="Custom Title" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('renders with subtitle', () => {
    render(<HeroSection subtitle="Custom subtitle text" />)
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument()
  })

  it('renders primary CTA button', () => {
    render(<HeroSection />)
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('renders secondary CTA button', () => {
    render(<HeroSection />)
    expect(screen.getByText('Watch Demo')).toBeInTheDocument()
  })

  it('calls onCtaClick when primary button is clicked', () => {
    const onCtaClick = vi.fn()
    render(<HeroSection onCtaClick={onCtaClick} />)

    const primaryButton = screen.getByRole('button', { name: 'Get Started' })
    fireEvent.click(primaryButton)

    expect(onCtaClick).toHaveBeenCalled()
  })

  it('calls onSecondaryCtaClick when secondary button is clicked', () => {
    const onSecondaryCtaClick = vi.fn()
    render(<HeroSection onSecondaryCtaClick={onSecondaryCtaClick} />)

    const secondaryButton = screen.getByRole('button', { name: 'Watch Demo' })
    fireEvent.click(secondaryButton)

    expect(onSecondaryCtaClick).toHaveBeenCalled()
  })

  it('renders scroll indicator', () => {
    render(<HeroSection />)
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<HeroSection className="custom-class" />)
    // Check that the section element has the custom class
    const section = document.querySelector('.custom-class')
    expect(section).toBeInTheDocument()
  })

  it('renders with gradient text styling on title span', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading')
    // The gradient classes are on the inner span, not the h1
    const gradientSpan = heading.querySelector('span') || heading
    expect(gradientSpan.className).toContain('bg-gradient-to-r')
    expect(gradientSpan.className).toContain('bg-clip-text')
    expect(gradientSpan.className).toContain('text-transparent')
  })
})