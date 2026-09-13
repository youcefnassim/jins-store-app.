import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const orderId = searchParams.id || "MLBB-XXXXXX-XXXX";

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 md:p-12 text-center border-t-4 border-t-primary relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-[50px] -z-10" />
        
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Order Received!</h1>
        <p className="text-muted-foreground mb-8">
          Your order has been successfully submitted and is pending payment verification.
        </p>
        
        <div className="bg-black/40 rounded-xl p-4 mb-8 border border-white/5">
          <p className="text-sm text-muted-foreground mb-1">Order Number</p>
          <p className="text-xl font-bold text-white tracking-widest">{orderId}</p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 h-12">
            <Link href={`/track?id=${orderId}`}>
              Track My Order
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full h-12 border-white/10 hover:bg-white/5">
            <Link href="/">Back to Home</Link>
          </Button>

          <Button asChild variant="ghost" className="w-full h-12 text-muted-foreground hover:text-white mt-2">
            <Link href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank">
              <MessageCircle className="mr-2 w-4 h-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
