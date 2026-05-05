"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  triggerOnce?: boolean;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  once = true,
  triggerOnce = false,
  start = "top 80%",
  end = "bottom 20%",
  scrub = false,
  markers = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          delay,
          duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            scrub,
            markers,
            once: triggerOnce,
            toggleActions: once ? "play none none reverse" : "play none none none",
          },
        }
      );
    }, ref.current);

    return () => ctx.revert();
  }, [delay, duration, once, triggerOnce, start, end, scrub, markers]);

  return <div ref={ref} className={className}>{children}</div>;
}