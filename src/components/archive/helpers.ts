import type { ExportFormat } from '@/types'

// ─── Helper Functions ─────────────────────────────────────────────────

/**
 * Protocol-safe downloader utility.
 * Resolves both standard Base64 Data URLs and native IndexedDB hydrated Object URLs.
 */
export async function resolveDataUrlOrBlob(url: string): Promise<Blob> {
  if (url.startsWith('blob:')) {
    const response = await fetch(url)
    return await response.blob()
  }

  const [header, base64] = url.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

export function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds} seconds ago`
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function getFormatBadge(format: ExportFormat): { label: string; className: string } {
  switch (format) {
    case 'webp':
      return { label: 'WebP', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' }
    case 'png':
      return { label: 'PNG', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' }
    case 'jpeg':
      return { label: 'JPEG', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' }
    case 'bmp':
      return { label: 'BMP', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20' }
    case 'tiff':
      return { label: 'TIFF', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' }
    case 'avif':
      return { label: 'AVIF', className: 'bg-orange-500/15 text-orange-400 border-orange-500/20' }
  }
}

export function getFrameExtension(format: ExportFormat): string {
  if (format === 'jpeg') return 'jpg'
  return format
}

// ─── Scrollytelling ZIP Bundle Generators ──────────────────────────────

export function generateResponsiveHTML(name: string, frameCount: number, extension: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artisan Labs — Responsive Scrollytelling Demo</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #050505;
      color: #eaeaea;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .scroll-container {
      height: 400vh; /* Scroll length */
      position: relative;
    }
    .sticky-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .scrolly-picture, .scrolly-img {
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
      display: block;
    }

    /* Overlay HUD */
    .overlay-hud {
      position: fixed;
      top: 32px;
      left: 32px;
      z-index: 10;
      pointer-events: none;
      backdrop-filter: blur(12px);
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 16px 24px;
      border-radius: 12px;
    }
    .overlay-hud h1 {
      margin: 0;
      font-size: 16px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 700;
      color: #ffffff;
    }
    .overlay-hud p {
      margin: 4px 0 0;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="overlay-hud">
    <h1>${name}</h1>
    <p>Responsive Scrollytelling &bull; <span id="frame-hud">Frame 1 / ${frameCount}</span></p>
  </div>

  <div class="scroll-container">
    <div class="sticky-viewport">
      <picture class="scrolly-picture">
        <source id="mobile-source" srcset="mobile/frame-001.${extension}" media="(max-width: 640px)">
        <source id="tablet-source" srcset="tablet/frame-001.${extension}" media="(max-width: 1024px)">
        <img id="scrolly-img" class="scrolly-img" src="desktop/frame-001.${extension}" alt="Scrollytelling Frame">
      </picture>
    </div>
  </div>

  <script>
    const totalFrames = ${frameCount};
    const extension = "${extension}";
    const container = document.querySelector('.scroll-container');
    const img = document.getElementById('scrolly-img');
    const mobileSource = document.getElementById('mobile-source');
    const tabletSource = document.getElementById('tablet-source');
    const frameHud = document.getElementById('frame-hud');

    window.addEventListener('scroll', () => {
      // Calculate scroll progress percentage (0.0 to 1.0)
      const maxScroll = container.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      // Determine frame number (1-based index)
      const currentFrame = Math.min(totalFrames, Math.max(1, Math.round(progress * (totalFrames - 1)) + 1));
      const paddedNum = String(currentFrame).padStart(3, '0');

      // Update frame sources dynamically
      mobileSource.srcset = \`mobile/frame-\${paddedNum}.\${extension}\`;
      tabletSource.srcset = \`tablet/frame-\${paddedNum}.\${extension}\`;
      img.src = \`desktop/frame-\${paddedNum}.\${extension}\`;

      frameHud.textContent = \`Frame \${currentFrame} / \${totalFrames} (\${Math.round(progress * 100)}%)\`;
    });
  </script>
</body>
</html>
`
}

