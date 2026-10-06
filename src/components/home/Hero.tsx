"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative pt-8 pb-0 md:pt-16 md:pb-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium">
              {t("badge")}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t("title1")} <br />
              <span className="text-gradient">{t("title2")}</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-muted-foreground max-w-[480px]">
              {t("description")}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-xl" onClick={() => { const el = document.getElementById('offers'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
                Recharge Now
                <ArrowRight className="ml-2 w-5 h-5 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-xl bg-white/10 text-slate-900 dark:text-white border-white/20 hover:bg-white/20 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm transition-all">
                <Link href="/games">
                  <Gamepad2 className="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" />
                  {t("cta_games")}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
