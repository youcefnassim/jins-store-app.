"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { ChevronDown, Gamepad2, Headphones, ShieldCheck } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer className="border-t border-white/10 bg-background/50 py-8 sm:py-10 mt-6 sm:mt-10 pb-28 md:pb-10">
      <div className="container mx-auto px-4 md:px-6">
        {/* ─── MOBILE VIEW (< md) : Accordéon compact pour minimiser l'espace ─── */}
        <div className="md:hidden space-y-4">
          {/* Logo & Description */}
          <div className="pb-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg border border-white/10 shadow-sm">
                <img src="/logo.jpg" alt="Jin's Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-2">
            {/* 1. Services */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200">
              <button
                type="button"
                onClick={() => toggleSection("services")}
                className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-foreground hover:bg-white/[0.04] transition-colors"
                aria-expanded={openSection === "services"}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span>{t("services")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/60 font-mono">4</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      openSection === "services" ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSection === "services"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="px-4 pb-3.5 pt-1 space-y-2.5 text-sm border-t border-white/5 bg-black/20">
                    <li>
                      <Link
                        href="/games"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {t("all_games")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/games/mobile-legends"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {t("mlbb")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/recharge"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {t("quick_recharge")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/check-id"
                        className="text-primary font-semibold hover:underline transition-colors flex items-center gap-2 py-1"
                      >
                        <span>🔍 Game ID Checker</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Support */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200">
              <button
                type="button"
                onClick={() => toggleSection("support")}
                className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-foreground hover:bg-white/[0.04] transition-colors"
                aria-expanded={openSection === "support"}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <span>{t("support")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/60 font-mono">3</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      openSection === "support" ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSection === "support"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="px-4 pb-3.5 pt-1 space-y-2.5 text-sm border-t border-white/5 bg-black/20">
                    <li>
                      <Link
                        href="/track"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                        {t("track_order")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                        {t("faq")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                        {t("contact")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Legal */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-200">
              <button
                type="button"
                onClick={() => toggleSection("legal")}
                className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-foreground hover:bg-white/[0.04] transition-colors"
                aria-expanded={openSection === "legal"}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{t("legal")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/60 font-mono">2</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      openSection === "legal" ? "rotate-180 text-purple-400" : ""
                    }`}
                  />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSection === "legal"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="px-4 pb-3.5 pt-1 space-y-2.5 text-sm border-t border-white/5 bg-black/20">
                    <li>
                      <Link
                        href="/terms"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
                        {t("terms")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
                        {t("privacy")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── DESKTOP VIEW (md+) : Grille 4 colonnes classique ─── */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg border border-white/10">
                <img src="/logo.jpg" alt="Jin's Store Logo" className="w-full h-full object-cover" />
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
            <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-primary" />
              {t("services")}
            </h3>
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
              <li>
                <Link href="/check-id" className="text-sm text-primary font-semibold hover:underline transition-colors flex items-center gap-1">
                  <span>🔍 Game ID Checker</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" />
              {t("support")}
            </h3>
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
            <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              {t("legal")}
            </h3>
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

        {/* ─── COPYRIGHT & BASEMENT ─── */}
        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between text-xs md:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.name}. {t("rights")}</p>
          <div className="flex space-x-4 mt-3 md:mt-0 text-xs">
            <span className="text-muted-foreground/60">Fast, Simple & Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
