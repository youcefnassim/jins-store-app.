"use client";

import { Star, Info, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  name: string;
  game: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(currentStatus ? "Avis masqué" : "Avis publié avec succès !");
        fetchReviews();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Avis supprimé !");
        fetchReviews();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Avis Clients</h1>
        <p className="text-slate-400 text-sm mt-1">Modérer les avis affichés sur le site (Dynamique)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Note moyenne", value: `${avg.toFixed(1)}/5 ⭐` },
          { label: "Total avis", value: reviews.length },
          { label: "En attente", value: pendingCount },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1020] border border-white/5 rounded-xl p-4 shadow-lg">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm font-medium text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-[#0d1020] border border-white/5 rounded-xl">
            Aucun avis trouvé. Exécutez supabase-reviews.sql !
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={`bg-[#0d1020] border rounded-2xl p-5 transition-all ${review.approved ? 'border-white/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {review.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white">{review.name}</span>
                      <span className="text-slate-400 text-xs ml-2 px-2 py-1 bg-white/5 rounded-full">{review.game || 'Général'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">{review.comment}</p>
                  <p className="text-xs text-slate-500 mt-3">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0">
                  <span className={`flex justify-center w-full sm:w-auto items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${review.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {review.approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {review.approved ? "Publié sur le site" : "En attente de validation"}
                  </span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => handleToggleApproval(review.id, review.approved)}
                      className={`flex-1 sm:flex-none border-white/10 ${review.approved ? 'hover:bg-amber-500/10 hover:text-amber-400 text-slate-300' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}
                    >
                      {review.approved ? 'Masquer' : 'Approuver'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete(review.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
