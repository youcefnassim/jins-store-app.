import { Hero } from "@/components/home/Hero";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PaymentMethods } from "@/components/home/PaymentMethods";
import { PopularPackages } from "@/components/home/PopularPackages";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TrackOrderCTA } from "@/components/home/TrackOrderCTA";
import { FAQPreview } from "@/components/home/FAQPreview";
import { ContactCTA } from "@/components/home/ContactCTA";
import { ReviewCarousel } from "@/components/ui/ReviewCarousel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <div className="flex flex-col relative">
      {/* Video Background — Home Page Only */}
      <div className="fixed inset-0 -z-20 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-40"
        >
          <source src="/mlb.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 dark:from-indigo-900/30 via-background/80 to-background/95" />
      </div>

      <Hero />
      <HeroCarousel />
      <TrustBadges />
      <ScrollReveal delay={0.1}><PaymentMethods /></ScrollReveal>
      <ScrollReveal delay={0.2}><PopularPackages /></ScrollReveal>
      <ScrollReveal delay={0.1}><PromoBanner /></ScrollReveal>
      <ScrollReveal delay={0.1}><HowItWorks /></ScrollReveal>
      <ScrollReveal delay={0.1}><WhyChooseUs /></ScrollReveal>
      <ScrollReveal delay={0.2}><ReviewCarousel /></ScrollReveal>
      <ScrollReveal delay={0.1}><TrackOrderCTA /></ScrollReveal>
      <ScrollReveal delay={0.1}><FAQPreview /></ScrollReveal>
      <ScrollReveal delay={0.1}><ContactCTA /></ScrollReveal>
    </div>
  );
}
