import React, { useEffect, useRef, useState } from 'react';

interface FloatingIslandCanvasProps {
  /** Overall lerped scroll progress [0..3.5] */
  scrollProgress: number;
  /** Reveal mode: hybrid (scroll wipe + spotlight), spotlight (cursor radial), or wipe (scroll linear) */
  revealMode: 'hybrid' | 'spotlight' | 'wipe';
}

export const FloatingIslandCanvas: React.FC<FloatingIslandCanvasProps> = ({
  scrollProgress,
  revealMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [smoothMouse, setSmoothMouse] = useState({ x: -1000, y: -1000 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Smooth lerp mouse tracking
  useEffect(() => {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.45;
    let currentX = targetX;
    let currentY = targetY;
    let isMoving = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isMoving = true;

      // 3D perspective tilt
      const rectX = (e.clientX / window.innerWidth - 0.5) * 2;
      const rectY = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({
        x: -rectY * 12,
        y: rectX * 16,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let rafId = 0;
    const updateSmooth = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      setSmoothMouse({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(updateSmooth);
    };
    rafId = requestAnimationFrame(updateSmooth);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Compute reveal masks based on mode
  const spotlightRadius = 260; // px
  const scrollPct = Math.min(100, Math.max(0, scrollProgress * 110));

  let maskStyle: React.CSSProperties = {};
  if (revealMode === 'spotlight') {
    maskStyle = {
      maskImage: `radial-gradient(circle ${spotlightRadius}px at ${smoothMouse.x}px ${smoothMouse.y}px, black 0%, black 65%, transparent 100%)`,
      WebkitMaskImage: `radial-gradient(circle ${spotlightRadius}px at ${smoothMouse.x}px ${smoothMouse.y}px, black 0%, black 65%, transparent 100%)`,
    };
  } else if (revealMode === 'wipe') {
    maskStyle = {
      maskImage: `linear-gradient(to top, black 0%, black ${scrollPct}%, transparent ${scrollPct + 18}%)`,
      WebkitMaskImage: `linear-gradient(to top, black 0%, black ${scrollPct}%, transparent ${scrollPct + 18}%)`,
    };
  } else {
    // Hybrid: both spotlight and scroll wipe combined
    maskStyle = {
      maskImage: `radial-gradient(circle ${spotlightRadius}px at ${smoothMouse.x}px ${smoothMouse.y}px, black 0%, black 65%, transparent 100%), linear-gradient(to top, black 0%, black ${scrollPct}%, transparent ${scrollPct + 18}%)`,
      WebkitMaskImage: `radial-gradient(circle ${spotlightRadius}px at ${smoothMouse.x}px ${smoothMouse.y}px, black 0%, black 65%, transparent 100%), linear-gradient(to top, black 0%, black ${scrollPct}%, transparent ${scrollPct + 18}%)`,
      maskComposite: 'add',
      WebkitMaskComposite: 'destination-over',
    };
  }

  // Hero fade out as section 1 approaches
  const heroOpacity = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.75) * 2.5));
  const heroTranslateY = Math.max(0, (scrollProgress - 0.6) * 180);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center transition-opacity duration-200"
      style={{
        opacity: heroOpacity,
        visibility: heroOpacity <= 0.01 ? 'hidden' : 'visible',
        perspective: '1200px',
      }}
    >
      {/* 3D Tilting Monolith Container */}
      <div
        className="relative w-[92vw] max-w-[1300px] h-[78vh] flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${heroTranslateY}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Layer 1: Photorealistic Barren Rock Monolith Base */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/rock-monolith-barren.png"
            alt="Photorealistic Craggy Rock Monolith"
            className="w-full h-full object-contain filter contrast-[1.08] brightness-[0.98] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none"
            draggable={false}
          />
        </div>

        {/* Layer 2: Photorealistic Lush Green Moss & Vegetation Monolith (Revealed by Cursor/Scroll) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-[mask-image] duration-75"
          style={maskStyle}
        >
          <img
            src="/rock-monolith-grassy.png"
            alt="Photorealistic Lush Foliage Monolith"
            className="w-full h-full object-contain filter contrast-[1.12] brightness-[1.02] drop-shadow-[0_20px_50px_rgba(0,255,102,0.15)] select-none"
            draggable={false}
          />
        </div>

        {/* Dynamic Glow Halo around cursor spotlight */}
        <div
          className="absolute pointer-events-none rounded-full blur-2xl transition-opacity duration-200"
          style={{
            left: smoothMouse.x,
            top: smoothMouse.y,
            width: `${spotlightRadius * 1.5}px`,
            height: `${spotlightRadius * 1.5}px`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(0, 255, 102, 0.12) 0%, transparent 70%)',
            opacity: revealMode === 'wipe' ? 0 : 0.8,
          }}
        />

        {/* Drifting Ambient Particle Sparks */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#00FF66]/40 blur-[0.5px] animate-pulse"
              style={{
                left: `${15 + (i * 23) % 70}%`,
                top: `${20 + (i * 37) % 65}%`,
                animationDuration: `${2.5 + (i % 3)}s`,
                animationDelay: `${(i * 0.4)}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
