"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Coins } from "lucide-react";
import { useCurrencyStore, CURRENCIES, Currency } from "@/store/useCurrencyStore";

export function CurrencySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentCurrency, setCurrency } = useCurrencyStore();

  const currentConfig = CURRENCIES[currentCurrency] || CURRENCIES.DZD;

  const handleSelect = (code: Currency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all shadow-sm"
        title="Changer de devise / Currency / العملة"
      >
        <span className="text-sm">{currentConfig.flag}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">
          {currentConfig.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3 h-3 text-primary" />
              Devise d'affichage
            </div>

            {(Object.keys(CURRENCIES) as Currency[]).map((code) => {
              const config = CURRENCIES[code];
              const isSelected = currentCurrency === code;

              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{config.flag}</span>
                    <div>
                      <span className="font-semibold">{config.code}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({config.symbol})
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
