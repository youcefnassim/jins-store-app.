import { RechargeStepper } from "@/components/recharge/RechargeStepper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recharge Diamonds",
  description: "Secure and fast Mobile Legends Diamonds recharge.",
};

export default function RechargePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Recharge Mobile Legends
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete the steps below to top up your account.
          </p>
        </div>
        
        <RechargeStepper />
      </div>
    </div>
  );
}
