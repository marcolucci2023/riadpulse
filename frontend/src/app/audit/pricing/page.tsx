"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runPricingAudit, PricingResult } from "@/lib/api";

const CITIES = ["Marrakech", "Fès", "Essaouira", "Chefchaouen", "Tanger", "Rabat"];

export default function PricingAuditPage() {
  const [form, setForm] = useState({
    riad_name: "",
    city: "Marrakech",
    current_price_mad: 600,
    stars: 3,
    num_rooms: 8,
    occupancy_rate: 65,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [error, setError] = useState("");

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runPricingAudit({
        riad_name: form.riad_name,
        city: form.city,
        stars: form.stars,
        current_price_mad: form.current_price_mad,
        num_rooms: form.num_rooms,
        occupancy_rate: form.occupancy_rate / 100,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  function getPositioning(gap: number): { label: string; emoji: string; color: string } {
    if (gap < -10) return { label: "Sous-tarifé", emoji: "🔻", color: "text-red-400" };
    if (gap > 10) return { label: "Sur-tarifé", emoji: "🔺", color: "text-orange-400" };
    return { label: "Bien positionné", emoji: "✅", color: "text-emerald-400" };
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      <Header />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Analyse des <span className="text-[#D4A843]">prix</span>
        </h1>
        <p className="text-white/60">
          Comparez vos tarifs au marché local et découvrez combien vous perdez chaque année.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/audit" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">🌐 Audit site web</Link>
          <span className="px-4 py-2 rounded-lg bg-[#C2452D] text-sm font-bold">🏷️ Analyse prix</span>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nom du riad</label>
              <input type="text" value={form.riad_name} onChange={(e) => updateField("riad_name", e.target.value)} placeholder="Riad Dar Zen" required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Ville</label>
              <select value={form.city} onChange={(e) => updateField("city", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition">
                {CITIES.map((c) => <option key={c} value={c} className="bg-[#1B2A4A]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Prix moyen / nuit (MAD)</label>
              <input type="number" value={form.current_price_mad} onChange={(e) => updateField("current_price_mad", parseInt(e.target.value) || 0)} min={50} required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Catégorie (étoiles)</label>
              <select value={form.stars} onChange={(e) => updateField("stars", parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition">
                <option value={3} className="bg-[#1B2A4A]">⭐⭐⭐ 3 étoiles</option>
                <option value={4} className="bg-[#1B2A4A]">⭐⭐⭐⭐ 4 étoiles</option>
                <option value={5} className="bg-[#1B2A4A]">⭐⭐⭐⭐⭐ 5 étoiles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre de chambres</label>
              <input type="number" value={form.num_rooms} onChange={(e) => updateField("num_rooms", parseInt(e.target.value) || 1)} min={1} max={50} required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Taux d&apos;occupation (%)</label>
              <input type="number" value={form.occupancy_rate} onChange={(e) => updateField("occupancy_rate", parseInt(e.target.value) || 50)} min={10} max={100} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 transition font-bold text-lg">
            {loading ? "Analyse en cours..." : "Analyser mes prix"}
          </button>
        </form>
      </section>

      {error && (
        <section className="max-w-2xl mx-auto px-6 pb-8">
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-4 text-red-300">❌ {error}</div>
        </section>
      )}

      {result && (
        <section className="max-w-3xl mx-auto px-6 pb-20">
          {/* Positionnement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center">
            {(() => {
              const pos = getPositioning(result.price_gap_percent);
              return (
                <div className="mb-4">
                  <span className={`text-2xl font-bold ${pos.color}`}>
                    {pos.emoji} {pos.label}
                  </span>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#D4A843]">
                  {result.current_price_mad} MAD
                </div>
                <div className="text-white/50 text-xs">Votre prix / nuit</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  {result.benchmark_price_mad} MAD
                </div>
                <div className="text-white/50 text-xs">
                  Benchmark {result.city} {result.stars}⭐
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className={`text-2xl font-bold ${result.price_gap_percent < 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {result.price_gap_percent > 0 ? "+" : ""}{result.price_gap_percent}%
                </div>
                <div className="text-white/50 text-xs">Écart vs marché</div>
              </div>
            </div>
          </div>

          {/* Barre de comparaison */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4">
              📊 Positionnement vs {result.city} ({result.stars}⭐)
            </h3>
            <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-emerald-500/30 rounded-full"
                style={{ left: "20%", width: "60%" }}
              />
              <div
                className="absolute h-full w-1 bg-[#D4A843]"
                style={{
                  left: `${Math.min(Math.max(((result.current_price_mad / (result.benchmark_price_mad * 1.5)) * 100), 2), 98)}%`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#D4A843] font-bold whitespace-nowrap">
                  Vous
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>Bas de marché</span>
              <span>{result.benchmark_price_mad} MAD (benchmark)</span>
              <span>Haut de marché</span>
            </div>
          </div>

          {/* Impact financier */}
          {result.annual_loss_mad > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 mb-6 text-center">
              <h3 className="text-lg font-bold mb-2 text-red-300">💸 Manque à gagner estimé</h3>
              <div className="text-4xl font-bold text-red-400 mb-1">
                {result.annual_loss_mad.toLocaleString("fr-FR")} MAD
              </div>
              <div className="text-white/50">
                ≈ {result.annual_loss_eur.toLocaleString("fr-FR")} € / an
              </div>
              <p className="text-white/40 text-sm mt-3">
                Basé sur {result.num_rooms} chambres × {Math.round(result.occupancy_rate * 100)}% d&apos;occupation × 365 jours
              </p>
            </div>
          )}

          {/* Recommandations */}
          {result.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">🎯 Recommandations</h3>
              {result.recommendations.map((r, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{r.title}</h4>
                    {r.impact_mad > 0 && (
                      <span className="text-sm font-bold text-emerald-400 whitespace-nowrap ml-4">
                        +{r.impact_mad.toLocaleString("fr-FR")} MAD/an
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{r.detail}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                    r.difficulty === "facile" ? "bg-emerald-900/50 text-emerald-300" :
                    r.difficulty === "moyenne" ? "bg-yellow-900/50 text-yellow-300" :
                    "bg-red-900/50 text-red-300"
                  }`}>
                    {r.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}