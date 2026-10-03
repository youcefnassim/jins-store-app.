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
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/AuthContext";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export type OrderData = {
  playerId: string;
  zoneId: string;
  phone: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState<OrderData>({
    playerId: "",
    zoneId: "",
    phone: "",
  });

  const { user } = useAuth();

  // Pre-select package from URL if available (Supabase lookup)
  useEffect(() => {
    const packageId = searchParams.get("package");
    if (!packageId) return;

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
      toast.error("Veuillez saisir votre ID de joueur.");
      return;
    }
    if (!orderData.package) {
      toast.error("Veuillez sélectionner un forfait de diamants.");
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
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
      const priceStr = String(orderData.package.price).replace(/[^0-9]/g, '');
      const price = parseInt(priceStr) || 0;
      let finalPrice = price;
      if (orderData.promoDiscount) {
        finalPrice = Math.round(price * (1 - orderData.promoDiscount / 100));
      }
      
      const pointsToAward = Math.floor(finalPrice * 0.1);

      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('game', 'Mobile Legends');
      formData.append('packageId', orderData.package.id);
      formData.append('packageName', String(orderData.package.amount));
      formData.append('playerId', orderData.playerId);
      if (orderData.zoneId) formData.append('zoneId', orderData.zoneId);
      if (orderData.phone) formData.append('phone', orderData.phone);
      formData.append('paymentMethod', orderData.paymentMethod?.name ?? '');
      formData.append('price', String(finalPrice));
      if (orderData.promoCode) formData.append('promoCode', orderData.promoCode);
      formData.append('pointsToAward', String(pointsToAward));
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
      const priceStr = String(orderData.package.price).replace(/[^0-9]/g, '');
      const price = parseInt(priceStr) || 0;
      const finalPrice = orderData.promoDiscount
        ? Math.round(price * (1 - orderData.promoDiscount / 100))
        : price;

      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          playerId: orderData.playerId,
          zoneId: orderData.zoneId,
          packageId: orderData.package.id,
          packageName: String(orderData.package.amount),
          price: finalPrice,
          phone: orderData.phone,
          gameSlug: 'mobile-legends',
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
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Main Steps Form */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        
        {/* Progress Indicator (2 Steps) */}
        <div className="glass-card rounded-xl p-4 md:p-6 border border-slate-200/60 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-2 gap-4 relative">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
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
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                    currentStep > step.id
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.id
                      ? "bg-primary text-white"
                      : "bg-slate-200 dark:bg-white/10 text-slate-500"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-xs md:text-sm font-semibold truncate">
                  {t(step.key as any)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Joueur & Forfait (Combined Essential Step 1) */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <PlayerForm 
              data={orderData} 
              onNext={(data) => {
                setOrderData(prev => ({ ...prev, ...data }));
              }} 
            />
            
            <PackageSelector 
              selectedPackage={orderData.package}
              onSelect={(pkg) => setOrderData(prev => ({ ...prev, package: pkg }))}
              onNext={handleNextToPayment}
              onBack={() => router.back()}
              gameName={searchParams.get("game") || "Mobile Legends"}
            />

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNextToPayment}
                disabled={!orderData.playerId.trim() || !orderData.package}
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/25"
              >
                <span>{t("continue_payment")}</span>
                <ArrowRight className="w-4 h-4 ml-2 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Paiement & Preuve (Combined Essential Step 2) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* ── Chargily Pay Card (Automatic Payment) ───────── */}
            <div className="relative rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-6 overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg">Chargily Pay</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Automatique</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Mode Test</span>
                  </div>
                  <p className="text-sm text-white/60 mb-4">Paiement sécurisé par carte <strong className="text-white/80">CIB</strong> ou <strong className="text-white/80">DAHABIA</strong>. Confirmation instantanée — aucun reçu requis.</p>
                  
                  <Button
                    onClick={handleChargilyCheckout}
                    disabled={isSubmitting || !orderData.playerId.trim() || !orderData.package}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Redirection...</>
                    ) : (
                      <>⚡ Payer maintenant — {orderData.promoDiscount ? Math.round(parseInt(String(orderData.package?.price || 0).replace(/[^0-9]/g,'')) * (1 - orderData.promoDiscount/100)) : parseInt(String(orderData.package?.price || 0).replace(/[^0-9]/g,''))} DZD</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">ou paiement manuel</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <PaymentSelector 
              selectedPayment={orderData.paymentMethod}
              onSelect={(method) => setOrderData(prev => ({ ...prev, paymentMethod: method }))}
              onNext={() => {}}
              onBack={handleBack}
              amount={
                orderData.promoDiscount 
                ? Math.round(parseInt(String(orderData.package?.price).replace(/[^0-9]/g, '')) * (1 - orderData.promoDiscount / 100))
                : parseInt(String(orderData.package?.price).replace(/[^0-9]/g, '')) || 0
              }
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
      <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
        <OrderSummary data={orderData} step={currentStep} />
      </div>
      
    </div>
  );
}
