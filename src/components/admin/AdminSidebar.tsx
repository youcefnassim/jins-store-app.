"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Users, Gamepad2,
  Tag, Star, Activity, LogOut, ChevronRight, X, ExternalLink, Image as ImageIcon,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/lib/supabase/AuthContext";

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { key: "flexy_calculator", icon: Smartphone, href: "/admin/dashboard#flexy-calculator" },
  { key: "orders", icon: ShoppingBag, href: "/admin/orders" },
  { key: "users", icon: Users, href: "/admin/users" },
  { key: "games", icon: Gamepad2, href: "/admin/games" },
  { key: "banners", icon: ImageIcon, href: "/admin/banners" },
  { key: "promos", icon: Tag, href: "/admin/promos" },
  { key: "reviews", icon: Star, href: "/admin/reviews" },
  { key: "logs", icon: Activity, href: "/admin/logs" },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const router = useRouter();
  const t = useTranslations("Admin");
  const locale = useLocale();
  const isAr = locale === "ar";

  const isActive = (href: string) => pathname.includes(href.split("#")[0]);

  const handleLogout = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client");
      await supabase.auth.signOut();
      
      // Call the API to clear the HTTP-only cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <aside
      className={`w-64 h-screen bg-white/95 dark:bg-[#0a0c14]/95 backdrop-blur-xl ${
        isAr ? "border-l right-0" : "border-r left-0"
      } border-slate-200 dark:border-white/10 flex flex-col fixed top-0 z-40 shadow-2xl transition-colors duration-300`}
    >
      {/* Header with Close Button */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] shrink-0">
            <img src="/logo.jpg" alt="Jin's Store Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">Jin's Store</p>
            <p className="text-xs text-primary font-semibold">{t("panel")}</p>
          </div>
        </div>

        {/* Close / Collapse Toggle Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 shadow-sm"
            title={t("hide_menu")}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
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
              <span className="relative z-10">{t(item.key)}</span>
              {active && (
                <ChevronRight
                  className={`w-4 h-4 relative z-10 text-primary ${
                    isAr ? "mr-auto rotate-180" : "ml-auto"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {profile?.name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile?.name || profile?.email || "Admin"}</p>
            <p className="text-xs text-primary">{t("administrator")}</p>
          </div>
        </div>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/10"
        >
          <ExternalLink className="w-4 h-4" />
          {t("back_to_site")}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
