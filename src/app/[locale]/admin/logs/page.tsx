"use client";

import { Activity, ShoppingBag, UserPlus, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  type: "order_created" | "order_approved" | "order_rejected" | "user_registered";
  message: string;
  time: string;
}

const typeConfig = {
  order_created: { icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10", label: "Nouvelle commande" },
  order_approved: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10", label: "Commande approuvée" },
  order_rejected: { icon: XCircle, color: "text-red-400 bg-red-500/10", label: "Commande rejetée" },
  user_registered: { icon: UserPlus, color: "text-purple-400 bg-purple-500/10", label: "Nouvel utilisateur" },
};

const generateDemoLogs = (): LogEntry[] => {
  const names = ["Ahmed", "Yanis", "Amine", "Sami", "Riad", "Karim"];
  const games = ["Mobile Legends", "Free Fire", "PUBG Mobile", "Valorant"];
  const types: LogEntry["type"][] = ["order_created", "order_approved", "order_rejected", "user_registered"];
  return Array.from({ length: 20 }, (_, i) => {
    const type = types[i % types.length];
    const name = names[i % names.length];
    const game = games[i % games.length];
    const minutes = i * 8 + Math.floor(Math.random() * 5);
    const message =
      type === "order_created" ? `${name} a passé une commande pour ${game}` :
      type === "order_approved" ? `Commande de ${name} (${game}) approuvée` :
      type === "order_rejected" ? `Commande de ${name} rejetée` :
      `${name} vient de créer un compte`;
    const date = new Date(Date.now() - minutes * 60000);
    return {
      id: `log-${i}`,
      type,
      message,
      time: date.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) + " — " + date.toLocaleDateString('fr'),
    };
  });
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLogs(generateDemoLogs());
      setLoading(false);
    }, 500);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs & Activité</h1>
          <p className="text-slate-400 text-sm mt-1">Historique des actions récentes sur la plateforme</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4" />
          <span>Événements récents ({logs.length})</span>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            </div>
          ) : logs.map((log, i) => {
            const config = typeConfig[log.type];
            return (
              <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <config.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{log.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{config.label}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
