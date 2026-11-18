"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024;
    if (isTouch) return;

    setEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let outerX = -100;
    let outerY = -100;
    let isRunning = false;
    let animationFrameId: number;

    const render = () => {
      const dx = mouseX - outerX;
      const dy = mouseY - outerY;

      outerX += dx * 0.3;
      outerY += dy * 0.3;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${outerX - 16}px, ${outerY - 16}px, 0)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }

      // Stop loop when resting to save CPU/GPU cycles
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        isRunning = false;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary/50 pointer-events-none z-[100] will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      <div
        ref={innerRef}
        className="fixed top-0 left-0 w-2 h-2 bg-purple-400 rounded-full pointer-events-none z-[100] will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
