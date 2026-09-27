"use client";

import { Tag, Info, Plus, Copy, Trash2, Loader2, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminSearchModal } from "@/components/admin/AdminSearchModal"; // reusing a modal approach, wait, I will just do inline modal

interface Promo {
  id: string;
  code: string;
  discount_percentage: number;
  current_uses: number;
  max_uses: number;
  active: boolean;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New promo state
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/admin/promo");
      const data = await res.json();
      if (res.ok) setPromos(data.promos);
    } catch (err) {
      toast.error("Erreur lors du chargement des codes promo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copié !`);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newDiscount || !newMaxUses) return toast.error("Veuillez remplir tous les champs");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: newCode, 
          discount_percentage: newDiscount, 
          max_uses: newMaxUses 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Code promo créé !");
        setIsModalOpen(false);
        setNewCode("");
        setNewDiscount("");
        setNewMaxUses("");
        fetchPromos();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/promo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        toast.success(`Code ${currentActive ? 'désactivé' : 'activé'}`);
        fetchPromos();
      }
    } catch (err) {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce code promo définitivement ?")) return;
    try {
      const res = await fetch(`/api/admin/promo?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Code supprimé");
        fetchPromos();
      }
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Codes Promo</h1>
          <p className="text-slate-400 text-sm mt-1">Gérer les réductions et offres spéciales (Dynamique)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-xl text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total codes", value: promos.length },
          { label: "Actifs", value: promos.filter(p => p.active && p.current_uses < p.max_uses).length },
          { label: "Utilisations", value: promos.reduce((s, p) => s + p.current_uses, 0) },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1020] border border-white/5 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : promos.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-[#0d1020] border border-white/5 rounded-xl">
            Aucun code promo. Exécutez supabase-promos.sql !
          </div>
        ) : promos.map(promo => {
          const isExpired = !promo.active || promo.current_uses >= promo.max_uses;
          return (
            <div key={promo.id} className={`bg-[#0d1020] border ${isExpired ? 'border-red-500/10' : 'border-white/5'} rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors`}>
              <div className={`w-12 h-12 rounded-xl ${isExpired ? 'bg-red-500/10' : 'bg-primary/15'} flex items-center justify-center flex-shrink-0`}>
                <Tag className={`w-6 h-6 ${isExpired ? 'text-red-400' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-lg">{promo.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${!promo.active ? 'bg-red-500/15 text-red-400' : promo.current_uses >= promo.max_uses ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {!promo.active ? "Désactivé" : promo.current_uses >= promo.max_uses ? "Épuisé" : "Actif"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className={`${isExpired ? 'text-red-400' : 'text-primary'} font-semibold`}>{promo.discount_percentage}% de réduction</span>
                  <span className="text-slate-400">{promo.current_uses} / {promo.max_uses} utilisations</span>
                </div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden w-full max-w-md">
                  <div
                    className={`h-full rounded-full ${isExpired ? 'bg-red-500/50' : 'bg-gradient-to-r from-primary to-purple-500'}`}
                    style={{ width: `${Math.min((promo.current_uses / promo.max_uses) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button onClick={() => copyCode(promo.code)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white" title="Copier le code">
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleActive(promo.id, promo.active)} 
                  className={`p-2.5 rounded-lg transition-colors ${promo.active ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
                  title={promo.active ? "Désactiver" : "Activer"}
                >
                  {promo.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(promo.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0f1d] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Nouveau Code Promo</h2>
            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Code Promo (ex: ETE2026)</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary font-mono uppercase"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Réduction (%)</label>
                  <input 
                    type="number" 
                    min="1" max="100"
                    value={newDiscount} 
                    onChange={e => setNewDiscount(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Utilisations max</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newMaxUses} 
                    onChange={e => setNewMaxUses(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
