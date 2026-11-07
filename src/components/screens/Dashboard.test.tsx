'use client'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from './Dashboard'
import { useAppStore } from '@/store/app-store'

// Mock zustand store
vi.mock('@/store/app-store', () => ({
  useAppStore: vi.fn(),
}))

// Mock lucide-react icons to avoid SVG issues in jsdom
vi.mock('lucide-react', () => {
  const icons: Record<string, any> = {}
  const iconNames = [
    'Film', 'Archive', 'MousePointerClick', 'Activity', 'Layers', 'HardDrive',
    'Sparkles', 'Upload', 'ArrowRight', 'Monitor', 'Image', 'Gauge', 'Box',
    'Code2', 'Timer', 'Check', 'Aperture', 'Heart', 'Lightbulb', 'Bug',
    'Play', 'Plus', 'RefreshCw', 'SlidersHorizontal', 'Loader2', 'TrendingUp',
    'ChevronRight', 'Mail', 'PlusCircle', 'Minus', 'MailOpen', 'MessageSquare',
    'Camera', 'Video', 'Monitor', 'Settings', 'Layers', 'Send', 'Mail',
    'Send', 'User', 'User2', 'Users', 'Phone', 'Mail', 'Send', 'CheckCircle',
    'X', 'Minus', 'Plus', 'CheckCircle', 'Info', 'AlertTriangle', 'Help',
  ]
  iconNames.forEach((name) => {
    icons[name] = () => <span data-testid={`icon-${name}`} />
  })
  return icons
})

// Mock shadcn/ui components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props} data-testid="badge">
      {children}
    </span>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props} data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div {...props} data-testid="card-title">{children}</div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props} data-testid="card-content">{children}</div>
  ),
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => (
    <div {...props} data-testid="tabs">{children}</div>
  ),
  TabsList: ({ children, ...props }: any) => (
    <div {...props} data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, ...props }: any) => (
    <button {...props} data-testid="tabs-trigger">{children}</button>
  ),
  TabsContent: ({ children, ...props }: any) => (
    <div {...props} data-testid="tabs-content">{children}</div>
  ),
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div {...props} data-testid="progress" data-value={value} />
  ),
}))

describe('Dashboard', () => {
  const mockSequences = [
    {
      id: 'seq-1',
      name: 'Test Sequence 1',
      frames: [{ dataUrl: 'data:image/webp;base64,abc', timestamp: 0, frameNumber: 0 }],
      videoName: 'test.mp4',
      format: 'webp' as const,
      frameCount: 1,
      width: 1920,
      height: 1080,
      fileSize: 100000,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'seq-2',
      name: 'Test Sequence 2',
      frames: [{ dataUrl: 'data:image/webp;base64,def', timestamp: 1, frameNumber: 1 }],
      videoName: 'test2.mp4',
      format: 'webp' as const,
      frameCount: 1,
      width: 1920,
      height: 1080,
      fileSize: 200000,
      timestamp: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.mocked(useAppStore).mockImplementation((selector?: any) => {
      const store = {
        activeScreen: 'dashboard',
        setActiveScreen: vi.fn(),
        sequences: mockSequences,
        hydrateSequences: vi.fn(),
        addSequence: vi.fn(),
        removeSequence: vi.fn(),
        renameSequence: vi.fn(),
        clearSequences: vi.fn(),
        currentVideo: null,
        setCurrentVideo: vi.fn(),
        currentSequence: null,
        setCurrentSequence: vi.fn(),
        isBooting: false,
        setBooting: vi.fn(),
        sidebarOpen: false,
        setSidebarOpen: vi.fn(),
        extractedCount: 0,
        setExtractedCount: vi.fn(),
        isExtracting: false,
        setIsExtracting: vi.fn(),
        lastSequenceFrameCount: 0,
        setLastSequenceFrameCount: vi.fn(),
      }
      return selector ? selector(store) : store
    })
  })

  it('renders the dashboard without crashing', () => {
    render(<Dashboard />)
    expect(screen.getByText('ARTISAN')).toBeInTheDocument()
  })

  it('renders the hero section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Scrollytelling Sequence Optimizer')).toBeInTheDocument()
  })

  it('renders capability stats', () => {
    render(<Dashboard />)
    // Capability stats should render all 4 stat cards
    expect(screen.getByText('Scroll Modes')).toBeInTheDocument()
    expect(screen.getByText('Export Formats')).toBeInTheDocument()
    expect(screen.getByText('Output Code')).toBeInTheDocument()
    expect(screen.getByText('Real-time')).toBeInTheDocument()
  })

  it('navigates to sequencer when clicking Start Creating button', () => {
    render(<Dashboard />)
    const button = screen.getByRole('button', { name: /start creating/i })
    fireEvent.click(button)
    expect(useAppStore).toHaveBeenCalled()
  })

  it('renders feature cards', () => {
    render(<Dashboard />)
    expect(screen.getByText('Video Sequencer')).toBeInTheDocument()
    expect(screen.getByText('Scroll Triggers')).toBeInTheDocument()
    expect(screen.getByText('Archive & Export')).toBeInTheDocument()
  })

  it('renders feature cards with correct descriptions', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Upload any video file and extract precision frames/)).toBeInTheDocument()
  })

  it('renders feedback form section', () => {
    render(<Dashboard />)
    expect(screen.getByText(/help us build/i)).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<Dashboard />)
    expect(screen.getByText((content) => content.includes('Artisan Labs') && content.includes('Built for Creators'))).toBeInTheDocument()
  })
})
