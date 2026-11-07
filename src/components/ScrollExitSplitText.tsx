import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ScrollExitSplitTextProps {
  text: string;
  /** Normalized exit progress from 0 (fully visible at bottom) to 1 (exited) */
  progress: number;
  className?: string;
}

/**
 * Splits headline into words -> chars as nested inline-block spans
 * with an aria-label on the h1 so screen readers read unbroken text,
 * building a paused GSAP timeline synced via gsap.to(timeline, { progress, duration: 0.4, ease: "power1.out" })
 */
export const ScrollExitSplitText: React.FC<ScrollExitSplitTextProps> = ({
  text,
  progress,
  className = '',
}) => {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll<HTMLElement>('.split-char');
    const tl = gsap.timeline({ paused: true });

    tl.fromTo(
      chars,
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        scaleY: 1,
      },
      {
        yPercent: -115,
        opacity: 0,
        rotateX: 45,
        scaleY: 0.82,
        stagger: {
          each: 0.025,
          from: 'center',
        },
        ease: 'power2.inOut',
        duration: 1,
      }
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [text]);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    const clamped = Math.max(0, Math.min(1, progress));
    gsap.to(tl, {
      progress: clamped,
      duration: 0.45,
      ease: 'power1.out',
      overwrite: true,
    });
  }, [progress]);

  const words = text.split(' ');

  return (
    <h1
      ref={containerRef}
      aria-label={text}
      className={`select-none overflow-hidden ${className}`}
    >
      {words.map((word, wIdx) => (
        <span
          key={wIdx}
          className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0"
          aria-hidden="true"
        >
          {word.split('').map((char, cIdx) => (
            <span
              key={cIdx}
              className="split-char inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
};
