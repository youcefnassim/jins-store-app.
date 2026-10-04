"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { Gamepad2, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useTranslations } from "next-intl";

interface Game {
  id: string; // We'll use slug for the link
  name: string;
  currencyName: string;
  isAvailable: boolean;
  image_url: string | null;
  emoji: string | null;
}

export default function GamesPage() {
  const t = useTranslations("Games");
  const [searchQuery, setSearchQuery] = useState("");
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (data.games) {
          const formattedGames = data.games.map((g: any) => {
            // Deduce currency name from the first package (e.g. "86 Diamants" -> "Diamants")
            let currencyName = "Credits";
            if (g.packages && g.packages.length > 0) {
              const labelParts = g.packages[0].label.split(' ');
              if (labelParts.length > 1) {
                currencyName = labelParts.slice(1).join(' '); // take everything after the number
              }
            }

            return {
              id: g.slug,
              name: g.name,
              currencyName,
              isAvailable: g.packages && g.packages.length > 0,
              image_url: g.image_url,
              emoji: g.emoji
            };
          });
          setAllGames(formattedGames);
        }
      } catch (error) {
        console.error("Failed to fetch games", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, []);

  const filteredGames = allGames.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.currencyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-24 min-h-screen">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          {t("description")}
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rtl:pl-4 rtl:pr-10 h-14 bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-full focus-visible:ring-primary shadow-sm dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence>
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tilt
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  scale={1.05}
                  transitionSpeed={2000}
                  glareEnable={true}
                  glareMaxOpacity={0.2}
                  glareColor="#ffffff"
                  glarePosition="all"
                  className="h-full"
                  tiltEnable={game.isAvailable}
                >
                  <Link href={game.isAvailable ? (game.id === "mobile-legends" ? `/recharge` : `/games/${game.id}`) : "#"} className="block h-full group">
                    <div className={`relative aspect-square rounded-3xl p-[2px] overflow-hidden transition-all duration-300 ${!game.isAvailable ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}>
                      {/* Animated Gradient Border on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 group-hover:from-primary group-hover:via-purple-500 group-hover:to-blue-500 transition-colors duration-500 opacity-50 group-hover:opacity-100" />
                      
                      {/* Inner Image Container */}
                      <div className="absolute inset-[2px] bg-[#0d1020] rounded-[22px] overflow-hidden z-10 flex flex-col">
                        {game.image_url ? (
                          <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
                            {game.emoji ? <span className="text-6xl">{game.emoji}</span> : <Gamepad2 className="w-16 h-16 text-white/20" />}
                          </div>
                        )}

                        {/* Title Overlay at bottom (Subtle gradient) */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-12 flex flex-col justify-end translate-y-1 group-hover:translate-y-0 transition-transform">
                          <h3 className="text-white font-bold text-center text-sm sm:text-base leading-tight drop-shadow-md truncate">{game.name}</h3>
                          <p className="text-[10px] sm:text-xs text-primary font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">{game.currencyName}</p>
                        </div>
                        
                        {!game.isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                            <span className="bg-black/80 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-white/20">
                              {t("coming_soon")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </Tilt>
              </motion.div>
            ))}
            
            {filteredGames.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <Gamepad2 className="w-16 h-16 text-slate-200 dark:text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("no_games")}</h3>
                <p className="text-muted-foreground">{t("no_games_desc", { searchQuery })}</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
