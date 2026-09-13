import { faqs } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MessageCircle } from "lucide-react";

export default function FAQPage() {
  // Group FAQs by category
  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about our recharge service.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const categoryFaqs = faqs.filter(f => f.category === category);
            
            return (
              <div key={category}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm">
                    {category[0]}
                  </span>
                  {category}
                </h2>
                <Accordion type="single" collapsible className="w-full glass-card border-white/10 rounded-xl overflow-hidden px-4">
                  {categoryFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-white/10 last:border-0">
                      <AccordionTrigger className="text-left text-white hover:text-primary transition-colors text-base font-medium py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-card rounded-2xl p-8 text-center border-primary/20 bg-primary/5">
          <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            We are here to help. Contact our support team on WhatsApp.
          </p>
          <Button asChild className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none h-12 px-8">
            <Link href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank">
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat on WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
