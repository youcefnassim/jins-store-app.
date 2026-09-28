"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
                  glareMaxOpacity={0.3}
                  glareColor="#ffffff"
                  glarePosition="all"
                  className="h-full"
                  tiltEnable={game.isAvailable}
                >
                  <Card className={`glass-card overflow-hidden group border-black/10 dark:border-white/10 transition-colors h-full flex flex-col ${game.isAvailable ? 'hover:border-primary/50' : 'opacity-60 grayscale'}`}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-indigo-900 to-purple-900 relative flex items-center justify-center overflow-hidden">
                      {game.image_url ? (
                        <img src={game.image_url} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      )}
                      
                      {game.emoji ? (
                        <span className="text-4xl sm:text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-lg">{game.emoji}</span>
                      ) : (
                        <Gamepad2 className="w-10 h-10 sm:w-16 sm:h-16 text-white/50 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                      )}
                      
                      {!game.isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                          <span className="bg-black/80 text-white px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase border border-white/10 text-center">
                            {t("coming_soon")}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 sm:p-6 text-center flex flex-col gap-2 sm:gap-4 flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-1">{game.name}</h3>
                        <p className="text-xs sm:text-sm text-primary font-medium">{game.currencyName}</p>
                      </div>
                      <Button 
                        asChild={game.isAvailable} 
                        disabled={!game.isAvailable}
                        className={`w-full ${game.isAvailable ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white relative z-10' : 'bg-black/5 text-slate-400 dark:bg-white/5 dark:text-white/50'}`}
                      >
                        {game.isAvailable ? (
                          <Link href={game.id === "mobile-legends" ? `/recharge` : `/games/${game.id}`}>{t("recharge_now")}</Link>
                        ) : (
                          <span>{t("unavailable")}</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
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
