"use client";

import { AlertCircle, Flame, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function TopMarquee() {
  const t = useTranslations("Common"); // Assuming Common has generic text, or we hardcode for effect
  
  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs font-bold py-1.5 overflow-hidden relative z-[60] flex">
      {/* 
        We use a fast CSS animation (marquee) defined in Tailwind or globals.css. 
        For simple implementation without complex CSS, we can use Tailwind's animate-pulse or just multiple spans 
        in a flex container. A true marquee requires custom keyframes.
      */}
      <div className="flex w-max animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-4 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Paiement Edahabia & CIB bientôt disponible
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-300" />
              Support client 24/7 sur WhatsApp
            </span>
            <span className="text-white/30">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
