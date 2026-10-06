import { UserCircle, Diamond, CreditCard, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = [
    {
      icon: UserCircle,
      title: t("steps.1.title"),
      description: t("steps.1.description"),
    },
    {
      icon: Diamond,
      title: t("steps.2.title"),
      description: t("steps.2.description"),
    },
    {
      icon: CreditCard,
      title: t("steps.3.title"),
      description: t("steps.3.description"),
    },
    {
      icon: Send,
      title: t("steps.4.title"),
      description: t("steps.4.description"),
    },
    {
      icon: CheckCircle2,
      title: t("steps.5.title"),
      description: t("steps.5.description"),
    }
  ];

  return (
    <section className="py-20 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-white/5 -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 md:mb-6 relative">
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 rtl:-right-auto rtl:-left-1 md:rtl:-left-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 md:border-4 border-background">
                  {index + 1}
                </div>
                <step.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-base md:text-lg text-slate-900 dark:text-white mb-1 md:mb-2 leading-tight">{step.title}</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-muted-foreground max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
