// =============================================================================
// Artisan Labs — Integration Templates Generator
// =============================================================================
// Generates premium scrollytelling boilerplate code for popular industry
// frameworks: GSAP ScrollTrigger, Framer Motion, and modern CSS scroll-timeline.
// =============================================================================

export interface TemplateParams {
  name: string;
  frameCount: number;
  extension: string;
  width: number;
  height: number;
}

/**
 * Generate GSAP ScrollTrigger scrollytelling component
 */
export function generateGSAPTemplate(params: TemplateParams): string {
  const { name, frameCount, extension, width, height } = params;
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return `import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Premium GSAP ScrollTrigger Scrollytelling Sequence
 * Built with canvas rendering for 60fps scrolling efficiency,
 * low memory overhead, and smooth scrubbing lag-smoothing.
 */
export function ${safeName}GSAP() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI canvas dimensions
    canvas.width = ${width};
    canvas.height = ${height};

    const frameCount = ${frameCount};
    
    // Resolve dynamic sequence frames paths
    const getFramePath = (index: number) => {
      const paddedNum = String(index).padStart(3, '0');
      return \`/desktop/frame-\${paddedNum}.${extension}\`;
    };

    // Preload image array to eliminate flicker during scrubbing
    const images: HTMLImageElement[] = [];
    const sequence = { frame: 0 };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      images.push(img);
    }

    // Hydrate first frame
    images[0].onload = () => {
      ctx.drawImage(images[0], 0, 0);
    };

    // Construct pinning and scroll scrubbing timeline
    const anim = gsap.to(sequence, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%', // Animate over 3x the viewport scroll height
        pin: true,
        scrub: 0.5, // 0.5s lag smoothing for elegant inertial damping
        anticipatePin: 1,
      },
      onUpdate: () => {
        const img = images[Math.round(sequence.frame)];
        if (img && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      }
    });

    return () => {
      anim.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen bg-black overflow-hidden"
    >
      {/* Centered canvas container with premium sticky pin */}
      <div className="flex h-screen w-full items-center justify-center">
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full object-contain"
          style={{ aspectRatio: '${width}/${height}' }}
        />
      </div>
    </div>
  );
}`;
}

/**
 * Generate Framer Motion scrollytelling component
 */
export function generateFramerMotionTemplate(params: TemplateParams): string {
  const { name, frameCount, extension, width, height } = params;
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Framer Motion Scrollytelling Sequence Hook-based Component
 * Leverages native useScroll + useTransform for hardware-accelerated scrollytelling.
 */
export function ${safeName}FramerMotion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameIndex, setFrameIndex] = useState(0);

  // Track the scroll percentage of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Map scroll progress directly to frame sequence indices
  const frameTransform = useTransform(
    scrollYProgress, 
    [0, 1], 
    [0, ${frameCount - 1}]
  );

  useEffect(() => {
    // Subscribe to transform outputs to update local react render states
    return frameTransform.on('change', (v) => {
      const idx = Math.round(v);
      setFrameIndex(idx);
    });
  }, [frameTransform]);

  // Generate dynamic responsive image path (supports picture/resizer)
  const paddedIndex = String(frameIndex + 1).padStart(3, '0');
  const currentFrameSrc = \`/desktop/frame-\${paddedIndex}.${extension}\`;

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-black">
      {/* Sticky pinning window */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <picture className="max-w-full max-h-full">
          {/* Responsive picture tags mapping to resized assets */}
          <source 
            srcSet={\`/mobile/frame-\${paddedIndex}.${extension}\`} 
            media="(max-width: 640px)" 
          />
          <source 
            srcSet={\`/tablet/frame-\${paddedIndex}.${extension}\`} 
            media="(max-width: 1024px)" 
          />
          <img
            src={currentFrameSrc}
            alt="Scrollytelling Frame \${frameIndex + 1}"
            className="max-w-full max-h-full object-contain"
            style={{ aspectRatio: '${width}/${height}' }}
          />
        </picture>
      </div>
    </div>
  );
}`;
}

/**
 * Generate CSS scroll-timeline scrollytelling component
 */
export function generateCSSTemplate(params: TemplateParams): string {
  const { name, frameCount, extension, width, height } = params;
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Construct steps inside keyframes
  let keyframes = '';
  const step = 100 / (frameCount - 1);
  for (let i = 0; i < frameCount; i++) {
    const pct = (i * step).toFixed(2);
    const padded = String(i + 1).padStart(3, '0');
    keyframes += `  ${pct}% { background-image: url('/desktop/frame-${padded}.${extension}'); }\n`;
  }

  return `/**
 * Cutting-Edge CSS Scroll-Timeline Scrollytelling Sequence
 * Built with zero JavaScript overhead, running 100% on the compositor thread.
 */

/* Setup CSS keyframes for background-swapping sequence */
@keyframes play-${safeName}-sequence {
${keyframes}}

/* HTML/React container styling */
.scroll-container-${safeName} {
  position: relative;
  width: 100%;
  height: 400vh; /* Scroll volume */
  background-color: #000;
}

.sticky-viewport-${safeName} {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.frame-display-${safeName} {
  width: 100%;
  max-width: ${width}px;
  aspect-ratio: ${width} / ${height};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  
  /* Bind to browser scroll tracking of the viewport */
  animation: play-${safeName}-sequence linear both;
  animation-timeline: scroll(nearest);
}

/* Graceful degradation for Safari/Firefox lacking scroll-timeline support */
@supports not (animation-timeline: scroll()) {
  .frame-display-${safeName} {
    /* Fallback background if unsupported */
    background-image: url('/desktop/frame-001.${extension}');
  }
  .frame-display-${safeName}::after {
    content: "Notice: Browser does not support scroll-timeline. Animate with Framer Motion/GSAP boilerplate.";
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(220,38,38,0.2);
    border: 1px solid rgba(220,38,38,0.3);
    color: #fca5a5;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 11px;
    font-family: monospace;
    backdrop-filter: blur(8px);
  }
}
`;
}
