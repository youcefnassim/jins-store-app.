import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameBySlug, getPackagesByGame } from "@/lib/supabase/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Copy, Flame, Gamepad2, HelpCircle, Info, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface GameDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: locale === "ar" ? "اللعبة غير متوفرة - Jin's Store" : "Jeu Introuvable - Jin's Store",
    };
  }

  const title = locale === "ar" 
    ? `شحن ${game.name} الجزائر - Jin's Store` 
    : `Recharge ${game.name} Algérie - Jin's Store`;
  const description = locale === "ar"
    ? `اشحن رصيد وجواهر ${game.name} في الجزائر فورياً عبر بريدي موب، CCP، فليكسي وريدوت باي.`
    : `Rechargez vos crédits et diamants pour ${game.name} en Algérie par BaridiMob, CCP, Flexy et RedotPay instantanément.`;

  return {
    title,
    description,
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "GameDetail" });
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const packages = await getPackagesByGame(slug);

  const isFreeFire = slug === "free-fire" || slug.includes("freefire");
  const isPubg = slug === "pubg-mobile" || slug.includes("pubg");
  const isValorant = slug === "valorant";

  const getCurrencyName = () => {
    if (isFreeFire) return t("currencies.free_fire");
    if (isPubg) return t("currencies.pubg");
    if (isValorant) return t("currencies.valorant");
    return t("currencies.default");
  };

  const getTutorialSteps = () => {
    if (isFreeFire) {
      return [
        {
          num: 1,
          title: t("tutorials.free_fire.step_1_title"),
          desc: t("tutorials.free_fire.step_1_desc"),
        },
        {
          num: 2,
          title: t("tutorials.free_fire.step_2_title"),
          desc: t("tutorials.free_fire.step_2_desc"),
        },
        {
          num: 3,
          title: t("tutorials.free_fire.step_3_title"),
          desc: t("tutorials.free_fire.step_3_desc"),
        },
        {
          num: 4,
          title: t("tutorials.free_fire.step_4_title"),
          desc: t("tutorials.free_fire.step_4_desc"),
        },
      ];
    }

    if (isPubg) {
      return [
        {
          num: 1,
          title: t("tutorials.pubg.step_1_title"),
          desc: t("tutorials.pubg.step_1_desc"),
        },
        {
          num: 2,
          title: t("tutorials.pubg.step_2_title"),
          desc: t("tutorials.pubg.step_2_desc"),
        },
        {
          num: 3,
          title: t("tutorials.pubg.step_3_title"),
          desc: t("tutorials.pubg.step_3_desc"),
        },
        {
          num: 4,
          title: t("tutorials.pubg.step_4_title"),
          desc: t("tutorials.pubg.step_4_desc"),
        },
      ];
    }

    return [
      {
        num: 1,
        title: t("tutorials.default.step_1_title"),
        desc: t("tutorials.default.step_1_desc"),
      },
      {
        num: 2,
        title: t("tutorials.default.step_2_title"),
        desc: t("tutorials.default.step_2_desc"),
      },
      {
        num: 3,
        title: t("tutorials.default.step_3_title"),
        desc: t("tutorials.default.step_3_desc"),
      },
      {
        num: 4,
        title: t("tutorials.default.step_4_title"),
        desc: t("tutorials.default.step_4_desc"),
      },
    ];
  };

  const tutorialSteps = getTutorialSteps();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-16 pb-16 md:pb-24 overflow-hidden border-b border-white/10 bg-gradient-to-b from-black/60 via-slate-950/80 to-background">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              <Link href="/games" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                {t("back_to_games")}
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Game Card / Cover */}
            <div className="relative group shrink-0">
              <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl relative bg-slate-900 flex items-center justify-center">
                {game.image_url ? (
                  <>
                    {/* Ambient backdrop */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-125"
                      style={{ backgroundImage: `url(${game.image_url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <img
                      src={game.image_url}
                      alt={game.name}
                      className="relative z-10 max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-purple-950">
                    {game.emoji ? (
                      <span className="text-7xl">{game.emoji}</span>
                    ) : (
                      <Gamepad2 className="w-20 h-20 text-primary" />
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 inset-x-3 text-center z-20">
                  <span className="inline-block bg-primary/90 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-md">
                    {game.category || (locale === "ar" ? "ألعاب الجوال" : "Jeu Mobile")}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Info & Quick CTA */}
            <div className="text-center md:text-left rtl:md:text-right flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {t("official_instant")}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                {game.name}
              </h1>

              <p className="text-lg md:text-xl text-primary font-semibold mb-4">
                {getCurrencyName()}
              </p>

              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
                {t("recharge_desc", { game: game.name })}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start rtl:md:justify-start gap-3">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 text-base rounded-xl font-bold shadow-lg shadow-primary/25">
                  <Link href={`/recharge?game=${game.slug}`}>
                    <Zap className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t("recharge_now")}
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-xl border-white/15">
                  <a href="#packages">
                    {t("view_packages")} ({packages.length})
                  </a>
                </Button>
              </div>

              <div className="flex items-center justify-center md:justify-start rtl:md:justify-start gap-4 mt-6 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t("secure_100")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{t("fast_delivery")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>{t("no_password")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Packages & Tutorial */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Left Column: ID Tutorial */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {t("how_to_find_id")}
              </h2>

              <Card className="glass-card border-black/10 dark:border-white/10 overflow-hidden shadow-lg">
                <div className="p-5 border-b border-white/5 bg-primary/5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("id_notice")}
                  </p>
                </div>
                <CardContent className="p-5">
                  <ol className="space-y-4">
                    {tutorialSteps.map((step) => (
                      <li key={step.num} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs mt-0.5">
                          {step.num}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs sm:text-sm">
                <Info className="w-5 h-5 flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
                <p>
                  {t("id_warning")}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Packages Grid */}
          <div className="lg:col-span-2" id="packages">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {t("available_packages")}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {t("select_package_desc")}
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                {packages.length} {locale === "ar" ? "باقات" : "packs"}
              </span>
            </div>

            {packages.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-lg font-bold text-white mb-1">{t("out_of_stock_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("out_of_stock_desc")}
                </p>
                <Button asChild variant="outline">
                  <Link href="/games">{t("explore_other_games")}</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="glass-card border-black/10 dark:border-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-xl relative overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent border border-primary/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {isFreeFire ? (
                            <div className="w-6 h-6 rotate-45 bg-amber-400 rounded-sm shadow-[0_0_12px_rgba(251,191,36,0.6)] flex items-center justify-center">
                              <span className="text-[10px] -rotate-45 font-black text-black">💎</span>
                            </div>
                          ) : (
                            <Sparkles className="w-6 h-6 text-primary" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-primary transition-colors">
                            {pkg.label}
                          </h3>
                          <p className="text-primary font-mono font-bold text-sm sm:text-base">
                            {pkg.price.toLocaleString()} {siteConfig.currency}
                          </p>
                        </div>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-4 rounded-xl shadow-md shrink-0"
                      >
                        <Link href={`/recharge?game=${game.slug}&package=${pkg.id}`}>
                          {t("choose")}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Direct Banner CTA */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-purple-600/10 to-transparent border border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {t("direct_order_title")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("direct_order_desc")}
                </p>
              </div>

              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shrink-0">
                <Link href={`/recharge?game=${game.slug}`}>
                  {t("start_recharge")}
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
