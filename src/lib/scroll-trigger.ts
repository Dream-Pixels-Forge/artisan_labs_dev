// =============================================================================
// Artisan Labs — Scroll Trigger Event Calculation Engine
// =============================================================================
// Smart algorithms for mapping extracted frames to scroll-based trigger events.
// Supports multiple calculation modes for different scrollytelling needs.
// =============================================================================

import type {
  ScrollTriggerConfig,
  ScrollTriggerEvent,
  ScrollTriggerMap,
  ScrollTriggerStats,
  SceneBreakpoint,
  ManualFrameRange,
} from '@/types'

// ─── Easing Functions ────────────────────────────────────────────────────────

function easeInQuad(t: number): number {
  return t * t
}

function easeOutQuad(t: number): number {
  return t * (2 - t)
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

// ─── Golden Ratio Helpers ───────────────────────────────────────────────────

function fibonacciSequence(n: number): number[] {
  const fibs = [1, 1]
  for (let i = 2; i < n; i++) {
    fibs.push(fibs[i - 1] + fibs[i - 2])
  }
  return fibs
}

// ─── Statistics ─────────────────────────────────────────────────────────────

function computeStats(events: ScrollTriggerEvent[], scrollDistancePx: number): ScrollTriggerStats {
  if (events.length < 2) {
    return {
      minSpacing: 0,
      maxSpacing: 0,
      avgSpacing: 0,
      stdDevSpacing: 0,
      maxDensity: 0,
      minDensity: 0,
    }
  }

  const spacings: number[] = []
  for (let i = 1; i < events.length; i++) {
    spacings.push(events[i].scrollPosition - events[i - 1].scrollPosition)
  }

  const minSpacing = Math.min(...spacings)
  const maxSpacing = Math.max(...spacings)
  const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length

  const variance =
    spacings.reduce((sum, s) => sum + Math.pow(s - avgSpacing, 2), 0) / spacings.length
  const stdDevSpacing = Math.sqrt(variance)

  // Density = frames per 100px
  const densityWindow = 100
  const minDensity = densityWindow / maxSpacing
  const maxDensity = densityWindow / minSpacing

  return {
    minSpacing: Math.round(minSpacing * 10) / 10,
    maxSpacing: Math.round(maxSpacing * 10) / 10,
    avgSpacing: Math.round(avgSpacing * 10) / 10,
    stdDevSpacing: Math.round(stdDevSpacing * 10) / 10,
    maxDensity: Math.round(maxDensity * 100) / 100,
    minDensity: Math.round(minDensity * 100) / 100,
  }
}

// ─── Convert Scroll Distance to Pixels ──────────────────────────────────────

export function scrollToPixels(distance: number, unit: string): number {
  if (typeof window === 'undefined') {
    // Server-side fallback
    switch (unit) {
      case 'vh': return distance * 9 // approximate
      case 'vw': return distance * 16 // approximate
      default: return distance
    }
  }
  switch (unit) {
    case 'vh': return distance * (window.innerHeight / 100)
    case 'vw': return distance * (window.innerWidth / 100)
    default: return distance
  }
}

// ─── Mode: Linear ──────────────────────────────────────────────────────────

function generateLinear(
  frameCount: number,
  scrollDistancePx: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []
  const spacing = scrollDistancePx / Math.max(1, frameCount - 1)

  for (let i = 0; i < frameCount; i++) {
    const progress = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    events.push({
      scrollPosition: Math.round(i * spacing * 10) / 10,
      frameIndex: i,
      progress: Math.round(progress * 10000) / 10000,
    })
  }

  return events
}

// ─── Mode: Ease-In ─────────────────────────────────────────────────────────

function generateEaseIn(
  frameCount: number,
  scrollDistancePx: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []

  for (let i = 0; i < frameCount; i++) {
    const t = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    const eased = easeInQuad(t)
    events.push({
      scrollPosition: Math.round(eased * scrollDistancePx * 10) / 10,
      frameIndex: i,
      progress: Math.round(t * 10000) / 10000,
    })
  }

  return events
}

// ─── Mode: Ease-Out ────────────────────────────────────────────────────────

function generateEaseOut(
  frameCount: number,
  scrollDistancePx: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []

  for (let i = 0; i < frameCount; i++) {
    const t = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    const eased = easeOutQuad(t)
    events.push({
      scrollPosition: Math.round(eased * scrollDistancePx * 10) / 10,
      frameIndex: i,
      progress: Math.round(t * 10000) / 10000,
    })
  }

  return events
}

// ─── Mode: Ease-In-Out ─────────────────────────────────────────────────────

function generateEaseInOut(
  frameCount: number,
  scrollDistancePx: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []

  for (let i = 0; i < frameCount; i++) {
    const t = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    const eased = easeInOutCubic(t)
    events.push({
      scrollPosition: Math.round(eased * scrollDistancePx * 10) / 10,
      frameIndex: i,
      progress: Math.round(t * 10000) / 10000,
    })
  }

  return events
}

// ─── Mode: Velocity-Aware ──────────────────────────────────────────────────
// Concentrates frames at regions where sequential frames differ the most
// (high motion regions get more trigger events, static regions get fewer)

function generateVelocity(
  frameCount: number,
  scrollDistancePx: number,
  frameTimestamps?: number[]
): ScrollTriggerEvent[] {
  if (!frameTimestamps || frameTimestamps.length < 2) {
    // Fallback to linear if no timestamps
    return generateLinear(frameCount, scrollDistancePx)
  }

  // Calculate frame differences (approximate velocity between consecutive frames)
  const diffs: number[] = []
  for (let i = 1; i < frameCount; i++) {
    const timeDiff = frameTimestamps[i] - frameTimestamps[i - 1]
    // Use actual timestamp gap normalized
    diffs.push(Math.abs(timeDiff))
  }

  // Normalize to weights (higher weight = more scroll space)
  const maxDiff = Math.max(...diffs, 0.001)
  const weights = diffs.map((d) => 0.2 + (d / maxDiff) * 0.8) // clamp between 0.2 and 1.0
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  const events: ScrollTriggerEvent[] = []
  let currentPos = 0

  for (let i = 0; i < frameCount; i++) {
    const progress = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    events.push({
      scrollPosition: Math.round(currentPos * 10) / 10,
      frameIndex: i,
      progress: Math.round(progress * 10000) / 10000,
    })

    if (i < weights.length) {
      currentPos += (weights[i] / totalWeight) * scrollDistancePx
    }
  }

  // Normalize so last event lands at scrollDistancePx
  if (events.length > 1) {
    const scale = scrollDistancePx / Math.max(1, events[events.length - 1].scrollPosition)
    for (const event of events) {
      event.scrollPosition = Math.round(event.scrollPosition * scale * 10) / 10
    }
  }

  return events
}

// ─── Mode: Scene-Based ─────────────────────────────────────────────────────
// Distributes frames within scene breakpoints, weighted by scene weight

function generateSceneBased(
  frameCount: number,
  scrollDistancePx: number,
  scenes: SceneBreakpoint[]
): ScrollTriggerEvent[] {
  if (scenes.length === 0) {
    // No scenes defined, use linear
    return generateLinear(frameCount, scrollDistancePx)
  }

  const events: ScrollTriggerEvent[] = []
  const totalWeight = scenes.reduce((sum, s) => sum + s.weight, 0)

  for (const scene of scenes) {
    const sceneFrameCount = scene.endFrame - scene.startFrame + 1
    const sceneScrollSpace = (scene.weight / totalWeight) * scrollDistancePx

    // Find the starting scroll position for this scene
    const sceneStartScroll = events.length > 0
      ? events[events.length - 1].scrollPosition
      : 0

    for (let i = 0; i < sceneFrameCount; i++) {
      const frameIdx = scene.startFrame + i
      if (frameIdx >= frameCount) break

      const t = sceneFrameCount === 1 ? 0.5 : i / (sceneFrameCount - 1)
      // Apply gentle ease-in-out within each scene
      const eased = easeInOutSine(t)

      events.push({
        scrollPosition: Math.round((sceneStartScroll + eased * sceneScrollSpace) * 10) / 10,
        frameIndex: frameIdx,
        progress: Math.round((frameIdx / Math.max(1, frameCount - 1)) * 10000) / 10000,
        sceneLabel: scene.label,
      })
    }
  }

  return events
}

// ─── Mode: Golden Ratio ────────────────────────────────────────────────────
// Fibonacci-inspired spacing: frames cluster toward the end for dramatic effect

function generateGoldenRatio(
  frameCount: number,
  scrollDistancePx: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []

  if (frameCount <= 1) {
    events.push({
      scrollPosition: 0,
      frameIndex: 0,
      progress: 0.5,
    })
    return events
  }

  // Generate fibonacci weights
  const fibs = fibonacciSequence(frameCount)
  const fibSum = fibs.reduce((a, b) => a + b, 0)

  let pos = 0
  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1)
    events.push({
      scrollPosition: Math.round(pos * 10) / 10,
      frameIndex: i,
      progress: Math.round(progress * 10000) / 10000,
    })

    // Each segment's width proportional to its fibonacci number
    if (i < fibs.length) {
      pos += (fibs[i] / fibSum) * scrollDistancePx
    }
  }

  // Normalize so the last event ends at scrollDistancePx
  const scale = scrollDistancePx / Math.max(1, events[events.length - 1].scrollPosition)
  for (const event of events) {
    event.scrollPosition = Math.round(event.scrollPosition * scale * 10) / 10
  }

  return events
}

