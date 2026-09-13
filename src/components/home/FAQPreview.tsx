import { faqs } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FAQPreview() {
  const previewFaqs = faqs.slice(0, 5);

  return (
    <section className="py-20 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          
          <div className="lg:w-1/3 flex flex-col items-start text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Got questions? We've got answers. If you have some other questions, feel free to contact us.
            </p>
            <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
              <Link href="/faq">View All FAQs</Link>
            </Button>
          </div>

          <div className="lg:w-2/3 w-full">
            <Accordion type="single" collapsible className="w-full">
              {previewFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                  <AccordionTrigger className="text-left text-white hover:text-primary transition-colors text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
        </div>
      </div>
    </section>
  );
}
