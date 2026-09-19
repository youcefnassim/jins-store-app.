"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag, Users, Gamepad2, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = RouterHook();

  // Keyboard shortcut listener for ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: "Commandes en attente", icon: ShoppingBag, href: "/admin/orders?status=pending", category: "Commandes" },
    { label: "Toutes les commandes", icon: ShoppingBag, href: "/admin/orders", category: "Commandes" },
    { label: "Liste des utilisateurs", icon: Users, href: "/admin/users", category: "Utilisateurs" },
    { label: "Catalogue des jeux", icon: Gamepad2, href: "/admin/products", category: "Produits" },
    { label: "Codes promo", icon: Sparkles, href: "/admin/promos", category: "Marketing" },
  ];

  const filteredLinks = query.trim() === ""
    ? quickLinks
    : quickLinks.filter(l => l.label.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase()));

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top Search Input */}
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-white/10">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une commande, un utilisateur, un jeu... (ex: BaridiMob, Free Fire)"
              className="w-full h-14 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-white/10">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Raccourcis & Actions Rapides
              </div>
              <div className="space-y-1">
                {filteredLinks.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Aucun résultat trouvé pour "{query}"
                  </div>
                ) : (
                  filteredLinks.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.href)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors text-xs">
                        <span>Ouvrir</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3 text-slate-400" /> Appuyez sur Entrée pour valider
            </span>
            <span>Raccourci : <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-white/10 rounded text-slate-700 dark:text-slate-300 font-mono">Cmd + K</kbd></span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function RouterHook() {
  return useRouter();
}
