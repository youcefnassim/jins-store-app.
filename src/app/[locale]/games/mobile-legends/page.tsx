import { packages } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, HelpCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Mobile Legends Diamonds Recharge",
  description: "Recharge your Mobile Legends Diamonds instantly with local payment methods in Algeria.",
};

export default function MobileLegendsPage() {
  const t = useTranslations("MobileLegends");
  const mlbbPackages = packages.filter(p => p.gameId === "mobile-legends" && p.active).slice(0, 6);

  return (
    <div className="pb-20">
      {/* Game Hero */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-white/10 bg-black/20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-900 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-black text-white text-xl">MLBB</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            {t("title")}
          </h1>
          <p className="text-xl text-primary font-medium mb-8">{t("subtitle")}</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 h-14 px-10 text-lg rounded-xl">
            <Link href="/recharge?game=mobile-legends">{t("start")}</Link>
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: ID Tutorial */}
        <div className="lg:col-span-1 space-y-8 text-left rtl:text-right">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("how_to")}</h2>
            
            <Card className="glass-card border-black/10 dark:border-white/10 overflow-hidden">
              <div className="aspect-video bg-black/5 dark:bg-black/40 flex items-center justify-center border-b border-black/10 dark:border-white/5 relative">
                {/* Visual Placeholder for tutorial */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
                <div className="z-10 flex flex-col items-center">
                  <HelpCircle className="w-12 h-12 text-white/50 mb-2" />
                  <span className="text-sm text-white/70">{t("screenshot")}</span>
                </div>
              </div>
              <CardContent className="p-6">
                <ol className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">1</span>
                    <p>{t("step_1")}</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">2</span>
                    <p>{t("step_2")}</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">3</span>
                    <p dangerouslySetInnerHTML={{ __html: t("step_3") }} />
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">4</span>
                    <p dangerouslySetInnerHTML={{ __html: t("step_4") }} />
                  </li>
                </ol>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
              <p>{t("warning")}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Packages Preview */}
        <div className="lg:col-span-2 text-left rtl:text-right">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("packages")}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mlbbPackages.map((pkg) => (
              <Card key={pkg.id} className="glass-card border-black/10 dark:border-white/5 hover:border-primary/30 transition-colors flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 bg-cyan-400 rotate-45 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{pkg.amount} {t("diamonds")}</h3>
                    <p className="text-primary font-medium text-sm">{pkg.price} {siteConfig.currency}</p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white hover:bg-primary hover:text-white border border-black/10 dark:border-white/10 shrink-0">
                  <Link href={`/recharge?package=${pkg.id}`}>{t("select")}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
