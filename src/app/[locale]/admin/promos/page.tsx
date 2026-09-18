"use client";

import { Tag, Info, Plus, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// This is a UI placeholder - actual promo codes require a `promo_codes` table in Supabase
const demoPromos = [
  { code: "BIENVENUE10", discount: "10%", uses: 0, maxUses: 100, active: true },
  { code: "ETE2026", discount: "15%", uses: 34, maxUses: 50, active: true },
  { code: "MLBB5", discount: "5%", uses: 50, maxUses: 50, active: false },
];

export default function AdminPromosPage() {
  const [promos] = useState(demoPromos);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copié !`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Codes Promo</h1>
          <p className="text-slate-400 text-sm mt-1">Gérer les réductions et offres spéciales</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau Code
        </button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>Fonctionnalité en cours de développement. Les codes affichés sont des exemples. L'intégration complète nécessite une table `promo_codes` dans Supabase et la logique de validation au moment du paiement.</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total codes", value: promos.length },
          { label: "Actifs", value: promos.filter(p => p.active).length },
          { label: "Utilisations totales", value: promos.reduce((s, p) => s + p.uses, 0) },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1020] border border-white/5 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {promos.map(promo => (
          <div key={promo.code} className="bg-[#0d1020] border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white text-lg">{promo.code}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${promo.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                  {promo.active ? "Actif" : "Expiré"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="text-primary font-semibold">{promo.discount} de réduction</span>
                <span className="text-slate-400">{promo.uses} / {promo.maxUses} utilisations</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                  style={{ width: `${(promo.uses / promo.maxUses) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copyCode(promo.code)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
