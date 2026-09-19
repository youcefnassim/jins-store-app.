"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Menu, X, Smartphone, Search, Gamepad2, HelpCircle, Phone, ChevronRight, User, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/supabase/AuthContext";

export function Navbar() {
  const t = useTranslations("Navbar");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: t("home"), href: "/", icon: Search },
    { name: t("games"), href: "/games", icon: Gamepad2 },
    { name: t("recharge"), href: "/recharge", icon: Smartphone },
    { name: t("track"), href: "/track", icon: Search },
    { name: t("faq"), href: "/faq", icon: HelpCircle },
    { name: t("contact"), href: "/contact", icon: Phone },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 md:top-4 w-full md:max-w-4xl md:mx-auto z-50 transition-all duration-500 rounded-none md:rounded-full",
          isScrolled
            ? "bg-background/80 dark:bg-black/50 backdrop-blur-xl border-b md:border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-2"
            : "bg-background/40 dark:bg-black/20 backdrop-blur-md md:border border-white/5 py-4"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo - Left Aligned */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-white/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300">
                <img src="/logo.jpg" alt="Jin's Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/70">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered (Hidden on Mobile) */}
          <nav 
            className="hidden md:flex items-center justify-center gap-1 flex-1 relative"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.slice(1).map((link) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredLink === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors z-10",
                    isActive || isHovered ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-muted-foreground"
                  )}
                >
                  {link.name}
                  
                  {/* Active Indicator Underline */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Sliding Hover Pill */}
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="hover-nav-pill"
                      className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* Mega Menu Dropdown for Games */}
                  {link.href === "/games" && isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] cursor-default"
                    >
                      <div className="bg-white/90 dark:bg-[#0a0e17]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Trending Games</h4>
                          <div className="space-y-3">
                            <Link href="/recharge?game=mobile-legends" className="flex items-center gap-3 group/item">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-5 h-5 text-blue-500 group-hover/item:scale-110 transition-transform" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">Mobile Legends</p>
                                <p className="text-xs text-muted-foreground">Diamonds Top Up</p>
                              </div>
                            </Link>
                            <Link href="/recharge?game=pubg-mobile" className="flex items-center gap-3 group/item">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-5 h-5 text-amber-500 group-hover/item:scale-110 transition-transform" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">PUBG Mobile</p>
                                <p className="text-xs text-muted-foreground">UC Top Up</p>
                              </div>
                            </Link>
                            <Link href="/recharge?game=free-fire" className="flex items-center gap-3 group/item">
                              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-5 h-5 text-rose-500 group-hover/item:scale-110 transition-transform" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white group-hover/item:text-primary transition-colors">Free Fire</p>
                                <p className="text-xs text-muted-foreground">Diamonds Top Up</p>
                              </div>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col justify-end p-4">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                          <div className="relative z-10">
                            <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 shadow-lg">New Promo</span>
                            <p className="text-white font-bold text-lg leading-tight mb-2">Get 10% Extra on first Top Up!</p>
                            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white border-0 shadow-lg w-full h-8 text-xs">
                              <Link href="/games">View All Games</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Actions - Right Aligned */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
            <GlobalSearch />
            <LanguageSwitcher />
            <ThemeToggle />

            {/* User Profile / Login (Hidden on Mobile) */}
            <div className="hidden md:block">
              {user ? (
                <Button asChild variant="outline" className="rounded-full border-black/10 dark:border-white/10 glass-card">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>Profile</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0 px-5 py-2 font-semibold tracking-wide">
                  <Link href="/auth/login" className="flex items-center gap-2">
                    <span>Se Connecter</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
