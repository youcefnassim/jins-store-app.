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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="mb-4 bg-[#0f1420] border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-72"
          >
            <div className="bg-gradient-to-r from-primary to-purple-600 p-4 relative">
              <h3 className="font-bold text-white">Live Support</h3>
              <p className="text-xs text-white/80">We typically reply in a few minutes.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-xs">J</span>
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 border border-white/5 text-sm text-white/90">
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
              className="absolute right-full mr-4 bg-white text-black text-sm font-bold py-2 px-4 rounded-xl shadow-lg whitespace-nowrap"
            >
              Need help? Chat with us!
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 border-t-8 border-t-transparent border-l-8 border-l-white border-b-8 border-b-transparent"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => !isOpen && setShowTooltip(false)}
          className="w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
