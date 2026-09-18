"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Users, CheckCircle2, Clock, XCircle,
  TrendingUp, DollarSign, Gamepad2, BarChart3, RefreshCw
} from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
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

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats ? [
    { label: "Total Commandes", value: stats.totalOrders, icon: ShoppingBag, color: "from-blue-500 to-blue-700", glow: "rgba(59,130,246,0.3)" },
    { label: "En Attente", value: stats.pendingOrders, icon: Clock, color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.3)" },
    { label: "Complétées", value: stats.completedOrders, icon: CheckCircle2, color: "from-emerald-500 to-green-700", glow: "rgba(16,185,129,0.3)" },
    { label: "Rejetées", value: stats.rejectedOrders, icon: XCircle, color: "from-red-500 to-red-700", glow: "rgba(239,68,68,0.3)" },
    { label: "Utilisateurs", value: stats.usersCount, icon: Users, color: "from-purple-500 to-purple-700", glow: "rgba(139,92,246,0.3)" },
    { label: "Revenus (DZD)", value: `${stats.totalRevenue.toLocaleString('fr-DZ')} DA`, icon: DollarSign, color: "from-primary to-purple-700", glow: "rgba(139,92,246,0.5)" },
  ] : [];

  const maxOrders = stats ? Math.max(...stats.last7Days.map(d => d.count), 1) : 1;
  const maxGame = stats ? Math.max(...stats.topGames.map(g => g.count), 1) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de Bord</h1>
          <p className="text-slate-400 mt-1">Bienvenue dans votre panneau d'administration</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="relative bg-[#0d1020] border border-white/5 rounded-2xl p-5 overflow-hidden group hover:border-white/10 transition-all"
                style={{ boxShadow: `0 0 30px ${card.glow}20` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`} style={{ boxShadow: `0 0 15px ${card.glow}` }}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <div className="text-xs text-slate-400 mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders last 7 days */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#0d1020] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Commandes (7 derniers jours)</h3>
                  <p className="text-xs text-slate-400">Activité récente</p>
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
              transition={{ delay: 0.6 }}
              className="bg-[#0d1020] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Top Jeux</h3>
                  <p className="text-xs text-slate-400">Par nombre de commandes</p>
                </div>
              </div>
              <div className="space-y-3">
                {stats?.topGames.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">Aucune donnée</p>
                ) : (
                  stats?.topGames.map((game, i) => (
                    <div key={game.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{game.name}</span>
                        <span className="text-slate-400">{game.count} commandes</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
            transition={{ delay: 0.7 }}
            className="bg-[#0d1020] border border-white/5 rounded-2xl p-6"
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Voir commandes en attente", href: "/admin/orders", badge: stats?.pendingOrders, color: "text-amber-400" },
                { label: "Gérer les utilisateurs", href: "/admin/users", color: "text-blue-400" },
                { label: "Ajouter un code promo", href: "/admin/promos", color: "text-emerald-400" },
                { label: "Voir les logs", href: "/admin/logs", color: "text-slate-400" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 text-sm font-medium text-slate-300 hover:text-white transition-all group"
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
