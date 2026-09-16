import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6 md:p-10 prose prose-invert max-w-none text-white/80">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-6 leading-relaxed">
              At {siteConfig.name}, we collect only the necessary information to process your orders. This includes your Game ID, phone number (for contact purposes regarding your order), and payment proof images.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">2. How We Use Your Information</h2>
            <p className="mb-6 leading-relaxed">
              We use the collected information exclusively to fulfill your digital top-up orders, verify payments, and communicate with you if there are issues with your transaction.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">3. Data Protection</h2>
            <p className="mb-6 leading-relaxed">
              We implement reasonable security measures to protect your personal information. We do not sell, trade, or rent your personal identification information to others.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">4. Data Retention</h2>
            <p className="mb-6 leading-relaxed">
              Payment proofs are retained only as long as necessary to resolve any disputes or verify the completion of the transaction, after which they may be deleted from our systems.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">5. Contact Us</h2>
            <p className="mb-6 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us via our WhatsApp support or at {siteConfig.supportEmail}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
