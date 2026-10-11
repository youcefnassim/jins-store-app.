"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erreur de création de compte');
      
      if (res.ok) {
        toast.success("Compte créé avec succès !");
        window.location.href = "/en/dashboard";
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error(error.message || "Erreur lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setIsLoading(true);
    try {
      const match = typeof window !== 'undefined' ? window.location.pathname.match(/^\/(fr|ar|en)/) : null;
      const locale = match ? match[1] : 'fr';
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} OAuth Error:`, error);
      toast.error(error.message || `Erreur d'inscription avec ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center px-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <img src="/logo.jpg" alt="Jin's Store Logo" className="w-full h-full object-cover" />
            </div>
            {siteConfig.name}
          </Link>
        </div>

        <Card className="glass-card border-black/10 dark:border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
          
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{t("create_account")}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("register_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                variant="outline"
                className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </Button>
              <Button
                type="button"
                onClick={() => handleOAuthLogin('discord')}
                disabled={isLoading}
                variant="outline"
                className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center gap-2 hover:border-[#5865F2]/50 hover:text-[#5865F2]"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Discord</span>
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 dark:bg-[#0f111a] px-2 text-muted-foreground">{t("or_continue")}</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-left rtl:text-right">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-white/80">{t("full_name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 rtl:left-auto rtl:right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jin Gamer" 
                    required
                    className="pl-10 rtl:pl-4 rtl:pr-10 bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-muted-foreground/50 h-12" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-white/80">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com" 
                    required
                    className="pl-10 rtl:pl-4 rtl:pr-10 bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-muted-foreground/50 h-12" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-white/80">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 rtl:pl-4 rtl:pr-10 bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white h-12" 
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white dark:bg-gradient-to-r dark:from-primary dark:to-purple-600 hover:bg-slate-800 dark:hover:from-primary/90 dark:hover:to-purple-600/90 h-12 mt-6 rounded-full dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {isLoading ? t("creating_account") : (
                  <>
                    {t("create_account_btn")}
                    <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("already_have_account")}{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                {t("sign_in")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
