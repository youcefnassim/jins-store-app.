"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Menu, X, Smartphone, Search, Gamepad2, HelpCircle, Phone, ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

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
    { name: "Home", href: "/", icon: Search },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Recharge", href: "/recharge", icon: Smartphone },
    { name: "Track Order", href: "/track", icon: Search },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-[0_4_30px_rgba(0,0,0,0.1)] py-2"
            : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo - Left Aligned */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-white/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300">
                <img src="/logo.png" alt="Jin's Store Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav 
            className="hidden lg:flex items-center justify-center gap-1 flex-1 relative"
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
                    isActive || isHovered ? "text-white" : "text-muted-foreground"
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
                      className="absolute inset-0 bg-white/5 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Toggle - Right Aligned */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
            
            <Link 
              href="/auth/login" 
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
              title="Sign In / Dashboard"
            >
              <User size={18} />
            </Link>

            <Button asChild className="hidden sm:inline-flex bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 rounded-full px-6">
              <Link href="/recharge">Recharge Now</Link>
            </Button>
            
            <button
              className="lg:hidden p-2 text-foreground/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slidebar (Drawer) Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            
            {/* Slidebar Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#0f1420] border-l border-white/10 z-[70] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-full border border-white/10">
                    <img src="/logo.png" alt="Jin's Store Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300",
                          isActive 
                            ? "bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary text-white" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <link.icon size={20} className={isActive ? "text-primary" : ""} />
                          <span className="font-medium text-base">{link.name}</span>
                        </div>
                        <ChevronRight size={16} className={isActive ? "text-primary opacity-100" : "opacity-30"} />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-white/5 space-y-3">
                <Button asChild variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full h-12 text-md">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In / Dashboard
                  </Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-primary to-purple-600 rounded-full h-12 text-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Link href="/recharge" onClick={() => setMobileMenuOpen(false)}>
                    Recharge Now
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
