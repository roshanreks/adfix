"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({ children, speed = 30, direction = "left", pauseOnHover = true, className = "" }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current?.firstElementChild) {
      setContentWidth(containerRef.current.firstElementChild.clientWidth);
    }
  }, []);

  const animation = direction === "left"
    ? `marquee-left ${contentWidth / speed}s linear infinite`
    : `marquee-right ${contentWidth / speed}s linear infinite`;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <div
        className="flex gap-8 w-max"
        style={{
          animation: isPaused ? "none" : animation,
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}
