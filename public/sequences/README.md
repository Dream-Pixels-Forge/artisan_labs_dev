# Artisan Labs — Responsive Developer Package

Congratulations! You have generated a production-optimized responsive scrollytelling image sequence package for **influencia**.

## Directory Structure
- `/desktop/` - Frames downscaled to 1920px (webp/jpeg, quality 0.82) for standard desktop viewports.
- `/tablet/` - Frames downscaled to 1024px (webp/jpeg, quality 0.75) for iPads and tablets.
- `/mobile/` - Frames downscaled to 640px (webp/jpeg, quality 0.65) for smartphones.
- `index.html` - A complete, working standalone scroll scrubbing demo.
- `GSAPScrollytelling.tsx` - Ready-to-use React component using GSAP ScrollTrigger.
- `FramerMotionScrollytelling.tsx` - Ready-to-use React component using Framer Motion.
- `scroll-timeline.css` - Compositor-thread powered scroll-timeline styling sheet.

## Integration Methods

### Method 1: Framer Motion (Recommended for React/Next.js)
Open the `FramerMotionScrollytelling.tsx` file for a drop-in React hook component.
It utilizes:
- `useScroll` to monitor scroll progression of a specific target container.
- `useTransform` to map progression directly to integer frame sequences.
- A `<picture>` element containing responsive `<source>` media queries to swap resized assets based on viewport size. This saves over 80% mobile data!

### Method 2: GSAP ScrollTrigger
Open `GSAPScrollytelling.tsx`.
It preloads all frame images dynamically and scrolls them using canvas `drawImage` inside a GSAP timeline with `scrub: 0.5` lag-smoothing. This guarantees 60fps scrolling on the main thread and avoids DOM layout thrashing.

### Method 3: Modern CSS Scroll-Timeline
Open `scroll-timeline.css`.
It utilizes zero JavaScript! Everything is animated on the browser's compositor thread using background-image swapping bound to `animation-timeline: scroll(nearest)`. 

## Optimized Viewport Performance
By downscaling your video frames to mobile and tablet breakpoints, your application's Core Web Vitals (Largest Contentful Paint and Interaction to Next Paint) are preserved.
Mobile frames are typically ~82% smaller than desktop 1080p source frames, providing instantaneous image downloads and zero-stutter scrollytelling on mobile Safari and Chrome!
