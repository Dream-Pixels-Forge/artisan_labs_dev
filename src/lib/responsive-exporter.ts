// =============================================================================
// Artisan Labs — Responsive Exporter Utility
// =============================================================================
// Resizes frames client-side to optimized viewport sizes (Desktop, Tablet, Mobile)
// using high-efficiency Canvas sampling, outputting optimized WebP/JPEG Blobs.
// =============================================================================

import type { ExportFormat } from '@/types';
import { getMimeType } from './frame-extractor';

export interface ResponsiveTarget {
  folder: string;
  width: number;
  quality: number;
}

// Industry-standard responsive viewports
export const RESPONSIVE_TARGETS: ResponsiveTarget[] = [
  { folder: 'desktop', width: 1920, quality: 0.82 },
  { folder: 'tablet', width: 1024, quality: 0.75 },
  { folder: 'mobile', width: 640, quality: 0.65 },
];

/**
 * Resize a Blob to a specific width client-side using offscreen canvas.
 * Prevents upscaling if the original width is already smaller than the target.
 */
export function resizeBlob(
  blob: Blob,
  targetWidth: number,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.width;
      const originalHeight = img.height;
      const aspectRatio = originalWidth / originalHeight;

      // Prevent upscaling
      const finalWidth = Math.min(originalWidth, targetWidth);
      const finalHeight = Math.round(finalWidth / aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('[Resizer] Failed to construct canvas context'));
        return;
      }

      // Smooth resizing interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      const mimeType = getMimeType(format);

      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('[Resizer] Output Blob was null'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`[Resizer] Image load failure: ${err}`));
    };

    img.src = objectUrl;
  });
}
