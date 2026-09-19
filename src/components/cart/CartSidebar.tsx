"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartSidebar() {
  const t = useTranslations();
  const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getItemCount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#0a0e17]">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-slate-50 dark:bg-[#0a0e17] border-l-slate-200 dark:border-l-white/10 p-0">
        <SheetHeader className="p-6 border-b border-slate-200 dark:border-white/10 text-left">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Mon Panier
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-70">
              <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez des forfaits à votre panier pour procéder au paiement groupé.
              </p>
              <Button onClick={() => setIsOpen(false)} className="mt-6" variant="outline">
                Continuer mes achats
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative group">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="w-16 h-16 rounded-lg bg-black/5 dark:bg-black/40 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.gameName} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.gameName}</p>
                        <p className="text-xs font-mono text-primary bg-primary/10 w-max px-2 py-0.5 rounded mt-1">ID: {item.playerId}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-md p-1 border border-slate-200 dark:border-white/10">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {(item.price * item.quantity).toLocaleString()} DZD
                        </span>
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
              <span className="text-slate-600 dark:text-slate-400">Total ({totalItems} articles)</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {getTotalPrice().toLocaleString()} DZD
              </span>
            </div>
            <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-base">
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                Passer à la caisse
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
