"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageCircle, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Message sent successfully!");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 rtl:text-right">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-black/10 dark:border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div className="text-left rtl:text-right">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">WhatsApp</h3>
                  <p className="text-slate-600 dark:text-muted-foreground text-sm mb-3">{t("whatsapp_desc")}</p>
                  <a href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    {siteConfig.supportWhatsApp}
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-black/10 dark:border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left rtl:text-right">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email</h3>
                  <p className="text-slate-600 dark:text-muted-foreground text-sm mb-3">{t("email_desc")}</p>
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline font-medium">
                    {siteConfig.supportEmail}
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-black/10 dark:border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-purple-500" />
                </div>
                <div className="text-left rtl:text-right">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t("location_title")}</h3>
                  <p className="text-slate-600 dark:text-muted-foreground text-sm">
                    {t("location_desc_1")}<br />
                    {t("location_desc_2")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-black/10 dark:border-white/10 h-full">
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("message_sent")}</h2>
                    <p className="text-slate-600 dark:text-muted-foreground mb-8 max-w-md mx-auto">
                      {t("message_sent_desc")}
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="border-black/10 dark:border-white/10">
                      {t("send_another")}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left rtl:text-right">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("form_title")}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 dark:text-white/80">{t("label_name")}</Label>
                        <Input id="name" required placeholder={t("placeholder_name")} className="bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 dark:text-white/80">{t("label_phone")}</Label>
                        <Input id="phone" required placeholder={t("placeholder_phone")} className="bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-slate-900 dark:text-white h-12" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-700 dark:text-white/80">{t("label_message")}</Label>
                      <textarea 
                        id="message" 
                        required
                        placeholder={t("placeholder_message")} 
                        className="w-full min-h-[150px] p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                      ></textarea>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground hover:bg-slate-800 dark:hover:bg-primary/90 h-14 text-base">
                      {isSubmitting ? t("btn_sending") : (
                        <>
                          <Send className="mr-2 rtl:ml-2 rtl:mr-0 w-5 h-5" />
                          {t("btn_send")}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
