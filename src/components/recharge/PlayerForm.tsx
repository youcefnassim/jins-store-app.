"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, HelpCircle, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/supabase/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

const playerSchema = z.object({
  playerId: z.string().min(5, "Player ID is too short").max(15, "Player ID is too long").regex(/^\d+$/, "Player ID must contain only numbers"),
  zoneId: z.string().min(3, "Zone ID is too short").max(5, "Zone ID is too long").regex(/^\d+$/, "Zone ID must contain only numbers"),
  phone: z.string().optional().refine((val) => !val || /^(05|06|07)\d{8}$/.test(val), {
    message: "Must be a valid Algerian phone number (e.g. 0550000000)",
  }),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  data: {
    playerId: string;
    zoneId: string;
    phone: string;
  };
  onNext: (data: PlayerFormValues) => void;
}

export function PlayerForm({ data, onNext }: PlayerFormProps) {
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

  const handleSelectAccount = (acc: any) => {
    form.setValue("playerId", acc.player_id || "");
    setVerifiedName(acc.player_name || null);
  };

  async function onSubmit(values: PlayerFormValues) {
    if (!verifiedName) {
      setIsVerifying(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockNames = ["DZ_Sniper", "Faker_Wannabe", "Algiers_King", "Pro_Gamer_99"];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setVerifiedName(randomName);
      setIsVerifying(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("dz_recharge_playerId", values.playerId);
      localStorage.setItem("dz_recharge_zoneId", values.zoneId);
      localStorage.setItem("dz_recharge_phone", values.phone);
    }

    onNext(values);
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "playerId" || name === "zoneId") {
        setVerifiedName(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card className="glass-card border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader>
        <CardTitle className="text-2xl text-slate-900 dark:text-white">{t("player_info_title")}</CardTitle>
        <CardDescription className="text-slate-500 dark:text-muted-foreground">
          {t("player_info_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user && savedAccounts.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-white/80 mb-3">Ou choisir un compte enregistré :</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="flex flex-col items-start bg-black/5 dark:bg-black/20 hover:bg-primary/20 border border-slate-200 dark:border-white/5 hover:border-primary/50 p-3 rounded-xl transition-all min-w-[140px] text-left shrink-0 group"
                >
                  <span className="text-xs text-primary font-bold">{acc.game}</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-white group-hover:text-primary-foreground">{acc.player_id}</span>
                  {acc.player_name && <span className="text-xs text-muted-foreground">{acc.player_name}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-white/80">{t("player_id")}</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 font-mono" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-white/80">{t("zone_id")}</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 font-mono" {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <AnimatePresence>
              {verifiedName && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400/80 font-bold uppercase tracking-wider">{t("account_verified")}</p>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">{verifiedName}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-white/80">
                    {t("phone")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 0550000000" className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 h-12" {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">{t("phone_desc")}</p>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <Link href="/games/mobile-legends" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1 order-2 sm:order-1 font-medium">
                <HelpCircle className="w-4 h-4" />
                {t("where_id")}
              </Link>
              
              <Button 
                type="submit" 
                disabled={isVerifying}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 w-full sm:w-auto order-1 sm:order-2 rounded-xl shadow-lg shadow-primary/25 transition-all"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    {t("verifying")}
                  </>
                ) : (
                  <>
                    {t("verify_id")}
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