// ─── Mode: Step & Hold ─────────────────────────────────────────────────────
// Frame advances immediately then holds for a fixed scroll distance

function generateStepHold(
  frameCount: number,
  scrollDistancePx: number,
  holdDuration: number
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []
  const stepWidth = scrollDistancePx / frameCount

  for (let i = 0; i < frameCount; i++) {
    const progress = frameCount === 1 ? 0.5 : i / (frameCount - 1)
    events.push({
      scrollPosition: Math.round(i * stepWidth * 10) / 10,
      frameIndex: i,
      progress: Math.round(progress * 10000) / 10000,
    })
  }

  return events
}

// ─── Mode: Manual ─────────────────────────────────────────────────────────────
// User-defined frame ranges with visual feedback
// Each range gets proportional scroll space based on scrollStart/scrollEnd

function generateManual(
  frameCount: number,
  scrollDistancePx: number,
  manualRanges: ManualFrameRange[]
): ScrollTriggerEvent[] {
  const events: ScrollTriggerEvent[] = []
  
  // If no manual ranges defined, fall back to linear
  if (!manualRanges || manualRanges.length === 0) {
    return generateLinear(frameCount, scrollDistancePx)
  }

  // Sort ranges by scroll position
  const sortedRanges = [...manualRanges].sort(
    (a, b) => a.scrollStart - b.scrollStart
  )

  // Generate events for each frame in each range
  for (const range of sortedRanges) {
    // Validate range
    const startFrame = Math.max(0, Math.min(range.startFrame, frameCount - 1))
    const endFrame = Math.max(startFrame, Math.min(range.endFrame, frameCount - 1))
    
    if (endFrame < startFrame) continue
    
    // Calculate scroll positions for this range
    const rangeScrollStart = range.scrollStart * scrollDistancePx
    const rangeScrollEnd = range.scrollEnd * scrollDistancePx
    const rangeScrollWidth = rangeScrollEnd - rangeScrollStart
    
    // Frames in this range
    const framesInRange = endFrame - startFrame + 1
    
    for (let i = startFrame; i <= endFrame; i++) {
      // Position within this range (0 to 1)
      const framePositionInRange = framesInRange === 1 
        ? 0.5 
        : (i - startFrame) / (framesInRange - 1)
      
      // Absolute scroll position
      const scrollPos = rangeScrollStart + (framePositionInRange * rangeScrollWidth)
      const progress = scrollPos / scrollDistancePx
      
      events.push({
        scrollPosition: Math.round(scrollPos * 10) / 10,
        frameIndex: i,
        progress: Math.round(progress * 10000) / 10000,
        sceneLabel: range.label,
      })
    }
  }

  // Sort all events by scroll position
  events.sort((a, b) => a.scrollPosition - b.scrollPosition)

  return events
}

