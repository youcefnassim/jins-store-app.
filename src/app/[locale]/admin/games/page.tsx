"use client";

import { Gamepad2, Info, Plus, Trash2, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GamePackage {
  id?: string;
  label: string;
  price: number;
}

interface Game {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  image_url?: string;
  packages: GamePackage[];
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Game State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newGame, setNewGame] = useState({ name: "", slug: "", emoji: "", image_url: "" });
  const [newPackages, setNewPackages] = useState<GamePackage[]>([{ label: "", price: 0 }]);

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

  const handleAddPackage = () => setNewPackages([...newPackages, { label: "", price: 0 }]);
  
  const handlePackageChange = (index: number, field: keyof GamePackage, value: any) => {
    const pkgs = [...newPackages];
    pkgs[index] = { ...pkgs[index], [field]: value };
    setNewPackages(pkgs);
  };

  const handleRemovePackage = (index: number) => {
    setNewPackages(newPackages.filter((_, i) => i !== index));
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGame, packages: newPackages }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Jeu ajouté avec succès !");
        setIsAddOpen(false);
        setNewGame({ name: "", slug: "", emoji: "", image_url: "" });
        setNewPackages([{ label: "", price: 0 }]);
        fetchGames();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jeux & Packs</h1>
          <p className="text-slate-400 text-sm mt-1">Catalogue dynamique des jeux et prix</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
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

      {/* Add Game Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0c0f1d] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ajouter un nouveau jeu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGame} className="space-y-6 mt-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du jeu</Label>
                <Input required value={newGame.name} onChange={e => setNewGame({...newGame, name: e.target.value})} className="bg-black/20 border-white/10" placeholder="ex: Mobile Legends" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input required value={newGame.slug} onChange={e => setNewGame({...newGame, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="bg-black/20 border-white/10" placeholder="ex: mobile-legends" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Émoji</Label>
                <Input required value={newGame.emoji} onChange={e => setNewGame({...newGame, emoji: e.target.value})} className="bg-black/20 border-white/10" placeholder="ex: 💎" />
              </div>
              <div className="space-y-2">
                <Label>URL de l'image (Optionnel)</Label>
                <Input value={newGame.image_url} onChange={e => setNewGame({...newGame, image_url: e.target.value})} className="bg-black/20 border-white/10" placeholder="/images/games/mlbb.jpg" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Packs de prix</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPackage} className="border-white/10 bg-white/5 hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-1" /> Ajouter un pack
                </Button>
              </div>

              {newPackages.map((pkg, index) => (
                <div key={index} className="flex items-end gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex-1 space-y-2">
                    <Label>Label (ex: 86 Diamants)</Label>
                    <Input required value={pkg.label} onChange={e => handlePackageChange(index, 'label', e.target.value)} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Prix (DA)</Label>
                    <Input required type="number" min="0" value={pkg.price} onChange={e => handlePackageChange(index, 'price', parseInt(e.target.value))} className="bg-black/40 border-white/10" />
                  </div>
                  {newPackages.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => handleRemovePackage(index)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="hover:bg-white/5">
                Annuler
              </Button>
              <Button type="submit" disabled={isAdding} className="bg-primary hover:bg-primary/90 text-white">
                {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sauvegarder le jeu"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
