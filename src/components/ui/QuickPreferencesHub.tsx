"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useCurrencyStore, Currency } from "@/store/useCurrencyStore";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  Globe,
  Coins,
  Sun,
  Moon,
  ChevronDown,
  Check,
} from "lucide-react";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇩🇿" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const currencies: { code: Currency; label: string; flag: string }[] = [
  { code: "DZD", label: "Dinar (DA)", flag: "🇩🇿" },
  { code: "EUR", label: "Euro (€)", flag: "🇪🇺" },
  { code: "USD", label: "Dollar ($)", flag: "🇺🇸" },
];

const emptySubscribe = () => () => {};

export function QuickPreferencesHub() {
  const t = useTranslations("QuickSettings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isAr = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentCurrency, setCurrency } = useCurrencyStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const currentLang = languages.find((l) => l.code === locale) || languages[0];
  const activeTheme = mounted ? (resolvedTheme || theme || "dark") : "dark";
  const isDark = activeTheme === "dark";

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof document !== "undefined") {
      document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLocale;
    }
    const searchParams = typeof window !== "undefined" ? window.location.search : "";
    const fullPath = `${pathname}${searchParams}`;
    router.replace(fullPath, { locale: newLocale });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* The Language & Preferences Pill Button (matching Photo 2: [ 🌐 FR / AR ]) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/90 dark:hover:bg-white/10 border border-slate-200/90 dark:border-white/10 transition-all shadow-sm group shrink-0"
        title="Langue & Préférences"
        aria-label="Language & Preferences"
      >
        <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors shrink-0" />

        <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 tracking-wider uppercase font-mono">
          {locale === "ar" ? (
            <>
              <span className="font-black underline decoration-primary underline-offset-2">AR</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <span className="text-slate-500 hidden sm:inline">FR</span>
            </>
          ) : locale === "en" ? (
            <>
              <span className="font-black underline decoration-primary underline-offset-2">EN</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <span className="text-slate-500 hidden sm:inline">FR</span>
            </>
          ) : (
            <>
              <span className="font-black underline decoration-primary underline-offset-2">FR</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <span className="text-slate-500 hidden sm:inline">AR</span>
            </>
          )}
        </span>
      </button>

      {/* Unified Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-full ${
              isAr ? "left-0" : "right-0"
            } mt-2 w-[280px] sm:w-[320px] bg-white/95 dark:bg-[#0c1020]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 space-y-4 text-slate-900 dark:text-white`}
          >
            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>{t("language")}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {languages.map((lang) => {
                  const isSelected = locale === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                          : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span>{t("currency")}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {currencies.map((curr) => {
                  const isSelected = currentCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                          : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{curr.flag}</span>
                      <span className="font-mono">{curr.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("theme")}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isDark
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t("light")}</span>
                  {!isDark && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDark
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t("dark")}</span>
                  {isDark && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
