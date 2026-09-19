"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Timer, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function PromoBanner() {
  const t = useTranslations("PromoBanner");

  return (
    <section className="py-12 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden glass-card border-black/10 dark:border-white/10"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 mix-blend-multiply dark:mix-blend-normal z-0" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay z-0" />
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[80px] rounded-full rotate-12" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[120%] bg-pink-500/20 blur-[100px] rounded-full rotate-45" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 text-left rtl:text-right">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3" />
                {t("badge")}
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {t("title")}
              </h2>
              
              <p className="text-white/80 text-lg md:text-xl mb-6">
                {t("description")}
              </p>

              <div className="flex items-center gap-2 text-white/90 bg-black/20 w-fit px-4 py-2 rounded-lg border border-white/10 mb-6 md:mb-0">
                <Timer className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">{t("time_left")}</span>
                <span className="text-sm font-bold font-mono tracking-widest text-amber-300 ml-2 rtl:mr-2 rtl:ml-0">48:00:00</span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-end">
              <Button asChild size="lg" className="w-full md:w-auto bg-white text-violet-900 hover:bg-slate-100 h-14 px-8 text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform duration-300 group">
                <Link href="/recharge?game=mobile-legends">
                  {t("cta")}
                  <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
