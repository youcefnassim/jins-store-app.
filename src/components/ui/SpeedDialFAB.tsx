"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowUp, X, Headphones } from "lucide-react";

const phoneNumber = "213555000000";
const whatsappMessage = encodeURIComponent("Bonjour, j'ai besoin d'aide concernant une recharge.");
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

export function SpeedDialFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  const actions = [
    ...(showScrollTop
      ? [
          {
            icon: ArrowUp,
            label: "Haut de page",
            onClick: scrollToTop,
            color: "bg-slate-800 dark:bg-slate-700 text-white",
          },
        ]
      : []),
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: whatsappUrl,
      color: "bg-[#25D366] text-white",
    },
    {
      icon: Headphones,
      label: "Support",
      href: "/contact",
      color: "bg-primary text-white",
    },
  ];

  return (
    // Only visible on mobile (md:hidden), anchored to the right side above the Profil tab
    <div className="md:hidden fixed bottom-[72px] right-4 z-50 flex flex-col items-center gap-3">
      {/* Sub-actions (expanded) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2"
              >
                {/* Label tooltip */}
                <span className="text-xs font-semibold bg-black/80 text-white px-2 py-1 rounded-lg whitespace-nowrap backdrop-blur-sm">
                  {action.label}
                </span>
                {/* Icon button */}
                {action.href ? (
                  <a
                    href={action.href}
                    target={action.href.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${action.color} active:scale-90 transition-transform`}
                  >
                    <action.icon className="w-5 h-5" />
                  </a>
                ) : (
                  <button
                    onClick={action.onClick}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${action.color} active:scale-90 transition-transform`}
                  >
                    <action.icon className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center justify-center"
        aria-label="Menu actions"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Headphones className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
