"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const getGameImage = (gameId?: string, image?: string) => {
  if (image && !image.includes("upload.wikimedia.org")) return image;
  if (gameId?.includes("mobile-legends") || gameId === "mlbb") return "/images/games/mobile-legends.png";
  if (gameId?.includes("pubg")) return "/images/games/pubg-mobile.png";
  if (gameId?.includes("valorant")) return "/images/games/valorant.png";
  return "/images/games/mobile-legends.png";
};

export function CartSidebar({ children }: { children?: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Cart");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getItemCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children ? children : (
          <Button variant="ghost" size="icon" className="relative group overflow-visible" title="Panier">
            <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center bg-gradient-to-r from-pink-500 to-primary text-white text-[10px] font-extrabold rounded-full border-2 border-white dark:border-[#0a0e17] shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-in zoom-in-75 duration-200">
                {totalItems}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-slate-50 dark:bg-[#0a0e17] border-l-slate-200 dark:border-l-white/10 p-0">
        <SheetHeader className="p-5 sm:p-6 pr-16 border-b border-slate-200 dark:border-white/10 text-left">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>{t("title")}</span>
            {totalItems > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 ml-auto">
                {totalItems} {totalItems > 1 ? "packs" : "pack"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-70">
              <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("empty_title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("empty_desc")}
              </p>
              <Button onClick={() => setIsOpen(false)} className="mt-6" variant="outline">
                {t("continue_shopping")}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-5 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111624] border border-slate-200 dark:border-white/10 shadow-sm relative group">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                      title="Supprimer du panier"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-black/50 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 p-0.5 flex items-center justify-center">
                      <img 
                        src={getGameImage(item.gameId, item.image)} 
                        alt={item.gameName} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/games/mobile-legends.png";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{item.gameName}</p>
                        {item.playerId ? (
                          <p className="text-xs font-mono text-primary bg-primary/10 w-max px-2 py-0.5 rounded mt-1">
                            ID: {item.playerId}{item.zoneId ? ` (${item.zoneId})` : ""}
                          </p>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-1">
                            Pack direct
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center bg-slate-100 dark:bg-black/50 rounded-lg p-0.5 border border-slate-200 dark:border-white/10 shrink-0">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors active:scale-95 disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            title="Diminuer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white select-none">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
                            title="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right whitespace-nowrap shrink-0">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-primary ml-1">
                            DZD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-400">{t("total")} ({totalItems} {t("items")})</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {getTotalPrice().toLocaleString()} DZD
              </span>
            </div>
            <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-base">
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                {t("checkout")}
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
