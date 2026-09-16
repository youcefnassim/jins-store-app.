"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, ChevronRight, CheckCircle2, Gamepad2, ShoppingBag, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  game: string;
  amount: string;
  price: string;
  status: string;
  createdAt: any;
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      const fetchOrders = async () => {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          
          if (data) {
            const fetchedOrders: Order[] = data.map(doc => ({
              id: doc.id,
              game: doc.game,
              amount: doc.package,
              price: doc.price,
              status: doc.status,
              createdAt: doc.created_at,
            }));
            setUserOrders(fetchedOrders);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 md:px-6 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / User Profile */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/3 lg:w-1/4"
        >
          <Card className="glass-card border-white/10 overflow-hidden sticky top-24">
            <div className="h-24 bg-gradient-to-br from-primary to-purple-600 relative">
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-[#0f111a] rounded-xl border-4 border-[#0f111a] flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-tr from-primary to-pink-500 rounded-lg flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {profile?.name ? profile.name.charAt(0) : user.email?.charAt(0)}
                </div>
              </div>
            </div>
            <CardContent className="pt-14 pb-6 px-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.name || "Gamer"}</h2>
              <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
              
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 mb-6 border border-black/10 dark:border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-700 dark:text-white/80">{t("fidelity_points")}</span>
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex items-end gap-2 text-left rtl:text-right">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
                    {profile?.points || 0}
                  </span>
                  <span className="text-sm text-amber-600 dark:text-amber-400/80 mb-1 tracking-wide">{t("pts")}</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1 rtl:flex-row-reverse rtl:justify-end">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  {t("vip_level")} <span className="text-amber-600 dark:text-amber-400 font-bold">Bronze</span>
                </div>
              </div>

              <div className="space-y-2 text-left rtl:text-right">
                <Button variant="ghost" className="w-full justify-start text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                  <ShoppingBag className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-primary" />
                  {t("my_orders")}
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-slate-900 dark:hover:text-white">
                  <Gamepad2 className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                  {t("saved_accounts")}
                </Button>

                {/* Admin Panel Button - only visible to admins */}
                {profile?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="w-full justify-start text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-amber-500/20 mt-2">
                      <Shield className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-300 dark:hover:bg-red-500/10 mt-4">
                  <LogOut className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                  {t("sign_out")}
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
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left rtl:text-right">
            <Card className="glass-card border-black/10 dark:border-white/10 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t("new_recharge")}</h3>
                  <p className="text-sm text-muted-foreground">{t("new_recharge_desc")}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors rtl:rotate-180 shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-black/10 dark:border-white/10 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10 hover:border-amber-500/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t("redeem_points")}</h3>
                  <p className="text-sm text-muted-foreground">{t("redeem_points_desc")}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors rtl:rotate-180 shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="glass-card border-black/10 dark:border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="text-left rtl:text-right">
                <CardTitle className="text-xl text-slate-900 dark:text-white">{t("recent_orders")}</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">{t("recent_orders_desc")}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                {t("view_all")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {ordersLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading orders...</div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No orders found.</div>
                ) : (
                  userOrders.map((order, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      key={order.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-black/60 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left rtl:text-right">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{order.game}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8)}...</span>
                            <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20"></span>
                            <span className="text-xs text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <div className="text-right rtl:text-left">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{order.amount}</p>
                          <p className="text-xs text-primary font-medium">{order.price}</p>
                        </div>
                        <div className={`px-2 py-1 border rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          order.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          order.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" :
                          "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
      </div>
    </div>
  );
}
