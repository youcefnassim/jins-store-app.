"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { PlayerForm } from "./PlayerForm";
import { PackageSelector } from "./PackageSelector";
import { PaymentSelector } from "./PaymentSelector";
import { ProofUpload } from "./ProofUpload";
import { OrderSummary } from "./OrderSummary";
import { Package, PaymentMethod } from "@/lib/mock-data";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/AuthContext";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";

export type OrderData = {
  playerId: string;
  zoneId: string;
  phone: string;
  quantity?: number;
  package?: Package;
  paymentMethod?: PaymentMethod;
  proofUrl?: string;
  transactionRef?: string;
  promoCode?: string;
  promoDiscount?: number;
};

const STEPS = [
  { id: 1, key: "step1_title" },
  { id: 2, key: "step2_title" },
];

export function RechargeStepper() {
  const t = useTranslations("RechargeForm");
  const tPkg = useTranslations("PackageSelector");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packagesUnlocked, setPackagesUnlocked] = useState(false);
  
  const [orderData, setOrderData] = useState<OrderData>({
    playerId: "",
    zoneId: "",
    phone: "",
    quantity: 1,
  });

  const { user } = useAuth();

  // Pre-select package from URL if available (Supabase lookup)
  useEffect(() => {
    const packageId = searchParams.get("package");
    if (!packageId) return;

    setPackagesUnlocked(true);

    const loadPackage = async () => {
      try {
        const { getPackageById } = await import("@/lib/supabase/database");
        const dbPkg = await getPackageById(packageId);
        if (dbPkg) {
          const pkg: Package = {
            id: dbPkg.id,
            gameId: "mobile-legends",
            amount: dbPkg.label,
            price: dbPkg.price,
            currency: "DZD",
            active: true,
          };
          setOrderData(prev => ({ ...prev, package: pkg }));
        }
      } catch {
        // Ignore — package will just not be pre-selected
      }
    };
    loadPackage();
  }, [searchParams]);

  const handleNextToPayment = () => {
    if (!orderData.playerId.trim()) {
      toast.error("Veuillez d'abord saisir votre ID de joueur.");
      document.getElementById("player-info-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!orderData.package) {
      toast.error("Veuillez sélectionner un forfait de diamants.");
      return;
    }
    setCurrentStep(2);
    setTimeout(() => {
      document.getElementById("payment-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setTimeout(() => {
      document.getElementById("package-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const getBaseTotalPrice = () => {
    const unitPrice = parseInt(String(orderData.package?.price || 0).replace(/[^0-9]/g, '')) || 0;
    return unitPrice * (orderData.quantity || 1);
  };

  const getFinalTotalPrice = () => {
    const base = getBaseTotalPrice();
    return orderData.promoDiscount ? Math.round(base * (1 - orderData.promoDiscount / 100)) : base;
  };

  const handleSubmit = async (file: File, transactionRef: string) => {
    if (!orderData.package || !orderData.paymentMethod) {
      toast.error("Informations manquantes. Veuillez vérifier le moyen de paiement.");
      return;
    }
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour passer commande. Veuillez vous connecter.");
      router.push("/auth/login");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const qty = orderData.quantity || 1;
      const formData = new FormData();
      formData.append('game', 'Mobile Legends');
      formData.append('packageId', orderData.package.id);
      formData.append('packageName', String(orderData.package.amount));
      formData.append('quantity', String(qty));
      formData.append('playerId', orderData.playerId);
      if (orderData.zoneId) formData.append('zoneId', orderData.zoneId);
      if (orderData.phone) formData.append('phone', orderData.phone);
      formData.append('paymentMethod', orderData.paymentMethod?.name ?? '');
      if (orderData.promoCode) formData.append('promoCode', orderData.promoCode);
      formData.append('receiptFile', file);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Échec de la création de la commande');
      
      toast.success("Commande transmise avec succès !");
      router.push(`/order/success?id=${data.orderId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Échec de l'envoi. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  // ── Chargily Pay automatic payment ──────────────────────────
  const handleChargilyCheckout = async () => {
    if (!orderData.package) {
      toast.error("Veuillez sélectionner un forfait.");
      return;
    }
    if (!orderData.playerId.trim()) {
      toast.error("Veuillez saisir votre ID de joueur.");
      return;
    }
    if (!user?.id) {
      toast.error("Connectez-vous pour payer.");
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const qty = orderData.quantity || 1;
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: orderData.playerId,
          zoneId: orderData.zoneId,
          packageId: orderData.package.id,
          packageName: String(orderData.package.amount),
          quantity: qty,
          phone: orderData.phone,
          gameSlug: 'mobile-legends',
          locale,
          promoCode: orderData.promoCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement');

      // Redirect to Chargily payment page
      window.location.href = data.checkout_url;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la création du paiement.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
      
      {/* Main Steps Form */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 sm:gap-6">
        
        {/* Progress Indicator (2 Steps) */}
        <div className="glass-card rounded-xl p-3 sm:p-4 border border-slate-200/60 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-2 gap-3 relative">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer",
                  currentStep === step.id 
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                    : currentStep > step.id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400"
                )}
                onClick={() => {
                  if (step.id === 1) setCurrentStep(1);
                  else if (step.id === 2 && orderData.playerId && orderData.package) setCurrentStep(2);
                }}
              >
                <div 
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                    currentStep > step.id
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.id
                      ? "bg-primary text-white"
                      : "bg-slate-200 dark:bg-white/10 text-slate-500"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-xs sm:text-sm font-semibold truncate">
                  {t(step.key as any)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Joueur & Forfait (Combined Essential Step 1) */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <PlayerForm 
              data={orderData} 
              onNext={(data) => {
                setOrderData(prev => ({ ...prev, ...data }));
                if (data.playerId?.trim() && data.zoneId?.trim()) {
                  setPackagesUnlocked(true);
                  setTimeout(() => {
                    document.getElementById("package-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 150);
                }
              }} 
            />
            
            <AnimatePresence mode="wait">
              {packagesUnlocked ? (
                <motion.div
                  key="package-section-open"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <PackageSelector 
                    selectedPackage={orderData.package}
                    quantity={orderData.quantity || 1}
                    onQuantityChange={(qty) => setOrderData(prev => ({ ...prev, quantity: qty }))}
                    onSelect={(pkg) => setOrderData(prev => ({ ...prev, package: pkg }))}
                    onNext={handleNextToPayment}
                    onBack={() => router.back()}
                    onCollapse={() => setPackagesUnlocked(false)}
                    gameName={searchParams.get("game") || "Mobile Legends"}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="package-section-collapsed"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setPackagesUnlocked(true);
                    setTimeout(() => {
                      document.getElementById("package-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="p-3.5 sm:p-4 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between group shadow-sm select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-primary/20 text-white/60 group-hover:text-primary flex items-center justify-center text-xs font-bold shrink-0 transition-colors">
                      2
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white/90 group-hover:text-white">
                          {tPkg("select_package")}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {orderData.package ? `${orderData.package.amount}` : "Caché (espace réduit)"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {orderData.package 
                          ? "Cliquez pour modifier le forfait ou changer la quantité" 
                          : tPkg("fill_to_unlock")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary group-hover:text-primary-foreground font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 shrink-0"
                  >
                    <span>{tPkg("show_packages")}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Step 2: Paiement & Preuve (Combined Essential Step 2) */}
        {currentStep === 2 && (
          <div id="payment-selector-section" className="space-y-4 sm:space-y-6 scroll-mt-20">
            {/* ── Chargily Pay Card (Automatic Payment) ───────── */}
            <div className="relative rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-5 sm:p-6 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xl sm:text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-white text-base sm:text-lg">Chargily Pay</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Automatique</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Mode Test</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
                    Paiement sécurisé par carte <strong className="text-white/80">CIB</strong> ou <strong className="text-white/80">EDAHABIA</strong>. Confirmation instantanée — aucun reçu requis.
                  </p>
                  
                  <Button
                    onClick={handleChargilyCheckout}
                    disabled={isSubmitting || !orderData.playerId.trim() || !orderData.package}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Redirection...</>
                    ) : (
                      <>⚡ Payer maintenant — {getFinalTotalPrice()} DZD</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">ou paiement manuel</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <PaymentSelector 
              selectedPayment={orderData.paymentMethod}
              onSelect={(method) => setOrderData(prev => ({ ...prev, paymentMethod: method }))}
              onNext={() => {}}
              onBack={handleBack}
              amount={getFinalTotalPrice()}
              promoCode={orderData.promoCode}
              onPromoApply={(code, discount) => setOrderData(prev => ({ ...prev, promoCode: code, promoDiscount: discount }))}
            />

            {orderData.paymentMethod && (
              <ProofUpload 
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        )}
      </div>

      {/* Sticky Order Summary */}
      <div className={cn("w-full lg:w-1/3 lg:sticky lg:top-24", !orderData.package && "hidden lg:block")}>
        <OrderSummary data={orderData} step={currentStep} />
      </div>
      
    </div>
  );
}
