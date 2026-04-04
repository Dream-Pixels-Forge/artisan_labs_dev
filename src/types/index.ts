// =============================================================================
// Artisan Labs: Scrollytelling Sequence Optimizer
// Type Definitions
// =============================================================================

export type Screen = 'dashboard' | 'sequencer' | 'scrollTrigger' | 'archive';

export type ExportFormat = 'jpeg' | 'png' | 'webp' | 'bmp' | 'tiff' | 'avif';

export interface FrameData {
  dataUrl: string;
  timestamp: number;
  frameNumber: number;
}

export interface Sequence {
  id: string;
  name: string;
  timestamp: string;
  frames: FrameData[];
  videoName: string;
  format: ExportFormat;
  frameCount: number;
  width: number;
  height: number;
  fileSize: number; // total estimated bytes
}

export interface ExtractionParams {
  samplingRate: number; // 0.1 - 10 FPS
  quality: number; // 0.1 - 1.0
  resizeFactor: number; // 0.1 - 2.0
  upscaling: number; // 1.0 - 4.0
  enhance: boolean;
  format: ExportFormat;
}

export interface VideoInfo {
  name: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
  file: File;
  url: string;
}

export interface SystemMetrics {
  sequencesTotal: number;
  framesTotal: number;
  storageUsed: string;
  uptime: string;
}

// =============================================================================
// Scroll Trigger Types
// =============================================================================

export type ScrollTriggerMode =
  | 'linear'          // Even distribution across scroll distance
  | 'easeIn'          // Quadratic ease-in: slow start, fast end
  | 'easeOut'         // Quadratic ease-out: fast start, slow end
  | 'easeInOut'       // Smooth S-curve acceleration
  | 'velocity'        // Concentrates frames at high-motion regions
  | 'scene'           // Scene-breakpoint distribution with weighted spacing
  | 'goldenRatio'     // Fibonacci-inspired non-uniform spacing
  | 'stepHold'        // Frame plays, then holds for a scroll distance
  | 'manual'          // User manually sets frame ranges with visual feedback

export type OvershootBehavior = 'clamp' | 'loop' | 'bounce' | 'none'

export type ScrollUnit = 'px' | 'vh' | 'vw'

export interface SceneBreakpoint {
  /** Frame index where this scene begins (0-based) */
  startFrame: number
  /** Frame index where this scene ends (inclusive) */
  endFrame: number
  /** Name/label for this scene */
  label: string
  /** Weight: how much scroll space this scene occupies (0.1 - 5.0) */
  weight: number
}

/** Manual frame range for 'manual' mode */
export interface ManualFrameRange {
  /** Start frame index (0-based) */
  startFrame: number
  /** End frame index (inclusive) */
  endFrame: number
  /** Label for this range */
  label: string
  /** Scroll position start (0-1, percentage of total scroll) */
  scrollStart: number
  /** Scroll position end (0-1, percentage of total scroll) */
  scrollEnd: number
}

export interface ScrollTriggerConfig {
  /** Calculation mode */
  mode: ScrollTriggerMode

  /** Total scroll distance in chosen units */
  scrollDistance: number

  /** Unit of scroll distance */
  scrollUnit: ScrollUnit

  /** Where the trigger starts relative to viewport (0-1) */
  triggerStart: number

  /** Where the trigger ends relative to viewport (0-1) */
  triggerEnd: number

  /** Overshoot behavior when user scrolls past boundaries */
  overshootBehavior: OvershootBehavior

  /** Whether to pin the element during scroll */
  pinElement: boolean

  /** Smoothing factor for frame interpolation (0 = instant, 0.95 = very smooth) */
  smoothing: number

  /** Whether to snap to the nearest frame */
  snapToFrame: boolean

  /** Scene breakpoints (only for 'scene' mode) */
  scenes: SceneBreakpoint[]

  /** Step hold duration in scroll units (only for 'stepHold' mode) */
  stepHoldDuration: number

  /** Manual frame ranges (only for 'manual' mode) - user-defined with visual feedback */
  manualRanges: ManualFrameRange[]
}

/** A single scroll trigger event mapping */
export interface ScrollTriggerEvent {
  /** Scroll position at which this event fires */
  scrollPosition: number
  /** Frame index to show */
  frameIndex: number
  /** Progress value 0-1 */
  progress: number
  /** Scene label (if scene mode) */
  sceneLabel?: string
}

/** Complete scroll trigger map output */
export interface ScrollTriggerMap {
  /** Configuration used to generate this map */
  config: ScrollTriggerConfig
  /** Total number of trigger events */
  eventCount: number
  /** Ordered trigger events */
  events: ScrollTriggerEvent[]
  /** Statistics about the distribution */
  stats: ScrollTriggerStats
  /** Scroll distance converted to pixels */
  scrollDistancePx: number
}

export interface ScrollTriggerStats {
  /** Minimum spacing between consecutive events (px) */
  minSpacing: number
  /** Maximum spacing between consecutive events (px) */
  maxSpacing: number
  /** Average spacing between consecutive events (px) */
  avgSpacing: number
  /** Standard deviation of spacing (px) */
  stdDevSpacing: number
  /** Number of frames per 100px scroll at densest point */
  maxDensity: number
  /** Number of frames per 100px scroll at sparsest point */
  minDensity: number
}

/** Default scroll trigger config */
export const DEFAULT_SCROLL_CONFIG: ScrollTriggerConfig = {
  mode: 'easeInOut',
  scrollDistance: 3000,
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
