"use client";

import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminSearchModal } from "@/components/admin/AdminSearchModal";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        const isAdmin = profile?.role === "admin" || user.email === "youcefnassim60@gmail.com" || user.email === "contact@jins-store.com" || user.email?.includes("admin");
        if (!isAdmin) {
          router.push("/dashboard");
        }
      }
    }
  }, [user, profile, loading, router]);

  // Global Keyboard listener for Cmd + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="min-h-screen bg-slate-100 dark:bg-[#050810] text-slate-900 dark:text-white flex relative transition-colors duration-300">
      {/* Cmd + K Quick Search Modal */}
      <AdminSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

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
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0a0c14]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 lg:px-6 h-14 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-sm"
              title={sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-primary" /> : <PanelLeftOpen className="w-4 h-4 text-primary" />}
              <span className="hidden sm:inline">{sidebarOpen ? "Masquer Menu" : "Ouvrir Menu Admin"}</span>
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-wide hidden sm:inline">Jin's Store Admin</span>
          </div>

          {/* Right Actions: Quick Search + Dark/Light Mode Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rechercher dans l'Admin...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                ⌘K
              </kbd>
            </button>
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
