"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Smartphone, Copy, Check, Percent, ArrowRightLeft, Sparkles, MessageSquare, PhoneCall, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const QUICK_PRESETS = [190, 350, 500, 700, 1000, 1500, 2000, 3000, 5000];

export function FlexyCalculator() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward"); // forward: base -> flexy, reverse: flexy -> base
  const [basePrice, setBasePrice] = useState<number | string>(1000);
  const [feePercent, setFeePercent] = useState<number>(20);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [flexyPhone, setFlexyPhone] = useState<string>("0550000000");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  useEffect(() => {
    fetch('/api/settings/flexy')
      .then(res => res.json())
      .then(data => {
        if (data.flexyPhone) setFlexyPhone(data.flexyPhone);
      })
      .catch(() => {});
  }, []);

  const handleSavePhone = async () => {
    if (!flexyPhone.trim()) {
      toast.error("Veuillez saisir un numéro valide");
      return;
    }
    setIsSavingPhone(true);
    try {
      const res = await fetch('/api/admin/settings/flexy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flexyPhone: flexyPhone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Numéro Flexy (${flexyPhone.trim()}) enregistré et actif sur le site !`);
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const numericValue = typeof basePrice === "number" ? basePrice : parseFloat(basePrice) || 0;

  // Forward calculations (Base -> Total with +20%)
  const feeAmountForward = Math.round(numericValue * (feePercent / 100));
  const totalFlexyForward = Math.round(numericValue * (1 + feePercent / 100));

  // Reverse calculations (Received Flexy -> Original value)
  const totalFlexyReverse = numericValue;
  const originalPriceReverse = feePercent > 0 ? Math.round(numericValue / (1 + feePercent / 100)) : numericValue;
  const feeAmountReverse = Math.round(totalFlexyReverse - originalPriceReverse);

  const displayTotal = mode === "forward" ? totalFlexyForward : totalFlexyReverse;
  const displayBase = mode === "forward" ? numericValue : originalPriceReverse;
  const displayFee = mode === "forward" ? feeAmountForward : feeAmountReverse;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copié : ${label}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getClientMessageFr = () => {
    return `Bonjour ! Pour votre commande de ${displayBase.toLocaleString()} DZD, le montant à envoyer en Flexy (frais opérateur +${feePercent}%) est de : ${displayTotal.toLocaleString()} DZD sur le numéro ${flexyPhone}. Merci de nous envoyer une capture d'écran du SMS de confirmation dès l'envoi.`;
  };

  const getClientMessageAr = () => {
    return `مرحباً ! بخصوص طلبك بقيمة ${displayBase.toLocaleString()} دج، المبلغ المطلوب إرساله فليكسي (مع رسوم +${feePercent}%) هو : ${displayTotal.toLocaleString()} دج إلى الرقم ${flexyPhone}. يرجى إرسال لقطة شاشة لرسالة التأكيد فور الإرسال.`;
  };

  return (
    <div className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Calculateur Flexy (+{feePercent}%)
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                Outil Vente
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculez instantanément le montant Flexy avec majoration ou retrouvez le montant net
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("forward")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              mode === "forward"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>Prix +{feePercent}%</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("reverse")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              mode === "reverse"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Calcul Inversé</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Inputs & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Price Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {mode === "forward" ? "Prix Original du Forfait (DZD) :" : "Montant Flexy Reçu / Requis (DZD) :"}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="Ex: 1000"
                className="w-full h-12 pl-4 pr-16 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-lg font-bold font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <span className="absolute right-4 top-3 text-sm font-bold text-slate-400 select-none">
                DZD
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Montants Fréquents :
              </span>
              <span className="text-[11px] text-amber-500 font-medium cursor-pointer hover:underline" onClick={() => setBasePrice(0)}>
                Effacer
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBasePrice(preset)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all",
                    numericValue === preset
                      ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                  )}
                >
                  {preset} DA
                </button>
              ))}
            </div>
          </div>

          {/* Percentage & Phone options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Taux de majoration :</span>
                <span className="text-amber-500 font-bold">+{feePercent}%</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 20, 25, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setFeePercent(pct)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      feePercent === pct
                        ? "bg-amber-500/20 border-amber-500 text-amber-500"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-white/20"
                    )}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Numéro Flexy récepteur :</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Actif sur le site</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={flexyPhone}
                  onChange={(e) => setFlexyPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSavePhone();
                    }
                  }}
                  placeholder="Ex: 0550123456"
                  className="flex-1 h-9 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSavePhone}
                  disabled={isSavingPhone}
                  className="h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-sm transition-all"
                >
                  {isSavingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSavingPhone ? "..." : "Enregistrer"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Operator Codes Cheat-Sheet */}
          <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
              Codes Flexy rapides (Algérie) :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-1.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                <span className="font-bold text-emerald-500">Mobilis:</span> *610*Num*Montant*Code#
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                <span className="font-bold text-red-500">Djezzy:</span> *710*Num*Montant*Code#
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                <span className="font-bold text-rose-500">Ooredoo:</span> *115*Num*Montant*Code#
              </div>
            </div>
          </div>
        </div>

        {/* Right Result Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Main Calculation Result Box */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent p-5 space-y-4 shadow-lg shadow-amber-500/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 block mb-1">
                {mode === "forward" ? "Montant Total Flexy à Réclamer" : "Valeur Nette du Forfait"}
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {displayTotal.toLocaleString()}
                </span>
                <span className="text-lg font-bold text-amber-500">
                  DZD
                </span>
              </div>
            </div>

            {/* Breakdown detail rows */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Prix de base :</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {displayBase.toLocaleString()} DZD
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Majoration ({feePercent}%) :</span>
                <span className="font-mono font-bold text-amber-500">
                  +{displayFee.toLocaleString()} DZD
                </span>
              </div>
            </div>

            {/* Quick Action Button: Copy Amount */}
            <Button
              type="button"
              onClick={() => handleCopy(String(displayTotal), "amount", `${displayTotal} DZD`)}
              className={cn(
                "w-full h-11 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md",
                copiedKey === "amount"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
              )}
            >
              {copiedKey === "amount" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Montant Copié ({displayTotal} DZD)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le Montant ({displayTotal} DZD)</span>
                </>
              )}
            </Button>
          </div>

          {/* Client WhatsApp Message Quick Copy */}
          <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                Message WhatsApp pour le client :
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(getClientMessageFr(), "msg_fr", "Message WhatsApp (Français)")}
                className={cn(
                  "h-8 text-[11px] font-semibold border-slate-200 dark:border-white/10 flex items-center gap-1 truncate",
                  copiedKey === "msg_fr" && "border-emerald-500 text-emerald-500"
                )}
              >
                {copiedKey === "msg_fr" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copier (Français)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(getClientMessageAr(), "msg_ar", "Message WhatsApp (Arabe)")}
                className={cn(
                  "h-8 text-[11px] font-semibold border-slate-200 dark:border-white/10 flex items-center gap-1 truncate",
                  copiedKey === "msg_ar" && "border-emerald-500 text-emerald-500"
                )}
              >
                {copiedKey === "msg_ar" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copier (العربية)</span>
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