// ─── Main: Generate Scroll Trigger Map ─────────────────────────────────────

export function generateScrollTriggerMap(
  frameCount: number,
  config: ScrollTriggerConfig,
  frameTimestamps?: number[]
): ScrollTriggerMap {
  const scrollDistancePx = scrollToPixels(config.scrollDistance, config.scrollUnit)

  let events: ScrollTriggerEvent[]

  switch (config.mode) {
    case 'linear':
      events = generateLinear(frameCount, scrollDistancePx)
      break
    case 'easeIn':
      events = generateEaseIn(frameCount, scrollDistancePx)
      break
    case 'easeOut':
      events = generateEaseOut(frameCount, scrollDistancePx)
      break
    case 'easeInOut':
      events = generateEaseInOut(frameCount, scrollDistancePx)
      break
    case 'velocity':
      events = generateVelocity(frameCount, scrollDistancePx, frameTimestamps)
      break
    case 'scene':
      events = generateSceneBased(frameCount, scrollDistancePx, config.scenes)
      break
    case 'goldenRatio':
      events = generateGoldenRatio(frameCount, scrollDistancePx)
      break
    case 'stepHold':
      events = generateStepHold(frameCount, scrollDistancePx, config.stepHoldDuration)
      break
    case 'manual':
      events = generateManual(frameCount, scrollDistancePx, config.manualRanges)
      break
    default:
      events = generateLinear(frameCount, scrollDistancePx)
  }

  const stats = computeStats(events, scrollDistancePx)

  return {
    config: { ...config },
    eventCount: events.length,
    events,
    stats,
    scrollDistancePx: Math.round(scrollDistancePx),
  }
}

