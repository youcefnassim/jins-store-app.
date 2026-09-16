"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050810]">
      
      {/* Animated orbs background */}
      <div className="fixed inset-0 -z-10">
        {/* Big central glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
        />
        
        {/* Top-left purple orb */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[100px]"
        />

        {/* Bottom-right pink orb */}
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]"
        />

        {/* Top-right cyan orb */}
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px]"
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            style={{
              left: `${5 + (i * 47) % 90}%`,
              top: `${10 + (i * 37) % 80}%`,
            }}
            className="absolute w-1 h-1 rounded-full bg-primary/60"
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {children}
    </div>
  );
}
