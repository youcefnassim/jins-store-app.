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
  category?: string;
  sort_order?: number;
  packages: GamePackage[];
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Game State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newGame, setNewGame] = useState({ name: "", slug: "", emoji: "", image_url: "", category: "Jeux", sort_order: 0 });
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
        setNewGame({ name: "", slug: "", emoji: "", image_url: "", category: "Jeux", sort_order: 0 });
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

  // Edit Game State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editGameId, setEditGameId] = useState("");
  const [editGame, setEditGame] = useState({ name: "", slug: "", emoji: "", image_url: "", category: "Jeux", sort_order: 0 });
  const [editPackages, setEditPackages] = useState<GamePackage[]>([{ label: "", price: 0 }]);

  const openEditModal = (game: Game) => {
    setEditGameId(game.id);
    setEditGame({
      name: game.name,
      slug: game.slug,
      emoji: game.emoji || "",
      image_url: game.image_url || "",
      category: game.category || "Jeux",
      sort_order: game.sort_order || 0,
    });
    setEditPackages(game.packages?.length > 0 ? [...game.packages] : [{ label: "", price: 0 }]);
    setIsEditOpen(true);
  };

  const handleEditPackageChange = (index: number, field: keyof GamePackage, value: any) => {
    const pkgs = [...editPackages];
    pkgs[index] = { ...pkgs[index], [field]: value };
    setEditPackages(pkgs);
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const res = await fetch("/api/admin/games", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editGameId, ...editGame, packages: editPackages }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Jeu mis à jour avec succès !");
        setIsEditOpen(false);
        fetchGames();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsEditing(false);
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(game)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Modifier ce jeu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(game.id, game.name)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Supprimer ce jeu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      {/* Edit Game Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#0a0c14] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-white sm:max-w-[700px] sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Modifier le jeu</DialogTitle>
            <p className="text-sm text-slate-400">Modifiez les informations et l'image du jeu.</p>
          </DialogHeader>
          
          <form onSubmit={handleUpdateGame} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Nom du jeu</label>
                <Input required value={editGame.name} onChange={e => setEditGame({...editGame, name: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Slug (URL)</label>
                <Input required value={editGame.slug} onChange={e => setEditGame({...editGame, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Émoji</label>
                <Input required value={editGame.emoji} onChange={e => setEditGame({...editGame, emoji: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">URL de l'image (Photo)</label>
                <Input value={editGame.image_url} onChange={e => setEditGame({...editGame, image_url: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Catégorie</label>
                <Input required value={editGame.category} onChange={e => setEditGame({...editGame, category: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="ex: Jeux, Cartes PSN..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Ordre d'affichage (0, 1, 2...)</label>
                <Input required type="number" value={editGame.sort_order} onChange={e => setEditGame({...editGame, sort_order: parseInt(e.target.value)})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="0" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">Packs de prix</h3>
                </div>
                <Button type="button" onClick={() => setEditPackages([...editPackages, { label: "", price: 0 }])} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-10 px-4">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {editPackages.map((pkg, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 relative group">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Label (ex: 86 Diamants)</label>
                      <Input required value={pkg.label} onChange={e => handleEditPackageChange(index, 'label', e.target.value)} className="h-11 bg-black/40 border-white/10 rounded-xl text-white" />
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Prix (DA)</label>
                      <Input required type="number" min="0" value={pkg.price} onChange={e => handleEditPackageChange(index, 'price', parseInt(e.target.value))} className="h-11 bg-black/40 border-white/10 rounded-xl text-white" />
                    </div>
                    {editPackages.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => setEditPackages(editPackages.filter((_, i) => i !== index))} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-0 flex items-center justify-center hover:bg-red-600 hover:scale-110">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12">
                Annuler
              </Button>
              <Button type="submit" disabled={isEditing} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 rounded-xl px-8 h-12 font-bold">
                {isEditing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Game Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0a0c14] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-white sm:max-w-[700px] sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Nouveau Jeu</DialogTitle>
            <p className="text-sm text-slate-400">Ajoutez un nouveau jeu et ses tarifs à votre catalogue.</p>
          </DialogHeader>
          
          <form onSubmit={handleCreateGame} className="space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Nom du jeu</label>
                <Input required value={newGame.name} onChange={e => setNewGame({...newGame, name: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="ex: Mobile Legends" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Slug (URL)</label>
                <Input required value={newGame.slug} onChange={e => setNewGame({...newGame, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="ex: mobile-legends" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Émoji</label>
                <Input required value={newGame.emoji} onChange={e => setNewGame({...newGame, emoji: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="ex: 💎" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">URL de l'image</label>
                <Input value={newGame.image_url} onChange={e => setNewGame({...newGame, image_url: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="/images/games/mlbb.jpg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Catégorie</label>
                <Input required value={newGame.category} onChange={e => setNewGame({...newGame, category: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="ex: Jeux, Cartes PSN..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">Ordre d'affichage</label>
                <Input required type="number" value={newGame.sort_order} onChange={e => setNewGame({...newGame, sort_order: parseInt(e.target.value)})} className="h-12 bg-black/40 border-white/10 rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50" placeholder="0" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">Packs de prix</h3>
                  <p className="text-xs text-slate-400 mt-1">Configurez les différentes recharges disponibles.</p>
                </div>
                <Button type="button" onClick={handleAddPackage} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-10 px-4">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </div>

              <div className="space-y-4">
                {newPackages.map((pkg, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 relative group">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Label (ex: 86 Diamants)</label>
                      <Input required value={pkg.label} onChange={e => handlePackageChange(index, 'label', e.target.value)} className="h-11 bg-black/40 border-white/10 rounded-xl text-white" placeholder="Nom du pack" />
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Prix (DA)</label>
                      <Input required type="number" min="0" value={pkg.price} onChange={e => handlePackageChange(index, 'price', parseInt(e.target.value))} className="h-11 bg-black/40 border-white/10 rounded-xl text-white" placeholder="0" />
                    </div>
                    {newPackages.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => handleRemovePackage(index)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-0 flex items-center justify-center hover:bg-red-600 hover:scale-110">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12">
                Annuler
              </Button>
              <Button type="submit" disabled={isAdding} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 rounded-xl px-8 h-12 font-bold">
                {isAdding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Sauvegarder le jeu"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
