"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Shield, User, Star, Crown } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  points: number;
  created_at: string;
}

const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
  admin: { label: "Admin", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Shield },
  user: { label: "Utilisateur", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: User },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      toast.success("Rôle mis à jour !");
      fetchUsers();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filtered = users.filter(u =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} comptes enregistrés</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: users.length, icon: User, color: "from-blue-500 to-blue-700" },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "from-red-500 to-red-700" },
          { label: "Meilleurs (>100 pts)", value: users.filter(u => (u.points ?? 0) > 100).length, icon: Crown, color: "from-amber-500 to-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1020] border border-white/5 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Users table */}
      <div className="bg-[#0d1020] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr className="text-xs text-slate-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Utilisateur</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Points</th>
                  <th className="px-5 py-3 text-left">Rôle</th>
                  <th className="px-5 py-3 text-left">Inscrit le</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(user => {
                  const role = roleConfig[user.role] ?? roleConfig.user;
                  return (
                    <tr key={user.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {user.username?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="font-semibold text-white">{user.username ?? "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3" /> {user.points ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.color}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString('fr')}</td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-primary/50 cursor-pointer"
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
