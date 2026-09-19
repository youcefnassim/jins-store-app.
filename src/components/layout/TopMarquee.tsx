"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Flame, ShieldCheck } from "lucide-react";

interface MarqueeItem {
  id: string;
  text: string;
  type: string;
}

const defaultItems: MarqueeItem[] = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

export function TopMarquee() {
  const [items, setItems] = useState<MarqueeItem[]>(defaultItems);

  useEffect(() => {
    fetch('/api/admin/marquee')
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-amber-300" />;
      case 'shield':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-blue-300" />;
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs font-bold py-1.5 overflow-hidden relative z-40 flex shadow-sm">
      <div className="flex w-max animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
        {[...Array(3)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-8 mx-4 whitespace-nowrap">
            {items.map((item) => (
              <span key={`${loopIdx}-${item.id}`} className="flex items-center gap-1.5">
                {getIcon(item.type)}
                {item.text}
                <span className="text-white/30 ml-8">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
