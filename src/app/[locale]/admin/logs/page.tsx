"use client";

import { Activity, ShoppingBag, CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface LogEntry {
  id: string;
  type: "order_created" | "order_approved" | "order_rejected";
  message: string;
  time: string;
  timestamp: number;
}

const typeConfig = {
  order_created: { icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10", label: "Nouvelle commande" },
  order_approved: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10", label: "Commande approuvée" },
  order_rejected: { icon: XCircle, color: "text-red-400 bg-red-500/10", label: "Commande rejetée" },
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) + " — " + d.toLocaleDateString('fr');
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch recent orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, game, status, created_at, profiles(email, name)')
        .order('created_at', { ascending: false })
        .limit(30);
        
      if (orders && !error) {
        const generatedLogs: LogEntry[] = [];
        
        orders.forEach((order: any) => {
          const userName = order.profiles?.name || order.profiles?.email?.split('@')[0] || "Un client";
          
          // Log Creation
          generatedLogs.push({
            id: `${order.id}-created`,
            type: "order_created",
            message: `${userName} a passé une commande pour ${order.game || 'un jeu'}`,
            time: formatTime(order.created_at),
            timestamp: new Date(order.created_at).getTime()
          });
          
          // Log Approval/Rejection
          if (order.status === 'completed') {
            generatedLogs.push({
              id: `${order.id}-approved`,
              type: "order_approved",
              message: `Commande de ${userName} (${order.game || 'un jeu'}) approuvée`,
              time: formatTime(order.created_at), 
              timestamp: new Date(order.created_at).getTime() + 1000 
            });
          } else if (order.status === 'rejected') {
            generatedLogs.push({
              id: `${order.id}-rejected`,
              type: "order_rejected",
              message: `Commande de ${userName} (${order.game || 'un jeu'}) rejetée`,
              time: formatTime(order.created_at),
              timestamp: new Date(order.created_at).getTime() + 1000
            });
          }
        });
        
        // Sort by timestamp desc
        generatedLogs.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(generatedLogs.slice(0, 50));
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Supabase Realtime Subscription for LIVE updates
    const channel = supabase
      .channel('realtime_orders_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as any;
          const oldOrder = payload.old as any;
          const eventType = payload.eventType;
          const now = Date.now();
          
          if (eventType === 'INSERT') {
            const newLog: LogEntry = {
              id: `${order.id}-created-${now}`,
              type: "order_created",
              message: `Une nouvelle commande a été passée pour ${order.game || 'un jeu'}`,
              time: formatTime(new Date().toISOString()),
              timestamp: now
            };
            setLogs(prev => [newLog, ...prev].slice(0, 50));
          } 
          else if (eventType === 'UPDATE' && order.status !== oldOrder?.status) {
            if (order.status === 'completed' || order.status === 'rejected') {
              const newLog: LogEntry = {
                id: `${order.id}-${order.status}-${now}`,
                type: order.status === 'completed' ? "order_approved" : "order_rejected",
                message: `La commande pour ${order.game || 'un jeu'} a été ${order.status === 'completed' ? 'approuvée' : 'rejetée'}`,
                time: formatTime(new Date().toISOString()),
                timestamp: now
              };
              setLogs(prev => [newLog, ...prev].slice(0, 50));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Logs & Activité
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Historique en <strong className="text-emerald-400">temps réel (Live)</strong> des commandes</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Événements connectés à la base de données ({logs.length})</span>
        </div>
        <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Connexion au serveur...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <p>Aucune activité récente pour le moment.</p>
            </div>
          ) : logs.map((log) => {
            const config = typeConfig[log.type];
            return (
              <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color} shadow-lg`}>
                  <config.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{log.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{config.label}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 whitespace-nowrap">
                  {log.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
