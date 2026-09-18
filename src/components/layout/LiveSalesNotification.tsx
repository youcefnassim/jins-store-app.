"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const fakeNames = ["Ahmed", "Yacine", "Karim", "Amina", "Walid", "Sarah", "Mohamed", "Rami"];
const fakeGames = [
  { name: "Free Fire", items: ["530 💎", "1080 💎", "2200 💎"] },
  { name: "PUBG Mobile", items: ["325 UC", "660 UC", "1800 UC"] },
  { name: "Mobile Legends", items: ["284 💎", "716 💎", "1446 💎"] },
  { name: "Valorant", items: ["1000 VP", "2050 VP"] }
];

export function LiveSalesNotification() {
  useEffect(() => {
    // Show a fake sale notification randomly every 20-45 seconds
    const showRandomSale = () => {
      const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
      const gameObj = fakeGames[Math.floor(Math.random() * fakeGames.length)];
      const item = gameObj.items[Math.floor(Math.random() * gameObj.items.length)];
      
      const timeAgo = Math.floor(Math.random() * 15) + 1; // 1 to 15 mins ago
      
      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-white dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-lg w-full max-w-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">🛒</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {name} vient d'acheter
            </p>
            <p className="text-xs text-primary font-medium">
              {item} {gameObj.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Il y a {timeAgo} min
            </p>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'bottom-left'
      });

      // Schedule next notification
      const nextDelay = Math.floor(Math.random() * (45000 - 20000 + 1) + 20000);
      timeoutId = setTimeout(showRandomSale, nextDelay);
    };

    // Start after 5 seconds initially
    let timeoutId = setTimeout(showRandomSale, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return null; // This component doesn't render anything directly
}