// ─── Get Frame Index for a Given Scroll Position ───────────────────────────

export function getFrameAtScroll(
  scrollPos: number,
  events: ScrollTriggerEvent[],
  config: ScrollTriggerConfig
): number {
  if (events.length === 0) return 0

  // Find the last event whose scrollPosition <= scrollPos
  let frameIndex = 0
  for (let i = 0; i < events.length; i++) {
    if (events[i].scrollPosition <= scrollPos) {
      frameIndex = events[i].frameIndex
    } else {
      break
    }
  }

  // Handle overshoot
  const maxScroll = events[events.length - 1].scrollPosition

  if (scrollPos > maxScroll) {
    switch (config.overshootBehavior) {
      case 'clamp':
        return events[events.length - 1].frameIndex
      case 'loop': {
        const overflow = scrollPos - maxScroll
        const cycleLength = maxScroll || 1
        const wrappedPos = overflow % cycleLength
        return getFrameAtScroll(wrappedPos, events, { ...config, overshootBehavior: 'clamp' })
      }
      case 'bounce':
        // Bounce back from the last frame
        return events[events.length - 1].frameIndex
      case 'none':
      default:
        return events[events.length - 1].frameIndex
    }
  }

  if (scrollPos < 0) {
    switch (config.overshootBehavior) {
      case 'clamp':
        return events[0].frameIndex
      case 'bounce':
        return events[0].frameIndex
      case 'loop': {
        const underflow = Math.abs(scrollPos)
        const cycleLength = maxScroll || 1
        const wrappedPos = cycleLength - (underflow % cycleLength)
        return getFrameAtScroll(wrappedPos, events, { ...config, overshootBehavior: 'clamp' })
      }
      case 'none':
      default:
        return events[0].frameIndex
    }
  }

  return frameIndex
}

// ─── Export as Developer-Ready Config ───────────────────────────────────────

