import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SocialProofPopup } from "@/components/ui/SocialProofPopup";
import { FloatingChat } from "@/components/ui/FloatingChat";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { PageTransition } from "@/components/ui/PageTransition";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/lib/supabase/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `Jin's Store | Fast & Secure Top Up`,
    template: `%s | Jin's Store`,
  },
  description: "Fast, simple and secure gaming top-ups in Algeria.",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  // Determine text direction for RTL (Arabic)
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              <CustomCursor />
        {/* Background Video */}
        <div className="fixed inset-0 -z-20 w-full h-full overflow-hidden bg-slate-100 dark:bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-40"
          >
            <source src="/mlb.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/30 via-background/80 to-background/95" />
        </div>
        <ParticlesBackground />
        
        <Navbar />
        <main className="flex-1 pt-16 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <Toaster theme="dark" position="top-center" />
        <SocialProofPopup />
          <FloatingChat />
          <ScrollToTop />
          </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
