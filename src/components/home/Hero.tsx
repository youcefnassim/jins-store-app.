"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-6"
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
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-xl" onClick={() => { const el = document.getElementById('offers'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
                Recharge Now
                <ArrowRight className="ml-2 w-5 h-5 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5">
                <Link href="/track">
                  <Search className="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" />
                  {t("cta_track")}
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-[500px] aspect-square mx-auto lg:mx-0 flex items-center justify-center"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />

            {/* Jin's Store Logo */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              {/* Outer glow pulse */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute inset-0 rounded-3xl border-2 border-blue-400/30"
              />
              <img
                src="/logo.jpg"
                alt="Jin's Store"
                className="relative w-48 h-48 rounded-3xl object-cover border-2 border-white/20 shadow-[0_0_60px_rgba(59,130,246,0.5)]"
              />
            </motion.div>

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -40, 0],
                  x: [0, i % 2 === 0 ? 20 : -20, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3 + i, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.5 
                }}
                className="absolute w-6 h-6 bg-blue-400/50 rounded-sm rotate-45 blur-[2px]"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${20 + i * 15}%`,
                }}
              />
            ))}
          </motion.div>


        </div>
      </div>
    </section>
  );
}
