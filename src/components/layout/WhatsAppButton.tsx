"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/payments")
      .then((r) => r.json())
      .then((d) => {
        const phone = d?.settings?.whatsapp || d?.whatsapp;
        if (phone) setPhoneNumber(String(phone).replace(/\D/g, ""));
      })
      .catch(() => {});
  }, []);

  if (!phoneNumber) return null;

  const message = encodeURIComponent("Bonjour, j'ai besoin d'aide concernant une recharge.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-24 right-6 md:bottom-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1ebd5a] transition-colors hover:scale-110 duration-200"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-75"></span>
    </motion.a>
  );
}
