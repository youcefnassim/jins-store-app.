"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
  Coins,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface CheckResult {
  valid: boolean;
  nickname: string;
  region?: string;
  game: string;
  playerId: string;
  zoneId?: string;
  doubleDiamondAvailable?: boolean;
}

export default function CheckIdPage() {
  const t = useTranslations("CheckId");
  const [selectedGame, setSelectedGame] = useState<"mobile-legends" | "free-fire" | "pubg-mobile">("mobile-legends");
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim()) return;
    if (selectedGame === "mobile-legends" && !zoneId.trim()) {
      setError(t("zone_required_error"));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: selectedGame,
          playerId: playerId.trim(),
          zoneId: zoneId.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || t("unable_to_verify_error"));
      }
    } catch {
      setError(t("connection_error"));
    } finally {
      setLoading(false);
    }
  };

  const doubleDiamondOffers = [
    { label: "50 + 50 Diamants", available: true },
    { label: "150 + 150 Diamants", available: true },
    { label: "250 + 250 Diamants", available: true },
    { label: "500 + 500 Diamants", available: true },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Checker Card */}
        <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Game Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setSelectedGame("mobile-legends"); setResult(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedGame === "mobile-legends"
                  ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              MLBB
            </button>
            <button
              type="button"
              onClick={() => { setSelectedGame("free-fire"); setResult(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedGame === "free-fire"
                  ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              Free Fire
            </button>
            <button
              type="button"
              onClick={() => { setSelectedGame("pubg-mobile"); setResult(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedGame === "pubg-mobile"
                  ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-white"
              }`}
            >
              PUBG Mobile
            </button>
          </div>

          <form onSubmit={handleCheck} className="space-y-5">
            <div className={`grid gap-4 ${selectedGame === "mobile-legends" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
              <div className={selectedGame === "mobile-legends" ? "sm:col-span-2" : ""}>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {selectedGame === "mobile-legends" ? t("user_id") : t("player_id_uid")}
                </label>
                <Input
                  required
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="Ex: 84033300"
                  className="h-12 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              {selectedGame === "mobile-legends" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                    {t("zone_server")}
                  </label>
                  <Input
                    required
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="Ex: 2163"
                    className="h-12 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 animate-spin" />
                  {t("checking_btn")}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {t("check_btn")}
                </>
              )}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 space-y-4"
              >
                {/* Account details */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("nickname_label")}</span>
                    <span className="text-base font-extrabold text-primary font-mono">{result.nickname}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("region_label")}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{result.region || "Global"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t("account_status_label")}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t("valid_account")}
                    </span>
                  </div>
                </div>

                {/* Double Diamond status for MLBB (like Meyan Shop) */}
                {selectedGame === "mobile-legends" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {t("double_diamond_title")}
                    </div>
                    <div className="space-y-2">
                      {doubleDiamondOffers.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            {t("available")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action button */}
                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Link href={`/recharge?game=${selectedGame}&playerId=${result.playerId}${result.zoneId ? `&zoneId=${result.zoneId}` : ""}`}>
                    {t("recharge_now_btn")}
                    <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
