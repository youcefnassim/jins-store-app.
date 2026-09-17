"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Eye, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Order {
  id: string;
  userId: string;
  game: string;
  package: string;
  playerId: string;
  price: string;
  pointsToAward: number;
  status: "pending" | "completed" | "rejected";
  receiptUrl: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          game: d.game,
          package: d.package,
          playerId: d.player_id,
          price: d.price,
          pointsToAward: d.points_to_award,
          status: d.status,
          receiptUrl: d.receipt_url,
          createdAt: d.created_at
        })));
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (order: Order) => {
    if (!confirm("Are you sure you want to approve this order?")) return;
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          action: 'approve',
          userId: order.userId,
          pointsToAward: order.pointsToAward,
        }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success("Order approved successfully!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to approve order.");
    }
  };

  const handleReject = async (order: Order) => {
    if (!confirm("Are you sure you want to reject this order?")) return;
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, action: 'reject' }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      toast.success("Order rejected.");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to reject order.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "pending");
  const completedOrders = orders.filter(o => o.status === "completed");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-500">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-500">{completedOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Review and process incoming top-up requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-muted-foreground uppercase bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Game / Player</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{order.game}</div>
                        <div className="text-muted-foreground">ID: {order.playerId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{order.price}</div>
                        <div className="text-xs text-primary">+{order.pointsToAward} pts</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          order.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                          order.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="hover:bg-primary/20 text-primary"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-[#0f111a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/50">
                <h3 className="text-xl font-bold">Review Order</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                          selectedOrder.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                          selectedOrder.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Game</div>
                    <div className="font-bold text-lg">{selectedOrder.game}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Package</div>
                    <div className="font-bold">{selectedOrder.package}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Player ID / Zone</div>
                    <div className="font-mono text-lg bg-black/5 dark:bg-white/5 p-2 rounded inline-block">{selectedOrder.playerId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="font-bold text-xl text-primary">{selectedOrder.price}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">Payment Receipt</div>
                  {selectedOrder.receiptUrl ? (
                    <a href={selectedOrder.receiptUrl} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <img src={selectedOrder.receiptUrl} alt="Receipt" className="w-full max-h-80 object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-40 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center text-muted-foreground">
                      No receipt uploaded
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/50 flex gap-4 justify-end">
                {selectedOrder.status === "pending" ? (
                  <>
                    <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => handleReject(selectedOrder)}>
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApprove(selectedOrder)}>
                      <Check className="w-4 h-4 mr-2" /> Approve & Top Up
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
