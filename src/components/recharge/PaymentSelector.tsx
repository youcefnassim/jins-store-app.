"use client";

import { useState, useEffect } from "react";
import { PaymentMethod } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, ArrowRight, Loader2, Wallet, Landmark, CreditCard, Info, 
  Copy, Check, Smartphone, UploadCloud, X, Image as ImageIcon,
  AlertTriangle, Clock, Phone, Ban, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_PAYMENT_SETTINGS, PaymentAccountsSettings } from "@/lib/payment-settings";
import { toast } from "sonner";
import { useRef } from "react";

interface PaymentSelectorProps {
  selectedPayment?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext?: () => void;
  onBack: () => void;
  onSubmit?: (file: File, transactionRef: string) => void;
  isSubmitting?: boolean;
  amount: number;
  promoCode?: string;
  onPromoApply?: (code: string, discount: number) => void;
}

export function PaymentSelector({ 
  selectedPayment, 
  onSelect, 
  onNext, 
  onBack, 
  onSubmit,
  isSubmitting = false,
  amount, 
  promoCode, 
  onPromoApply 
}: PaymentSelectorProps) {
  const t = useTranslations("PaymentSelector");
  const tPkg = useTranslations("PackageSelector");
  const tProof = useTranslations("ProofUpload");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Payment proof upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [flexyTime, setFlexyTime] = useState("");
  const [flexySenderPhone, setFlexySenderPhone] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setCurrentTimeToFlexy = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setFlexyTime(`${hours}:${minutes}`);
    toast.success(isAr ? `تم تعيين الوقت الحالي: ${hours}:${minutes}` : `Heure actuelle définie : ${hours}:${minutes}`);
  };

  const processFile = (selected?: File) => {
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error(tProof("too_large"));
        return;
      }
      setProofFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setProofFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleIHavePaid = () => {
    if (!selectedPayment) return;
    
    // Strict requirement for Flexy: exact sending time must be specified!
    if (selectedPayment.id === "flexy" && !flexyTime.trim()) {
      toast.error(t("flexy_time_required_error"));
      document.getElementById("flexy-time-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("flexy-time-input")?.focus();
      return;
    }

    // If an onSubmit prop is provided (merged flow)
    if (onSubmit) {
      if (!proofFile) {
        toast.error(
          locale === "ar"
            ? "يرجى إرفاق وصل أو صورة إثبات الدفع أولاً."
            : locale === "en"
            ? "Please attach your payment receipt proof first."
            : "Veuillez joindre votre reçu de paiement pour continuer."
        );
        document.getElementById("payment-proof-upload-box")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const finalTransactionRef = selectedPayment.id === "flexy"
        ? `[Heure Flexy: ${flexyTime.trim()}]${flexySenderPhone.trim() ? ` [Émetteur: ${flexySenderPhone.trim()}]` : ""}${transactionRef.trim() ? ` [Note: ${transactionRef.trim()}]` : ""}`
        : transactionRef.trim();

      onSubmit(proofFile, finalTransactionRef);
      return;
    }

    // Fallback to legacy onNext
    if (onNext) {
      onNext();
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    onSelect(method);
    setTimeout(() => {
      document.getElementById("selected-payment-details-box")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

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
        return null;
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

  const getDynamicInstructions = (id: string) => {
    switch (id) {
      case "baridimob":
        return isAr
          ? `قم بتحويل المبلغ المطلوب بالضبط إلى رقم الحساب الجاري RIP: ${paySettings.baridimob.rip} (${paySettings.baridimob.holder || "بريدي موب"}). احتفظ بصورة الوصل لرفعها في الخطوة التالية.`
          : locale === "en"
          ? `Transfer the exact amount to RIP: ${paySettings.baridimob.rip} (${paySettings.baridimob.holder || "BaridiMob"}). Keep the receipt screenshot to upload below.`
          : `Transférez le montant exact au RIP : ${paySettings.baridimob.rip} (${paySettings.baridimob.holder || "BaridiMob"}). Conservez le reçu pour le téléverser ci-dessous.`;

      case "ccp":
        return isAr
          ? `قم بالتحويل إلى رقم الحساب CCP: ${paySettings.ccp.account} المفتاح ${paySettings.ccp.cle} (${paySettings.ccp.holder || "بريد الجزائر"}). احتفظ بصورة الوصل لرفعها في الخطوة التالية.`
          : locale === "en"
          ? `Transfer the exact amount via CCP: ${paySettings.ccp.account} Key ${paySettings.ccp.cle} (${paySettings.ccp.holder || "Algérie Poste"}). Keep the receipt to upload below.`
          : `Transférez le montant exact au CCP : ${paySettings.ccp.account} Clé ${paySettings.ccp.cle} (${paySettings.ccp.holder || "Algérie Poste"}). Conservez le reçu pour le téléverser ci-dessous.`;

      case "redotpay":
      case "binance":
        return isAr
          ? `أرسل المبلغ المطلوب إلى معرّف الحساب RedotPay ID: ${paySettings.redotpay.id}. احتفظ بلقطة شاشة للتحويل لرفعها في الخطوة التالية.`
          : locale === "en"
          ? `Send the exact amount to RedotPay ID: ${paySettings.redotpay.id}. Take a screenshot of the completed transfer to upload below.`
          : `Transférez le montant exact sur l'ID RedotPay : ${paySettings.redotpay.id}. Conservez une capture d'écran de la transaction pour la téléverser ci-dessous.`;

      case "flexy":
        return isAr
          ? `أرسل الفليكسي (+${paySettings.flexy.feePercent}% رسوم خدمة) إلى الرقم ${paySettings.flexy.phone}. انتظر رسالة SMS لتأكيد التحويل والتقط لقطة شاشة للوصل، أو اذكر فقط الرقم الذي أرسلت منه في خانة الملاحظات.`
          : locale === "en"
          ? `Send flexy (+${paySettings.flexy.feePercent}% fee) to ${paySettings.flexy.phone}. Wait for confirmation SMS and take a screenshot, or enter your sender phone number below.`
          : `Envoyez le flexy (+${paySettings.flexy.feePercent}% de frais) au ${paySettings.flexy.phone}. Attendez le SMS de confirmation et prenez une capture d'écran, ou indiquez simplement le numéro depuis lequel vous avez envoyé.`;

      default:
        return selectedPayment?.instructions || "";
    }
  };

  // Dynamic currency logic
  const isRedotPay = selectedPayment?.id === "redotpay" || selectedPayment?.id === "binance";
  const isFlexy = selectedPayment?.id === "flexy";
  const rawFlexyAmount = isFlexy ? Math.round(amount * (1 + paySettings.flexy.feePercent / 100)) : 0;
  // Anti-Maktivi offset: avoid 500, 1000, 1500, 2000, 2510...
  const antiMaktiviExtra = (isFlexy && rawFlexyAmount % 500 === 0 && rawFlexyAmount >= 500) ? 10 : 0;
  const flexyAmount = rawFlexyAmount + antiMaktiviExtra;

  const displayAmount = isRedotPay 
    ? (amount / 240).toFixed(2) // Conversion rate: 1 USD = 240 DZD
    : isFlexy
    ? flexyAmount
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
            
            {/* Selected Method Details & Instructions (AU-DESSUS - Displays at top when clicked) */}
            <AnimatePresence mode="wait">
              {selectedPayment && (
                <motion.div 
                  key={selectedPayment.id}
                  id="selected-payment-details-box"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-500/15 via-blue-500/10 to-blue-500/5 border border-blue-500/30 overflow-hidden space-y-4 shadow-xl shadow-blue-500/5 scroll-mt-24"
                >
                  {/* Active Method Identification Banner */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1 bg-black/50 border border-white/10 shrink-0 shadow-sm">
                        {getMethodIcon(selectedPayment.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-base leading-tight">
                            {selectedPayment.name}
                          </h4>
                          {getMethodBadge(selectedPayment.id)}
                        </div>
                        <p className="text-[11px] text-blue-200/70 mt-0.5">
                          {isAr ? "معلومات وطريقة الدفع المحددة" : "Instructions & coordonnées de cette méthode"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isAr ? "محدد" : "Sélectionné"}</span>
                    </span>
                  </div>

                  {/* Dynamic Instructions & Account Details or Custom Flexy Card */}
                  {isFlexy ? (
                    <div className="space-y-3.5">
                      {/* Flexy Phone & Info Card */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-blue-900/40 border-2 border-blue-500/50 p-4 sm:p-5 shadow-xl shadow-blue-950/60">
                        {/* Header: Mobilis Flexy Number */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/25">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                              <Smartphone className="w-6 h-6 text-blue-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-300">
                                  {t("flexy_number_title")}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Mobilis 06
                                </span>
                              </div>
                              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white select-all mt-0.5">
                                {paySettings.flexy.phone}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <Button 
                              type="button"
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleCopy(paySettings.flexy.phone)}
                              className={cn(
                                "h-10 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md",
                                copiedText === paySettings.flexy.phone 
                                  ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40" 
                                  : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border border-blue-400/30"
                              )}
                            >
                              {copiedText === paySettings.flexy.phone ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-emerald-300">{isAr ? "تم النسخ!" : "Copié !"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>{isAr ? "نسخ الرقم" : "Copier"}</span>
                                </>
                              )}
                            </Button>
                            <a 
                              href={`tel:${paySettings.flexy.phone.replace(/\s+/g, "")}`}
                              className="h-10 px-3.5 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 shadow-sm flex items-center gap-1.5 transition-all"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="hidden sm:inline">{isAr ? "اتصال" : "Appeler"}</span>
                            </a>
                          </div>
                        </div>

                        {/* 3 Conditions on Accepted Credit Types */}
                        <div className="pt-3.5 space-y-2">
                          <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200">
                              <span className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-red-300 shrink-0 font-black text-xs">✕</span>
                              <span className="font-bold">{t("flexy_rule_no_maktivi")}</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200">
                              <span className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-red-300 shrink-0 font-black text-xs">✕</span>
                              <span className="font-bold">{t("flexy_rule_no_intl")}</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 shadow-sm">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-black text-xs">✓</span>
                              <span className="font-extrabold text-sm">{t("flexy_rule_credit_only")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Warning on Timing & Responsibility (Red/Amber Box) */}
                        <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-500/20 via-amber-500/15 to-transparent border-2 border-amber-500/40 text-amber-100 space-y-1.5 shadow-md">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div className="text-xs leading-relaxed space-y-0.5">
                              <p className="font-bold text-amber-300">{t("flexy_warn_time_title")}</p>
                              <p className="font-extrabold text-white text-xs sm:text-sm">{t("flexy_warn_time_desc")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 pt-1.5 border-t border-amber-500/20">
                            <span className="text-amber-400">📌</span>
                            <span className="font-medium italic">{t("flexy_warn_responsibility")}</span>
                          </div>
                        </div>

                        {/* Prohibited & Anti-Maktivi Amounts Advisory */}
                        <div className="mt-3.5 p-3 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-rose-300 font-bold">
                            <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{t("flexy_forbidden_amounts")}</span>
                          </div>
                          <div className="flex items-start gap-2 text-emerald-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{t("flexy_recommended_amounts")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-blue-100 text-sm sm:text-base mb-1">
                            {t("instructions")}
                          </h4>
                          <p className="text-blue-200/80 text-xs sm:text-sm leading-relaxed">
                            {getDynamicInstructions(selectedPayment.id)}
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
                    </>
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
                      <div className="flex flex-col gap-1.5 text-xs pb-2 border-b border-white/10">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-white/70">Prix normal : {amount.toLocaleString()} DZD</span>
                          <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            +{paySettings.flexy.feePercent}% Frais Flexy (+{Math.round(amount * (paySettings.flexy.feePercent / 100)).toLocaleString()} DZD)
                          </span>
                        </div>
                        {antiMaktiviExtra > 0 && (
                          <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg font-medium text-[11px]">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>
                              {isAr 
                                ? `تمت إضافة +10 دج تلقائياً (${flexyAmount} دج) لتجنب تحويل الرصيد إلى ماكتيفي (Maktivi)` 
                                : `+10 DA ajoutés automatiquement (${flexyAmount} DA au lieu de ${rawFlexyAmount} DA) pour éviter le forfait Maktivi`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest font-semibold mb-0.5">
                          {isFlexy ? "Montant Flexy à envoyer :" : t("amount_to_send")}
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

                  {/* Integrated Proof Upload Section (Merged) */}
                  <div id="payment-proof-upload-box" className="rounded-xl border border-white/10 bg-black/30 p-3.5 sm:p-4 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {isFlexy 
                            ? (isAr ? "إثبات الدفع ومعلومات تحويل الفليكسي" : "Preuve & détails du transfert Flexy") 
                            : tProof("title")}
                        </h4>
                        <p className="text-[11px] text-white/50">
                          {isFlexy
                            ? (isAr ? "يرجى ذكر وقت الإرسال بدقة ورفع لقطة شاشة للرسالة النصية SMS" : "Indiquez l'heure exacte d'envoi et téléversez la capture d'écran du SMS")
                            : tProof("description")}
                        </p>
                      </div>
                    </div>

                    {/* Flexy Specific Required Inputs */}
                    {isFlexy && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-500/40 space-y-3 shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>{t("flexy_time_label")}</span>
                          </label>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={setCurrentTimeToFlexy}
                            className="h-7 px-2.5 text-[11px] text-amber-200 bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 transition-all"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t("flexy_current_time")}</span>
                          </Button>
                        </div>

                        <div className="relative">
                          <input
                            id="flexy-time-input"
                            type="text"
                            value={flexyTime}
                            onChange={(e) => setFlexyTime(e.target.value)}
                            placeholder={t("flexy_time_placeholder")}
                            className="w-full h-10 bg-black/70 border border-amber-500/50 rounded-lg px-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                          />
                        </div>
                        <p className="text-[10px] text-amber-200/90 leading-tight flex items-center gap-1 font-medium">
                          <span>⚠️</span>
                          <span>
                            {isAr 
                              ? "ضروري جداً: يرجى كتابة وقت إرسال الفليكسي بالساعة والدقيقة كما هو في رسالة SMS الخاصة بك."
                              : "Strictement obligatoire : mentionnez l'heure exacte du transfert pour valider votre commande."}
                          </span>
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                          <label className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-white/60" />
                            <span>{t("flexy_sender_label")}</span>
                          </label>
                          <input
                            type="text"
                            value={flexySenderPhone}
                            onChange={(e) => setFlexySenderPhone(e.target.value)}
                            placeholder={t("flexy_sender_placeholder")}
                            className="w-full h-9 bg-black/60 border border-white/15 rounded-lg px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Drag and Drop / Select box */}
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-xl transition-all duration-300 relative overflow-hidden group p-4",
                        previewUrl
                          ? "border-emerald-500/50 bg-black/60"
                          : isDragging
                          ? "border-primary bg-primary/10 scale-[1.01]"
                          : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 cursor-pointer"
                      )}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f && f.type.startsWith("image/")) processFile(f);
                      }}
                      onClick={() => !previewUrl && fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => processFile(e.target.files?.[0])}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />

                      {previewUrl ? (
                        <div className="relative flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 overflow-hidden min-w-0">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0 flex items-center justify-center">
                              <img src={previewUrl} alt="Reçu" className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{proofFile?.name}</p>
                              <p className="text-[10px] text-emerald-400 font-medium">
                                ✓ {isFlexy ? "SMS prêt" : "Reçu prêt"} ({(proofFile?.size! / 1024 / 1024).toFixed(2)} Mo)
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="rounded-full w-8 h-8 shrink-0 hover:scale-105"
                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <UploadCloud className="w-8 h-8 text-white/40 group-hover:text-primary transition-colors mb-2" />
                          <p className="text-xs font-semibold text-white/90">
                            {isDragging 
                              ? tProof("drop_here") 
                              : isFlexy 
                              ? (isAr ? "ارفع لقطة شاشة لرسالة SMS التأكيد" : "Téléversez la capture du SMS de confirmation") 
                              : tProof("click_or_drag")}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5">{tProof("format_info")}</p>
                        </div>
                      )}
                    </div>

                    {/* Transaction Reference (Optional) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/70">
                        {isFlexy ? (isAr ? "ملاحظة إضافية (اختياري)" : "Note additionnelle (optionnel)") : tProof("tx_ref")}
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder={isFlexy ? (isAr ? "أي تفاصيل أخرى..." : "ex: envoyé depuis puce Mobilis...") : tProof("tx_ref_placeholder")}
                        className="w-full h-9 bg-black/60 border border-white/15 rounded-lg px-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary font-mono transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment Methods Grid (Rendered below instructions) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-0.5">
                <span>
                  {selectedPayment
                    ? (isAr ? "طرق الدفع المتاحة (انقر للتغيير) :" : "Méthodes de paiement (cliquez pour changer) :")
                    : (isAr ? "اختر طريقة الدفع للمتابعة :" : "Choisissez un moyen de paiement :")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methods.map((method) => {
                  const isSelected = selectedPayment?.id === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => handleMethodSelect(method)}
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
                                {flexyAmount.toLocaleString()} DZD
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
            </div>

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
                onClick={handleIHavePaid} 
                disabled={!selectedPayment || isSubmitting}
                className={cn(
                  "h-10 sm:h-11 px-6 sm:px-8 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm select-none",
                  proofFile
                    ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-primary/25 cursor-pointer"
                    : "bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-600 text-white shadow-primary/15 cursor-pointer"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>{tProof("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("i_have_paid")}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
