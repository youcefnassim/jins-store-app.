"use client";

import { packages, Package } from "@/lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { PlayerIdModal } from "@/components/cart/PlayerIdModal";

export function PopularPackages() {
  const t = useTranslations("PopularPackages");
  const popularPackages = packages.filter((p) => p.gameId === "mobile-legends" && p.active);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPkgForCart, setSelectedPkgForCart] = useState<Package | null>(null);
  const { addItem } = useCartStore();

  // Scroll left or right helper
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 300;

    if (direction === "left") {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Automatic infinite sliding banner effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 290, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleAddToCartConfirm = (playerId: string, zoneId?: string) => {
    if (selectedPkgForCart) {
      addItem({
        packageId: selectedPkgForCart.id,
        gameId: selectedPkgForCart.gameId,
        gameName: "Mobile Legends",
        name: `${selectedPkgForCart.amount} Diamonds`,
        price: selectedPkgForCart.price,
        playerId,
        zoneId,
        image: "/logo.jpg",
      });
      setSelectedPkgForCart(null);
    }
  };

  return (
    <section id="offers" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header with Title and Control Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-bold mb-3 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Offres Exclusives MLBB
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("description")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end">
            {/* Slider Control Arrows */}
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10">
              <button
                onClick={() => handleScroll("left")}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center transition-all shadow-sm"
                aria-label="Previous offer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center transition-all shadow-sm"
                aria-label="Next offer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Button
              asChild
              variant="outline"
              className="rounded-full border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs md:text-sm font-semibold"
            >
              <Link href="/recharge">{t("view_all")}</Link>
            </Button>
          </div>
        </div>

        {/* Automatic Horizontal Carousel Banner (One Single Row) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative"
        >
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-5 overflow-x-auto scroll-smooth py-4 px-1 no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {popularPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="shrink-0 w-[270px] sm:w-[290px] snap-start"
              >
                <Card className="glass-card h-full flex flex-col relative overflow-hidden group border border-slate-200 dark:border-white/10 shadow-xl hover:border-cyan-500/50 transition-all duration-300">
                  {/* Cart Icon Quick Add Top Right */}
                  <button
                    onClick={() => setSelectedPkgForCart(pkg)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all backdrop-blur-md"
                    title="Ajouter au panier"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>

                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-gradient-to-r from-primary to-purple-500 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-4 rounded-br-xl shadow-md">
                        {t("popular")}
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-7 items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-500 border border-cyan-500/30">
                      <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-500 rotate-45 rounded-sm shadow-[0_0_25px_rgba(34,211,238,0.8)]" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {pkg.amount}
                    </h3>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t("diamonds")}
                    </p>
                  </CardHeader>

                  <CardContent className="text-center pb-5 flex-grow flex items-center justify-center">
                    <div className="flex items-baseline gap-1 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {pkg.price}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {siteConfig.currency}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-none font-bold rounded-xl h-11 text-sm transition-all hover:scale-[1.02]"
                    >
                      <Link href={`/recharge?package=${pkg.id}`}>
                        {t("recharge_now")}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Player ID Modal for Quick Cart Addition */}
        <PlayerIdModal
          isOpen={!!selectedPkgForCart}
          onClose={() => setSelectedPkgForCart(null)}
          onConfirm={handleAddToCartConfirm}
          gameName="Mobile Legends"
        />
      </div>
    </section>
  );
}
