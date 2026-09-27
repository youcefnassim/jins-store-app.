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

  return (
    <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-pink-500 w-full" />
      <CardHeader className="bg-black/20 pb-4">
        <CardTitle className="text-lg text-white">{t("title")}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{t("game")}</span>
            <span className="font-medium text-white">Mobile Legends</span>
          </div>
          
          {data.playerId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("player")}</span>
              <span className="font-medium text-white">
                {data.playerId} <span className="text-muted-foreground">({data.zoneId})</span>
              </span>
            </div>
          )}
          
          {data.package && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("package")}</span>
              <span className="font-medium text-primary">
                {data.package.amount} Diamants
              </span>
            </div>
          )}

          {data.paymentMethod && (
            <div className="flex justify-between items-center text-sm">
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
            <div className="p-6 bg-black/40 flex flex-col gap-2">
              
              {data.promoDiscount ? (
                <div className="flex justify-between items-center text-emerald-400 text-sm">
                  <span>Code Promo ({data.promoCode})</span>
                  <span>-{data.promoDiscount}%</span>
                </div>
              ) : null}

              <div className="flex justify-between items-end mt-2">
                <span className="text-white/80 font-medium">{t("total_amount")}</span>
                <div className="text-right">
                  {data.promoDiscount ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-slate-500 line-through mb-1">{data.package.price} DZD</span>
                      <span className="text-2xl font-bold text-white block leading-none mb-1">
                        {Math.round(parseInt(String(data.package.price).replace(/[^0-9]/g, '')) * (1 - data.promoDiscount / 100))}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white block leading-none mb-1">
                      {data.package.price}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
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
