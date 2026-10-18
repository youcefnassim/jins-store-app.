"use client";

import { useState, useEffect } from "react";
import { PaymentMethod } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Wallet, Landmark, CreditCard, Info, Copy, Check, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_PAYMENT_SETTINGS, PaymentAccountsSettings } from "@/app/api/settings/payments/route";

interface PaymentSelectorProps {
  selectedPayment?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
  amount: number;
  promoCode?: string;
  onPromoApply?: (code: string, discount: number) => void;
}

export function PaymentSelector({ 
  selectedPayment, 
  onSelect, 
  onNext, 
  onBack, 
  amount, 
  promoCode, 
  onPromoApply 
}: PaymentSelectorProps) {
  const t = useTranslations("PaymentSelector");
  const tPkg = useTranslations("PackageSelector");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const [promoInput, setPromoInput] = useState(promoCode || "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(!!promoCode);
  const [paySettings, setPaySettings] = useState<PaymentAccountsSettings>(DEFAULT_PAYMENT_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    api.getPaymentMethods().then((res) => {
      if (isMounted) {
        setMethods(res);
        setLoading(false);
      }
    });

    fetch("/api/settings/payments")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.settings) {
          setPaySettings(data.settings);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const getMethodIcon = (id: string) => {
    const hasError = imgErrors[id];

    switch (id) {
      case "baridimob":
        return !hasError ? (
          <img
            src="/images/payments/baridimob.png"
            alt="BaridiMob"
            onError={() => handleImgError(id)}
            className="w-full h-full object-contain rounded-xl"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            BM
          </div>
        );

      case "ccp":
        return !hasError ? (
          <img
            src="/images/payments/ccp.png"
            alt="Algérie Poste CCP"
            onError={() => handleImgError(id)}
            className="w-full h-full object-contain rounded-xl"
            loading="eager"
          />
        ) : (
          <Landmark className="w-6 h-6 text-[#60a5fa]" />
        );

      case "redotpay":
      case "binance":
        return !hasError ? (
          <img
            src="/images/payments/redotpay.png"
            alt="RedotPay"
            onError={() => handleImgError(id)}
            className="w-full h-full object-contain rounded-xl"
            loading="eager"
          />
        ) : (
          <CreditCard className="w-6 h-6 text-rose-400" />
        );

      case "flexy":
        return !hasError ? (
          <img
            src="/images/payments/flexy.png"
            alt="Flexy"
            onError={() => handleImgError(id)}
            className="w-full h-full object-contain rounded-xl"
            loading="eager"
          />
        ) : (
          <Smartphone className="w-6 h-6 text-amber-400" />
        );

      default:
        return <Wallet className="w-6 h-6 text-primary" />;
    }
  };

  const getMethodBadge = (id: string) => {
    switch (id) {
      case "baridimob":
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Instantané • 0%
          </span>
        );
      case "ccp":
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Algérie Poste
          </span>
        );
      case "redotpay":
      case "binance":
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Crypto / USD
          </span>
        );
      case "flexy":
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            +{paySettings.flexy.feePercent}% {isAr ? "رسوم" : "Frais"}
          </span>
        );
      default:
        return null;
    }
  };

  const getAccountDetails = (id: string) => {
    switch (id) {
      case "baridimob":
        return { 
          label: isAr 
            ? `رقم الحساب البريدي الجاري RIP بريدي موب (${paySettings.baridimob.holder || "بريد الجزائر"})`
            : `Numéro RIP BaridiMob (${paySettings.baridimob.holder || "Algérie Poste"})`, 
          value: paySettings.baridimob.rip 
        };
      case "ccp":
        return { 
          label: isAr
            ? `رقم حساب CCP والمفتاح (${paySettings.ccp.holder || "بريد الجزائر"})`
            : `Compte CCP & Clé (${paySettings.ccp.holder || "Algérie Poste"})`, 
          value: `${paySettings.ccp.account} Clé ${paySettings.ccp.cle}` 
        };
      case "redotpay":
      case "binance":
        return { 
          label: isAr ? "معرّف حساب ريدوت باي (ID)" : "ID Compte RedotPay", 
          value: paySettings.redotpay.id 
        };
      case "flexy":
        return { 
          label: isAr 
            ? "رقم فليكسي المستقبل (موبيليس / جيزي / أوريدو)"
            : "Numéro Flexy (Mobilis / Djezzy / Ooredoo)", 
          value: paySettings.flexy.phone 
        };
      default:
        return null;
    }
  };

  // Dynamic currency logic
  const isRedotPay = selectedPayment?.id === "redotpay" || selectedPayment?.id === "binance";
  const isFlexy = selectedPayment?.id === "flexy";
  const displayAmount = isRedotPay 
    ? (amount / 240).toFixed(2) // Conversion rate: 1 USD = 240 DZD
    : isFlexy
    ? Math.round(amount * (1 + paySettings.flexy.feePercent / 100))
    : amount;
  const displayCurrency = isRedotPay ? "USD" : siteConfig.currency;

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
      
      <CardHeader className="py-3.5 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-bold shrink-0">
            3
          </span>
          <div>
            <CardTitle className="text-lg sm:text-xl text-white leading-tight">
              {t("select_payment")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {t("choose_payment_desc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            
            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methods.map((method) => {
                const isSelected = selectedPayment?.id === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => onSelect(method)}
                    className={cn(
                      "relative cursor-pointer rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 group select-none overflow-hidden",
                      isSelected
                        ? "border-primary bg-gradient-to-r from-primary/20 via-purple-900/15 to-black/40 shadow-[0_0_20px_rgba(139,92,246,0.35)] ring-1 ring-primary/60 scale-[1.01]"
                        : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60 hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Icon Container */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 p-1.5 border transition-all duration-200 shadow-md",
                        method.id === "baridimob" 
                          ? "bg-emerald-950/40 border-emerald-500/30 group-hover:border-emerald-500/60"
                          : method.id === "ccp"
                          ? "bg-blue-950/40 border-blue-500/30 group-hover:border-blue-500/60"
                          : method.id === "redotpay"
                          ? "bg-rose-950/40 border-rose-500/30 group-hover:border-rose-500/60"
                          : "bg-purple-950/40 border-purple-500/30 group-hover:border-purple-500/60"
                      )}>
                        {getMethodIcon(method.id)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:text-primary transition-colors truncate">
                            {method.name}
                          </h3>
                          {getMethodBadge(method.id)}
                          {method.id === "flexy" && amount > 0 && (
                            <span className="text-[11px] font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {Math.round(amount * 1.2).toLocaleString()} DZD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 leading-tight">
                          {method.description}
                        </p>
                      </div>
                    </div>

                    {/* Radio Checkmark */}
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                      isSelected
                        ? "bg-primary border-primary text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                        : "border-white/20 bg-white/5 group-hover:border-white/40"
                    )}>
                      {isSelected && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Method Details & Instructions */}
            <AnimatePresence mode="wait">
              {selectedPayment && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 sm:p-5 rounded-xl bg-blue-500/10 border border-blue-500/25 overflow-hidden space-y-4"
                >
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-100 text-sm sm:text-base mb-1">
                        {t("instructions")}
                      </h4>
                      <p className="text-blue-200/80 text-xs sm:text-sm leading-relaxed">
                        {selectedPayment.id === 'flexy'
                          ? (isAr 
                              ? `أرسل الفليكسي (+${paySettings.flexy.feePercent}% رسوم خدمة) إلى الرقم ${paySettings.flexy.phone}. انتظر رسالة SMS لتأكيد التحويل والتقط لقطة شاشة للوصل، أو اذكر فقط الرقم الذي أرسلت منه في خانة الملاحظات.`
                              : `Envoyez le flexy (+${paySettings.flexy.feePercent}% de frais) au ${paySettings.flexy.phone}. Attendez le SMS de confirmation et prenez une capture d'écran, ou indiquez simplement le numéro depuis lequel vous avez envoyé.`)
                          : selectedPayment.instructions}
                      </p>
                    </div>
                  </div>
                  
                  {/* Copy Account Box (Full Width, No QR code) */}
                  {getAccountDetails(selectedPayment.id) && (
                    <div className="bg-black/50 rounded-xl p-3.5 sm:p-4 border border-white/10 space-y-1.5">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {getAccountDetails(selectedPayment.id)?.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="bg-black/60 text-white px-3 py-2.5 rounded-lg font-mono text-xs sm:text-sm border border-white/10 flex-1 min-w-0 truncate select-all">
                          {getAccountDetails(selectedPayment.id)?.value}
                        </code>
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleCopy(getAccountDetails(selectedPayment.id)?.value || "")}
                          className={cn(
                            "h-10 px-3.5 shrink-0 rounded-lg transition-all font-semibold text-xs flex items-center gap-1.5 shadow-sm",
                            copiedText === getAccountDetails(selectedPayment.id)?.value 
                              ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40" 
                              : "bg-white/15 hover:bg-white/25 text-white border border-white/10"
                          )}
                        >
                          {copiedText === getAccountDetails(selectedPayment.id)?.value ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Promo Code Input */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 sm:p-4 space-y-2.5">
                    <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-primary font-black">%</span>
                      {t("promo_title")}
                    </label>
                    <div className="flex items-center gap-2.5">
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
                        className="flex-1 min-w-0 bg-black/60 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-primary uppercase placeholder:normal-case placeholder:text-white/30 font-mono transition-colors h-10"
                      />
                      <Button 
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim() || promoLoading || promoSuccess}
                        className={cn(
                          "h-10 px-5 rounded-lg font-bold text-xs sm:text-sm shrink-0 transition-all select-none shadow-md",
                          promoSuccess
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : promoInput.trim()
                            ? "bg-primary hover:bg-primary/90 text-white shadow-primary/25 cursor-pointer"
                            : "bg-white/15 hover:bg-white/20 text-white border border-white/10 opacity-70"
                        )}
                      >
                        {promoLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : promoSuccess ? (
                          <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Appliqué</span>
                        ) : (
                          <span>{t("promo_apply")}</span>
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-[11px] flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        {t("promo_error")}
                      </p>
                    )}
                    {promoSuccess && (
                      <p className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {t("promo_success")}
                      </p>
                    )}
                  </div>

                  {/* Amount To Send Preview */}
                  <div className="bg-gradient-to-r from-primary/25 via-purple-600/15 to-transparent rounded-xl p-4 border border-primary/35 shadow-lg space-y-2">
                    {isFlexy && (
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10 flex-wrap gap-1">
                        <span className="text-white/70">Prix normal : {amount.toLocaleString()} DZD</span>
                        <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          +20% Frais Flexy (+{Math.round(amount * 0.2).toLocaleString()} DZD)
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-semibold mb-0.5">
                          {isFlexy ? "Montant Flexy à envoyer (+20%) :" : t("amount_to_send")}
                        </p>
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                          {displayAmount} <span className="text-sm sm:text-base font-bold text-primary">{displayCurrency}</span>
                        </span>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-inner shrink-0">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={onBack} 
                className="text-white/70 hover:text-white hover:bg-white/5 h-9 px-3 text-xs sm:text-sm"
              >
                <ArrowLeft className="mr-1.5 w-4 h-4 rtl:rotate-180 rtl:ml-1.5 rtl:mr-0" />
                {tPkg("back")}
              </Button>
              
              <Button 
                type="button" 
                onClick={onNext} 
                disabled={!selectedPayment}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-10 sm:h-11 px-6 sm:px-8 rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                <span>{t("i_have_paid")}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
