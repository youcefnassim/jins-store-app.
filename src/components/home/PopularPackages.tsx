"use client";

import { packages } from "@/lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import Tilt from "react-parallax-tilt";

export function PopularPackages() {
  const popularPackages = packages.filter(p => p.gameId === "mobile-legends" && p.active).slice(0, 4);

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              Popular Diamond Packages
            </h2>
            <p className="text-muted-foreground text-lg">
              Get the best value on MLBB Diamonds. Delivered fast after payment verification.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 border-white/10 hover:bg-white/5">
            <Link href="/recharge">View All Packages</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularPackages.map((pkg) => (
            <Tilt 
              key={pkg.id} 
              tiltMaxAngleX={5} 
              tiltMaxAngleY={5} 
              scale={1.02} 
              transitionSpeed={2000} 
              glareEnable={true} 
              glareMaxOpacity={0.2} 
              glareColor="#ffffff"
              glarePosition="all"
              className="h-full"
            >
              <Card className="glass-card h-full flex flex-col relative overflow-hidden group">
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-primary to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-8 rotate-45 translate-x-[26px] translate-y-[12px] shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                      Popular
                    </div>
                  </div>
                )}
                <CardHeader className="pb-4 pt-8 items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-500 border border-cyan-500/30">
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-500 rotate-45 rounded-sm shadow-[0_0_25px_rgba(34,211,238,0.8)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{pkg.amount}</h3>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                    Diamonds
                  </p>
                </CardHeader>
                <CardContent className="text-center pb-6 flex-grow flex items-end justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{pkg.price}</span>
                    <span className="text-muted-foreground font-medium">{siteConfig.currency}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild className="w-full bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all relative z-10 border-none font-bold">
                    <Link href={`/recharge?package=${pkg.id}`}>Recharge Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
