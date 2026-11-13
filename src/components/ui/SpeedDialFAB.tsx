"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowUp, X, Headphones } from "lucide-react";
import { usePathname } from "@/i18n/routing";

export function SpeedDialFAB() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("https://wa.me/213555000000");

  // Completely hide the FAB on checkout, recharge, and game purchase pages to prevent overlapping payment forms
  const isOrderOrFormPage = pathname?.includes("/recharge") || pathname?.includes("/checkout") || pathname?.includes("/order");
  if (isOrderOrFormPage) {
    return null;
  }

  useEffect(() => {
    fetch("/api/settings/payments")
      .then((r) => r.json())
      .then((d) => {
        const phone = d?.settings?.whatsapp || d?.whatsapp;
        if (phone) {
          const cleanPhone = String(phone).replace(/\D/g, "");
          const msg = encodeURIComponent("Bonjour, j'ai besoin d'aide concernant une recharge.");
          setWhatsappUrl(`https://wa.me/${cleanPhone}?text=${msg}`);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  const actions = [
    ...(showScrollTop
      ? [
          {
            icon: ArrowUp,
            label: "Haut de page",
            onClick: scrollToTop,
            color: "bg-slate-800 dark:bg-slate-700 text-white",
          },
        ]
      : []),
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: whatsappUrl,
      color: "bg-[#25D366] text-white",
    },
    {
      icon: Headphones,
      label: "Support",
      href: "/contact",
      color: "bg-primary text-white",
    },
  ];

  return (
    <div 
      className="md:hidden fixed right-3.5 z-40 flex flex-col items-center gap-2.5"
      style={{ bottom: "calc(76px + max(env(safe-area-inset-bottom, 0px), 8px))" }}
    >
      {/* Sub-actions (expanded) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2.5"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2"
              >
                {/* Label tooltip */}
                <span className="text-[11px] font-semibold bg-black/85 text-white px-2 py-0.5 rounded-lg whitespace-nowrap backdrop-blur-sm shadow-md">
                  {action.label}
                </span>
                {/* Icon button */}
                {action.href ? (
                  <a
                    href={action.href}
                    target={action.href.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center ${action.color} active:scale-90 transition-transform`}
                  >
                    <action.icon className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={action.onClick}
                    className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center ${action.color} active:scale-90 transition-transform`}
                  >
                    <action.icon className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-purple-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Menu actions"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Headphones className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