export function exportScrollTriggerJSON(map: ScrollTriggerMap): string {
  const totalScroll = map.scrollDistancePx
  
  // Calculate percentage positions for CSS
  const triggerPoints = map.events.map((e) => {
    const percent = totalScroll > 0
      ? Math.round((e.scrollPosition / totalScroll) * 10000) / 100
      : 0
    return {
      scrollPx: Math.round(e.scrollPosition),
      scrollPercent: percent,
      frameIndex: e.frameIndex,
      progress: Math.round(e.progress * 10000) / 100,
      ...(e.sceneLabel ? { scene: e.sceneLabel } : {}),
    }
  })

  // Generate JavaScript usage code
  const jsUsage = `
/* JavaScript usage example:
const scrollVideo = document.querySelector('.scroll-video');
const frames = [...]; // your frame images
const events = ${JSON.stringify(triggerPoints, null, 2)};

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const scrollRange = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(scrollY / scrollRange, 1);
  
  // Find closest frame
  let currentFrame = 0;
  for (const event of events) {
    if (progress * 100 >= event.scrollPercent) {
      currentFrame = event.frameIndex;
    }
  }
  scrollVideo.src = frames[currentFrame];
});
*/`

  return JSON.stringify({
    version: '1.0.0',
    generator: 'Artisan Labs Scroll Trigger Engine',
    generatedAt: new Date().toISOString(),
    config: {
      mode: map.config.mode,
      scrollDistance: map.config.scrollDistance,
      scrollUnit: map.config.scrollUnit,
      triggerStart: map.config.triggerStart,
      triggerEnd: map.config.triggerEnd,
      overshootBehavior: map.config.overshootBehavior,
      pinElement: map.config.pinElement,
      smoothing: map.config.smoothing,
      snapToFrame: map.config.snapToFrame,
      scenes: map.config.scenes,
    },
    summary: {
      totalScrollPx: map.scrollDistancePx,
      totalFrames: map.eventCount,
      averageSpacingPx: Math.round(map.stats.avgSpacing),
      modeDescription: SCROLL_MODE_INFO[map.config.mode]?.description || '',
    },
    events: triggerPoints,
    stats: map.stats,
  }, null, 2) + jsUsage
}

// ─── Export as CSS Animation Keyframes ──────────────────────────────────────

export interface CSSExportOptions {
  /** CSS selector for the video element */
  selector?: string
  /** Variable name for frame index (default: --frame-index) */
  variableName?: string
  /** Include fallback for browsers without scroll-timeline */
  includeFallback?: boolean
  /** Include JavaScript integration code */
  includeJS?: boolean
  /** Custom class name for keyframes */
  keyframeName?: string
}

const DEFAULT_CSS_OPTIONS: CSSExportOptions = {
  selector: '.scroll-video',
  variableName: '--frame-index',
  includeFallback: true,
  includeJS: true,
  keyframeName: 'scrollFrameSwap',
}

