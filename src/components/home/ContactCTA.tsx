import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function ContactCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366]/10 mb-6">
          <MessageCircle className="w-8 h-8 text-[#25D366]" />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Need help with your order?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Our support team is available on WhatsApp to assist you with any questions or issues regarding your recharge.
        </p>
        
        <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-shadow">
          <Link href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 w-5 h-5" />
            Contact Support
          </Link>
        </Button>
      </div>
    </section>
  );
}
