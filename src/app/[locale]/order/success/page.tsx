import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getTranslations } from "next-intl/server";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const t = await getTranslations("OrderSuccess");
  const params = await searchParams;
  const orderId = params.id || "MLBB-XXXXXX-XXXX";

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 md:p-12 text-center border-t-4 border-t-primary relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-[50px] -z-10" />
        
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("description")}
        </p>
        
        <div className="bg-black/5 dark:bg-black/40 rounded-xl p-4 mb-8 border border-black/10 dark:border-white/5">
          <p className="text-sm text-muted-foreground mb-1">{t("order_number")}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-widest">{orderId}</p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground hover:bg-slate-800 dark:hover:bg-primary/90 h-12">
            <Link href={`/track?id=${orderId}`}>
              {t("track_order")}
              <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 w-4 h-4 rtl:rotate-180" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full h-12 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
            <Link href="/">{t("back_home")}</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full h-12 text-muted-foreground hover:text-slate-900 dark:hover:text-white mt-2">
            <Link href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank">
              <MessageCircle className="mr-2 rtl:ml-2 rtl:mr-0 w-4 h-4" />
              {t("contact_support")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
