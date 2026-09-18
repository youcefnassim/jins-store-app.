"use client";

import { Star, Info, CheckCircle2, XCircle } from "lucide-react";

const demoReviews = [
  { id: 1, name: "Yanis B.", game: "Mobile Legends", rating: 5, comment: "Service rapide et fiable ! Livraison en moins de 2 minutes.", approved: true, date: "2026-09-15" },
  { id: 2, name: "Amina K.", game: "Free Fire", rating: 5, comment: "Le meilleur site de recharge en Algérie, je recommande !", approved: true, date: "2026-09-14" },
  { id: 3, name: "Rami M.", game: "PUBG Mobile", rating: 4, comment: "Très bon service, les prix sont corrects.", approved: false, date: "2026-09-16" },
  { id: 4, name: "Sami H.", game: "Valorant", rating: 5, comment: "Parfait ! J'utilise ce site depuis 6 mois.", approved: true, date: "2026-09-12" },
];

export default function AdminReviewsPage() {
  const avg = demoReviews.reduce((s, r) => s + r.rating, 0) / demoReviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Avis Clients</h1>
        <p className="text-slate-400 text-sm mt-1">Modérer les avis affichés sur le site</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>Ces avis sont des exemples. L'intégration complète nécessite une table `reviews` dans Supabase et un formulaire public pour que les clients puissent laisser un avis.</div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Note moyenne", value: `${avg.toFixed(1)}/5 ⭐` },
          { label: "Total avis", value: demoReviews.length },
          { label: "En attente", value: demoReviews.filter(r => !r.approved).length },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1020] border border-white/5 rounded-xl p-4">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {demoReviews.map(review => (
          <div key={review.id} className={`bg-[#0d1020] border rounded-xl p-5 ${review.approved ? 'border-white/5' : 'border-amber-500/20'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {review.name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm">{review.name}</span>
                    <span className="text-slate-400 text-xs ml-2">• {review.game}</span>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-300">{review.comment}</p>
                <p className="text-xs text-slate-500 mt-2">{review.date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${review.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {review.approved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {review.approved ? "Publié" : "En attente"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
