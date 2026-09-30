"use client";

import { useState, useEffect } from "react";
import { PaymentMethod } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Wallet, Landmark, CreditCard, Smartphone, Info, Copy, Check, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface PaymentSelectorProps {
  selectedPayment?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
  amount: number;
  promoCode?: string;
  onPromoApply?: (code: string, discount: number) => void;
}

export function PaymentSelector({ selectedPayment, onSelect, onNext, onBack, amount, promoCode, onPromoApply }: PaymentSelectorProps) {
  const t = useTranslations("PaymentSelector");
  const tPkg = useTranslations("PackageSelector");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState(promoCode || "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(!!promoCode);

  useEffect(() => {
    let isMounted = true;
    api.getPaymentMethods().then((res) => {
      if (isMounted) {
        setMethods(res);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case "baridimob": return <Smartphone className="w-6 h-6 text-[#facc15]" />;
      case "ccp": return <Landmark className="w-6 h-6 text-[#60a5fa]" />;
      case "binance": return <Wallet className="w-6 h-6 text-[#f59e0b]" />;
      case "flexy": return <CreditCard className="w-6 h-6 text-[#34d399]" />;
      default: return <Wallet className="w-6 h-6 text-primary" />;
    }
  };

  // Mock account details for copy-to-clipboard functionality
  const getAccountDetails = (id: string) => {
    switch (id) {
      case "baridimob":
        return { label: "RIP Number", value: "00799999000000000012", showQr: true };
      case "ccp":
        return { label: "CCP Account", value: "12345678 Clé 99 (MOCK NAME)", showQr: false };
      case "binance":
        return { label: "Binance Pay ID", value: "123456789", showQr: true };
      case "flexy":
        return { label: "Phone Number", value: "0550000000", showQr: false };
      default:
        return null;
    }
  };

  // Dynamic currency logic
  const displayAmount = selectedPayment?.id === "binance" 
    ? (amount / 240).toFixed(2) // Mock conversion rate: 1 USDT = 240 DZD
    : amount;
  const displayCurrency = selectedPayment?.id === "binance" ? "USDT" : siteConfig.currency;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoSuccess(true);
        if (onPromoApply) onPromoApply(promoInput.trim().toUpperCase(), data.discount_percentage);
      } else {
        setPromoError(data.error || "Code invalide");
        setPromoSuccess(false);
        if (onPromoApply) onPromoApply("", 0);
      }
    } catch (err) {
      setPromoError("Erreur de connexion");
      setPromoSuccess(false);
      if (onPromoApply) onPromoApply("", 0);
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <Card className="glass-card border-white/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 translate-y-1/2" />
      
      <CardHeader>
        <CardTitle className="text-2xl text-white">{t("select_payment")}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("choose_payment_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {methods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => onSelect(method)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-4",
                    selectedPayment?.id === method.id
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60"
                  )}
                >
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {getIcon(method.id)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{method.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedPayment && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 overflow-hidden"
                >
                  <div className="flex gap-3 mb-4">
                    <Info className="w-6 h-6 text-blue-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-100 text-lg mb-1">{t("instructions")}</h4>
                      <p className="text-blue-200/80 text-sm leading-relaxed">
                        {selectedPayment.instructions}
                      </p>
                    </div>
                  </div>
                  
                  {/* Click to Copy & QR Code Section */}
                  {getAccountDetails(selectedPayment.id) && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 bg-black/40 rounded-lg p-4 border border-white/5 items-center">
                      
                      {/* Copy Box */}
                      <div className="flex-1 w-full">
                        <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">
                          {getAccountDetails(selectedPayment.id)?.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="bg-black/50 text-white px-3 py-2 rounded-md font-mono text-sm border border-white/10 flex-1">
                            {getAccountDetails(selectedPayment.id)?.value}
                          </code>
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => handleCopy(getAccountDetails(selectedPayment.id)?.value || "")}
                            className={copiedText === getAccountDetails(selectedPayment.id)?.value ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300" : ""}
                          >
                            {copiedText === getAccountDetails(selectedPayment.id)?.value ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Mock QR Code */}
                      {getAccountDetails(selectedPayment.id)?.showQr && (
                        <div className="flex flex-col items-center justify-center shrink-0 bg-white p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform" title="Scan to pay">
                          <QrCode className="w-16 h-16 text-black" />
                          <span className="text-[10px] text-black font-bold mt-1 tracking-tighter">{t("scan_to_pay")}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  
                  {/* PROMO CODE SECTION */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                    <div className="px-4 pt-4 pb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="text-primary">%</span>
                        {t("promo_title")}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={t("promo_placeholder")}
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoError("");
                            setPromoSuccess(false);
                            if (onPromoApply) onPromoApply("", 0);
                          }}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary uppercase placeholder:normal-case placeholder:text-white/30 transition-colors"
                        />
                        <Button 
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || promoLoading || promoSuccess}
                          variant={promoSuccess ? "default" : "secondary"}
                          className={promoSuccess ? "bg-emerald-500 hover:bg-emerald-600 text-white px-5" : "px-5"}
                        >
                          {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : promoSuccess ? <Check className="w-4 h-4" /> : t("promo_apply")}
                        </Button>
                      </div>
                    </div>
                    {promoError && (
                      <div className="px-4 pb-3">
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                          {t("promo_error")}
                        </p>
                      </div>
                    )}
                    {promoSuccess && (
                      <div className="px-4 pb-3">
                        <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1.5">
                          <Check className="w-3 h-3" />
                          {t("promo_success")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent rounded-xl p-5 mt-4 flex justify-between items-center border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{t("amount_to_send")}</p>
                      <span className="text-3xl font-black text-white tracking-wider">
                        {displayAmount} <span className="text-base font-semibold text-primary">{displayCurrency}</span>
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/5">
                <ArrowLeft className="mr-2 w-4 h-4 rtl:rotate-180 rtl:ml-2 rtl:mr-0" />
                {tPkg("back")}
              </Button>
              
              <Button 
                type="button" 
                onClick={onNext} 
                disabled={!selectedPayment}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-12 px-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                {t("i_have_paid")}
                <ArrowRight className="ml-2 w-4 h-4 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
