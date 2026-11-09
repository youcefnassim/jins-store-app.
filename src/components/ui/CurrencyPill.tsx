"use client";

import { useSyncExternalStore } from "react";
import { useCurrencyStore, Currency } from "@/store/useCurrencyStore";
import { motion, AnimatePresence } from "framer-motion";

const emptySubscribe = () => () => {};

const CURRENCY_ORDER: Currency[] = ["DZD", "USD", "EUR"];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  DZD: "DA",
  USD: "$",
  EUR: "€",
};

const CURRENCY_LABELS: Record<Currency, string> = {
  DZD: "Dinar Algérien (DA)",
  USD: "Dollar ($)",
  EUR: "Euro (€)",
};

export function CurrencyPill() {
  const { currentCurrency, setCurrency } = useCurrencyStore();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const activeCurrency: Currency = mounted ? currentCurrency : "DZD";

  const handleCycle = () => {
    const currentIndex = CURRENCY_ORDER.indexOf(activeCurrency);
    const nextIndex = (currentIndex + 1) % CURRENCY_ORDER.length;
    setCurrency(CURRENCY_ORDER[nextIndex]);
  };

  const nextCurrency = CURRENCY_ORDER[(CURRENCY_ORDER.indexOf(activeCurrency) + 1) % CURRENCY_ORDER.length];

  return (
    <button
      type="button"
      onClick={handleCycle}
      className="relative h-8 sm:h-9 min-w-[38px] sm:min-w-[44px] px-2.5 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/90 dark:hover:bg-white/10 border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all active:scale-95 group shrink-0 select-none cursor-pointer"
      title={`Devise active : ${CURRENCY_LABELS[activeCurrency]} — Cliquer pour changer en ${CURRENCY_LABELS[nextCurrency]}`}
      aria-label={`Changer de devise. Actuelle : ${CURRENCY_LABELS[activeCurrency]}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={activeCurrency}
          initial={{ opacity: 0, y: -5, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.85 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="font-mono font-black text-xs sm:text-sm text-primary dark:text-purple-400 tracking-wider"
        >
          {CURRENCY_SYMBOLS[activeCurrency]}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
