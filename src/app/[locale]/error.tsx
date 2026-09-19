"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error Logged:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-500/10">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Une erreur s'est produite lors du chargement
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        {error?.message || "Impossible de charger les données pour cette page. Veuillez réessayer."}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button 
          onClick={reset} 
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-12 shadow-lg shadow-primary/25"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer le chargement
        </Button>
        <Button 
          asChild 
          variant="outline" 
          className="w-full sm:w-auto rounded-full px-6 h-12 border-slate-200 dark:border-white/10"
        >
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
