"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const reviews = [
  {
    id: 1,
    name: "Yassine DZ",
    role: "Regular Customer",
    content: "The fastest recharge service in Algeria! I got my Mobile Legends diamonds in less than 5 minutes. Highly recommended.",
    rating: 5,
  },
  {
    id: 2,
    name: "Aminesniiper",
    role: "Pro Player",
    content: "Trustworthy and very professional. The customer support helped me immediately when I made a mistake with my Zone ID.",
    rating: 5,
  },
  {
    id: 3,
    name: "Karim_16",
    role: "New Customer",
    content: "First time buying here and I paid with BaridiMob. Everything went smooth and the interface is incredibly beautiful.",
    rating: 5,
  },
  {
    id: 4,
    name: "Sarah_Gamer",
    role: "Regular Customer",
    content: "I love the new fidelity points system! Now I can get discounts on my weekly passes. The best store for MLBB.",
    rating: 5,
  },
];

export function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-12 overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">What Our Gamers Say</h2>
        <div className="flex justify-center gap-1 text-amber-400 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-amber-400" />
          ))}
        </div>
        <p className="text-muted-foreground">Trusted by thousands of players across Algeria</p>
      </div>

      <div className="relative h-[250px] md:h-[200px]">
        {reviews.map((review, index) => {
          // Calculate relative position for the carousel effect
          const offset = index - currentIndex;
          const isVisible = Math.abs(offset) <= 1 || (index === 0 && currentIndex === reviews.length - 1) || (index === reviews.length - 1 && currentIndex === 0);
          
          let x = 0;
          let opacity = 0;
          let scale = 0.8;
          let zIndex = 0;

          if (offset === 0) {
            x = 0;
            opacity = 1;
            scale = 1;
            zIndex = 20;
          } else if (offset === 1 || (currentIndex === reviews.length - 1 && index === 0)) {
            x = 100; // Right
            opacity = 0.4;
            zIndex = 10;
          } else if (offset === -1 || (currentIndex === 0 && index === reviews.length - 1)) {
            x = -100; // Left
            opacity = 0.4;
            zIndex = 10;
          }

          if (!isVisible) return null;

          return (
            <motion.div
              key={review.id}
              initial={false}
              animate={{ 
                x: `${x}%`, 
                opacity, 
                scale,
                zIndex 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 right-0 mx-auto w-full max-w-lg origin-center"
            >
              <Card className="glass-card border-white/10 bg-black/40 backdrop-blur-xl">
                <CardContent className="p-8">
                  <Quote className="w-10 h-10 text-primary/20 absolute top-4 right-4" />
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-white/90 text-lg mb-6 line-clamp-3 relative z-10">
                    "{review.content}"
                  </p>
                  
                  <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{review.name}</h4>
                      <p className="text-xs text-primary">{review.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
