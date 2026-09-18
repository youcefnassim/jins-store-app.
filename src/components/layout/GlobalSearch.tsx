"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Fake list of games for search (should ideally come from DB or config)
const searchableGames = [
  { id: "pubg-mobile", name: "PUBG Mobile", category: "Mobile" },
  { id: "free-fire", name: "Free Fire", category: "Mobile" },
  { id: "mobile-legends", name: "Mobile Legends", category: "Mobile" },
  { id: "valorant", name: "Valorant", category: "PC" },
  { id: "genshin-impact", name: "Genshin Impact", category: "PC/Mobile" }
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const filteredGames = query.length > 0 
    ? searchableGames.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-colors border border-black/10 dark:border-white/10"
        aria-label="Search games"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center p-4 border-b border-slate-100 dark:border-white/10">
                <Search className="w-6 h-6 text-muted-foreground mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher un jeu... (ex: PUBG, Free Fire)"
                  className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-muted-foreground"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {query.length > 0 && (
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/recharge/${game.id}`);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{game.name}</span>
                        <span className="text-xs text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">{game.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      Aucun jeu trouvé pour "{query}"
                    </div>
                  )}
                </div>
              )}
              {query.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Commencez à taper pour rechercher
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
