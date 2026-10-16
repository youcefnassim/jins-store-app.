import { Suspense } from "react";
import { RechargeStepper } from "@/components/recharge/RechargeStepper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Recharge Diamonds",
  description: "Secure and fast Mobile Legends Diamonds recharge.",
};

import { getGameBySlug } from "@/lib/supabase/database";

export default async function RechargePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ game?: string; package?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recharge" });
  const sParams = searchParams ? await searchParams : {};
  const gameSlug = sParams.game || "mobile-legends";
  
  // Fetch requested game data to show its image and title
  const game = (await getGameBySlug(gameSlug)) || (await getGameBySlug("mobile-legends"));
  const gameTitle = game?.name ? `Recharger ${game.name}` : t("title");
  const gameDesc = game?.name 
    ? `Sélectionnez votre forfait de crédits pour ${game.name} et recevez votre recharge rapidement.` 
    : t("description");

  return (
    <div className="container mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4">
      <div className="max-w-6xl mx-auto">
        {game?.image_url && (
          <div className="mb-6 w-full h-44 sm:h-56 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center group">
            {/* Ambient blurred backdrop so the container is full of vibrant game atmosphere */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 transition-transform duration-700 group-hover:scale-130"
              style={{ backgroundImage: `url(${game.image_url})` }}
            />
            {/* Gradient overlays for readability and depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-black/30 to-black/20 z-10" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 z-10" />

            {/* Foreground image: perfectly centered, 100% visible, never cut or cropped */}
            <img 
              src={game.image_url} 
              alt={game.name || "Game Banner"} 
              className="relative z-20 max-h-[85%] max-w-[90%] object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        
        <div className="mb-4 sm:mb-6 text-center md:text-left rtl:md:text-right">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 flex items-center justify-center md:justify-start gap-2.5">
            {gameTitle}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {gameDesc}
          </p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
          <RechargeStepper />
        </Suspense>
      </div>
    </div>
  );
}
