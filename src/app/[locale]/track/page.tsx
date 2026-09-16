"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, Order } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Package as PackageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setOrderId(id);
      handleSearch(id);
    }
  }, [searchParams]);

  const handleSearch = async (idToSearch: string = orderId) => {
    if (!idToSearch.trim()) return;
    
    setLoading(true);
    setError("");
    setOrder(null);
    
    try {
      const result = await api.getOrder(idToSearch.trim());
      if (result) {
        setOrder(result);
      } else {
        setError("Order not found. Please check your order number and try again.");
      }
    } catch (err) {
      setError("An error occurred while tracking the order.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'completed': return 3;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const timeline = [
    { label: "Order Created", index: 0 },
    { label: "Payment Verification", index: 1 },
    { label: "Recharge Processing", index: 2 },
    { label: "Completed", index: 3 },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your order number to see the current status of your recharge.
          </p>
        </div>

        <Card className="glass-card mb-8 border-white/10">
          <CardContent className="p-6">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Order Number (e.g. MLBB-...)"
                  className="pl-11 h-14 bg-black/40 border-white/10 text-lg text-white placeholder:text-muted-foreground/50"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-14 px-8 text-base bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-4 text-destructive-foreground">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <h3 className="font-bold text-destructive text-lg mb-1">Order not found</h3>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Order Details Card */}
            <Card className="glass-card border-white/10 overflow-hidden">
              <div className="bg-black/20 p-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-bold text-white tracking-widest">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Game</p>
                  <p className="font-medium text-white flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-primary" />
                    MLBB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Player ID</p>
                  <p className="font-medium text-white">{order.playerId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="font-medium text-primary">{order.amount} {siteConfig.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                    order.status === 'completed' ? "bg-green-500/20 text-green-400" :
                    order.status === 'rejected' ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    {order.status}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 md:p-10">
                {order.status === 'rejected' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-500 mb-2">Payment Rejected</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      We could not verify your payment proof. Please contact support to resolve this issue or request a refund.
                    </p>
                    <Button asChild className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none">
                      <Link href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank">
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical line for mobile */}
                    <div className="md:hidden absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10" />
                    
                    {/* Horizontal line for desktop */}
                    <div className="hidden md:block absolute top-[19px] left-8 right-8 h-0.5 bg-white/10" />

                    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
                      {timeline.map((step, index) => {
                        const isCompleted = getStatusIndex(order.status) >= step.index;
                        const isCurrent = getStatusIndex(order.status) === step.index;
                        
                        return (
                          <div key={index} className="flex md:flex-col items-center gap-4 md:text-center">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                              isCompleted ? "bg-primary border-primary text-white" :
                              "bg-black border-white/20 text-muted-foreground"
                            )}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />}
                            </div>
                            <div>
                              <p className={cn(
                                "font-semibold text-sm md:text-base",
                                isCompleted ? "text-white" : "text-muted-foreground"
                              )}>{step.label}</p>
                              {isCurrent && (
                                <p className="text-xs text-primary font-medium mt-1">In Progress</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
