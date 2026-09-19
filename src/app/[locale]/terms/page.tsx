import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Terms");
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center md:text-left rtl:md:text-right">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("last_updated")} {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="glass-card border-black/10 dark:border-white/10">
          <CardContent className="p-6 md:p-10 max-w-none text-slate-700 dark:text-white/80 text-left rtl:text-right">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t("s1_title")}</h2>
            <p className="mb-6 leading-relaxed">
              {t("s1_text", { name: siteConfig.name })}
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-8">{t("s2_title")}</h2>
            <p className="mb-6 leading-relaxed">
              {t("s2_text")}
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-8">{t("s3_title")}</h2>
            <p className="mb-6 leading-relaxed">
              {t("s3_text")}
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-8">{t("s4_title")}</h2>
            <p className="mb-6 leading-relaxed">
              {t("s4_text")}
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-8">{t("s5_title")}</h2>
            <p className="mb-6 leading-relaxed">
              {t("s5_text", { email: siteConfig.supportEmail })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
