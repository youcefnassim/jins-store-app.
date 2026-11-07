"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Gamepad2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface GamePackage {
  id: string;
  price: number;
}

interface GameItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  image_url?: string;
  packages?: GamePackage[];
}

const LOCAL_FALLBACKS: Record<string, string> = {
  "mobile-legends": "/images/games/mobile-legends.png",
  "free-fire": "/images/games/free-fire.png",
  "pubg-mobile": "/images/games/pubg-mobile.png",
  "valorant": "/images/games/valorant.png",
};

export function NavbarSearch() {
  const t = useTranslations("NavbarSearch");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState<GameItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch games on initial focus/click
  const fetchGames = async () => {
    if (hasFetched) return;
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      if (data?.games) {
        setGames(data.games);
        setHasFetched(true);
      }
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        fetchGames();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasFetched]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return games.filter((g) => {
      const nameMatch = g.name?.toLowerCase().includes(q);
      const slugMatch = g.slug?.toLowerCase().includes(q);
      const catMatch = g.category?.toLowerCase().includes(q);
      return nameMatch || slugMatch || catMatch;
    });
  }, [games, query]);

  // Keyboard navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || filteredGames.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredGames.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredGames.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < filteredGames.length) {
      e.preventDefault();
      const selected = filteredGames[activeIndex];
      const targetUrl =
        selected.slug === "mobile-legends"
          ? "/recharge?game=mobile-legends"
          : `/games/${selected.slug}`;
      setIsOpen(false);
      setQuery("");
      router.push(targetUrl);
    }
  };

  const getMinPrice = (game: GameItem) => {
    if (!game.packages || game.packages.length === 0) return null;
    const prices = game.packages.map((p) => Number(p.price) || 0).filter((p) => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Bar Input Pill */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm ${
          isOpen && query.trim()
            ? "ring-2 ring-primary/40 border-primary/50 bg-white dark:bg-white/10"
            : "hover:bg-slate-200/80 dark:hover:bg-white/10"
        } w-20 xs:w-28 sm:w-36 md:w-40 focus-within:w-36 xs:focus-within:w-44 sm:focus-within:w-52 md:focus-within:w-60`}
      >
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            fetchGames();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          className="w-full bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-white truncate"
          aria-label="Rechercher"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Floating Results Popover (Only when typing) */}
      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-full ${
              isAr ? "right-0" : "left-0 sm:left-auto sm:right-0"
            } mt-2 w-[280px] xs:w-[320px] sm:w-[360px] bg-white/95 dark:bg-[#0c1020]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-slate-900 dark:text-white`}
          >
            {/* Header label */}
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{query.trim() ? t("results") : t("trending")}</span>
              {games.length > 0 && (
                <span className="text-[10px] text-slate-400/80 font-normal lowercase">
                  {filteredGames.length} {t("games_count")}
                </span>
              )}
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto space-y-1 py-1">
              {filteredGames.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <Gamepad2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("no_results")}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("no_results_desc")}
                  </p>
                </div>
              ) : (
                filteredGames.map((game, index) => {
                  const minPrice = getMinPrice(game);
                  const isSelected = index === activeIndex;
                  const targetUrl =
                    game.slug === "mobile-legends"
                      ? "/recharge?game=mobile-legends"
                      : `/games/${game.slug}`;

                  const resolvedImage =
                    LOCAL_FALLBACKS[game.slug] || game.image_url || "/logo.jpg";

                  return (
                    <Link
                      key={game.slug}
                      href={targetUrl}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-all ${
                        isSelected
                          ? "bg-primary/10 dark:bg-primary/20 border border-primary/30"
                          : "hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0 border border-black/5 dark:border-white/10 flex items-center justify-center">
                          <img
                            src={resolvedImage}
                            alt={game.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (LOCAL_FALLBACKS[game.slug]) {
                                target.src = LOCAL_FALLBACKS[game.slug];
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {game.name}
                          </p>
                          <span className="inline-block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {game.category || "Jeu"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {minPrice !== null && (
                          <div className="text-right">
                            <span className="block text-[9px] text-slate-400">
                              {t("starting_from")}
                            </span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatPrice(minPrice)}
                            </span>
                          </div>
                        )}
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary">
                          {isAr ? (
                            <ArrowLeft className="w-3 h-3" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Bottom Footer */}
            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/10 px-1">
              <Link
                href="/games"
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors text-center rounded-lg hover:bg-primary/5"
              >
                <span>{t("view_all")}</span>
                {isAr ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

