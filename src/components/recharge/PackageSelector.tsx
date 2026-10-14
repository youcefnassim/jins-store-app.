"use client";

import { useState, useEffect } from "react";
import { Package } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowDown, ShoppingCart, Minus, Plus, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PackageSelectorProps {
  selectedPackage?: Package;
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  onSelect: (pkg: Package) => void;
  onNext: () => void;
  onBack: () => void;
  onCollapse?: () => void;
  gameName?: string;
}

export function PackageSelector({ 
  selectedPackage, 
  quantity = 1,
  onQuantityChange,
  onSelect, 
  onNext, 
  onBack, 
  onCollapse,
  gameName = "Mobile Legends" 
}: PackageSelectorProps) {
  const t = useTranslations("PackageSelector");
  const tForm = useTranslations("RechargeForm");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart state
  const [cartPkg, setCartPkg] = useState<Package | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [playerId, setPlayerId] = useState("");
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const handleAddToCart = () => {
    if (cartPkg && playerId.trim()) {
      addItem({
        gameId: cartPkg.gameId,
        packageId: cartPkg.id,
        playerId: playerId.trim(),
        price: cartPkg.price,
        quantity: cartQuantity,
        name: String(cartPkg.amount),
        gameName: gameName,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mobile_Legends_Bang_Bang_logo.png/600px-Mobile_Legends_Bang_Bang_logo.png", 
      });
      toast.success("✅ Ajouté au panier avec succès !", {
        description: `${gameName} — ${cartPkg.amount} (x${cartQuantity}) — ID: ${playerId.trim()}`,
        duration: 3000,
      });
      setCartPkg(null);
      setPlayerId("");
      setCartQuantity(1);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPackages = async () => {
      try {
        const slugMap: Record<string, string> = {
          "Mobile Legends": "mobile-legends",
          "Mobile Legends: Bang Bang": "mobile-legends",
          "MLBB": "mobile-legends",
          "Free Fire": "free-fire",
          "PUBG Mobile": "pubg-mobile",
          "Valorant": "valorant",
        };
        const slug = slugMap[gameName] ?? "mobile-legends";

        const { getPackagesByGame } = await import("@/lib/supabase/database");
        const dbPackages = await getPackagesByGame(slug);

        if (!isMounted) return;

        if (dbPackages.length > 0) {
          const mapped: Package[] = dbPackages.map((p, index) => ({
            id: p.id,
            gameId: slug,
            amount: p.label,
            price: p.price,
            currency: "DZD",
            popular: p.popular ?? (index === 2),
            active: true,
          }));
          setPackages(mapped);
        } else {
          const { api } = await import("@/lib/api");
          const res = await api.getPackages("mobile-legends");
          if (isMounted) setPackages(res);
        }
      } catch (err) {
        console.error("PackageSelector load error:", err);
        const { api } = await import("@/lib/api");
        const res = await api.getPackages("mobile-legends");
        if (isMounted) setPackages(res);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPackages();
    return () => { isMounted = false; };
  }, [gameName]);

  const handlePackageClick = (pkg: Package) => {
    onSelect(pkg);
  };

  const handleProceed = () => {
    onNext();
    setTimeout(() => {
      document.getElementById("payment-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  return (
    <Card id="package-selector-section" className="glass-card border-white/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader className="py-3.5 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <div>
              <CardTitle className="text-lg sm:text-xl text-white leading-tight">{t("select_package")}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {t("choose_package")}
              </CardDescription>
            </div>
          </div>
          {onCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="text-xs text-muted-foreground hover:text-white h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1 hover:bg-white/10"
              title="Masquer les forfaits"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Masquer</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="relative rounded-xl border border-white/5 bg-black/20 p-3 h-28 flex flex-col items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="w-14 h-3.5 rounded-full bg-white/5" />
                <div className="w-16 h-3 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageClick(pkg)}
                    className={cn(
                      "relative cursor-pointer rounded-xl border p-3 sm:p-3.5 transition-all duration-200 flex flex-col items-center text-center gap-1 group overflow-hidden select-none",
                      isSelected
                        ? "border-primary bg-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.45)] ring-1 ring-primary/60 scale-[1.02]"
                        : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                    )}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-1.5 inset-x-0 mx-auto w-fit z-10">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                          {t("popular")}
                        </span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCartPkg(pkg);
                        setCartQuantity(1);
                      }}
                      title={t("add_to_cart_title")}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 hover:bg-primary text-white/70 hover:text-white flex items-center justify-center transition-all z-10 rtl:right-auto rtl:left-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="text-2xl sm:text-3xl my-0.5 group-hover:scale-110 transition-transform select-none">
                      💎
                    </div>
                    
                    <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{pkg.amount}</h3>
                    
                    <div className="mt-0.5 flex items-baseline gap-1 text-primary">
                      <span className="font-bold text-xs sm:text-sm">{formatPrice(pkg.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector Bar (Displayed when package selected) */}
            {selectedPackage && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/90">{t("quantity")} :</span>
                    <div className="flex items-center bg-black/60 border border-white/15 rounded-lg overflow-hidden shadow-inner">
                      <button
                        type="button"
                        className="h-8 w-8 text-white hover:bg-white/15 active:bg-white/25 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-white select-none">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="h-8 w-8 text-white hover:bg-white/15 active:bg-white/25 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => onQuantityChange?.(Math.min(99, quantity + 1))}
                        disabled={quantity >= 99}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ({selectedPackage.amount})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">{t("total")}</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-400">
                      {formatPrice(selectedPackage.price * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions with Down Arrow Flow */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/5 h-9 px-3">
                <ArrowLeft className="mr-1.5 w-4 h-4 rtl:rotate-180 rtl:ml-1.5 rtl:mr-0" />
                {t("back")}
              </Button>
              
              <Button 
                type="button" 
                onClick={handleProceed} 
                disabled={!selectedPackage}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-10 sm:h-11 px-5 sm:px-7 rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>{t("buy_now")}</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Cart Dialog with Quantity */}
      <Dialog open={!!cartPkg} onOpenChange={(open) => !open && setCartPkg(null)}>
        <DialogContent className="sm:max-w-md bg-[#0a0e17] border-white/10">
          <DialogHeader>
            <DialogTitle>{t("add_to_cart_title")}</DialogTitle>
            <DialogDescription>
              {t("enter_player_id", { amount: cartPkg?.amount ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div>
              <Label htmlFor="dialogPlayerId" className="text-xs text-white">{tForm("player_id")}</Label>
              <Input 
                id="dialogPlayerId" 
                value={playerId} 
                onChange={(e) => setPlayerId(e.target.value)} 
                placeholder="Ex: 12345678" 
                className="mt-1.5 bg-black/40 border-white/10 text-white h-10 font-mono text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-white/80 mb-1.5 block">{t("quantity")}</Label>
              <div className="flex items-center justify-between bg-black/40 border border-white/10 p-2 rounded-lg">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                    disabled={cartQuantity <= 1}
                    className="h-8 w-8 text-white hover:bg-white/10 flex items-center justify-center rounded disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white">{cartQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity(Math.min(99, cartQuantity + 1))}
                    disabled={cartQuantity >= 99}
                    className="h-8 w-8 text-white hover:bg-white/10 flex items-center justify-center rounded disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {cartPkg && (
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block uppercase">Total</span>
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(cartPkg.price * cartQuantity)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setCartPkg(null)}>{t("cancel")}</Button>
            <Button 
              onClick={handleAddToCart} 
              disabled={!playerId.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {t("add_to_cart_title")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
