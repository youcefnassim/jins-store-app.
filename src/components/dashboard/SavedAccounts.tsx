"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface SavedAccount {
  id: string;
  game: string;
  player_id: string;
  player_name: string | null;
}

export function SavedAccounts({ userId }: { userId: string }) {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newGame, setNewGame] = useState("PUBG Mobile");
  const [newPlayerId, setNewPlayerId] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

  const gamesList = ["PUBG Mobile", "Free Fire", "Mobile Legends", "Valorant", "Genshin Impact"];

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerId) return toast.error("Player ID is required");

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("saved_accounts")
        .insert({
          user_id: userId,
          game: newGame,
          player_id: newPlayerId,
          player_name: newPlayerName || null,
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts([data, ...accounts]);
      toast.success("Account saved successfully!");
      setNewPlayerId("");
      setNewPlayerName("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save account");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from("saved_accounts").delete().eq("id", id);
      if (error) throw error;
      
      setAccounts(accounts.filter(a => a.id !== id));
      toast.success("Account deleted");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete account");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="glass-card border-black/10 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Saved Accounts
        </CardTitle>
        <CardDescription>
          Save your Player IDs to recharge faster next time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add New Account Form */}
        <form onSubmit={handleAddAccount} className="bg-black/5 dark:bg-black/40 p-4 rounded-xl border border-black/5 dark:border-white/5 mb-6">
          <h4 className="font-semibold text-sm mb-3">Add New Account</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={newGame} 
              onChange={(e) => setNewGame(e.target.value)}
              className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black/20"
            >
              {gamesList.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
            <Input 
              placeholder="Player ID (e.g. 51234567)" 
              value={newPlayerId}
              onChange={(e) => setNewPlayerId(e.target.value)}
              className="dark:bg-black/20"
            />
            <Input 
              placeholder="Nickname (Optional)" 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="dark:bg-black/20"
            />
            <Button type="submit" disabled={adding} className="shrink-0 bg-primary hover:bg-primary/90">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </form>

        {/* List of Saved Accounts */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-black/5 dark:bg-white/5 rounded-xl">
              No saved accounts yet. Add one above!
            </div>
          ) : (
            accounts.map((acc, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={acc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{acc.game}</span>
                    {acc.player_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        {acc.player_name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground mt-1">ID: {acc.player_id}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(acc.id)}
                  disabled={deleting === acc.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  {deleting === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
