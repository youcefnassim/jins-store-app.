"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide tooltip after a few seconds
  useState(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto z-50 flex flex-col items-end rtl:items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="mb-4 bg-white dark:bg-[#0f1420] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden w-72 text-left rtl:text-right"
          >
            <div className="bg-slate-900 text-white dark:bg-gradient-to-r dark:from-primary dark:to-purple-600 p-4 relative">
              <h3 className="font-bold text-white">Live Support</h3>
              <p className="text-xs text-white/80">We typically reply in a few minutes.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="dark:text-primary font-bold text-xs">J</span>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl rounded-tl-sm rtl:rounded-tr-sm rtl:rounded-tl-2xl p-3 border border-black/5 dark:border-white/5 text-sm text-slate-900 dark:text-white/90">
                  Hi there! 👋 How can we help you today with your recharge?
                </div>
              </div>
              
              <Link 
                href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} 
                target="_blank"
                className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-center py-3 rounded-xl transition-colors shadow-lg"
              >
                Chat on WhatsApp
              </Link>
              
              <Link 
                href={siteConfig.socialLinks.facebook} 
                target="_blank"
                className="block w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-center py-3 rounded-xl transition-colors shadow-lg"
              >
                Message on Facebook
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full rtl:left-full rtl:right-auto mr-4 rtl:ml-4 rtl:mr-0 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold py-2 px-4 rounded-xl shadow-lg whitespace-nowrap"
            >
              Need help? Chat with us!
              <div className="absolute top-1/2 -right-2 rtl:-left-2 rtl:-right-auto -translate-y-1/2 border-t-8 border-t-transparent border-l-8 border-l-slate-900 dark:border-l-white rtl:border-l-transparent rtl:border-r-8 rtl:border-r-slate-900 rtl:dark:border-r-white border-b-8 border-b-transparent"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => !isOpen && setShowTooltip(false)}
          className="w-14 h-14 bg-slate-900 dark:bg-gradient-to-r dark:from-primary dark:to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(15,23,42,0.4)] dark:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(15,23,42,0.6)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
