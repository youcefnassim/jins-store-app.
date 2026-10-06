"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  color: string;
  sort_order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: "",
    description: "",
    image: "",
    link: "",
    color: "from-blue-500/80 to-purple-600/80",
    sort_order: 0
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (res.ok) {
        if (data.table_missing) {
          setTableMissing(true);
        } else {
          setBanners(data.banners);
          setTableMissing(false);
        }
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      image: "",
      link: "/recharge",
      color: "from-blue-500/80 to-purple-600/80",
      sort_order: banners.length
    });
    setIsOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setIsEditing(true);
    setFormData(banner);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = "/api/admin/banners";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(isEditing ? "Bannière modifiée" : "Bannière ajoutée");
        setIsOpen(false);
        fetchBanners();
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette bannière ?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Bannière supprimée");
        fetchBanners();
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tableMissing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bannières (Hero Carousel)</h1>
          <p className="text-slate-400 mt-1">Gérez les affiches principales de l'accueil.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 max-w-2xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Info className="w-5 h-5" />
            Base de données incomplète
          </h3>
          <p className="mb-4">La table <strong>banners</strong> n'existe pas dans Supabase. Veuillez exécuter cette requête SQL dans l'éditeur SQL de votre projet Supabase :</p>
          <pre className="bg-black/50 p-4 rounded-xl text-sm overflow-x-auto text-emerald-400 select-all">
{`CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  link TEXT NOT NULL,
  color TEXT DEFAULT 'from-blue-500/80 to-purple-600/80',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);`}
          </pre>
          <Button onClick={fetchBanners} className="mt-6 bg-white/10 hover:bg-white/20 text-white">J'ai exécuté le script, réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bannières d'Accueil</h1>
          <p className="text-slate-400 mt-1">Personnalisez le carrousel de la page principale</p>
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une Bannière
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden group flex flex-col">
            <div className="relative h-40 bg-black">
              {banner.image ? (
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5"><ImageIcon className="w-8 h-8 text-white/20" /></div>
              )}
              <div className={\`absolute inset-0 bg-gradient-to-r \${banner.color} mix-blend-multiply opacity-50\`} />
              
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => openEditModal(banner)} className="p-2 bg-black/50 hover:bg-blue-500 text-white rounded-lg backdrop-blur-sm transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 bg-black/50 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1">{banner.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{banner.description}</p>
              
              <div className="mt-auto flex justify-between text-xs text-slate-500 font-medium">
                <span className="truncate flex-1 pr-2">Lien: {banner.link}</span>
                <span>Ordre: {banner.sort_order}</span>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl text-slate-400">
            Aucune bannière pour le moment.
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0a0c14] border border-white/10 text-white sm:max-w-[600px] rounded-3xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">{isEditing ? "Modifier la bannière" : "Ajouter une bannière"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Titre principal</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black/20 border-white/5 text-white" />
              </div>
              
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Description</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-black/20 border-white/5 text-white" />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Image URL (unsplash ou imgur)</label>
                <Input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="bg-black/20 border-white/5 text-white" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Lien du bouton (ex: /recharge)</label>
                <Input required value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="bg-black/20 border-white/5 text-white" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Ordre d'affichage (0 = premier)</label>
                <Input type="number" required value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="bg-black/20 border-white/5 text-white" />
              </div>
              
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Dégradé de couleur (Tailwind CSS)</label>
                <select 
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  className="w-full h-10 rounded-md bg-black/20 border border-white/5 text-sm px-3 outline-none text-white focus:ring-1 focus:ring-primary"
                >
                  <option value="from-blue-500/80 to-cyan-400/80">Bleu à Cyan</option>
                  <option value="from-amber-500/80 to-orange-600/80">Orange (ex: PUBG)</option>
                  <option value="from-rose-500/80 to-red-600/80">Rouge (ex: Free Fire)</option>
                  <option value="from-indigo-500/80 to-purple-600/80">Violet</option>
                  <option value="from-emerald-500/80 to-teal-400/80">Vert</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full mt-4 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-12 text-lg">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {isEditing ? "Enregistrer les modifications" : "Ajouter la bannière"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
