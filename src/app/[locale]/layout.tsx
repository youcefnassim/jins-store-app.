import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { SocialProofPopup } from "@/components/ui/SocialProofPopup";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";
import { PageTransition } from "@/components/ui/PageTransition";
import { TopMarquee } from "@/components/layout/TopMarquee";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { SpeedDialFAB } from "@/components/ui/SpeedDialFAB";
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
              {/* Background */}
              <div className="fixed inset-0 -z-20 w-full h-full bg-slate-100 dark:bg-[#050810]">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/30 dark:from-indigo-900/20 via-background/60 to-background" />
              </div>
              <ParticlesBackground />
              
              {/* Centered Background Logo Watermark */}
              <div className="fixed inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-5 dark:opacity-10">
                <div className="relative w-[450px] h-[450px] sm:w-[550px] sm:h-[550px] md:w-[650px] md:h-[650px] rounded-full overflow-hidden">
                  <img 
                    src="/logo.jpg" 
                    alt="Jin's Store Watermark Logo" 
                    className="w-full h-full object-cover rounded-full filter contrast-125"
                  />
                </div>
              </div>
              
              <LayoutWrapper>
                {children}
              </LayoutWrapper>

              <Toaster theme="dark" position="top-center" />
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
