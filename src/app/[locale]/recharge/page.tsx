import { Suspense } from "react";
import { RechargeStepper } from "@/components/recharge/RechargeStepper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Recharge Diamonds",
  description: "Secure and fast Mobile Legends Diamonds recharge.",
};

export default async function RechargePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recharge" });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left rtl:md:text-right">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
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
