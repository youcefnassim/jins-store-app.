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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recharge" });
  
  // Try to fetch Mobile Legends game data to show its image
  const game = await getGameBySlug("mobile-legends");

  return (
    <div className="container mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4">
      <div className="max-w-6xl mx-auto">
        {game?.image_url && (
          <div className="mb-4 w-full h-36 sm:h-48 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent to-transparent z-10" />
            <img 
              src={game.image_url} 
              alt="Mobile Legends" 
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}
        
        <div className="mb-4 sm:mb-6 text-center md:text-left rtl:md:text-right">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 flex items-center justify-center md:justify-start gap-2.5">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("description")}
          </p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
          <RechargeStepper />
        </Suspense>
      </div>
    </div>
  );
}
