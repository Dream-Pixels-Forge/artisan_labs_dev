/**
 * MCP route tests.
 *
 * These tests verify the scroll-trigger library integration that the MCP
 * server depends on, ensuring the MCP tools produce correct output.
 *
 * Run with: npx vitest run src/app/api/mcp/route.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  generateScrollTriggerMap,
  SCROLL_MODE_INFO,
} from '@/lib/scroll-trigger'

describe('MCP - scroll-trigger integration', () => {
  const baseConfig = {
    mode: 'linear' as const,
    scrollDistance: 1000,
    scrollUnit: 'px' as const,
    triggerStart: 0,
    triggerEnd: 1,
    overshootBehavior: 'clamp' as const,
    pinElement: true,
    smoothing: 0.08,
    snapToFrame: false,
    scenes: [] as never[],
    stepHoldDuration: 100,
    manualRanges: [] as never[],
  }

  it('generateScrollTriggerMap produces valid events', () => {
    const map = generateScrollTriggerMap(10, baseConfig)

    expect(map.eventCount).toBe(10)
    expect(map.events.length).toBe(10)
    expect(map.events[0].scrollPosition).toBe(0)
    expect(map.events[map.events.length - 1].scrollPosition).toBeLessThanOrEqual(
      map.scrollDistancePx,
    )
  })

  it('easeInOut mode produces different spacing than linear', () => {
    const linear = generateScrollTriggerMap(5, baseConfig)
    const ease = generateScrollTriggerMap(5, {
      ...baseConfig,
      mode: 'easeInOut',
    })

    // EaseInOut should have different spacing than linear
    expect(linear.events[1].scrollPosition).not.toBe(
      ease.events[1].scrollPosition,
    )
  })

  it('SCROLL_MODE_INFO covers all modes', () => {
    const modes = [
      'linear',
      'easeIn',
      'easeOut',
      'easeInOut',
      'velocity',
      'scene',
      'goldenRatio',
      'stepHold',
      'manual',
    ]
    for (const mode of modes) {
      expect(mode in SCROLL_MODE_INFO).toBe(true)
    }
  })

  it('all modes produce valid event counts', () => {
    const modes: Array<'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'velocity' | 'scene' | 'goldenRatio' | 'stepHold' | 'manual'> = [
      'linear',
      'easeIn',
      'easeOut',
      'easeInOut',
      'velocity',
      'scene',
      'goldenRatio',
      'stepHold',
      'manual',
    ]
    for (const mode of modes) {
      const map = generateScrollTriggerMap(10, {
        ...baseConfig,
        mode,
      })
      expect(map.eventCount).toBe(10)
      expect(map.events.length).toBe(10)
    }
  })
})
