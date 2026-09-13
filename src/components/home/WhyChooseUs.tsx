import { Zap, ShieldCheck, WalletCards, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WhyChooseUs() {
  const reasons = [
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Fast processing after payment verification. We aim to complete orders quickly.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Orders",
      description: "100% safe and secure platform. Your account details are always protected.",
    },
    {
      icon: WalletCards,
      title: "Multiple Payments",
      description: "Pay conveniently via BaridiMob, CCP, Binance, or Flexy.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Have an issue? Our support team is ready to assist you via WhatsApp.",
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide the most reliable top-up service for Algerian gamers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <Card key={index} className="glass-card border-white/5 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <reason.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg text-white">{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
