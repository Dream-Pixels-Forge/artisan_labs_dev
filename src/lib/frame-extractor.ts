// =============================================================================
// Artisan Labs — Frame Extractor Utility
// =============================================================================
// Client-side video frame extraction using Canvas API.
// Sequential seek-and-capture to avoid browser concurrency issues.
// =============================================================================

import type { ExportFormat, ExtractionParams, FrameData } from '@/types';

// ─── MIME Type Mapping ────────────────────────────────────────────────────

export function getMimeType(format: ExportFormat): string {
  const mimeMap: Record<ExportFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    avif: 'image/avif',
  };
  return mimeMap[format];
}

// ─── Estimate Frame Count ─────────────────────────────────────────────────

export function estimateFrameCount(samplingRate: number, duration: number): number {
  return Math.ceil(duration * samplingRate);
}

// ─── Estimate File Size ───────────────────────────────────────────────────

const BASE_BYTES: Record<ExportFormat, number> = {
  jpeg: 30_000,   // ~30 KB per frame at quality 0.8
  webp: 20_000,   // ~20 KB
  png: 100_000,   // ~100 KB
  bmp: 200_000,   // ~200 KB
  tiff: 150_000,  // ~150 KB
  avif: 15_000,   // ~15 KB
};

const BASE_QUALITY: Record<ExportFormat, number> = {
  jpeg: 0.8,
  webp: 0.8,
  png: 1.0,
  bmp: 1.0,
  tiff: 1.0,
  avif: 0.8,
};

export function estimateFileSize(
  params: ExtractionParams,
  duration: number
): number {
  const frames = estimateFrameCount(params.samplingRate, duration);
  const base = BASE_BYTES[params.format];
  const baseQ = BASE_QUALITY[params.format];

  // Quality scaling: quality ratio to the 1.5 power
  const qualityScale = baseQ > 0 ? (params.quality / baseQ) ** 1.5 : 1;

  // Resize factor affects pixel count quadratically
  const resizeScale = params.resizeFactor ** 2;

  // Upscaling factor affects pixel count quadratically
  const upscaleScale = params.upscaling ** 2;

  const perFrame = base * qualityScale * resizeScale * upscaleScale;
  return Math.round(frames * perFrame);
}

// ─── Core: Extract Frames ────────────────────────────────────────────────

const SEEK_TIMEOUT = 5_000; // 5 seconds per seek — fail-safe

/**
 * Seek to a specific time in the video element and wait for the `seeked` event.
 * Includes a timeout to prevent hanging if the browser never fires the event.
 */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Already at the right position
    if (Math.abs(video.currentTime - time) < 0.001) {
      resolve();
      return;
    }

    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      fn();
    };

    const onSeeked = () => finish(resolve);
    const onError = () => finish(() => reject(new Error(`Failed to seek to ${time.toFixed(3)}s`)));

    const timeout = setTimeout(() => {
      // Timeout — try to resolve anyway (the video might still be usable)
      finish(resolve);
    }, SEEK_TIMEOUT);

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    // Trigger the seek
    video.currentTime = time;
  });
}

/**
 * Wait for a single animation frame to ensure the video frame has rendered.
 */
function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Load a video element and wait until it's fully ready for seeking.
 * Uses `loadeddata` (not just `loadedmetadata`) to ensure duration is accurate.
 */
function loadVideo(video: HTMLVideoElement, src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('canplaythrough', onReady);
      video.removeEventListener('error', onError);
      fn();
    };

    const onLoaded = () => {
      // loadeddata fired — also wait briefly for the decoder to be truly ready
      setTimeout(() => finish(resolve), 50);
    };

    const onReady = () => finish(resolve);

    const onError = () => finish(() => reject(new Error('Failed to load video')));

    const timeout = setTimeout(() => {
      // If loadedmetadata fired but not loadeddata, we might still be OK
      if (video.readyState >= 1 && video.duration > 0) {
        finish(resolve);
      } else {
        finish(() => reject(new Error('Video load timeout')));
      }
    }, 15_000);

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('canplaythrough', onReady);
    video.addEventListener('error', onError);

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = src;
  });
}

/**
 * Extract frames from a video file sequentially.
 *
 * @param videoFile  - The video File object
 * @param params     - Extraction parameters (FPS, quality, format, etc.)
 * @param onProgress - Callback with (currentFrame, totalFrames)
 * @param signal     - Optional AbortSignal for cancellation
 */
export async function extractFrames(
  videoFile: File,
  params: ExtractionParams,
  onProgress: (count: number, total: number) => void,
  signal?: AbortSignal
): Promise<FrameData[]> {
  const objectUrl = URL.createObjectURL(videoFile);
  const frames: FrameData[] = [];

  try {
    // Check for cancellation at start
    if (signal?.aborted) throw new DOMException('Extraction cancelled', 'AbortError');

    // Create and load video element
    const video = document.createElement('video');
    await loadVideo(video, objectUrl);

    const { duration, videoWidth, videoHeight } = video;

    if (!duration || duration <= 0 || !isFinite(duration)) {
      throw new Error('Video has no valid duration');
    }
    if (!videoWidth || !videoHeight) {
      throw new Error('Video has no valid dimensions');
    }

    // Calculate output dimensions
    const outWidth = Math.max(1, Math.round(videoWidth * params.resizeFactor * params.upscaling));
    const outHeight = Math.max(1, Math.round(videoHeight * params.resizeFactor * params.upscaling));

    // Create off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas 2D context');
    }

    // Calculate frame timestamps
    const totalFrames = estimateFrameCount(params.samplingRate, duration);
    const interval = 1 / params.samplingRate;
    const mimeType = getMimeType(params.format);

    // Enhancement filter string
    const enhanceFilter = params.enhance
      ? 'contrast(1.15) saturate(1.15) brightness(1.05)'
      : 'none';

    // Quality for toDataURL (only applicable to jpeg, webp, avif)
    const qualityStr = (params.format === 'jpeg' || params.format === 'webp' || params.format === 'avif')
      ? params.quality
      : undefined;

    // Sequential seek-and-capture loop
    for (let i = 0; i < totalFrames; i++) {
      // Check for cancellation before each frame
      if (signal?.aborted) throw new DOMException('Extraction cancelled', 'AbortError');

      // Calculate target timestamp (avoid seeking past duration)
      const timestamp = Math.min(i * interval, duration - 0.01);

      // Seek to the timestamp (with built-in timeout)
      await seekTo(video, timestamp);

      // Wait for render
      await nextFrame();

      // Clear canvas
      ctx.clearRect(0, 0, outWidth, outHeight);

      // Apply enhancement filter
      if (params.enhance) {
        ctx.filter = enhanceFilter;
      } else {
        ctx.filter = 'none';
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, outWidth, outHeight);

      // Reset filter after drawing
      ctx.filter = 'none';

      // Export as data URL
      const dataUrl = qualityStr !== undefined
        ? canvas.toDataURL(mimeType, qualityStr)
        : canvas.toDataURL(mimeType);

      frames.push({
        dataUrl,
        timestamp: Math.round(timestamp * 1000) / 1000,
        frameNumber: i + 1,
      });

      // Report progress
      onProgress(i + 1, totalFrames);
    }

    return frames;
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(objectUrl);
  }
}
