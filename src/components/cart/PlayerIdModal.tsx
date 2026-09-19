"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";

interface PlayerIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (playerId: string, zoneId?: string) => void;
  gameName?: string;
}

export function PlayerIdModal({ isOpen, onClose, onConfirm, gameName = "Game" }: PlayerIdModalProps) {
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerId.trim()) {
      onConfirm(playerId.trim(), zoneId.trim() || undefined);
      setPlayerId("");
      setZoneId("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0e17] border border-slate-200 dark:border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Entrer l'ID Joueur ({gameName})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="playerId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              ID Joueur (Player ID) *
            </Label>
            <Input
              id="playerId"
              placeholder="Ex: 123456789"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoneId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Zone ID (Optionnel)
            </Label>
            <Input
              id="zoneId"
              placeholder="Ex: 1234"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl flex-1">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!playerId.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex-1"
            >
              Ajouter au panier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
