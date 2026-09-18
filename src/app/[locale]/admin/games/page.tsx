"use client";

import { Gamepad2, Info } from "lucide-react";

const games = [
  { name: "Mobile Legends: Bang Bang", slug: "mobile-legends", emoji: "💎", packages: [
    { label: "86 Diamants", price: 190 }, { label: "172 Diamants", price: 370 },
    { label: "344 Diamants", price: 720 }, { label: "514 Diamants", price: 1050 },
    { label: "706 Diamants", price: 1420 }, { label: "1060 Diamants", price: 2120 },
  ]},
  { name: "Free Fire", slug: "free-fire", emoji: "🔥", packages: [
    { label: "140 Diamonds", price: 200 }, { label: "355 Diamonds", price: 480 },
    { label: "530 Diamonds", price: 700 }, { label: "1080 Diamonds", price: 1380 },
    { label: "2200 Diamonds", price: 2700 },
  ]},
  { name: "PUBG Mobile", slug: "pubg-mobile", emoji: "🎯", packages: [
    { label: "60 UC", price: 120 }, { label: "325 UC", price: 600 },
    { label: "660 UC", price: 1180 }, { label: "1800 UC", price: 3100 },
  ]},
  { name: "Valorant", slug: "valorant", emoji: "⚡", packages: [
    { label: "475 VP", price: 450 }, { label: "1000 VP", price: 900 },
    { label: "2050 VP", price: 1800 }, { label: "3650 VP", price: 3150 },
  ]},
];

export default function AdminGamesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jeux & Packs</h1>
          <p className="text-slate-400 text-sm mt-1">Catalogue des jeux et prix actuels</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>Les prix sont actuellement codés en dur dans le code source. La gestion dynamique des prix via cette interface sera disponible dans une prochaine version (nécessite une table `games` dans Supabase).</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map(game => (
          <div key={game.slug} className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <span className="text-2xl">{game.emoji}</span>
              <div>
                <h3 className="font-bold text-white">{game.name}</h3>
                <p className="text-xs text-slate-400">{game.packages.length} packs disponibles</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {game.packages.map(pkg => (
                <div key={pkg.label} className="flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 rounded-xl transition-colors">
                  <span className="text-sm text-slate-300">{pkg.label}</span>
                  <span className="text-sm font-bold text-primary">{pkg.price} DA</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
