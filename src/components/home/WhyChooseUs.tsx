import { Zap, ShieldCheck, WalletCards, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function WhyChooseUs() {
  const t = useTranslations("WhyChooseUs");
  const reasons = [
    {
      icon: Zap,
      title: t("reasons.1.title"),
      description: t("reasons.1.description"),
    },
    {
      icon: ShieldCheck,
      title: t("reasons.2.title"),
      description: t("reasons.2.description"),
    },
    {
      icon: WalletCards,
      title: t("reasons.3.title"),
      description: t("reasons.3.description"),
    },
    {
      icon: Headphones,
      title: t("reasons.4.title"),
      description: t("reasons.4.description"),
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map((reason, index) => (
            <Card key={index} className="glass-card border-white/5 hover:border-primary/50 transition-colors">
              <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 sm:mb-4 text-primary">
                  <reason.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-white leading-tight">{reason.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-2 sm:pt-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-snug sm:leading-relaxed">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
