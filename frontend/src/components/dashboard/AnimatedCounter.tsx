"use client";
import React, { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1000, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (isNaN(end)) {
      return;
    }
    
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration;
    // Step size determined by frame budget
    const incrementTime = 16; // ~60fps
    
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalMiliseconds, 1);
      
      // easeOutQuad easing: f(t) = t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const current = Math.round(easeProgress * (end - start) + start);
      
      setCount(current);
      
      if (progress === 1) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}