export function exportScrollTriggerCSS(
  map: ScrollTriggerMap,
  options: CSSExportOptions | string = {}
): string {
  // Handle string overload for backward compatibility
  const opts = typeof options === 'string' 
    ? { ...DEFAULT_CSS_OPTIONS, selector: options }
    : { ...DEFAULT_CSS_OPTIONS, ...options }
  
  const { 
    selector, 
    variableName, 
    includeFallback, 
    includeJS, 
    keyframeName 
  } = opts
  
  const totalScroll = map.scrollDistancePx
  const eventCount = map.events.length

  // Build CSS with modern scroll-timeline and fallbacks
  let css = `/* ════════════════════════════════════════════════════════════════════
 * Artisan Labs — Scrollytelling CSS Export
 * Generated: ${new Date().toISOString()}
 * Mode: ${map.config.mode} | Frames: ${eventCount} | Scroll: ${totalScroll}px
 * ════════════════════════════════════════════════════════════════════ */

`

  // 1. CSS Custom Properties for easy customization
  css += `/* ─── CSS Variables ──────────────────────────────────────────────────── */
:root {
  ${keyframeName}-frames: ${eventCount};
  ${keyframeName}-scroll: ${totalScroll};
  ${keyframeName}-selector: "${selector}";
}

`

  // 2. Modern scroll-timeline keyframes (Chrome 115+)
  css += `/* ─── Scroll-Timeline Animation (Modern Browsers) ───────────────────── */
@keyframes ${keyframeName} {
`
  for (let i = 0; i < map.events.length; i++) {
    const event = map.events[i]
    const percent = totalScroll > 0
      ? Math.round((event.scrollPosition / totalScroll) * 10000) / 100
      : 0
    css += `  ${percent.toFixed(2)}% { ${variableName}: ${event.frameIndex}; }\n`
  }
  css += `}

${selector} {
  animation: ${keyframeName} linear;
  animation-timeline: scroll();
  animation-range: 0% 100%;
}

`

  // 3. Fallback for browsers without scroll-timeline
  if (includeFallback) {
    css += `/* ─── JavaScript Fallback (All Browsers) ──────────────────────────────── */
/* 
 * For browsers without scroll-timeline support, use this JavaScript:
 * 
 * const frames = [...]; // your frame image URLs
 * const events = [\n`
    
    for (let i = 0; i < Math.min(map.events.length, 10); i++) {
      const event = map.events[i]
      const percent = totalScroll > 0
        ? Math.round((event.scrollPosition / totalScroll) * 10000) / 100
        : 0
      css += ` *   { percent: ${percent.toFixed(2)}, frame: ${event.frameIndex} },\n`
    }
    if (map.events.length > 10) {
      css += ` *   // ... ${map.events.length - 10} more events\n`
    }
    css += ` * ];
 * 
 * const container = document.querySelector('${selector}');
 * const scrollMax = document.body.scrollHeight - window.innerHeight;
 * 
 * window.addEventListener('scroll', () => {
 *   const progress = Math.min(window.scrollY / scrollMax, 1) * 100;
 *   const event = events.find(e => progress <= e.percent) || events[events.length - 1];
 *   container.style.setProperty('${variableName}', event.frame.toString());
 * });
 */

`

    // Fallback CSS using @property (if supported)
    css += `/* ─── @property Fallback (CSS-only, limited browser support) ───────── */
@property --current-progress {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

${selector}-fallback {
  /* Requires JavaScript to set --current-progress */
  /* JavaScript: element.style.setProperty('--current-progress', (scrollY / scrollMax * 100) + '%') */
}

`
  }

  // 4. Image swap utility classes
  css += `/* ─── Frame Display Utilities ──────────────────────────────────────────── */
${selector} {
  display: block;
  width: 100%;
  height: auto;
}

${selector}-container {
  position: relative;
  overflow: hidden;
}

${selector}-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--frame-overlay, transparent);
  pointer-events: none;
  z-index: 1;
}

`

  // 5. Integration guide
  if (includeJS) {
    css += `/* ════════════════════════════════════════════════════════════════════
 * Integration Guide
 * ════════════════════════════════════════════════════════════════════════════

/* 1. IMAGE SPRITESHEET (Recommended for performance):
   Combine all frames into a single sprite image and use:
${selector} {
  image-rendering: pixelated; /* for pixel art */
  background-image: url('/frames/spritesheet.webp');
  background-size: ${map.eventCount * 100}%;
  background-position: calc(var(${variableName}) * (100% / ${map.eventCount - 1})) 0;
}

/* 2. MULTIPLE IMG ELEMENTS:
   <div class="${selector}-stack">
     <img src="frame0.webp" style="opacity: calc(1 - min(1, var(${variableName})))" />
     <img src="frame1.webp" style="opacity: calc(abs(var(${variableName}) - 1))" />
     <!-- more frames -->
   </div>

/* 3. CANVAS RENDERING:
   const canvas = document.querySelector('canvas');
   const ctx = canvas.getContext('2d');
   const frames = [...]; // preloaded images
   window.addEventListener('scroll', () => {
     const index = getComputedStyle(document.body).getPropertyValue('${variableName}');
     ctx.drawImage(frames[parseInt(index)], 0, 0);
   });

*/
`
  }

  return css
}

