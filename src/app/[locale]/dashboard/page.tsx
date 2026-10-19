"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Gamepad2, 
  ShoppingBag, 
  Clock, 
  Shield, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  Search,
  RefreshCw,
  Gift,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SavedAccounts } from "@/components/dashboard/SavedAccounts";
import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { toast } from "sonner";
import { REDEEM_TIERS } from "@/app/api/user/redeem/route";

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
  const [activeTab, setActiveTab] = useState<'orders' | 'accounts' | 'settings' | 'redeem'>('orders');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [scopeAll, setScopeAll] = useState(false);

  // Redeem modal state
  const [redeemingTier, setRedeemingTier] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(profile?.points || 0);

  useEffect(() => {
    if (profile?.points !== undefined) {
      setUserPoints(profile.points);
    }
  }, [profile?.points]);

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

  const handleRedeem = async (tierId: string) => {
    setRedeemingTier(tierId);
    try {
      const res = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'échange de points");

      toast.success(data.message || "Code promo généré avec succès !");
      setGeneratedCode(data.code);
      if (typeof data.remainingPoints === 'number') {
        setUserPoints(data.remainingPoints);
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible d'échanger les points");
    } finally {
      setRedeemingTier(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span>Chargement de votre espace personnel...</span>
        </div>
      </div>
    );
  }

  const filteredOrders = userOrders.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const getVipBadge = (points: number) => {
    if (points >= 5000) return { label: "Diamant VIP", color: "from-cyan-400 to-blue-500 text-cyan-400" };
    if (points >= 2000) return { label: "Platine", color: "from-purple-400 to-pink-500 text-purple-400" };
    if (points >= 500) return { label: "Or", color: "from-amber-400 to-yellow-500 text-amber-400" };
    return { label: "Bronze", color: "from-amber-600 to-orange-500 text-amber-500" };
  };

  const vip = getVipBadge(userPoints);

  return (
    <div className="container mx-auto px-4 md:px-6 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / User Profile */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/3 lg:w-1/4"
        >
          <Card className="glass-card border-white/10 overflow-hidden sticky top-24 shadow-xl">
            <div className="h-28 bg-gradient-to-br from-primary via-purple-600 to-pink-600 relative">
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-[#0f111a] rounded-2xl border-4 border-[#0f111a] flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-gradient-to-tr from-primary to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl font-black uppercase">
                  {profile?.name ? profile.name.charAt(0) : user.email?.charAt(0) || "U"}
                </div>
              </div>
            </div>

            <CardContent className="pt-14 pb-6 px-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {profile?.name || "Client Jin's Store"}
                </h2>
                {profile?.role === "admin" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-6 font-mono truncate">{user.email}</p>
              
              {/* Points Card */}
              <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-2xl p-4 mb-6 border border-amber-500/30 shadow-inner">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider">
                    {t("fidelity_points")}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-mono">
                    {userPoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-500 tracking-wide">{t("pts")}</span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t("vip_level")}</span>
                  <span className={`font-black bg-gradient-to-r ${vip.color} bg-clip-text text-transparent`}>
                    {vip.label}
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full justify-start rounded-xl font-bold text-xs h-10 transition-all ${
                    activeTab === 'orders' 
                      ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-primary" />
                  <span>{t("my_orders")}</span>
                  {userOrders.length > 0 && (
                    <span className="ml-auto rtl:mr-auto rtl:ml-0 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
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
                  <Gamepad2 className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-emerald-500" />
                  <span>{t("saved_accounts")}</span>
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('redeem')}
                  className={`w-full justify-start rounded-xl font-bold text-xs h-10 transition-all ${
                    activeTab === 'redeem' 
                      ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-sm' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Gift className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-amber-500" />
                  <span>Échanger Points & Codes Promo</span>
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
                  <Shield className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-indigo-500" />
                  <span>Paramètres du Profil</span>
                </Button>

                {profile?.role === "admin" && (
                  <Link href="/admin/dashboard" className="block pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 rounded-xl font-bold text-xs h-10 shadow-sm"
                    >
                      <Shield className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                      <span>Tableau de Bord Admin ⚡</span>
                    </Button>
                  </Link>
                )}

                <Button 
                  onClick={logout} 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-xs h-10 mt-4"
                >
                  <LogOut className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                  <span>{t("sign_out")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full md:w-2/3 lg:w-3/4 space-y-6"
        >
          {/* Quick Actions (Both are fully functional links!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quick Action 1: New Recharge */}
            <Link href="/games" className="block group">
              <Card className="glass-card border-black/10 dark:border-white/10 bg-gradient-to-br from-primary/15 via-purple-500/5 to-transparent hover:border-primary/50 transition-all rounded-2xl shadow-sm hover:shadow-primary/20 hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">Boutique</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{t("new_recharge")}</span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("new_recharge_desc")}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-inner">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {/* Quick Action 2: Redeem Points */}
            <div 
              onClick={() => setActiveTab('redeem')}
              className="block group cursor-pointer"
            >
              <Card className="glass-card border-black/10 dark:border-white/10 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent hover:border-amber-500/50 transition-all rounded-2xl shadow-sm hover:shadow-amber-500/20 hover:-translate-y-0.5">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-0.5">Fidélité ({userPoints} PTS)</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                      <span>{t("redeem_points")}</span>
                      <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("redeem_points_desc")}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0 shadow-inner">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <Card className="glass-card border-black/10 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl text-slate-900 dark:text-white">{t("recent_orders")}</CardTitle>
                    {isAdminView && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        {scopeAll ? "Mode Boutique (Toutes)" : "Mode Admin"}
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
                      className="h-8 text-xs font-semibold rounded-lg border-amber-500/30 text-amber-500"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      <span>{scopeAll ? "Mes commandes" : "Voir toutes (Magasin)"}</span>
                    </Button>
                  )}

                  {/* Filter Pills */}
                  <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
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

              <CardContent className="pt-4">
                <div className="space-y-3">
                  {ordersLoading ? (
                    <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span>Chargement de vos commandes...</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                        {statusFilter === 'all' ? "Aucune commande trouvée" : `Aucune commande avec le statut "${statusFilter}"`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Rechargez vos forfaits de jeux préférés et suivez leur statut en temps réel ici.
                      </p>
                      <Link href="/games">
                        <Button className="h-9 px-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90">
                          Passer une commande maintenant
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    filteredOrders.map((order, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        key={order.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            order.status === "completed" 
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500" 
                              : order.status === "rejected"
                              ? "bg-red-500/15 border-red-500/30 text-red-500"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                          }`}>
                            <Gamepad2 className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                {order.game}
                              </h4>
                              <span className="text-xs font-semibold text-primary">
                                • {order.package || order.amount}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                              <span 
                                onClick={() => handleCopy(order.id, `order_${order.id}`)}
                                className="font-mono text-[11px] cursor-pointer hover:text-primary transition-colors flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded"
                                title="Copier le numéro de commande"
                              >
                                #{order.id.slice(0, 8)}...
                                {copiedId === `order_${order.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                              </span>

                              {order.playerId && (
                                <span className="font-mono text-[11px]">
                                  ID: <strong className="text-slate-700 dark:text-slate-300">{order.playerId}</strong>
                                </span>
                              )}

                              <span>•</span>
                              <span className="text-[11px]">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : 'Récemment'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto shrink-0">
                          <div className="text-right">
                            <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                              {order.price} DZD
                            </p>
                          </div>

                          <div className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${
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
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"
                              title="Suivre la commande en temps réel"
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

          {/* TAB 3: REDEEM POINTS */}
          {activeTab === 'redeem' && (
            <Card className="glass-card border-black/10 dark:border-white/10 rounded-2xl shadow-md p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Échanger vos Points de Fidélité</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Transformez vos Jins Coins en codes promos de réduction utilisables immédiatement.</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30 text-right shrink-0">
                  <span className="text-[10px] font-bold text-amber-500 uppercase block">Solde actuel</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{userPoints.toLocaleString()} PTS</span>
                </div>
              </div>

              {/* Generated Code Alert */}
              {generatedCode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-2 border-emerald-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Code Promo Créé avec Succès !
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setGeneratedCode(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/40 border border-emerald-500/40 rounded-xl px-4 py-2.5 font-mono text-lg font-black text-emerald-400 tracking-wider">
                      {generatedCode}
                    </div>
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        setCopiedCode(true);
                        toast.success("Code promo copié !");
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? "Copié !" : "Copier le Code"}</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Collez ce code dans le champ <strong>Code Promo</strong> lors de votre prochaine commande pour profiter de votre réduction.
                  </p>
                </motion.div>
              )}

              {/* Redemption Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REDEEM_TIERS.map(tier => {
                  const canAfford = userPoints >= tier.points;
                  const isRedeeming = redeemingTier === tier.id;

                  return (
                    <div 
                      key={tier.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        canAfford 
                          ? 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-amber-500/40 shadow-sm' 
                          : 'opacity-60 bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-black text-amber-500 font-mono">-{tier.discount}%</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            {tier.points} PTS
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tier.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Réduction immédiate de {tier.discount}% sur votre commande.
                        </p>
                      </div>

                      <Button 
                        onClick={() => handleRedeem(tier.id)}
                        disabled={!canAfford || isRedeeming}
                        className={`w-full h-10 font-bold text-xs rounded-xl transition-all shadow-sm ${
                          canAfford 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' 
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                        ) : canAfford ? (
                          "Échanger maintenant"
                        ) : (
                          `Manque ${(tier.points - userPoints).toLocaleString()} PTS`
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && <ProfileSettings />}
        </motion.div>
        
      </div>
    </div>
  );
}
