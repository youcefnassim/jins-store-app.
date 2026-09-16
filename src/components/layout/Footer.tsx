import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-white/10 bg-background/50 py-12 mt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg border border-white/10">
                <img src="/logo.png" alt="Jin's Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("services")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/games" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("all_games")}
                </Link>
              </li>
              <li>
                <Link href="/games/mobile-legends" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("mlbb")}
                </Link>
              </li>
              <li>
                <Link href="/recharge" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("quick_recharge")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("support")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/track" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("track_order")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}. {t("rights")}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
