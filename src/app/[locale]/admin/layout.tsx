"use client";

import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (profile?.role !== "admin" && user.email !== "youcefnassim60@gmail.com") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] mb-4 animate-pulse">
          <span className="text-2xl">🛡️</span>
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Vérification des accès Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810]/70 backdrop-blur-sm text-slate-900 dark:text-white flex relative">
      {/* Sidebar with Animated Slide In/Out */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-40"
          >
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        {/* Top Control Bar with Menu Toggle & Theme Toggle */}
        <div className="sticky top-0 z-30 bg-[#0a0c14]/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 text-xs font-semibold shadow-sm"
              title={sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-primary" /> : <PanelLeftOpen className="w-4 h-4 text-primary" />}
              <span className="hidden sm:inline">{sidebarOpen ? "Masquer Menu" : "Ouvrir Menu Admin"}</span>
            </button>
            <span className="font-bold text-sm text-white tracking-wide">Jin's Store Admin</span>
          </div>

          {/* Right Actions: Dark/Light Mode Switcher */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
