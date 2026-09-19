import { faqs } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function FAQPreview() {
  const t = useTranslations("FAQPreview");
  const previewFaqs = faqs.slice(0, 5);

  return (
    <section className="py-20 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          
          <div className="lg:w-1/3 flex flex-col items-start text-left rtl:text-right">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {t("description")}
            </p>
            <Button asChild variant="outline" className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
              <Link href="/faq">{t("view_all")}</Link>
            </Button>
          </div>

          <div className="lg:w-2/3 w-full">
            <Accordion className="w-full">
              {previewFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-black/10 dark:border-white/10">
                  <AccordionTrigger className="text-left rtl:text-right text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors text-base font-medium">
                    {t(`questions.${index}.q`) || faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-muted-foreground leading-relaxed text-left rtl:text-right">
                    {t(`questions.${index}.a`) || faq.answer}
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
