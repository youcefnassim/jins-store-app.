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
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error(error.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Failed to register with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center px-4 relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <img src="/logo.png" alt="Jin's Store Logo" className="w-full h-full object-cover" />
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
              <Button onClick={handleGoogleLogin} disabled={isLoading} variant="outline" className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white">
                Google
              </Button>
              <Button variant="outline" className="border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white">
                <Gamepad2 className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                Discord
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
