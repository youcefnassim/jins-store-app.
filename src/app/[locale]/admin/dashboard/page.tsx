"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Users, CheckCircle2, Clock, XCircle,
  TrendingUp, DollarSign, Gamepad2, BarChart3, RefreshCw,
  PieChart, AlertTriangle, Megaphone, Save, Check
} from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface StockAlert {
  id: string;
  name: string;
  game: string;
  stock: number;
  threshold: number;
  status: 'critical' | 'warning' | 'out_of_stock';
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
  netProfit: number;
  marginPercent: number;
  paymentBreakdown: PaymentMethodStat[];
  stockAlerts: StockAlert[];
  usersCount: number;
  topGames: { name: string; count: number }[];
  last7Days: { date: string; count: number }[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 } }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Marquee announcement state
  const [marqueeText, setMarqueeText] = useState("OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !");
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarquee = async () => {
    try {
      const res = await fetch('/api/admin/marquee');
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setMarqueeText(data.items[0].text);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMarquee();
  }, []);

  const handleSaveMarquee = async () => {
    setIsSavingMarquee(true);
    try {
      const res = await fetch('/api/admin/marquee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: '1', text: marqueeText, type: 'flame' },
            { id: '2', text: 'Paiement Edahabia & CIB disponible', type: 'shield' },
            { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
          ]
        })
      });
      if (res.ok) {
        toast.success("Bannière d'annonce mise à jour sur le site !");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (e) {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingMarquee(false);
    }
  };

  const statCards = stats ? [
    { label: "Total Commandes", value: stats.totalOrders, icon: ShoppingBag, color: "from-blue-500 to-blue-700", glow: "rgba(59,130,246,0.3)" },
    { label: "En Attente", value: stats.pendingOrders, icon: Clock, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.3)" },
    { label: "Complétées", value: stats.completedOrders, icon: CheckCircle2, color: "from-emerald-500 to-green-700", glow: "rgba(16,185,129,0.3)" },
    { label: "Utilisateurs", value: stats.usersCount, icon: Users, color: "from-purple-500 to-purple-700", glow: "rgba(139,92,246,0.3)" },
    { label: "Chiffre d'Affaires (DZD)", value: `${stats.totalRevenue.toLocaleString('fr-DZ')} DA`, icon: DollarSign, color: "from-primary to-purple-700", glow: "rgba(139,92,246,0.5)" },
    { 
      label: "Bénéfice Net Estimé", 
      value: `${stats.netProfit.toLocaleString('fr-DZ')} DA`, 
      subBadge: `+${stats.marginPercent}% Marge`,
      icon: TrendingUp, 
      color: "from-emerald-600 to-teal-700", 
      glow: "rgba(16,185,129,0.5)" 
    },
  ] : [];

  const maxOrders = stats ? Math.max(...stats.last7Days.map(d => d.count), 1) : 1;
  const maxGame = stats ? Math.max(...stats.topGames.map(g => g.count), 1) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenue dans votre panneau d'administration Jin's Store</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards Grid (Includes Net Profit) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="relative bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm"
                style={{ boxShadow: `0 0 30px ${card.glow}20` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`} style={{ boxShadow: `0 0 15px ${card.glow}` }}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  {card.subBadge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {card.subBadge}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Site Announcement Banner Manager (Feature 5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Gestion de l'Annonce du Site (Top Marquee)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ce message défile en direct tout en haut de la boutique</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                placeholder="Entrez votre offre ou annonce..."
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all font-medium"
              />
              <button
                onClick={handleSaveMarquee}
                disabled={isSavingMarquee}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSavingMarquee ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Publier sur le site</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Breakdown (Feature 4) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Moyens de Paiement Utilisés</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Répartition (BaridiMob, CCP, Flexy)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {stats?.paymentBreakdown.map((pm) => (
                  <div key={pm.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{pm.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{pm.percentage}% ({pm.count} commandes)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pm.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pm.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Inventory Stock Alerts (Feature 2) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Alertes Stock & Codes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cartes & recharge en réserve faible</p>
                </div>
              </div>

              <div className="space-y-3">
                {stats?.stockAlerts.map((item) => {
                  const isOut = item.status === 'out_of_stock';
                  const isCrit = item.status === 'critical';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.game}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isOut 
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                            : isCrit 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}>
                          {isOut ? 'ÉPUISÉ (0)' : `Reste: ${item.stock}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders last 7 days */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Commandes (7 derniers jours)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Activité récente</p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-32">
                {stats?.last7Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.round((day.count / maxOrders) * 100)}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                    />
                    <span className="text-[9px] text-slate-500">
                      {new Date(day.date).toLocaleDateString('fr', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Top Jeux</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Par nombre de commandes</p>
                </div>
              </div>
              <div className="space-y-3">
                {stats?.topGames.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">Aucune donnée</p>
                ) : (
                  stats?.topGames.map((game, i) => (
                    <div key={game.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{game.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">{game.count} commandes</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((game.count / maxGame) * 100)}%` }}
                          transition={{ delay: 0.7 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Voir commandes en attente", href: "/admin/orders", badge: stats?.pendingOrders, color: "text-amber-500 dark:text-amber-400" },
                { label: "Gérer les utilisateurs", href: "/admin/users", color: "text-blue-500 dark:text-blue-400" },
                { label: "Ajouter un code promo", href: "/admin/promos", color: "text-emerald-500 dark:text-emerald-400" },
                { label: "Voir les logs", href: "/admin/logs", color: "text-slate-500 dark:text-slate-400" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="relative bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all group"
                >
                  {action.badge ? (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {action.badge}
                    </span>
                  ) : null}
                  <span className={`block text-lg mb-1 ${action.color}`}>→</span>
                  {action.label}
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
