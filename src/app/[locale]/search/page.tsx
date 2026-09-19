"use client";

import { useState } from "react";
import { Search, Gamepad2, Sparkles, Smartphone, Monitor, CreditCard } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const ALL_GAMES = [
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    category: "Mobile",
    description: "Recharge UC Rapide & Sécurisée",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600",
    badge: "Populaire",
    popular: true,
  },
  {
    id: "free-fire",
    name: "Free Fire",
    category: "Mobile",
    description: "Diamants Free Fire livraison instantanée",
    image: "https://images.unsplash.com/photo-1538481199005-c710c4e965fc?q=80&w=600",
    badge: "Promo +10%",
    popular: true,
  },
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    category: "Mobile",
    description: "Recharge Diamonds MLBB avec ID Joueur",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600",
    badge: "Top Vente",
    popular: true,
  },
  {
    id: "valorant",
    name: "Valorant",
    category: "PC",
    description: "Points Valorant VP pour skins et passes",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600",
    popular: false,
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    category: "PC/Mobile",
    description: "Cristaux Primaires et Faveur de l'Astre de la Nuit",
    image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600",
    popular: false,
  },
  {
    id: "roblox",
    name: "Roblox",
    category: "Cartes",
    description: "Cartes cadeaux Robux & Abonnements",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600",
    popular: false,
  },
];

const CATEGORIES = [
  { id: "all", label: "Tous les jeux", icon: Gamepad2 },
  { id: "Mobile", label: "Jeux Mobile", icon: Smartphone },
  { id: "PC", label: "Jeux PC", icon: Monitor },
  { id: "Cartes", label: "Cartes Cadeaux", icon: CreditCard },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGames = ALL_GAMES.filter((game) => {
    const matchesQuery =
      game.name.toLowerCase().includes(query.toLowerCase()) ||
      game.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || game.category.includes(selectedCategory);

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-6xl min-h-[80vh]">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Catalogue & Recherche
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Rechercher un Jeu ou une Carte
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Trouvez instantanément vos jeux préférés et rechargez au meilleur prix en Algérie.
        </p>

        {/* Search Input Bar */}
        <div className="relative mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tapez le nom d'un jeu (ex: PUBG, Free Fire, Mobile Legends...)"
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg text-slate-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Results Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Banner Image */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                {game.badge && (
                  <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                    {game.badge}
                  </span>
                )}
                <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                  {game.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <Button
                  asChild
                  className="mt-6 w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
                >
                  <Link href={`/recharge?game=${game.id}`}>
                    Recharger
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md mx-auto">
          <Gamepad2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Aucun jeu trouvé
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Essayez avec un autre mot-clé ou modifiez la catégorie sélectionnée.
          </p>
          <Button
            onClick={() => {
              setQuery("");
              setSelectedCategory("all");
            }}
            variant="outline"
            className="rounded-full text-xs"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
