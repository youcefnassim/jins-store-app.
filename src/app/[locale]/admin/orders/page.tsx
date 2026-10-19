"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  Search,
  Zap,
  Server,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  user_id: string;
  game: string;
  package: string;
  player_id: string;
  price: string;
  points_to_award: number;
  status: "pending" | "processing" | "completed" | "rejected";
  receipt_url: string;
  created_at: string;
}

interface ProviderStatus {
  providerName: string;
  isConfigured: boolean;
  balance: number;
  currency: string;
  isLive: boolean;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [executingTopup, setExecutingTopup] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      toast.error("Erreur lors de la récupération des commandes");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderStatus = async () => {
    try {
      const res = await fetch('/api/admin/topup/status');
      if (res.ok) {
        const data = await res.json();
        setProviderStatus(data);
      }
    } catch {
      // Non blocking
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProviderStatus();
  }, []);

  const handleAction = async (order: Order, action: "approve" | "reject") => {
    if (!confirm(`Confirmer : ${action === "approve" ? "Approuver" : "Rejeter"} cette commande ?`)) return;
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(action === "approve" ? "✅ Commande approuvée !" : "❌ Commande rejetée");
        setSelected(null);
        fetchOrders();
      } else {
        toast.error(data.error || "Erreur lors de l'action");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleAutoTopup = async (order: Order) => {
    if (!confirm(`Déclencher la recharge directe automatique pour ${order.game} (ID: ${order.player_id}) ?`)) {
      return;
    }

    setExecutingTopup(true);
    try {
      const res = await fetch('/api/admin/topup/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`🎉 Recharge réussie ! Réf: ${data.topup?.transactionId || 'OK'}`);
        setSelected(null);
        fetchOrders();
        fetchProviderStatus();
      } else {
        toast.error(data.error || "Échec de la recharge automatique");
      }
    } catch {
      toast.error("Erreur lors de la communication avec le serveur");
    } finally {
      setExecutingTopup(false);
    }
  };

  const statusColor = (s: string) =>
    s === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
    s === "processing" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
    s === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    "bg-red-500/10 text-red-400 border-red-500/20";

  const statusLabel = (s: string) =>
    s === "pending" ? "En attente" :
    s === "processing" ? "Payée (Chargily)" :
    s === "completed" ? "Complétée" : "Rejetée";

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.game?.toLowerCase().includes(search.toLowerCase()) && !o.player_id?.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Gestion des Commandes
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              Auto Top-Up Ready
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Traiter et livrer les demandes de recharge des joueurs</p>
        </div>

        {/* Live Top-up Provider Card */}
        {providerStatus && (
          <div className="bg-[#0e1326] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <span>{providerStatus.providerName}</span>
                {providerStatus.isLive ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVE</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">TEST / SANDBOX</span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Solde API :</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {providerStatus.balance.toFixed(2)} {providerStatus.currency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par jeu ou Player ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "processing", "completed", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                filter === f ? "bg-primary text-white border-primary" : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
              }`}
            >
              {f === "all" ? "Tout" : f === "pending" ? "Attente" : f === "processing" ? "Chargily (Payée)" : f === "completed" ? "Complétées" : "Rejetées"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Aucune commande trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/3 border-b border-white/5">
                <tr className="text-xs text-slate-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Jeu / Joueur</th>
                  <th className="px-5 py-3 text-left">Pack</th>
                  <th className="px-5 py-3 text-left">Prix</th>
                  <th className="px-5 py-3 text-left">Statut</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{order.game}</div>
                      <div className="text-xs text-slate-400 font-mono">ID: {order.player_id}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{order.package}</td>
                    <td className="px-5 py-4 font-bold text-primary">{order.price}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('fr')}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(order)}
                        className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(order.status === "pending" || order.status === "processing") && (
                        <>
                          <button
                            onClick={() => handleAutoTopup(order)}
                            className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 transition-colors ml-1"
                            title="⚡ Livrer automatiquement par API"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(order, "approve")}
                            className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors ml-1"
                            title="Approuver manuellement"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(order, "reject")}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors ml-1"
                            title="Rejeter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0f1220] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">Détail Commande</h3>
                  <span className="text-xs font-mono text-slate-400">#{selected.id.slice(0, 8)}</span>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-6 flex flex-col md:flex-row gap-6 overflow-y-auto flex-1">
                <div className="flex-1 space-y-4">
                  {[
                    { label: "Statut", value: <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColor(selected.status)}`}>{statusLabel(selected.status)}</span> },
                    { label: "Jeu", value: selected.game },
                    { label: "Pack", value: selected.package },
                    { label: "Player ID", value: <span className="font-mono bg-white/10 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-white/10">{selected.player_id}</span> },
                    { label: "Prix", value: <span className="font-bold text-primary text-lg">{selected.price}</span> },
                    { label: "Date", value: new Date(selected.created_at).toLocaleString('fr') },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="text-xs text-slate-400 mb-1">{row.label}</div>
                      <div className="text-white">{row.value}</div>
                    </div>
                  ))}

                  {/* Auto-topup Banner inside modal */}
                  {(selected.status === "pending" || selected.status === "processing") && (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-primary/10 to-transparent border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide">
                        <Zap className="w-4 h-4" />
                        Recharge Directe Automatique
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Envoie directement le pack au compte de jeu du joueur sans passer par aucun site externe.
                      </p>
                      <button
                        onClick={() => handleAutoTopup(selected)}
                        disabled={executingTopup}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                      >
                        {executingTopup ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Livraison en cours...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-black" />
                            ⚡ Livrer Directement par API
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-2">Reçu de Paiement</div>
                  {selected.receipt_url ? (
                    <a
                      href={selected.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group"
                    >
                      <img src={selected.receipt_url} alt="Reçu" className="w-full max-h-72 object-contain bg-black" />
                    </a>
                  ) : (
                    <div className="h-40 bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-sm">Aucun reçu</span>
                    </div>
                  )}
                </div>
              </div>

              {(selected.status === "pending" || selected.status === "processing") && (
                <div className="p-5 border-t border-white/5 flex gap-3 justify-end bg-white/3">
                  <button
                    onClick={() => handleAction(selected, "reject")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                  >
                    <X className="w-4 h-4" /> Rejeter
                  </button>
                  <button
                    onClick={() => handleAction(selected, "approve")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-sm font-medium"
                  >
                    <Check className="w-4 h-4" /> Valider Manuellement
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
