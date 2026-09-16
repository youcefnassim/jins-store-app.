"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShoppingBag, Clock, Sparkles, LogOut, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock user data
const user = {
  name: "Jin Gamer",
  email: "jin@example.com",
  points: 1250,
  level: "Gold",
};

// Mock orders
const recentOrders = [
  { id: "MLBB-20231015-1234", game: "Mobile Legends", amount: "514 Diamonds", price: "900 DZD", status: "Completed", date: "Oct 15, 2023" },
  { id: "FF-20231012-9876", game: "Free Fire", amount: "210 Diamonds", price: "400 DZD", status: "Completed", date: "Oct 12, 2023" },
  { id: "MLBB-20231005-5555", game: "Mobile Legends", amount: "86 Diamonds", price: "150 DZD", status: "Completed", date: "Oct 05, 2023" },
];

export default function DashboardPage() {
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
                <div className="w-full h-full bg-gradient-to-tr from-primary to-pink-500 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                  J
                </div>
              </div>
            </div>
            <CardContent className="pt-14 pb-6 px-6">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/80">Fidelity Points</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                    {user.points}
                  </span>
                  <span className="text-sm text-amber-400/80 mb-1 tracking-wide">PTS</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  VIP Level: <span className="text-amber-400 font-bold">{user.level}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-white bg-white/5 hover:bg-white/10">
                  <ShoppingBag className="w-4 h-4 mr-3 text-primary" />
                  My Orders
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white">
                  <Gamepad2 className="w-4 h-4 mr-3" />
                  Saved Accounts
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-4">
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-card border-white/10 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1">New Recharge</h3>
                  <p className="text-sm text-muted-foreground">Top up your games</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent hover:border-amber-500/50 transition-colors cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1">Redeem Points</h3>
                  <p className="text-sm text-muted-foreground">Get free diamonds</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl text-white">Recent Orders</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">Your latest top-up history</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {recentOrders.map((order, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:bg-black/60 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{order.game}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className="text-xs text-muted-foreground">{order.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                      <div className="text-right">
                        <p className="font-bold text-white text-sm">{order.amount}</p>
                        <p className="text-xs text-primary font-medium">{order.price}</p>
                      </div>
                      <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {order.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
      </div>
    </div>
  );
}
