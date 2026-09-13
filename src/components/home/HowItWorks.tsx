import { UserCircle, Diamond, CreditCard, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
  const steps = [
    {
      icon: UserCircle,
      title: "Enter MLBB ID",
      description: "Provide your Player ID and Zone ID.",
    },
    {
      icon: Diamond,
      title: "Choose Package",
      description: "Select the Diamonds you need.",
    },
    {
      icon: CreditCard,
      title: "Select Payment",
      description: "Choose BaridiMob, CCP, or Binance.",
    },
    {
      icon: Send,
      title: "Send Proof",
      description: "Upload a screenshot of the payment.",
    },
    {
      icon: CheckCircle2,
      title: "Receive Diamonds",
      description: "We verify and recharge your account.",
    }
  ];

  return (
    <section className="py-20 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Recharging your Mobile Legends account is simple. Just follow these steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-white/5 -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-6 relative">
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-4 border-background">
                  {index + 1}
                </div>
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
