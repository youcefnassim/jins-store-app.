"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Users, Gamepad2,
  Tag, Star, Activity, LogOut, ChevronRight, Shield
} from "lucide-react";
import { useAuth } from "@/lib/supabase/AuthContext";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Commandes", icon: ShoppingBag, href: "/admin/orders" },
  { label: "Utilisateurs", icon: Users, href: "/admin/users" },
  { label: "Jeux & Packs", icon: Gamepad2, href: "/admin/games" },
  { label: "Codes Promo", icon: Tag, href: "/admin/promos" },
  { label: "Avis Clients", icon: Star, href: "/admin/reviews" },
  { label: "Logs", icon: Activity, href: "/admin/logs" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const router = useRouter();

  const isActive = (href: string) => pathname.includes(href);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0a0c14] border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Jin's Store</p>
            <p className="text-xs text-primary font-semibold">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="admin-active-pill"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${active ? "text-primary" : ""}`} strokeWidth={active ? 2.5 : 2} />
              <span className="relative z-10">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {profile?.username?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.username ?? "Admin"}</p>
            <p className="text-xs text-primary">Administrateur</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
