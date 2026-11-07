"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useTranslations, useLocale } from "next-intl";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import {
  Zap,
  ArrowRight,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameCardData {
  id: string;
  slug: string;
  name: string;
  currencyName: string;
  image: string;
  fallbackImage: string;
  minPrice: number;
  tag: string;
  promoBadge: string;
  theme: {
    accentGlow: string;
    borderGradient: string;
    badgeStyle: string;
    buttonStyle: string;
  };
  link: string;
}

// Default curated games metadata with official high-converting assets
const DEFAULT_GAMES_METADATA: Record<string, Partial<GameCardData>> = {
  "mobile-legends": {
    name: "Mobile Legends: Bang Bang",
    currencyName: "Diamants MLBB",
    image: "/images/games/mobile-legends.png",
    fallbackImage: "/images/games/mobile-legends.png",
    minPrice: 190,
    tag: "tag_moba",
    promoBadge: "promo_mlbb",
    link: "/recharge?game=mobile-legends",
    theme: {
      accentGlow: "group-hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]",
      borderGradient: "group-hover:from-blue-500 group-hover:via-cyan-400 group-hover:to-indigo-500",
      badgeStyle: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      buttonStyle: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25",
    },
  },
  "free-fire": {
    name: "Free Fire",
    currencyName: "Diamonds Free Fire",
    image: "/images/games/free-fire.png",
    fallbackImage: "/images/games/free-fire.png",
    minPrice: 200,
    tag: "tag_br",
    promoBadge: "promo_ff",
    link: "/games/free-fire",
    theme: {
      accentGlow: "group-hover:shadow-[0_0_35px_rgba(249,115,22,0.5)]",
      borderGradient: "group-hover:from-amber-500 group-hover:via-orange-500 group-hover:to-red-500",
      badgeStyle: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      buttonStyle: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/25",
    },
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    currencyName: "Unknown Cash (UC)",
    image: "/images/games/pubg-mobile.png",
    fallbackImage: "/images/games/pubg-mobile.png",
    minPrice: 120,
    tag: "tag_survival",
    promoBadge: "promo_pubg",
    link: "/games/pubg-mobile",
    theme: {
      accentGlow: "group-hover:shadow-[0_0_35px_rgba(234,179,8,0.5)]",
      borderGradient: "group-hover:from-yellow-400 group-hover:via-amber-500 group-hover:to-orange-500",
      badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      buttonStyle: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-amber-500/25",
    },
  },
  "valorant": {
    name: "Valorant",
    currencyName: "Points Valorant (VP)",
    image: "/images/games/valorant.png",
    fallbackImage: "/images/games/valorant.png",
    minPrice: 450,
    tag: "tag_fps",
    promoBadge: "promo_valorant",
    link: "/games/valorant",
    theme: {
      accentGlow: "group-hover:shadow-[0_0_35px_rgba(244,63,94,0.5)]",
      borderGradient: "group-hover:from-rose-500 group-hover:via-red-500 group-hover:to-pink-500",
      badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      buttonStyle: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/25",
    },
  },
};

