import { Card, CardContent } from "@/components/ui/card";
import { paymentMethods } from "@/lib/mock-data";
import { Wallet, Landmark, CreditCard, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

export function PaymentMethods() {
  const t = useTranslations("PaymentMethods");

  const getIcon = (id: string) => {
    switch (id) {
      case "baridimob": return <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-[#facc15]" />;
      case "ccp": return <Landmark className="w-6 h-6 sm:w-8 sm:h-8 text-[#60a5fa]" />;
      case "binance": return <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-[#f59e0b]" />;
      case "flexy": return <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-[#34d399]" />;
      default: return <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />;
    }
  };

  return (
    <section className="py-20 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="glass-card hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  {getIcon(method.id)}
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-sm sm:text-lg text-slate-900 dark:text-white leading-tight mb-1">{t(`methods.${method.id}.name`) || method.name}</h3>
                  <p className="text-[11px] sm:text-sm text-slate-600 dark:text-muted-foreground line-clamp-2 leading-tight">
                    {t(`methods.${method.id}.description`) || method.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
