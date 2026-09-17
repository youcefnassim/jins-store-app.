"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerForm } from "./PlayerForm";
import { PackageSelector } from "./PackageSelector";
import { PaymentSelector } from "./PaymentSelector";
import { ProofUpload } from "./ProofUpload";
import { OrderSummary } from "./OrderSummary";
import { Package, PaymentMethod } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/AuthContext";
// createOrder is now handled server-side via /api/orders/create

export type OrderData = {
  playerId: string;
  zoneId: string;
  phone: string;
  package?: Package;
  paymentMethod?: PaymentMethod;
  proofUrl?: string; // For mock purposes
  transactionRef?: string;
};

const STEPS = [
  { id: 1, name: "Player" },
  { id: 2, name: "Package" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Proof" },
];

export function RechargeStepper() {
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
          // If we have package from URL, we can optionally skip step 2 later, 
          // but for now let's just preselect it.
        }
      });
    }
  }, [searchParams]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (file: File, transactionRef: string) => {
    if (!orderData.package || !orderData.paymentMethod) {
      toast.error("Missing information. Please check all steps.");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to recharge. Please log in first.");
      router.push("/auth/login");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const priceStr = String(orderData.package.price).replace(/[^0-9]/g, '');
      const price = parseInt(priceStr) || 0;
      const pointsToAward = Math.floor(price * 0.1);

      // Use server-side API to bypass network restrictions
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('game', 'Mobile Legends');
      formData.append('packageId', orderData.package.id);
      formData.append('packageName', String(orderData.package.amount) + ' Diamonds');
      formData.append('playerId', orderData.zoneId ? `${orderData.playerId} (${orderData.zoneId})` : orderData.playerId);
      formData.append('price', String(orderData.package.price));
      formData.append('pointsToAward', String(pointsToAward));
      formData.append('receiptFile', file);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit order');
      
      toast.success("Order submitted successfully!");
      router.push(`/order/success?id=${data.orderId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Main Steps Form */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {/* Progress Indicator */}
        <div className="glass-card rounded-xl p-4 md:p-6 mb-2 hidden sm:block border-white/5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
            
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0a0e17] px-2 relative z-10">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2",
                    currentStep > step.id 
                      ? "bg-primary border-primary text-white" 
                      : currentStep === step.id
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-black/50 border-white/10 text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={cn(
                  "text-xs md:text-sm font-medium transition-colors",
                  currentStep >= step.id ? "text-white" : "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="sm:hidden glass-card rounded-xl p-4 mb-2 border-white/5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep} of {STEPS.length}</span>
          <span className="font-medium text-white">{STEPS[currentStep - 1].name}</span>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <PlayerForm 
              data={orderData} 
              onNext={(data) => {
                setOrderData(prev => ({ ...prev, ...data }));
                handleNext();
              }} 
            />
          )}
          
          {currentStep === 2 && (
            <PackageSelector 
              selectedPackage={orderData.package}
              onSelect={(pkg) => setOrderData(prev => ({ ...prev, package: pkg }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 3 && (
            <PaymentSelector 
              selectedPayment={orderData.paymentMethod}
              onSelect={(method) => setOrderData(prev => ({ ...prev, paymentMethod: method }))}
              onNext={handleNext}
              onBack={handleBack}
              amount={orderData.package?.price || 0}
            />
          )}
          
          {currentStep === 4 && (
            <ProofUpload 
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Sticky Order Summary */}
      <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
        <OrderSummary data={orderData} step={currentStep} />
      </div>
      
    </div>
  );
}