export function GamesShowcase() {
  const t = useTranslations("GamesShowcase");
  const locale = useLocale();
  const isAr = locale === "ar";
  const { formatPrice } = useCurrencyStore();

  const [games, setGames] = useState<GameCardData[]>([
    {
      id: "mobile-legends",
      slug: "mobile-legends",
      name: "Mobile Legends: Bang Bang",
      currencyName: "Diamants MLBB",
      image: "/images/games/mobile-legends.png",
      fallbackImage: "/images/games/mobile-legends.png",
      minPrice: 190,
      tag: "tag_moba",
      promoBadge: "promo_mlbb",
      link: "/recharge?game=mobile-legends",
      theme: DEFAULT_GAMES_METADATA["mobile-legends"].theme!,
    },
    {
      id: "free-fire",
      slug: "free-fire",
      name: "Free Fire",
      currencyName: "Diamonds Free Fire",
      image: "/images/games/free-fire.png",
      fallbackImage: "/images/games/free-fire.png",
      minPrice: 200,
      tag: "tag_br",
      promoBadge: "promo_ff",
      link: "/games/free-fire",
      theme: DEFAULT_GAMES_METADATA["free-fire"].theme!,
    },
    {
      id: "pubg-mobile",
      slug: "pubg-mobile",
      name: "PUBG Mobile",
      currencyName: "Unknown Cash (UC)",
      image: "/images/games/pubg-mobile.png",
      fallbackImage: "/images/games/pubg-mobile.png",
      minPrice: 120,
      tag: "tag_survival",
      promoBadge: "promo_pubg",
      link: "/games/pubg-mobile",
      theme: DEFAULT_GAMES_METADATA["pubg-mobile"].theme!,
    },
    {
      id: "valorant",
      slug: "valorant",
      name: "Valorant",
      currencyName: "Points Valorant (VP)",
      image: "/images/games/valorant.png",
      fallbackImage: "/images/games/valorant.png",
      minPrice: 450,
      tag: "tag_fps",
      promoBadge: "promo_valorant",
      link: "/games/valorant",
      theme: DEFAULT_GAMES_METADATA["valorant"].theme!,
    },
  ]);

  // Sync with live DB games
  useEffect(() => {
    async function loadDbGames() {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        if (data.games && data.games.length > 0) {
          const mapped: GameCardData[] = data.games.map((g: any) => {
            const meta = DEFAULT_GAMES_METADATA[g.slug] || {};
            const minPkgPrice = g.packages && g.packages.length > 0
              ? Math.min(...g.packages.map((p: any) => p.price))
              : (meta.minPrice || 150);

            // Extract currency label
            let currName = meta.currencyName || "Crédits";
            if (g.packages && g.packages.length > 0) {
              const parts = g.packages[0].label.split(" ");
              if (parts.length > 1) {
                currName = parts.slice(1).join(" ");
              }
            }

            // Reliable image resolution: prefer our local pristine images if external URL is invalid/pinterest
            let resolvedImage = meta.image || "/images/games/mobile-legends.png";
            if (g.image_url && !g.image_url.includes("pin.it") && (g.image_url.startsWith("http") || g.image_url.startsWith("/"))) {
              resolvedImage = g.image_url;
            }

            return {
              id: g.id || g.slug,
              slug: g.slug,
              name: g.name,
              currencyName: currName,
              image: resolvedImage,
              fallbackImage: meta.fallbackImage || "/images/games/mobile-legends.png",
              minPrice: minPkgPrice,
              tag: meta.tag || "tag_br",
              promoBadge: meta.promoBadge || "instant_badge",
              link: g.slug === "mobile-legends" ? "/recharge?game=mobile-legends" : `/games/${g.slug}`,
              theme: meta.theme || {
                accentGlow: "group-hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]",
                borderGradient: "group-hover:from-purple-500 group-hover:via-violet-400 group-hover:to-indigo-500",
                badgeStyle: "bg-purple-500/20 text-purple-300 border-purple-500/40",
                buttonStyle: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25",
              },
            };
          });

          if (mapped.length > 0) {
            setGames(mapped.slice(0, 4));
          }
        }
      } catch (err) {
        // Fallback to initial games
      }
    }
    loadDbGames();
  }, []);

  return (
    <section className="py-10 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-3 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span>{t("badge")}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
          >
            {t("title_part1")}{" "}
            <span className="text-gradient">{t("title_part2")}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* 2 by 2 Grid (Deux par deux) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-4xl mx-auto">
          {games.map((game, idx) => {
            return (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={8}
                  tiltMaxAngleY={8}
                  scale={1.02}
                  transitionSpeed={2000}
                  glareEnable={true}
                  glareMaxOpacity={0.15}
                  glareColor="#ffffff"
                  glarePosition="all"
                  glareBorderRadius="20px"
                  className="h-full"
                >
                  <Link href={game.link} className="block h-full group">
                    <div
                      className={`relative h-full min-h-[340px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl p-[2px] overflow-hidden transition-all duration-500 ${game.theme.accentGlow}`}
                    >
                      {/* Animated Neon Gradient Border on Hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 ${game.theme.borderGradient} transition-all duration-500 opacity-60 group-hover:opacity-100`}
                      />

                      {/* Inner Card Container */}
                      <div className="relative h-full w-full bg-slate-900/90 dark:bg-[#0b0e1b]/95 backdrop-blur-2xl rounded-[18px] sm:rounded-[22px] overflow-hidden flex flex-col justify-between p-3 sm:p-5 border border-white/10">
                        {/* Ambient Image Backdrop with Blur */}
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 scale-125 blur-lg transition-transform duration-700 ease-out pointer-events-none"
                          style={{ backgroundImage: `url(${game.image})` }}
                        />

                        {/* Top Card Badges */}
                        <div className="relative z-10 flex items-center justify-between gap-1.5">
                          <span
                            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold tracking-wide uppercase border backdrop-blur-md truncate ${game.theme.badgeStyle}`}
                          >
                            {t(game.tag as any)}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/40 border border-white/15 text-[9px] sm:text-[11px] font-semibold text-amber-300 backdrop-blur-md shrink-0">
                            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300 animate-pulse text-amber-300" />
                            <span className="hidden xs:inline">{t("instant_delivery")}</span>
                            <span className="xs:hidden">1-5 min</span>
                          </span>
                        </div>

                        {/* Game Artwork Hero Section */}
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
                          <div className="relative w-full h-24 sm:h-36 flex items-center justify-center">
                            <img
                              src={game.image}
                              alt={game.name}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== game.fallbackImage) {
                                  target.src = game.fallbackImage;
                                }
                              }}
                              className="max-h-20 sm:max-h-32 max-w-[90%] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] group-hover:scale-110 group-hover:-translate-y-1.5 transition-transform duration-500 ease-out"
                            />
                          </div>

                          {/* Floating Promotional Offer Pill */}
                          <div className="mt-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-white text-[9px] sm:text-[11px] font-bold tracking-wide flex items-center gap-1 sm:gap-1.5 backdrop-blur-md shadow-sm group-hover:border-primary/50 transition-colors max-w-full">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{t(game.promoBadge as any)}</span>
                          </div>
                        </div>

                        {/* Bottom Info & Action CTA */}
                        <div className="relative z-10 pt-2.5 sm:pt-3.5 border-t border-white/10 flex flex-col gap-2 sm:gap-3">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-extrabold text-white text-xs sm:text-base md:text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                                {game.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
                                {game.currencyName}
                              </p>
                            </div>
                            <div className="text-right rtl:text-left shrink-0">
                              <span className="block text-[8px] sm:text-[10px] text-slate-400 font-medium">
                                {t("from_price")}
                              </span>
                              <span className="text-xs sm:text-sm md:text-base font-extrabold text-emerald-400 font-mono tracking-tight">
                                {formatPrice(game.minPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div
                            className={`w-full py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl text-white text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg transition-all duration-300 group-hover:shadow-xl ${game.theme.buttonStyle}`}
                          >
                            <span>{t("recharge_btn")}</span>
                            <ArrowRight
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1 ${
                                isAr ? "rtl:rotate-180 rtl:group-hover:-translate-x-1" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Tilt>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner to Explore All Games */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-6 sm:px-8 py-5 sm:py-6 h-auto text-xs sm:text-base font-bold bg-white/5 hover:bg-white/10 border-slate-300 dark:border-white/15 text-slate-900 dark:text-white shadow-md hover:shadow-lg transition-all gap-2 sm:gap-3"
          >
            <Link href="/games">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>{t("view_all_games")}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary rtl:rotate-180" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
