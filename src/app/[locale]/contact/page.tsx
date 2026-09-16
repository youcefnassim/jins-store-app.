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

export default function ContactPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg">
            We'd love to hear from you. Here's how you can reach us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-3">Fastest response time.</p>
                  <a href={`https://wa.me/${siteConfig.supportWhatsApp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    {siteConfig.supportWhatsApp}
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm mb-3">For general inquiries.</p>
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline font-medium">
                    {siteConfig.supportEmail}
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Location</h3>
                  <p className="text-muted-foreground text-sm">
                    Algiers, Algeria<br />
                    Available online 24/7
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-white/10 h-full">
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Thank you for contacting us. Our team will get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/10">
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/80">Name</Label>
                        <Input id="name" required placeholder="John Doe" className="bg-black/40 border-white/10 text-white h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
                        <Input id="phone" required placeholder="0550..." className="bg-black/40 border-white/10 text-white h-12" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white/80">Message</Label>
                      <textarea 
                        id="message" 
                        required
                        placeholder="How can we help you?" 
                        className="w-full min-h-[150px] p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                      ></textarea>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 h-14 text-base">
                      {isSubmitting ? "Sending..." : (
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          Send Message
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