// ─── Auto-Detect Scenes from Frame Data ────────────────────────────────────

export function autoDetectScenes(
  frameTimestamps: number[],
  frameCount: number,
  sensitivity: number = 0.5
): { startFrame: number; endFrame: number; label: string; weight: number }[] {
  if (frameTimestamps.length < 3 || frameCount < 3) return []

  // Calculate time gaps between consecutive frames
  const gaps: number[] = []
  for (let i = 1; i < frameTimestamps.length; i++) {
    gaps.push(frameTimestamps[i] - frameTimestamps[i - 1])
  }

  if (gaps.length === 0) return []

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const threshold = avgGap * (1 + sensitivity * 2)

  // Find scene boundaries where gap exceeds threshold
  const boundaries: number[] = [0]
  for (let i = 0; i < gaps.length; i++) {
    if (gaps[i] > threshold) {
      boundaries.push(i + 1)
    }
  }
  boundaries.push(frameCount)

  // Create scenes from boundaries
  const scenes: SceneBreakpoint[] = []
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]
    const end = Math.min(boundaries[i + 1] - 1, frameCount - 1)
    if (end <= start) continue

    const sceneDuration = frameTimestamps[end] - frameTimestamps[start]
    scenes.push({
      startFrame: start,
      endFrame: end,
      label: `Scene ${i + 1}`,
      weight: Math.max(0.5, Math.min(3, sceneDuration / avgGap)),
    })
  }

  return scenes
}

// ─── Mode Descriptions for UI ──────────────────────────────────────────────

export const SCROLL_MODE_INFO: Record<string, {
  label: string
  description: string
  icon: string
  bestFor: string
}> = {
  linear: {
    label: 'Linear',
    description: 'Even distribution of frames across the entire scroll distance. Each frame gets equal scroll space.',
    icon: '≡',
    bestFor: 'Uniform playback, product showcases',
  },
  easeIn: {
    label: 'Ease In',
    description: 'Frames start slow and accelerate toward the end. Early frames are spread out; later frames are tightly packed.',
    icon: '▸▸▸',
    bestFor: 'Building anticipation, dramatic reveals',
  },
  easeOut: {
    label: 'Ease Out',
    description: 'Frames start fast and decelerate. Quick changes at the top, gentle settling at the bottom.',
    icon: '◀◀◀',
    bestFor: 'Hero intros, smooth landings',
  },
  easeInOut: {
    label: 'Ease In-Out',
    description: 'Smooth S-curve: slow start, fast middle, slow end. Natural-feeling acceleration and deceleration.',
    icon: '◂▸▸◂',
    bestFor: 'Most scrollytelling, general purpose',
  },
  velocity: {
    label: 'Velocity-Aware',
    description: 'Intelligently concentrates frames at high-motion regions. Fast-changing scenes get more trigger events.',
    icon: '⟿⟿',
    bestFor: 'Videos with varying motion, action scenes',
  },
  scene: {
    label: 'Scene-Based',
    description: 'Divide frames into named scenes with custom weights. Each scene controls its own scroll space allocation.',
    icon: 'box',
    bestFor: 'Storyboarded content, multi-section narratives',
  },
  goldenRatio: {
    label: 'Golden Ratio',
    description: 'Fibonacci-inspired spacing creates organic, visually harmonious frame distribution. Frames cluster toward the climax.',
    icon: 'φ',
    bestFor: 'Artistic storytelling, premium experiences',
  },
  stepHold: {
    label: 'Step & Hold',
    description: 'Each frame holds for a fixed scroll distance before advancing. Creates discrete, magazine-like transitions.',
    icon: '⊞',
    bestFor: 'Presentations, data stories, infographics',
  },
  manual: {
    label: 'Manual',
    description: 'You define exactly which frames show at which scroll positions. Full control with visual feedback.',
    icon: '✎',
    bestFor: 'Precise control, highlight specific moments, custom sequences',
  },
}
