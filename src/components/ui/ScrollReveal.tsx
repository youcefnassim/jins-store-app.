"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollReveal({ children, width = "100%", delay = 0, direction = "up" }: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const getHiddenState = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: 15 };
      case "down": return { opacity: 0, y: -15 };
      case "left": return { opacity: 0, x: 15 };
      case "right": return { opacity: 0, x: -15 };
      default: return { opacity: 0, y: 15 };
    }
  };

  const getVisibleState = () => {
    return { opacity: 1, y: 0, x: 0 };
  };

  return (
    <div ref={ref} style={{ width, position: "relative" }}>
      <motion.div
        variants={{
          hidden: getHiddenState(),
          visible: getVisibleState(),
        }}
        initial="hidden"
        animate={controls}
        transition={{ duration: 0.25, delay: Math.min(delay, 0.1), ease: "easeOut" }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
