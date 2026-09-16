"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function TrackOrderCTA() {
  const t = useTranslations("TrackOrderCTA");
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      router.push(`/track?id=${orderNumber.trim()}`);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <Card className="glass-card max-w-4xl mx-auto overflow-hidden border-primary/20 relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left rtl:md:text-right">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">
                {t("title")}
              </h2>
              <p className="text-muted-foreground">
                {t("description")}
              </p>
            </div>
            
            <form onSubmit={handleTrack} className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t("placeholder")}
                  className="pl-10 rtl:pl-4 rtl:pr-10 h-12 bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-muted-foreground/60 w-full"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 shrink-0 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 transition-colors">
                {t("button")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
