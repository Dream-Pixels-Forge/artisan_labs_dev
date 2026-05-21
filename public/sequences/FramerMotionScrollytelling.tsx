import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Framer Motion Scrollytelling Sequence Hook-based Component
 * Leverages native useScroll + useTransform for hardware-accelerated scrollytelling.
 */
export function influenciaFramerMotion() {
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
    [0, 31]
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
  const currentFrameSrc = `/desktop/frame-${paddedIndex}.webp`;

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-black">
      {/* Sticky pinning window */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <picture className="max-w-full max-h-full">
          {/* Responsive picture tags mapping to resized assets */}
          <source 
            srcSet={`/mobile/frame-${paddedIndex}.webp`} 
            media="(max-width: 640px)" 
          />
          <source 
            srcSet={`/tablet/frame-${paddedIndex}.webp`} 
            media="(max-width: 1024px)" 
          />
          <img
            src={currentFrameSrc}
            alt="Scrollytelling Frame ${frameIndex + 1}"
            className="max-w-full max-h-full object-contain"
            style={{ aspectRatio: '512/288' }}
          />
        </picture>
      </div>
    </div>
  );
}