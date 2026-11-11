"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, CreditCard, Smartphone, Save, RefreshCw, CheckCircle2, ShieldCheck, DollarSign, Wallet, AlertTriangle, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PaymentAccountsSettings, DEFAULT_PAYMENT_SETTINGS } from "@/lib/payment-settings";

const SQL_SETUP_SCRIPT = `-- SCRIPT DE CRÉATION DE LA TABLE site_settings DANS SUPABASE
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read site_settings" ON public.site_settings;
CREATE POLICY "Allow read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write site_settings" ON public.site_settings;
CREATE POLICY "Allow write site_settings" ON public.site_settings FOR ALL USING (true);
`;

export function PaymentAccountsManager() {
  const [settings, setSettings] = useState<PaymentAccountsSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payments")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.tableMissing) {
          setTableMissing(true);
        }
      })
      .catch((err) => console.error("Error loading payment settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setSqlCopied(true);
    toast.success("Script SQL copié dans le presse-papier !");
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Coordonnées de paiement et paramètres de marge enregistrés avec succès !");
        setTableMissing(false);
      } else {
        if (data.tableMissing) {
          setTableMissing(true);
        }
        toast.error(data.error || "Erreur lors de l'enregistrement", { duration: 6000 });
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d1020] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Gestion des Coordonnées de Paiement & Marges
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Live sur le site
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configurez les coordonnées bancaires, Flexy et votre taux de marge net pour tout le site
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm h-10 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Sauvegarde..." : "Enregistrer les Coordonnées"}</span>
        </Button>
      </div>

      {/* Warning banner if site_settings table is missing in Supabase */}
      {tableMissing && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm">
                Action requise : Table Supabase non détectée
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                La table <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-amber-300">site_settings</code> n&apos;est pas encore créée dans votre base de données Supabase.
                Tant qu&apos;elle n&apos;est pas créée, les modifications de coordonnées ne persisteront pas sur Vercel.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copySql}
              className="h-8 px-3 text-xs bg-amber-500/20 border-amber-500/40 text-amber-100 hover:bg-amber-500/30"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              <span>{sqlCopied ? "Script copié !" : "Copier le script SQL"}</span>
            </Button>
            <a
              href="https://supabase.com/dashboard/project/urpgragqoaodncenylmn/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white underline underline-offset-2 ml-2"
            >
              <span>Ouvrir Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. BaridiMob Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>BaridiMob (Algérie Poste)</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Numéro RIP BaridiMob (20 chiffres) :
              </label>
              <input
                type="text"
                value={settings.baridimob.rip}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    baridimob: { ...prev.baridimob, rip: e.target.value },
                  }))
                }
                placeholder="Ex: 00799999000000000012"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Titulaire du compte :
              </label>
              <input
                type="text"
                value={settings.baridimob.holder}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    baridimob: { ...prev.baridimob, holder: e.target.value },
                  }))
                }
                placeholder="Ex: JIN'S STORE"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 2. Compte CCP Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Landmark className="w-4 h-4" />
              <span>Compte CCP</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Numéro CCP :
                </label>
                <input
                  type="text"
                  value={settings.ccp.account}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ccp: { ...prev.ccp, account: e.target.value },
                    }))
                  }
                  placeholder="Ex: 12345678"
                  className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Clé :
                </label>
                <input
                  type="text"
                  value={settings.ccp.cle}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      ccp: { ...prev.ccp, cle: e.target.value },
                    }))
                  }
                  placeholder="99"
                  className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Nom du Titulaire CCP :
              </label>
              <input
                type="text"
                value={settings.ccp.holder}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    ccp: { ...prev.ccp, holder: e.target.value },
                  }))
                }
                placeholder="Ex: JIN'S STORE"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 3. RedotPay & Binance Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>RedotPay / Binance</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                ID Compte RedotPay :
              </label>
              <input
                type="text"
                value={settings.redotpay.id}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    redotpay: { ...prev.redotpay, id: e.target.value },
                  }))
                }
                placeholder="Ex: 123456789"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
              💡 Les paiements RedotPay convertissent automatiquement le montant en USD au taux de 240 DZD.
            </div>
          </div>

          {/* 4. Flexy Configuration Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>Paiement Flexy (Mobilis/Djezzy/Ooredoo)</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Numéro Flexy récepteur :
              </label>
              <input
                type="text"
                value={settings.flexy.phone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    flexy: { ...prev.flexy, phone: e.target.value },
                  }))
                }
                placeholder="Ex: 0550123456"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Taux de majoration Flexy :</span>
                <span className="text-amber-500 font-bold">+{settings.flexy.feePercent}%</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.flexy.feePercent}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      flexy: { ...prev.flexy, feePercent: Number(e.target.value) || 0 },
                    }))
                  }
                  className="w-24 h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400">% de frais ajoutés au panier</span>
              </div>
            </div>
          </div>

          {/* 5. Marge Bénéficiaire & Rentabilité Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Calculateur de Marge & Bénéfice Net (Dashboard)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Taux de marge nette estimé :</span>
                  <span className="text-purple-500 font-bold">+{settings.defaultMarginPercent}%</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.defaultMarginPercent}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        defaultMarginPercent: Number(e.target.value) || 1,
                      }))
                    }
                    className="w-24 h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-xs text-slate-400">% de bénéfice calculé sur les ventes complétées</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center">
                Ce pourcentage est utilisé automatiquement sur le Dashboard pour calculer et afficher votre carte « Bénéfice Net » en dinars algériens (DZD).
              </div>
            </div>
          </div>

          {/* 6. WhatsApp Support Client Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>Numéro WhatsApp Support Client</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Numéro WhatsApp (avec indicatif +213) :
              </label>
              <input
                type="text"
                value={settings.whatsapp || "+213550000000"}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    whatsapp: e.target.value,
                  }))
                }
                placeholder="+213550000000"
                className="w-full h-9 px-3 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
              💬 Ce numéro alimente automatiquement le bouton de chat flottant WhatsApp et la page Contact.
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
