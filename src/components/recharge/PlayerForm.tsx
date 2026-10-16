"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Loader2, CheckCircle2, UserCheck, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/supabase/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const playerSchema = z.object({
  playerId: z.string().min(5, "L'ID Joueur est trop court").max(15, "L'ID Joueur est trop long").regex(/^\d+$/, "L'ID Joueur doit contenir uniquement des chiffres"),
  zoneId: z.string().optional(),
  phone: z.string().optional().refine((val) => !val || /^(05|06|07)\d{8}$/.test(val), {
    message: "Numéro de téléphone algérien invalide (ex. 0550000000)",
  }),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  data: {
    playerId: string;
    zoneId?: string;
    phone?: string;
  };
  gameSlug?: string;
  onNext: (data: { playerId: string; zoneId?: string; phone?: string }) => void;
}

export function PlayerForm({ data, gameSlug, onNext }: PlayerFormProps) {
  const isMlbb = !gameSlug || gameSlug === "mobile-legends" || gameSlug === "mlbb";
  const t = useTranslations("RechargeForm");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const { user } = useAuth();
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      playerId: data.playerId || "",
      zoneId: data.zoneId || "",
      phone: data.phone || "",
    },
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (!data.playerId && typeof window !== "undefined") {
      const savedPlayerId = localStorage.getItem("dz_recharge_playerId");
      const savedZoneId = localStorage.getItem("dz_recharge_zoneId");
      const savedPhone = localStorage.getItem("dz_recharge_phone");

      if (savedPlayerId) form.setValue("playerId", savedPlayerId);
      if (savedZoneId) form.setValue("zoneId", savedZoneId);
      if (savedPhone) form.setValue("phone", savedPhone);
    }
  }, [data.playerId, form]);

  // Fetch saved accounts if logged in
  useEffect(() => {
    if (user) {
      const fetchAccounts = async () => {
        try {
          const { data, error } = await supabase
            .from("saved_accounts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (!error && data) setSavedAccounts(data);
        } catch (e) {
          console.error(e);
        } finally {
          setAccountsLoading(false);
        }
      };
      fetchAccounts();
    } else {
      setAccountsLoading(false);
    }
  }, [user]);

  // Automatic verification effect with debounce
  const watchedPlayerId = form.watch("playerId");
  const watchedZoneId = form.watch("zoneId");
  const watchedPhone = form.watch("phone");

  useEffect(() => {
    const isPlayerValid = /^\d{5,15}$/.test(watchedPlayerId || "");
    const isZoneValid = isMlbb ? /^\d{3,5}$/.test(watchedZoneId || "") : true;

    if (!isPlayerValid || !isZoneValid) {
      setVerifiedName(null);
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/check-player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            game: gameSlug || "mobile-legends",
            playerId: watchedPlayerId,
            zoneId: isMlbb ? watchedZoneId : undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.nickname) {
          setVerifiedName(data.nickname);
        } else {
          setVerifiedName("Format Valide");
        }
      } catch {
        setVerifiedName("Format Valide");
      } finally {
        setIsVerifying(false);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("dz_recharge_playerId", watchedPlayerId);
        if (watchedZoneId) localStorage.setItem("dz_recharge_zoneId", watchedZoneId);
        if (watchedPhone) localStorage.setItem("dz_recharge_phone", watchedPhone);
      }

      onNext({
        playerId: watchedPlayerId,
        zoneId: watchedZoneId || "",
        phone: watchedPhone || "",
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedPlayerId, watchedZoneId, watchedPhone, isMlbb, gameSlug]);

  const handleSelectAccount = (acc: any) => {
    form.setValue("playerId", acc.player_id || "");
    if (acc.zone_id) form.setValue("zoneId", acc.zone_id);
    setVerifiedName(acc.player_name || "Compte Enregistré");
    onNext({
      playerId: acc.player_id || "",
      zoneId: acc.zone_id || watchedZoneId || "",
      phone: watchedPhone || "",
    });
    setTimeout(() => {
      document.getElementById("package-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  async function onSubmit(values: PlayerFormValues) {
    if (isMlbb && (!values.zoneId || values.zoneId.length < 3)) {
      form.setError("zoneId", { message: "L'ID de Zone (3-5 chiffres) est requis pour Mobile Legends" });
      return;
    }

    if (!verifiedName) {
      setIsVerifying(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setVerifiedName("Format Valide");
      setIsVerifying(false);
    }
    onNext({
      playerId: values.playerId,
      zoneId: values.zoneId || "",
      phone: values.phone || "",
    });
    setTimeout(() => {
      document.getElementById("package-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  return (
    <Card id="player-info-section" className="glass-card border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader className="py-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <div>
            <CardTitle className="text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">{t("player_info_title")}</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              {t("player_info_desc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {user && savedAccounts.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-700 dark:text-white/80 mb-2">Comptes enregistrés :</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="flex flex-col items-start bg-black/5 dark:bg-black/20 hover:bg-primary/20 border border-slate-200 dark:border-white/5 hover:border-primary/50 px-3 py-2 rounded-xl transition-all min-w-[130px] text-left shrink-0 group"
                >
                  <span className="text-[10px] text-primary font-bold">{acc.game}</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white group-hover:text-primary-foreground">{acc.player_id}</span>
                  {acc.player_name && <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">{acc.player_name}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            
            <div className={cn("grid gap-3 sm:gap-4", isMlbb ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700 dark:text-white/80">
                      {isMlbb ? t("player_id") : "ID Joueur (UID)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isMlbb ? "123456789" : "ex: 123456789 (UID)"} 
                          className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-10 font-mono text-sm" 
                          {...field} 
                        />
                        {isVerifying && (
                          <div className="absolute right-3 top-2.5 rtl:right-auto rtl:left-3">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />
              {isMlbb && (
                <FormField
                  control={form.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700 dark:text-white/80">{t("zone_id")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="1234" className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-10 font-mono text-sm" {...field} />
                          {isVerifying && (
                            <div className="absolute right-3 top-2.5 rtl:right-auto rtl:left-3">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive text-xs" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <AnimatePresence>
              {verifiedName && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-bold uppercase tracking-wider">{t("account_verified")}</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{verifiedName}</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-emerald-500 opacity-60" />
                </motion.div>
              )}
            </AnimatePresence>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700 dark:text-white/80">
                    {t("phone")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 0550000000" className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-10 text-sm" {...field} />
                  </FormControl>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">{t("phone_desc")}</p>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
              <Link 
                href={isMlbb ? "/games/mobile-legends" : `/games/${gameSlug || "free-fire"}`} 
                target="_blank" 
                className="text-xs text-primary hover:underline flex items-center gap-1 order-2 sm:order-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t("where_id")}
              </Link>
              
              <Button 
                type="submit" 
                disabled={isVerifying}
                className={cn(
                  "font-bold h-11 px-6 w-full sm:w-auto order-1 sm:order-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm",
                  verifiedName 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                    : "bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                )}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("verifying")}</span>
                  </>
                ) : verifiedName ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Choisir mon forfait</span>
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                  </>
                ) : (
                  <>
                    <span>Continuer vers les forfaits</span>
                    <ArrowDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
