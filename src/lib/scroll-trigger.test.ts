/// <reference types="vitest/globals" />

/**
 * Unit tests for the scroll trigger calculation engine.
 * Pure functions — no DOM, no Next.js, runs in node.
 */

import {
  generateScrollTriggerMap,
  getFrameAtScroll,
  exportScrollTriggerJSON,
  exportScrollTriggerJS,
  exportScrollTriggerCSS,
  autoDetectScenes,
  scrollToPixels,
  SCROLL_MODE_INFO,
} from './scroll-trigger'
import type { ScrollTriggerConfig } from '@/types'

const baseConfig: ScrollTriggerConfig = {
  mode: 'linear',
  scrollDistance: 1000,
  scrollUnit: 'px',
  triggerStart: 0,
  triggerEnd: 1,
  overshootBehavior: 'clamp',
  pinElement: true,
  smoothing: 0.08,
  snapToFrame: false,
  scenes: [],
  stepHoldDuration: 100,
  manualRanges: [],
}

describe('scrollToPixels', () => {
  it('converts px 1:1', () => {
    expect(scrollToPixels(500, 'px')).toBe(500)
  })
  it('converts vh/vw with window fallback when undefined', () => {
    expect(scrollToPixels(100, 'vh')).toBe(900) // 100 * 9
    expect(scrollToPixels(100, 'vw')).toBe(1600) // 100 * 16
  })
})

const modes: Array<[string, ScrollTriggerConfig['mode']]> = [
  ['linear', 'linear'],
  ['easeIn', 'easeIn'],
  ['easeOut', 'easeOut'],
  ['easeInOut', 'easeInOut'],
  ['velocity', 'velocity'],
  ['scene', 'scene'],
  ['goldenRatio', 'goldenRatio'],
  ['stepHold', 'stepHold'],
  ['manual', 'manual'],
]

describe.each(modes)('generateScrollTriggerMap mode: %s', (_, mode) => {
  const config = { ...baseConfig, mode }
  it(`produces one event per frame for 10 frames`, () => {
    const map = generateScrollTriggerMap(10, config)
    expect(map.eventCount).toBe(10)
    expect(map.events.length).toBe(10)
    expect(map.config.mode).toBe(mode)
  })
  it('orders events by scrollPosition ascending', () => {
    const map = generateScrollTriggerMap(10, config)
    const positions = map.events.map((e) => e.scrollPosition)
    const sorted = [...positions].sort((a, b) => a - b)
    expect(positions).toEqual(sorted)
  })
  it('first event starts at 0 and last <= scrollDistancePx', () => {
    const map = generateScrollTriggerMap(10, config)
    expect(map.events[0].scrollPosition).toBe(0)
    expect(map.events[map.events.length - 1].scrollPosition).toBeLessThanOrEqual(
      map.scrollDistancePx,
    )
  })
  it('progress stays within 0..1', () => {
    const map = generateScrollTriggerMap(10, config)
    for (const e of map.events) {
      expect(e.progress).toBeGreaterThanOrEqual(0)
      expect(e.progress).toBeLessThanOrEqual(1)
    }
  })
  it('computes stats', () => {
    const map = generateScrollTriggerMap(10, config)
    expect(typeof map.stats.avgSpacing).toBe('number')
    expect(map.stats.minSpacing).toBeLessThanOrEqual(map.stats.maxSpacing)
  })
})

describe('single frame edge cases', () => {
  it('handles frameCount of 1 without division by zero', () => {
    for (const [, mode] of modes) {
      const map = generateScrollTriggerMap(1, { ...baseConfig, mode })
      expect(map.eventCount).toBe(1)
      expect(map.events[0].frameIndex).toBe(0)
    }
  })
  it('handles frameCount of 0 gracefully', () => {
    const map = generateScrollTriggerMap(0, baseConfig)
    expect(map.eventCount).toBe(0)
    expect(map.events).toEqual([])
  })
})

describe('getFrameAtScroll', () => {
  const config = { ...baseConfig, mode: 'linear' as const }
  const map = generateScrollTriggerMap(5, config)

  it('returns frame 0 before first event', () => {
    expect(getFrameAtScroll(-10, map.events, config)).toBe(0)
  })
  it('returns the last frame after last event (clamp)', () => {
    expect(getFrameAtScroll(map.scrollDistancePx + 1000, map.events, config)).toBe(
      4,
    )
  })
  it('returns the correct frame at exact event position', () => {
    expect(getFrameAtScroll(map.events[2].scrollPosition, map.events, config)).toBe(
      2,
    )
  })
  it('returns the last event when scrolling between events', () => {
    const pos = (map.events[1].scrollPosition + map.events[2].scrollPosition) / 2
    expect(getFrameAtScroll(pos, map.events, config)).toBe(1)
  })
  it('empty events returns 0', () => {
    expect(getFrameAtScroll(0, [], config)).toBe(0)
  })
})

describe('exports', () => {
  const map = generateScrollTriggerMap(3, baseConfig)

  it('exportScrollTriggerJSON produces valid JSON', () => {
    const json = exportScrollTriggerJSON(map)
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.events.length).toBe(3)
    expect(parsed.stats).toBeDefined()
  })

  it('exportScrollTriggerJS produces JS with config and events', () => {
    const js = exportScrollTriggerJS(map)
    expect(js).toContain('scrollConfig')
    expect(js).toContain('scrollEvents')
    expect(js).toContain('initScrollVideo')
  })

  it('exportScrollTriggerCSS produces CSS keyframes', () => {
    const css = exportScrollTriggerCSS(map)
    expect(css).toContain('@keyframes')
    expect(css).toContain('scrollFrameSwap')
    expect(css).toContain('animation-timeline')
  })
})

describe('SCROLL_MODE_INFO', () => {
  it('covers every mode with label, description, icon, bestFor', () => {
    for (const [, mode] of modes) {
      const info = SCROLL_MODE_INFO[mode]
      expect(info.label).toBeTruthy()
      expect(info.description).toBeTruthy()
      expect(info.icon).toBeTruthy()
      expect(info.bestFor).toBeTruthy()
    }
  })
})

describe('autoDetectScenes', () => {
  it('returns empty for too few frames', () => {
    expect(autoDetectScenes([0, 1], 2)).toEqual([])
  })
  it('detects a scene boundary on a large timestamp gap', () => {
    // Big gap between index 1 and 2 => scene break
    const scenes = autoDetectScenes([0, 1, 10, 11], 4, 0.5)
    expect(scenes.length).toBeGreaterThanOrEqual(1)
  })
})
