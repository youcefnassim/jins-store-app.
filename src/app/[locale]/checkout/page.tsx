"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useCartStore } from "@/store/useCartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/AuthContext";
import { PaymentSelector } from "@/components/recharge/PaymentSelector";
import { ProofUpload } from "@/components/recharge/ProofUpload";
import { PaymentMethod } from "@/lib/mock-data";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<"payment" | "proof">("payment");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Button onClick={() => router.push("/games")} variant="outline">
          Parcourir les jeux
        </Button>
      </div>
    );
  }

  const handleSubmit = async (file: File, transactionRef: string) => {
    if (!paymentMethod) {
      toast.error("Veuillez sélectionner une méthode de paiement.");
      return;
    }
    
    if (!user?.id) {
      toast.error("Vous devez être connecté pour passer commande.");
      router.push("/auth/login");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const pointsToAward = Math.floor(totalPrice * 0.1);

      // Submit global order
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('game', 'Cart Multiple Items');
      formData.append('packageId', 'cart-' + Date.now());
      formData.append('packageName', `${items.length} items from Cart`);
      // Encode cart items to save them in DB if needed (or just list them in player ID field as a hack for now)
      const itemsList = items.map(i => `${i.gameName}: ${i.name} (ID: ${i.playerId}) x${i.quantity}`).join(' | ');
      formData.append('playerId', itemsList);
      formData.append('price', String(totalPrice));
      formData.append('pointsToAward', String(pointsToAward));
      formData.append('receiptFile', file);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit order');
      
      toast.success("Commande envoyée avec succès !");
      clearCart();
      router.push(`/order/success?id=${data.orderId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Échec de l'envoi de la commande. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <h1 className="text-3xl font-bold">Caisse (Checkout)</h1>
          <p className="text-muted-foreground">Finalisez votre achat de {items.length} article(s).</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === "payment" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>1. Méthode de Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentSelector 
                    selectedPayment={paymentMethod}
                    onSelect={setPaymentMethod}
                    onNext={() => setCurrentStep("proof")}
                    onBack={() => router.back()}
                    amount={totalPrice}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === "proof" && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>2. Preuve de Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
                    <p className="text-sm font-medium">
                      Veuillez envoyer le montant total de <span className="font-bold text-primary">{totalPrice.toLocaleString()} DZD</span> vers notre compte {paymentMethod?.name}.
                    </p>
                  </div>
                  <ProofUpload 
                    onBack={() => setCurrentStep("payment")}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle>Résumé de la Commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm border-b border-white/5 pb-2">
                      <div>
                        <p className="font-semibold">{item.quantity}x {item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.gameName}</p>
                        <p className="text-xs font-mono text-primary">ID: {item.playerId}</p>
                      </div>
                      <span className="font-medium whitespace-nowrap ml-2">
                        {(item.price * item.quantity).toLocaleString()} DZD
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{totalPrice.toLocaleString()} DZD</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
