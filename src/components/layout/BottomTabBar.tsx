"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Home, Gamepad2, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";

export function BottomTabBar() {
  const pathname = usePathname();
  const t = useTranslations("Navigation"); // Assuming Navigation translations exist

  const tabs = [
    { name: "Accueil", icon: Home, href: "/" },
    { name: "Jeux", icon: Gamepad2, href: "/games" },
    { name: "Recherche", icon: Search, href: "/search" }, // Or open a search moda
    { name: "Profil", icon: User, href: "/dashboard" },
  ];

  // Helper to check if a tab is active.
  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/fr" || pathname === "/ar")) return true;
    if (href !== "/" && pathname.includes(href)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0a0e17]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
            >
              {active && (
                <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-b-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              )}

              <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/5'}`}>
                <tab.icon className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
