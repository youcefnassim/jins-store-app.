"use client";

import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/auth/login");
      else if (profile?.role !== "admin") router.push("/dashboard");
    }
  }, [user, profile, loading, router]);

  if (loading || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] mb-4 animate-pulse">
          <span className="text-2xl">🛡️</span>
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Vérification des accès...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070910] text-white flex">
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-30 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-40 lg:hidden"
            >
              <AdminSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#0a0c14] border-b border-white/5 px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Admin Panel</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
