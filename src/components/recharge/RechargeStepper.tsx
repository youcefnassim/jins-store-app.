"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlayerForm } from "./PlayerForm";
import { PackageSelector } from "./PackageSelector";
import { PaymentSelector } from "./PaymentSelector";
import { ProofUpload } from "./ProofUpload";
import { OrderSummary } from "./OrderSummary";
import { Package, PaymentMethod } from "@/lib/mock-data";
import { api } from "@/lib/api";
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

  // Pre-select package from URL if available
  useEffect(() => {
    const packageId = searchParams.get("package");
    if (packageId) {
      api.getPackages("mobile-legends").then((packages) => {
        const pkg = packages.find(p => p.id === packageId);
        if (pkg) {
          setOrderData(prev => ({ ...prev, package: pkg }));
        }
      });
    }
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
      const pointsToAward = Math.floor(price * 0.1);

      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('game', 'Mobile Legends');
      formData.append('packageId', orderData.package.id);
      formData.append('packageName', String(orderData.package.amount) + ' Diamants');
      formData.append('playerId', orderData.zoneId ? `${orderData.playerId} (${orderData.zoneId})` : orderData.playerId);
      formData.append('price', String(orderData.package.price));
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
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1 rtl:rotate-180 rtl:ml-1 rtl:mr-0" />
                {t("change_player_info")}
              </Button>
            </div>

            <PaymentSelector 
              selectedPayment={orderData.paymentMethod}
              onSelect={(method) => setOrderData(prev => ({ ...prev, paymentMethod: method }))}
              onNext={() => {}}
              onBack={handleBack}
              amount={orderData.package?.price || 0}
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
