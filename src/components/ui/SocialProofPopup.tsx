"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { siteConfig } from "@/config/site";

// Mock data for social proof
const mockPurchases = [
  { name: "Ahmed", city: "Alger", item: "514 Diamants", time: "Il y a 2 min" },
  { name: "Yanis", city: "Oran", item: "86 Diamants", time: "Il y a 5 min" },
  { name: "Amine", city: "Constantine", item: "Pass Hebdomadaire", time: "Il y a 12 min" },
  { name: "Sami", city: "Annaba", item: "172 Diamants", time: "À l'instant" },
  { name: "Riad", city: "Blida", item: "344 Diamants", time: "Il y a 1 min" },
];

export function SocialProofPopup() {
  const [currentPurchase, setCurrentPurchase] = useState<typeof mockPurchases[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before showing first popup
    const initialTimer = setTimeout(() => {
      showNextPopup();
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  const showNextPopup = () => {
    const randomPurchase = mockPurchases[Math.floor(Math.random() * mockPurchases.length)];
    setCurrentPurchase(randomPurchase);
    setIsVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next popup (between 10s and 30s)
      const nextDelay = Math.floor(Math.random() * 20000) + 10000;
      setTimeout(() => {
        showNextPopup();
      }, nextDelay);
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-4 z-50 md:bottom-8 md:left-8 max-w-sm"
        >
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 pr-6">
              <p className="text-sm text-white font-medium leading-tight mb-1">
                <span className="font-bold text-primary">{currentPurchase.name}</span> de {currentPurchase.city}
              </p>
              <p className="text-xs text-muted-foreground">
                vient d'acheter <span className="text-white font-bold">{currentPurchase.item}</span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{currentPurchase.time}</p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
