"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  CheckCircle2, 
  Gamepad2, 
  ShoppingBag, 
  Shield, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SavedAccounts } from "@/components/dashboard/SavedAccounts";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { toast } from "sonner";

interface Order {
  id: string;
  game: string;
  amount: string;
  package: string;
  price: string;
  status: string;
  playerId?: string;
  zoneId?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'accounts' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [scopeAll, setScopeAll] = useState(false);

  const fetchOrders = async (all = scopeAll) => {
    setOrdersLoading(true);
    try {
      const url = all ? '/api/user/orders?scope=all' : '/api/user/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setUserOrders(data.orders);
        setIsAdminView(Boolean(data.isAdmin));
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié dans le presse-papiers !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span>Chargement de votre compte...</span>
        </div>
      </div>
    );
  }

  const filteredOrders = userOrders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 sm:py-10 md:py-12 min-h-screen">
      <div className="flex flex-col md:flex-row gap-5 lg:gap-6">
        
        {/* Compact Sidebar / User Profile Menu */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[280px] lg:w-[300px] shrink-0"
        >
          <Card className="glass-card border-slate-200 dark:border-white/10 overflow-hidden sticky top-20 shadow-md rounded-2xl">
            {/* Compact Account Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-purple-600 to-pink-500 flex items-center justify-center text-white text-xl font-black uppercase shrink-0 shadow-md shadow-primary/20">
                  {profile?.name ? profile.name.charAt(0) : user.email?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {profile?.name || "Mon Compte"}
                    </h2>
                    {profile?.role === "admin" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Streamlined Menu Navigation */}
            <CardContent className="p-2 sm:p-2.5 space-y-1">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('orders')}
                className={`w-full justify-start rounded-xl font-bold text-xs h-10 transition-all ${
                  activeTab === 'orders' 
                    ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-primary shrink-0" />
                <span className="truncate">{t("my_orders")}</span>
                {userOrders.length > 0 && (
                  <span className="ml-auto rtl:mr-auto rtl:ml-0 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold shrink-0">
                    {userOrders.length}
                  </span>
                )}
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('accounts')}
                className={`w-full justify-start rounded-xl font-bold text-xs h-10 transition-all ${
                  activeTab === 'accounts' 
                    ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Gamepad2 className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-emerald-500 shrink-0" />
                <span className="truncate">{t("saved_accounts")}</span>
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('settings')}
                className={`w-full justify-start rounded-xl font-bold text-xs h-10 transition-all ${
                  activeTab === 'settings' 
                    ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-indigo-500 shrink-0" />
                <span className="truncate">Paramètres du Profil</span>
              </Button>

              {profile?.role === "admin" && (
                <Link href="/admin/dashboard" className="block pt-1">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 rounded-xl font-bold text-xs h-10 shadow-sm"
                  >
                    <Shield className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 shrink-0" />
                    <span className="truncate">Tableau de Bord Admin ⚡</span>
                  </Button>
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 mt-2">
                <Button 
                  onClick={logout} 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-xs h-9"
                >
                  <LogOut className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 shrink-0" />
                  <span>{t("sign_out")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full flex-1 space-y-5"
        >
          {/* Streamlined Quick Actions (Compact) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Quick Action 1: New Recharge */}
            <Link href="/games" className="block group">
              <Card className="glass-card border-slate-200 dark:border-white/10 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent hover:border-primary/50 transition-all rounded-2xl shadow-sm hover:shadow-primary/15 cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Boutique de Jeux</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors flex items-center gap-1.5 mt-0.5">
                      <span>{t("new_recharge")}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("new_recharge_desc")}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-inner">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {/* Quick Action 2: Track Order */}
            <Link href="/track" className="block group">
              <Card className="glass-card border-slate-200 dark:border-white/10 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent hover:border-indigo-500/50 transition-all rounded-2xl shadow-sm hover:shadow-indigo-500/15 cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Suivi en Direct</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-500 transition-colors flex items-center gap-1.5 mt-0.5">
                      <span>Suivre une Commande</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vérifiez le statut de livraison par numéro de commande</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0 shadow-inner">
                    <Search className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <Card className="glass-card border-slate-200 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="py-3.5 px-4 sm:px-5 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-white">{t("recent_orders")}</CardTitle>
                    {isAdminView && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        {scopeAll ? "Toutes les commandes" : "Mode Admin"}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {t("recent_orders_desc")}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isAdminView && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const next = !scopeAll;
                        setScopeAll(next);
                        fetchOrders(next);
                      }}
                      className="h-7 text-[11px] font-semibold rounded-lg border-amber-500/30 text-amber-500 px-2.5"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      <span>{scopeAll ? "Mes commandes" : "Toutes les commandes"}</span>
                    </Button>
                  )}

                  {/* Filter Pills */}
                  <div className="flex bg-slate-100 dark:bg-black/40 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
                    {(['all', 'pending', 'completed', 'rejected'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all capitalize ${
                          statusFilter === s 
                            ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {s === 'all' ? 'Toutes' : s === 'pending' ? 'En attente' : s === 'completed' ? 'Livrées' : 'Rejetées'}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2.5">
                  {ordersLoading ? (
                    <div className="text-center py-10 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>Chargement de vos commandes...</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                        {statusFilter === 'all' ? "Aucune commande trouvée" : `Aucune commande avec le statut "${statusFilter}"`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Rechargez vos forfaits de jeux préférés et suivez leur statut en temps réel.
                      </p>
                      <Link href="/games">
                        <Button size="sm" className="h-8 px-3.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90">
                          Passer une commande
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    filteredOrders.map((order, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        key={order.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            order.status === "completed" 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500" 
                              : order.status === "rejected"
                              ? "bg-red-500/15 border-red-500/30 text-red-500"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                          }`}>
                            <Gamepad2 className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {order.game}
                              </h4>
                              <span className="text-[11px] font-semibold text-primary">
                                • {order.package || order.amount}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-500">
                              <span 
                                onClick={() => handleCopy(order.id, `order_${order.id}`)}
                                className="font-mono text-[10px] cursor-pointer hover:text-primary transition-colors flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded"
                                title="Copier le numéro de commande"
                              >
                                #{order.id.slice(0, 8)}...
                                {copiedId === `order_${order.id}` ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                              </span>

                              {order.playerId && (
                                <span className="font-mono text-[10px]">
                                  ID: <strong className="text-slate-700 dark:text-slate-300">{order.playerId}</strong>
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                }) : 'Récemment'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-2.5 self-end sm:self-auto shrink-0">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {order.price} DZD
                          </span>

                          <div className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            order.status === "completed" 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500" 
                              : order.status === "rejected"
                              ? "bg-red-500/15 border-red-500/30 text-red-500"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                          }`}>
                            {order.status === "pending" ? "En attente" : order.status === "completed" ? "Livrée" : "Rejetée"}
                          </div>

                          <Link href={`/track?id=${encodeURIComponent(order.id)}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"
                              title="Suivre la commande en direct"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: SAVED ACCOUNTS */}
          {activeTab === 'accounts' && <SavedAccounts userId={user.id} />}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && <ProfileSettings />}
        </motion.div>
        
      </div>
    </div>
  );
}
