"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-14 h-7 rounded-full bg-white/10" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
        isDark
          ? "bg-indigo-600/80 border border-indigo-400/30"
          : "bg-amber-400/80 border border-amber-300/30"
      }`}
    >
      {/* Sliding pill */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
          isDark ? "bg-white left-8" : "bg-white left-1"
        }`}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3 h-3 text-indigo-600" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3 h-3 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background icons */}
      <Sun className={`absolute left-1.5 w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-30"} text-white`} />
      <Moon className={`absolute right-1.5 w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? "opacity-30" : "opacity-0"} text-white`} />
    </button>
  );
}
