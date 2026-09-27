"use client";

import { Gamepad2, Info, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface GamePackage {
  id: string;
  label: string;
  price: number;
}

interface Game {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  packages: GamePackage[];
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      if (res.ok) {
        setGames(data.games);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error("Erreur lors du chargement des jeux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le jeu ${name} ?`)) return;

    try {
      const res = await fetch(`/api/admin/games?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Jeu supprimé avec succès !");
        fetchGames();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jeux & Packs</h1>
          <p className="text-slate-400 text-sm mt-1">Catalogue dynamique des jeux et prix</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un jeu
        </Button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm text-emerald-400">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Catalogue Dynamique Activé !</strong> Les jeux et les prix sont maintenant récupérés directement depuis votre base de données Supabase.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun jeu trouvé dans la base de données.</p>
          <p className="text-sm">Veuillez exécuter le script SQL pour insérer les jeux par défaut.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden group">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white">{game.name}</h3>
                    <p className="text-xs text-slate-400">{game.packages?.length || 0} packs disponibles</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(game.id, game.name)}
                  className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer ce jeu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {game.packages?.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 rounded-xl transition-colors">
                    <span className="text-sm text-slate-300">{pkg.label}</span>
                    <span className="text-sm font-bold text-primary">{pkg.price} DA</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
