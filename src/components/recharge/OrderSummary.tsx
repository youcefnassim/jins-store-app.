"use client";

import { OrderData } from "./RechargeStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

interface OrderSummaryProps {
  data: OrderData & { promoCode?: string; promoDiscount?: number };
  step: number;
}

export function OrderSummary({ data, step }: OrderSummaryProps) {
  const t = useTranslations("OrderSummary");

  const quantity = data.quantity || 1;
  const unitPrice = data.package 
    ? parseInt(String(data.package.price).replace(/[^0-9]/g, '')) || 0 
    : 0;
  const baseTotal = unitPrice * quantity;
  const finalTotal = data.promoDiscount 
    ? Math.round(baseTotal * (1 - data.promoDiscount / 100)) 
    : baseTotal;

  return (
    <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-pink-500 w-full" />
      <CardHeader className="bg-black/20 py-3.5 px-5">
        <CardTitle className="text-base sm:text-lg text-white font-bold">{t("title")}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-muted-foreground">{t("game")}</span>
            <span className="font-medium text-white">Mobile Legends</span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-muted-foreground">{t("player")}</span>
            <span className={data.playerId ? "font-mono text-white text-xs" : "text-muted-foreground text-xs"}>
              {data.playerId ? `${data.playerId} (${data.zoneId || "-"})` : "—"}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-muted-foreground">{t("package")}</span>
            <span className={data.package ? "font-semibold text-primary text-xs" : "text-muted-foreground text-xs"}>
              {data.package ? `${data.package.amount} (x${quantity})` : "En attente"}
            </span>
          </div>

          {data.paymentMethod && (
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-muted-foreground">{t("payment_method")}</span>
              <span className="font-medium text-white">
                {data.paymentMethod.name}
              </span>
            </div>
          )}
        </div>

        {data.package && (
          <>
            <Separator className="bg-white/10" />
            <div className="p-4 sm:p-5 bg-black/40 flex flex-col gap-2">
              
              {data.promoDiscount ? (
                <div className="flex justify-between items-center text-emerald-400 text-xs sm:text-sm">
                  <span>Code Promo ({data.promoCode})</span>
                  <span>-{data.promoDiscount}%</span>
                </div>
              ) : null}

              <div className="flex justify-between items-end mt-1">
                <span className="text-white/80 font-medium text-xs sm:text-sm">{t("total_amount")}</span>
                <div className="text-right">
                  {data.promoDiscount ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400 line-through mb-0.5">{baseTotal} DZD</span>
                      <span className="text-xl sm:text-2xl font-bold text-white block leading-none mb-1">
                        {finalTotal}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-white block leading-none mb-1">
                      {baseTotal}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {siteConfig.currency}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
