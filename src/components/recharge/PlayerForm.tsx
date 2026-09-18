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

const playerSchema = z.object({
  playerId: z.string().min(5, "Player ID is too short").max(15, "Player ID is too long").regex(/^\d+$/, "Player ID must contain only numbers"),
  zoneId: z.string().min(3, "Zone ID is too short").max(5, "Zone ID is too long").regex(/^\d+$/, "Zone ID must contain only numbers"),
  phone: z.string().regex(/^(05|06|07)\d{8}$/, "Must be a valid Algerian phone number (e.g. 0550000000)"),
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
    // Extract zone ID if present in format 123456(1234) or similar? 
    // In saved_accounts we don't have zone_id separated, so we might just leave zoneId empty or if they saved it as player_id. 
    // Usually MLBB players save ID and Zone. Let's just set player_id.
    setVerifiedName(acc.player_name || null);
  };

  async function onSubmit(values: PlayerFormValues) {
    if (!verifiedName) {
      setIsVerifying(true);
      // Simulate API call for ID verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock player name
      const mockNames = ["DZ_Sniper", "Faker_Wannabe", "Algiers_King", "Pro_Gamer_99"];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setVerifiedName(randomName);
      setIsVerifying(false);
      return;
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("dz_recharge_playerId", values.playerId);
      localStorage.setItem("dz_recharge_zoneId", values.zoneId);
      localStorage.setItem("dz_recharge_phone", values.phone);
    }

    onNext(values);
  }

  // Reset verification if ID changes
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
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader>
        <CardTitle className="text-2xl text-white">Player Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your MLBB Player ID and Zone ID to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user && savedAccounts.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-white/80 mb-3">Or choose a saved account:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="flex flex-col items-start bg-black/20 hover:bg-primary/20 border border-white/5 hover:border-primary/50 p-3 rounded-xl transition-all min-w-[140px] text-left shrink-0 group"
                >
                  <span className="text-xs text-primary font-bold">{acc.game}</span>
                  <span className="text-sm font-mono text-white group-hover:text-primary-foreground">{acc.player_id}</span>
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
                    <FormLabel className="text-white/80">Player ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123456789" className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-12" {...field} />
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
                    <FormLabel className="text-white/80">Zone ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1234" className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-12" {...field} />
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
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">Account Verified</p>
                    <p className="text-white font-bold text-lg">{verifiedName}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Phone Number (WhatsApp)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 0550000000" className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-12" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">We need this to contact you if there's an issue with your order.</p>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <Link href="/games/mobile-legends" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1 order-2 sm:order-1">
                <HelpCircle className="w-4 h-4" />
                Where do I find my ID?
              </Link>
              
              <Button 
                type="submit" 
                disabled={isVerifying}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-12 px-8 w-full sm:w-auto order-1 sm:order-2 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Verifying ID...
                  </>
                ) : !verifiedName ? (
                  <>
                    Verify Player ID
                  </>
                ) : (
                  <>
                    Continue to Packages
                    <ArrowRight className="ml-2 w-5 h-5" />
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
