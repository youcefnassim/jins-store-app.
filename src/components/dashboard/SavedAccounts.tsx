"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Trash2, Plus, Loader2, Zap, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

interface SavedAccount {
  id: string;
  game: string;
  player_id: string;
  player_name: string | null;
}

const POPULAR_GAMES = [
  { name: "Free Fire", slug: "free-fire" },
  { name: "Mobile Legends", slug: "mobile-legends" },
  { name: "PUBG Mobile", slug: "pubg-mobile" },
  { name: "Roblox", slug: "roblox" },
  { name: "Brawl Stars", slug: "brawl-stars" },
  { name: "Valorant", slug: "valorant" },
  { name: "Genshin Impact", slug: "genshin-impact" },
];

export function SavedAccounts({ userId }: { userId: string }) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newGame, setNewGame] = useState("Free Fire");
  const [newPlayerId, setNewPlayerId] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/user/saved-accounts');
      const data = await res.json();
      if (res.ok && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
      }
    } catch (err: unknown) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerId.trim()) {
      return toast.error("Veuillez saisir l'ID du joueur");
    }

    setAdding(true);
    try {
      const res = await fetch('/api/user/saved-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: newGame,
          playerId: newPlayerId.trim(),
          playerName: newPlayerName.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible d'enregistrer le compte");
      }

      toast.success("Compte joueur enregistré avec succès !");
      setNewPlayerId("");
      setNewPlayerName("");
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || "Échec de l'enregistrement");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/user/saved-accounts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la suppression");

      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success("Compte supprimé");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const getGameSlug = (gameName: string) => {
    const found = POPULAR_GAMES.find(g => g.name.toLowerCase() === gameName.toLowerCase());
    return found ? found.slug : "mobile-legends";
  };

  return (
    <Card className="glass-card border-black/10 dark:border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Comptes & Identifiants Joueurs Enregistrés
        </CardTitle>
        <CardDescription>
          Enregistrez vos Player IDs pour recharger vos jeux favoris en 1 seul clic sans retaper votre identifiant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Form to Add Account */}
        <form onSubmit={handleAddAccount} className="bg-slate-50 dark:bg-black/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Ajouter un nouveau compte joueur
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Jeu</label>
              <select 
                value={newGame} 
                onChange={(e) => setNewGame(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/60 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary"
              >
                {POPULAR_GAMES.map(game => (
                  <option key={game.name} value={game.name}>{game.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Player ID (Requis)</label>
              <Input 
                placeholder="Ex: 512345678" 
                value={newPlayerId}
                onChange={(e) => setNewPlayerId(e.target.value)}
                className="h-10 text-xs font-mono rounded-xl bg-white dark:bg-black/60 border-slate-200 dark:border-white/10"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Pseudo / Surnom (Optionnel)</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ex: ProGamer" 
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-white dark:bg-black/60 border-slate-200 dark:border-white/10"
                />
                <Button 
                  type="submit" 
                  disabled={adding} 
                  className="h-10 px-4 bg-primary hover:bg-primary/90 rounded-xl shrink-0 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{adding ? "..." : "Ajouter"}</span>
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* List of Saved Accounts */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Chargement de vos comptes...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10 px-4 text-muted-foreground bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="font-medium text-sm">Aucun compte enregistré pour le moment.</p>
              <p className="text-xs text-slate-500 mt-1">Ajoutez votre identifiant joueur ci-dessus pour vos futures recharges rapides.</p>
            </div>
          ) : (
            accounts.map((acc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={acc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{acc.game}</span>
                      {acc.player_name && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {acc.player_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      ID: <span className="text-slate-900 dark:text-white">{acc.player_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link href={`/recharge?game=${getGameSlug(acc.game)}&playerId=${encodeURIComponent(acc.player_id)}`}>
                    <Button 
                      size="sm" 
                      className="h-9 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Recharger</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </Button>
                  </Link>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(acc.id)}
                    disabled={deleting === acc.id}
                    className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Supprimer ce compte"
                  >
                    {deleting === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
