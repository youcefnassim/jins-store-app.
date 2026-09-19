"use client";

import { Zap, ShieldCheck, HeadphonesIcon, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrustBadges() {
  const t = useTranslations("TrustBadges");

  const features = [
    {
      icon: TrendingDown,
      title: t("b4_title"),
      description: t("b4_desc"),
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: HeadphonesIcon,
      title: t("b3_title"),
      description: t("b3_desc"),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: ShieldCheck,
      title: t("b2_title"),
      description: t("b2_desc"),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Zap,
      title: t("b1_title"),
      description: t("b1_desc"),
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="py-12 relative z-10 -mt-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${feature.bg} group-hover:scale-110`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
