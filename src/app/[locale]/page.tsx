import { Hero } from "@/components/home/Hero";
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
    <div className="flex flex-col">
      <Hero />
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
