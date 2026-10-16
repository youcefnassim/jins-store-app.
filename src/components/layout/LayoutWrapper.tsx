"use client";

import { usePathname } from "@/i18n/routing";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopMarquee } from "@/components/layout/TopMarquee";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { SpeedDialFAB } from "@/components/ui/SpeedDialFAB";
import { SocialProofPopup } from "@/components/ui/SocialProofPopup";
import { PageTransition } from "@/components/ui/PageTransition";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/admin");

  if (isAdmin) {
    return (
      <main className="flex-1 min-h-screen bg-[#050810]">
        {children}
      </main>
    );
  }

  return (
    <>
      <TopMarquee />
      <Navbar />
      <BottomTabBar />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <SpeedDialFAB />
    </>
  );
}
