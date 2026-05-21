import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Premium GSAP ScrollTrigger Scrollytelling Sequence
 * Built with canvas rendering for 60fps scrolling efficiency,
 * low memory overhead, and smooth scrubbing lag-smoothing.
 */
export function influenciaGSAP() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI canvas dimensions
    canvas.width = 512;
    canvas.height = 288;

    const frameCount = 32;
    
    // Resolve dynamic sequence frames paths
    const getFramePath = (index: number) => {
      const paddedNum = String(index).padStart(3, '0');
      return `/desktop/frame-${paddedNum}.webp`;
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
          style={{ aspectRatio: '512/288' }}
        />
      </div>
    </div>
  );
}