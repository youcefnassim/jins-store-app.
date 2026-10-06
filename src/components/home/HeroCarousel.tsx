"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function HeroCarousel() {
  const t = useTranslations("HeroCarousel");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBanners, setActiveBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/banners?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.banners && data.banners.length > 0) {
          setActiveBanners(data.banners);
        } else {
          setActiveBanners([]);
        }
      } catch (e) {
        setActiveBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const currentBanners = activeBanners;

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === currentBanners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanners.length, loading]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === currentBanners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? currentBanners.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto h-[180px] sm:h-[260px] md:h-[340px] lg:h-[400px] flex items-center justify-center mt-8 bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentBanners.length === 0) {
    return null;
  }

  const getOffset = (idx: number, current: number, length: number) => {
    let diff = idx - current;
    if (diff > Math.floor(length / 2)) {
      diff -= length;
    } else if (diff < -Math.floor(length / 2)) {
      diff += length;
    }
    return diff;
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[180px] sm:h-[260px] md:h-[340px] lg:h-[400px] flex items-center justify-center overflow-hidden group mt-8">
      
      {currentBanners.map((banner, idx) => {
        const offset = getOffset(idx, currentIndex, currentBanners.length);
        const isActive = offset === 0;
        const isVisible = Math.abs(offset) <= 1;

        return (
          <motion.div
            key={banner.id}
            animate={{
              x: `${offset * 85}%`,
              scale: isActive ? 1 : 0.85,
              opacity: isVisible ? (isActive ? 1 : 0.5) : 0,
              zIndex: 10 - Math.abs(offset),
            }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute w-[85%] md:w-[75%] lg:w-[65%] h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
            onClick={() => {
              if (!isActive) setCurrentIndex(idx);
            }}
            style={{ cursor: isActive ? "default" : "pointer" }}
            <Link 
              href={isActive ? banner.link : '#'} 
              className="block w-full h-full bg-[#0a0c14] rounded-2xl md:rounded-3xl"
              onClick={(e) => {
                if (!isActive) {
                  e.preventDefault();
                }
              }}
            >
              {/* Image */}
              <img 
                src={banner.image} 
                alt={banner.title}
                className="w-full h-full object-cover md:object-fill rounded-2xl md:rounded-3xl"
              />
              
              {/* Darken inactive slides */}
              {!isActive && <div className="absolute inset-0 bg-black/60" />}
            </Link>
          </motion.div>
        );
      })}

      {/* Navigation Buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-2 sm:left-6 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 rtl:left-auto rtl:right-2 sm:rtl:right-6 lg:rtl:right-12 shadow-lg"
      >
        <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-2 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 rtl:right-auto rtl:left-2 sm:rtl:left-6 lg:rtl:left-12 shadow-lg"
      >
        <ChevronRight className="w-6 h-6 rtl:rotate-180" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {currentBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
