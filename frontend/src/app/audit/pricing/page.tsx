"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runPricingAudit, PricingAuditResponse } from "@/lib/api";

const CITIES = [
  "Marrakech",
  "Fès",
  "Essaouira",
  "Chefchaouen",
  "Tanger",
  "Rabat",
];

function PositioningBadge({ positioning }: { positioning: string }) {
  const config: Record<string, { label: string; color: string; emoji: string }> = {
    underpriced: {
      label: "Sous-tarifé",
      color: "bg-red-500/20 border-red-500/40 text-red-300",
      emoji: "🔻",
    },
    well_positioned: {
      label: "Bien positionné",
      color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      emoji: "✅",
    },
    overpriced: {
      label: "Sur-tarifé",
      color: "bg-orange-500/20 border-orange-500/40 text-orange-300",
      emoji: "🔺",
    },
    unknown: {
      label: "Non déterminé",
      color: "bg-gray-500/20 border-gray-500/40 text-gray-300",
      emoji: "❓",
    },
  };

  const c = config[positioning] || config["unknown"];

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${c.color}`}>
      {c.emoji} {c.label}
    </span>
  );
}

export default function PricingAuditPage() {
  const [form, setForm] = useState({
    riad_name: "",
    city: "Marrakech",
    my_price_per_night: 600,
    stars: 3,
    num_rooms: 8,
    occupancy_rate: 65,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingAuditResponse | null>(null);
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
      const data = await runPricingAudit(form);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      <Header />

      {/* Titre */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Analyse des <span className="text-[#D4A843]">prix</span>
        </h1>
        <p className="text-white/60">
          Comparez vos tarifs au marché local et découvrez combien vous perdez
          chaque année.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/audit"
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
          >
            🌐 Audit site web
          </Link>
          <span className="px-4 py-2 rounded-lg bg-[#C2452D] text-sm font-bold">
            🏷️ Analyse prix
          </span>
        </div>
      </section>

      {/* Formulaire */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Nom du riad
              </label>
              <input
                type="text"
                value={form.riad_name}
                onChange={(e) => updateField("riad_name", e.target.value)}
                placeholder="Riad Dar Zen"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Ville
              </label>
              <select
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#1B2A4A]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Prix moyen / nuit (MAD)
              </label>
              <input
                type="number"
                value={form.my_price_per_night}
                onChange={(e) =>
                  updateField("my_price_per_night", parseInt(e.target.value) || 0)
                }
                min={50}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Catégorie (étoiles)
              </label>
              <select
                value={form.stars}
                onChange={(e) => updateField("stars", parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition"
              >
                <option value={3} className="bg-[#1B2A4A]">
                  ⭐⭐⭐ 3 étoiles
                </option>
                <option value={4} className="bg-[#1B2A4A]">
                  ⭐⭐⭐⭐ 4 étoiles
                </option>
                <option value={5} className="bg-[#1B2A4A]">
                  ⭐⭐⭐⭐⭐ 5 étoiles
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Nombre de chambres
              </label>
              <input
                type="number"
                value={form.num_rooms}
                onChange={(e) =>
                  updateField("num_rooms", parseInt(e.target.value) || 1)
                }
                min={1}
                max={50}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Taux d&apos;occupation (%)
              </label>
              <input
                type="number"
                value={form.occupancy_rate}
                onChange={(e) =>
                  updateField("occupancy_rate", parseInt(e.target.value) || 50)
                }
                min={10}
                max={100}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 transition font-bold text-lg"
          >
            {loading ? "Analyse en cours..." : "Analyser mes prix"}
          </button>
        </form>
      </section>

      {/* Erreur */}
      {error && (
        <section className="max-w-2xl mx-auto px-6 pb-8">
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-4 text-red-300">
            ❌ {error}
          </div>
        </section>
      )}

      {/* Résultat */}
      {result && (
        <section className="max-w-3xl mx-auto px-6 pb-20">
          {/* Positionnement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center">
            <div className="mb-4">
              <PositioningBadge positioning={result.positioning} />
            </div>
            <p className="text-white/70 text-lg mb-6">
              {result.positioning_detail}
            </p>

            {/* Chiffres clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#D4A843]">
                  {result.my_price} MAD
                </div>
                <div className="text-white/50 text-xs">Votre prix</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  {result.benchmark.median_price} MAD
                </div>
                <div className="text-white/50 text-xs">
                  Médiane {result.benchmark.city} {result.benchmark.stars}⭐
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#C2452D]">
                  {result.gap_percent}%
                </div>
                <div className="text-white/50 text-xs">
                  Écart vs marché ({result.gap_mad_per_night} MAD/nuit)
                </div>
              </div>
            </div>
          </div>

          {/* Impact financier */}
          {result.estimated_annual_loss_mad > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 mb-6 text-center">
              <h3 className="text-lg font-bold mb-2 text-red-300">
                💸 Manque à gagner estimé
              </h3>
              <div className="text-4xl font-bold text-red-400 mb-1">
                {result.estimated_annual_loss_mad.toLocaleString()} MAD
              </div>
              <div className="text-white/50">
                ≈ {result.estimated_annual_loss_eur.toLocaleString()} € / an
              </div>
              <p className="text-white/40 text-sm mt-3">
                Basé sur {form.num_rooms} chambres × {form.occupancy_rate}%
                d&apos;occupation × 365 jours
              </p>
            </div>
          )}

          {/* Fourchette du marché */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4">
              📊 Fourchette de prix à {result.benchmark.city} (
              {result.benchmark.stars}⭐)
            </h3>
            <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
              {/* Zone marché */}
              <div
                className="absolute h-full bg-emerald-500/30 rounded-full"
                style={{
                  left: `${(result.benchmark.low_price / (result.benchmark.high_price * 1.3)) * 100}%`,
                  width: `${((result.benchmark.high_price - result.benchmark.low_price) / (result.benchmark.high_price * 1.3)) * 100}%`,
                }}
              />
              {/* Position utilisateur */}
              <div
                className="absolute h-full w-1 bg-[#D4A843]"
                style={{
                  left: `${Math.min((result.my_price / (result.benchmark.high_price * 1.3)) * 100, 98)}%`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#D4A843] font-bold whitespace-nowrap">
                  Vous
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>{result.benchmark.low_price} MAD</span>
              <span>{result.benchmark.median_price} MAD (médiane)</span>
              <span>{result.benchmark.high_price} MAD</span>
            </div>
            <p className="text-white/30 text-xs mt-3">
              Source : {result.benchmark.source}
            </p>
          </div>

          {/* Recommandations */}
          {result.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">🎯 Recommandations</h3>
              {result.recommendations.map((r, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{r.title}</h4>
                    {r.impact_mad > 0 && (
                      <span className="text-sm font-bold text-emerald-400 whitespace-nowrap ml-4">
                        +{r.impact_mad.toLocaleString()} MAD/an
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{r.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
