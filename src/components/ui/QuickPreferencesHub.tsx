"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/routing";
import { useCurrencyStore, CURRENCIES, Currency } from "@/store/useCurrencyStore";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  Globe,
  Coins,
  Sun,
  Moon,
  Search,
  ChevronDown,
  Check,
  X,
  Gamepad2,
  SlidersHorizontal,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<any[]>([]);
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

  // Fetch games for search
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) {
          setGames(data.games);
        }
      })
      .catch(() => {});
  }, []);

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

  const filteredGames = searchQuery.trim()
    ? games.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="relative" ref={containerRef}>
      {/* The Single Unified Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all shadow-sm group"
        title="Préférences : Langue, Devise, Thème & Recherche"
        aria-label="Quick Settings & Preferences"
      >
        <span className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-white uppercase">
          <span>{currentLang.flag}</span>
          <span className="hidden xs:inline">{currentLang.code}</span>
        </span>

        <span className="text-slate-300 dark:text-white/20 text-xs">·</span>

        <span className="text-xs font-extrabold text-primary font-mono tracking-tight">
          {currentCurrency}
        </span>

        <span className="text-slate-300 dark:text-white/20 text-xs">·</span>

        <span className="text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform">
          {mounted && isDark ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          )}
        </span>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
            } mt-2 w-[310px] sm:w-[350px] bg-white/95 dark:bg-[#0c1020]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-50 space-y-4 text-slate-900 dark:text-white`}
          >
            {/* Header & Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? "right-3" : "left-3"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className={`w-full h-10 ${
                    isAr ? "pr-9 pl-8" : "pl-9 pr-8"
                  } text-xs font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary text-slate-900 dark:text-white placeholder-slate-400`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isAr ? "left-2.5" : "right-2.5"
                    } text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown (if typing) */}
              {searchQuery.trim() !== "" && (
                <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl max-h-44 overflow-y-auto p-1.5 space-y-1">
                  {filteredGames.length === 0 ? (
                    <div className="py-3 text-center text-xs text-slate-400">
                      {t("no_results")}
                    </div>
                  ) : (
                    filteredGames.map((g) => (
                      <Link
                        key={g.slug}
                        href={g.slug === "mobile-legends" ? "/recharge?game=mobile-legends" : `/games/${g.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-xs font-medium"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{g.name}</span>
                        </div>
                        <span className="text-[10px] text-primary font-bold shrink-0">
                          {g.category || "Jeu"}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-white/10">
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                          : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-white/10">
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
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
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-white/10">
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

