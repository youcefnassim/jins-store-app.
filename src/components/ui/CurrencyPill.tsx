"use client";

import { useSyncExternalStore } from "react";
import { useCurrencyStore, Currency } from "@/store/useCurrencyStore";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function CurrencyPill() {
  const { currentCurrency, setCurrency } = useCurrencyStore();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const activeCurrency = mounted ? currentCurrency : "DZD";

  return (
    <div
      role="group"
      aria-label="Currency Selector"
      className="flex items-center rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/90 dark:hover:bg-white/10 border border-slate-200/90 dark:border-white/10 px-1 py-0.5 sm:px-1.5 sm:py-1 shadow-sm transition-all shrink-0 select-none"
    >
      {/* USD Button: Symbol $ */}
      <button
        type="button"
        onClick={() => setCurrency("USD")}
        className={cn(
          "px-1.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all",
          activeCurrency === "USD"
            ? "bg-primary text-white shadow-sm font-black scale-105"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        )}
        title="Dollar ($ / USD)"
        aria-pressed={activeCurrency === "USD"}
      >
        $
      </button>

      <span className="text-slate-300 dark:text-white/20 text-[10px] select-none mx-0.5">/</span>

      {/* EUR Button: Symbol € */}
      <button
        type="button"
        onClick={() => setCurrency("EUR")}
        className={cn(
          "px-1.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all",
          activeCurrency === "EUR"
            ? "bg-primary text-white shadow-sm font-black scale-105"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        )}
        title="Euro (€ / EUR)"
        aria-pressed={activeCurrency === "EUR"}
      >
        €
      </button>

      <span className="text-slate-300 dark:text-white/20 text-[10px] select-none mx-0.5">/</span>

      {/* DZD Button: Symbol DA */}
      <button
        type="button"
        onClick={() => setCurrency("DZD")}
        className={cn(
          "px-1.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all",
          activeCurrency === "DZD"
            ? "bg-primary text-white shadow-sm font-black scale-105"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        )}
        title="Dinar Algérien (DA / DZD)"
        aria-pressed={activeCurrency === "DZD"}
      >
        DA
      </button>
    </div>
  );
}
