"use client";

import { useState, useEffect } from "react";
import { Package } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageSelectorProps {
  selectedPackage?: Package;
  onSelect: (pkg: Package) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PackageSelector({ selectedPackage, onSelect, onNext, onBack }: PackageSelectorProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getPackages("mobile-legends").then((res) => {
      if (isMounted) {
        setPackages(res);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <Card className="glass-card border-white/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader>
        <CardTitle className="text-2xl text-white">Select Package</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose the amount of Diamonds you want to recharge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => onSelect(pkg)}
                  className={cn(
                    "relative cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col items-center text-center gap-2 group overflow-hidden",
                    selectedPackage?.id === pkg.id
                      ? "border-primary bg-primary/20 shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                      : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  )}
                >
                  {/* Points Badge */}
                  <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="w-2 h-2" />
                    +{Math.floor(pkg.price * 0.1)} Pts
                  </div>

                  {pkg.popular && (
                    <div className="absolute -top-2 inset-x-0 mx-auto w-fit">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
                    <div className="w-6 h-6 bg-gradient-to-tr from-cyan-400 to-blue-500 rotate-45 rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                  </div>
                  
                  <h3 className="font-bold text-white text-lg leading-tight">{pkg.amount}</h3>
                  
                  <div className="mt-1 flex items-baseline gap-1 text-primary">
                    <span className="font-bold">{pkg.price}</span>
                    <span className="text-xs font-medium uppercase">{siteConfig.currency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/5">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              
              <Button 
                type="button" 
                onClick={onNext} 
                disabled={!selectedPackage}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-12 px-8 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