export function generateStandardHTML(name: string, frameCount: number, extension: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artisan Labs — Scrollytelling Demo</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #050505;
      color: #eaeaea;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .scroll-container {
      height: 400vh;
      position: relative;
    }
    .sticky-viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .scrolly-img {
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
      display: block;
    }

    .overlay-hud {
      position: fixed;
      top: 32px;
      left: 32px;
      z-index: 10;
      pointer-events: none;
      backdrop-filter: blur(12px);
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 16px 24px;
      border-radius: 12px;
    }
    .overlay-hud h1 {
      margin: 0;
      font-size: 16px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 700;
      color: #ffffff;
    }
    .overlay-hud p {
      margin: 4px 0 0;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="overlay-hud">
    <h1>${name}</h1>
    <p>Standard Scrollytelling &bull; <span id="frame-hud">Frame 1 / ${frameCount}</span></p>
  </div>

  <div class="scroll-container">
    <div class="sticky-viewport">
      <img id="scrolly-img" class="scrolly-img" src="frames/frame-001.${extension}" alt="Scrollytelling Frame">
    </div>
  </div>

  <script>
    const totalFrames = ${frameCount};
    const extension = "${extension}";
    const container = document.querySelector('.scroll-container');
    const img = document.getElementById('scrolly-img');
    const frameHud = document.getElementById('frame-hud');

    window.addEventListener('scroll', () => {
      const maxScroll = container.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      const currentFrame = Math.min(totalFrames, Math.max(1, Math.round(progress * (totalFrames - 1)) + 1));
      const paddedNum = String(currentFrame).padStart(3, '0');

      img.src = \`frames/frame-\${paddedNum}.\${extension}\`;
      frameHud.textContent = \`Frame \${currentFrame} / \${totalFrames} (\${Math.round(progress * 100)}%)\`;
    });
  </script>
</body>
</html>
`
}

export function generateResponsiveReadme(name: string, frameCount: number, extension: string): string {
  return `# Artisan Labs — Responsive Developer Package

Congratulations! You have generated a production-optimized responsive scrollytelling image sequence package for **${name}**.

## Directory Structure
- \`/desktop/\` - Frames downscaled to 1920px (webp/jpeg, quality 0.82) for standard desktop viewports.
- \`/tablet/\` - Frames downscaled to 1024px (webp/jpeg, quality 0.75) for iPads and tablets.
- \`/mobile/\` - Frames downscaled to 640px (webp/jpeg, quality 0.65) for smartphones.
- \`index.html\` - A complete, working standalone scroll scrubbing demo.
- \`GSAPScrollytelling.tsx\` - Ready-to-use React component using GSAP ScrollTrigger.
- \`FramerMotionScrollytelling.tsx\` - Ready-to-use React component using Framer Motion.
- \`scroll-timeline.css\` - Compositor-thread powered scroll-timeline styling sheet.

## Integration Methods

### Method 1: Framer Motion (Recommended for React/Next.js)
Open the \`FramerMotionScrollytelling.tsx\` file for a drop-in React hook component.
It utilizes:
- \`useScroll\` to monitor scroll progression of a specific target container.
- \`useTransform\` to map progression directly to integer frame sequences.
- A \`<picture>\` element containing responsive \`<source>\` media queries to swap resized assets based on viewport size. This saves over 80% mobile data!

### Method 2: GSAP ScrollTrigger
Open \`GSAPScrollytelling.tsx\`.
It preloads all frame images dynamically and scrolls them using canvas \`drawImage\` inside a GSAP timeline with \`scrub: 0.5\` lag-smoothing. This guarantees 60fps scrolling on the main thread and avoids DOM layout thrashing.

### Method 3: Modern CSS Scroll-Timeline
Open \`scroll-timeline.css\`.
It utilizes zero JavaScript! Everything is animated on the browser's compositor thread using background-image swapping bound to \`animation-timeline: scroll(nearest)\`.

## Optimized Viewport Performance
By downscaling your video frames to mobile and tablet breakpoints, your application's Core Web Vitals (Largest Contentful Paint and Interaction to Next Paint) are preserved.
Mobile frames are typically ~82% smaller than desktop 1080p source frames, providing instantaneous image downloads and zero-stutter scrollytelling on mobile Safari and Chrome!
`
}

export function generateStandardReadme(name: string, frameCount: number, extension: string): string {
  return `# Artisan Labs — Developer Sequence Package

You have exported the scrollytelling sequence **${name}** in original resolution.

## Directory Structure
- \`/frames/\` - Your extracted frame images in original dimensions.
- \`index.html\` - A complete standalone scroll scrubbing demo.
- \`GSAPScrollytelling.tsx\` - Ready-to-use React component using GSAP ScrollTrigger.
- \`FramerMotionScrollytelling.tsx\` - Ready-to-use React component using Framer Motion.
- \`scroll-timeline.css\` - Pure CSS scroll-timeline styling sheet.

## Integration Methods
Open the corresponding file in this package to copy code snippets for your preferred framework (GSAP ScrollTrigger, Framer Motion, or modern CSS scroll-timeline).
`
}
