"use client";

import { OrderData } from "./RechargeStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  data: OrderData;
  step: number;
}

export function OrderSummary({ data, step }: OrderSummaryProps) {
  return (
    <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-pink-500 w-full" />
      <CardHeader className="bg-black/20 pb-4">
        <CardTitle className="text-lg text-white">Order Summary</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Game</span>
            <span className="font-medium text-white">Mobile Legends</span>
          </div>
          
          {data.playerId && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Player</span>
              <span className="font-medium text-white">
                {data.playerId} <span className="text-muted-foreground">({data.zoneId})</span>
              </span>
            </div>
          )}
          
          {data.package && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Package</span>
              <span className="font-medium text-primary">
                {data.package.amount} Diamonds
              </span>
            </div>
          )}

          {data.paymentMethod && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payment via</span>
              <span className="font-medium text-white">
                {data.paymentMethod.name}
              </span>
            </div>
          )}
        </div>

        {data.package && (
          <>
            <Separator className="bg-white/10" />
            <div className="p-6 bg-black/40 flex justify-between items-end">
              <span className="text-white/80 font-medium">Total Amount</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-white block leading-none mb-1">
                  {data.package.price}
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {siteConfig.currency}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
