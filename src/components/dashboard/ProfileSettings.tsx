"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Loader2, Save, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/supabase/AuthContext";

export function ProfileSettings() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Le nom ne peut pas être vide");

    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la mise à jour");

      toast.success("Profil mis à jour avec succès !");
      // Trigger instant UI update by reloading window state smoothly
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loyalty Points Card */}
      <Card className="glass-card border-black/10 dark:border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-amber-500/20 shadow-md">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Jins Coins & Fidélité</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Cumulez des points à chaque recharge et transformez-les en codes promo de réduction.</p>
            </div>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-mono">
              {profile?.points || 0}
            </div>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mt-1">Total Jins Coins</p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Info Form */}
      <Card className="glass-card border-black/10 dark:border-white/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informations du Profil
          </CardTitle>
          <CardDescription>
            Gérez vos coordonnées et votre nom d'affichage public sur la boutique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Adresse E-mail (Identifiant)</label>
              <Input value={user?.email || ""} disabled className="opacity-60 bg-slate-100 dark:bg-black/30 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nom complet / Pseudo</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Entrez votre nom" 
                className="bg-white dark:bg-black/40"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || name === profile?.name} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-bold rounded-xl flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Enregistrer les modifications</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
