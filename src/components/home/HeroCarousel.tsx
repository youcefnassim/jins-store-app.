"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "Offre Spéciale PUBG Mobile",
    description: "Rechargez 660 UC et obtenez 60 UC Bonus !",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=400", // Generic gaming image
    link: "/recharge/pubg-mobile",
    color: "from-amber-500/80 to-orange-600/80"
  },
  {
    id: 2,
    title: "Genshin Impact - Nouveauté",
    description: "Les Cristaux Primaires au meilleur prix d'Algérie",
    image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1200&h=400", // Anime/fantasy style
    link: "/recharge/genshin-impact",
    color: "from-indigo-500/80 to-purple-600/80"
  },
  {
    id: 3,
    title: "Free Fire - Pass Élite",
    description: "Ne ratez pas le nouveau Pass Élite de cette saison",
    image: "https://images.unsplash.com/photo-1538481199005-c710c4e965fc?auto=format&fit=crop&q=80&w=1200&h=400", // Action game style
    link: "/recharge/free-fire",
    color: "from-rose-500/80 to-red-600/80"
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[250px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl group mt-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banners[currentIndex].image})` }}
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentIndex].color} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12 z-10">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg"
            >
              {banners[currentIndex].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl drop-shadow-md"
            >
              {banners[currentIndex].description}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold px-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <Link href={banners[currentIndex].link}>
                  Profiter de l'offre
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
