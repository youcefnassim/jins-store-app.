import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6 md:p-10 prose prose-invert max-w-none text-white/80">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-6 leading-relaxed">
              Welcome to {siteConfig.name}. By accessing our website, you agree to these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">2. Services Provided</h2>
            <p className="mb-6 leading-relaxed">
              We provide a digital platform to facilitate the top-up of gaming credits, specifically Mobile Legends: Bang Bang Diamonds in Algeria. We act as an intermediary for these digital goods.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">3. Orders and Payments</h2>
            <p className="mb-6 leading-relaxed">
              All orders are subject to verification. Users must provide accurate Game ID and Zone ID details. We are not responsible for Diamonds sent to the wrong account due to user error.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">4. Refunds</h2>
            <p className="mb-6 leading-relaxed">
              Due to the digital nature of the goods, refunds are only issued if we are unable to deliver the Diamonds after payment verification. Once Diamonds are delivered, all sales are final.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">5. Contact</h2>
            <p className="mb-6 leading-relaxed">
              If you have any questions regarding these Terms, please contact us at {siteConfig.supportEmail}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
