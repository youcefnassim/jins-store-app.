"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Home } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LocaleNotFound() {
  const t = useTranslations("Common"); // Assuming fallback translations

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Glitch Effect 404 */}
      <div className="relative mb-8">
        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 animate-pulse">
          404
        </h1>
        <div className="absolute inset-0 text-8xl md:text-9xl font-black text-slate-900/5 dark:text-white/5 blur-sm translate-x-1 translate-y-1">
          404
        </div>
      </div>
      
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px_rgba(139,92,246,0.3)]">
        <Gamepad2 className="w-10 h-10 text-primary" />
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-widest text-slate-900 dark:text-slate-100">
        Game Over
      </h2>
      
      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mb-10">
        La page que vous cherchez a été détruite ou n'a jamais existé. Reconnectez-vous au serveur principal.
      </p>

      <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full px-8 h-14 text-lg shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] transition-all group">
        <Link href="/" className="flex items-center gap-2">
          <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Insert Coin to Continue
        </Link>
      </Button>
    </div>
  );
}
