"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runCommissionsAudit, CommissionsAuditResponse } from "@/lib/api";

const CITIES = ["Marrakech", "Fès", "Essaouira", "Chefchaouen", "Tanger", "Rabat"];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, string> = {
    facile: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    moyenne: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    difficile: "bg-red-500/20 text-red-300 border-red-500/40",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${config[difficulty] || config["moyenne"]}`}>
      {difficulty.toUpperCase()}
    </span>
  );
}

export default function CommissionsAuditPage() {
  const [form, setForm] = useState({
    riad_name: "",
    city: "Marrakech",
    annual_revenue_mad: 800000,
    booking_percent: 60,
    airbnb_percent: 15,
    expedia_percent: 5,
    direct_percent: 20,
    avg_night_price_mad: 700,
    num_rooms: 8,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommissionsAuditResponse | null>(null);
  const [error, setError] = useState("");

  function update(field: string, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-ajuster le direct_percent pour que le total = 100%
      if (["booking_percent", "airbnb_percent", "expedia_percent"].includes(field)) {
        const otaTotal = next.booking_percent + next.airbnb_percent + next.expedia_percent;
        next.direct_percent = Math.max(0, 100 - otaTotal);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runCommissionsAudit(form);
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

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Pertes en <span className="text-[#C2452D]">commissions</span>
        </h1>
        <p className="text-white/60">
          Découvrez exactement combien vous payez à Booking, Airbnb et Expedia chaque année.
        </p>
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <Link href="/audit" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">🌐 Site web</Link>
          <Link href="/audit/pricing" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">🏷️ Prix</Link>
          <Link href="/audit/reputation" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">⭐ Réputation</Link>
          <span className="px-4 py-2 rounded-lg bg-[#C2452D] text-sm font-bold">💸 Commissions</span>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-8">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nom du riad</label>
              <input type="text" value={form.riad_name} onChange={(e) => update("riad_name", e.target.value)} placeholder="Riad Dar Zen" required className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Ville</label>
              <select value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition">
                {CITIES.map((c) => <option key={c} value={c} className="bg-[#1B2A4A]">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">CA annuel (MAD)</label>
              <input type="number" min="0" value={form.annual_revenue_mad} onChange={(e) => update("annual_revenue_mad", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Prix moyen / nuit (MAD)</label>
              <input type="number" min="50" value={form.avg_night_price_mad} onChange={(e) => update("avg_night_price_mad", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre de chambres</label>
              <input type="number" min="1" max="50" value={form.num_rooms} onChange={(e) => update("num_rooms", parseInt(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#D4A843] pt-2">📊 Répartition des réservations (%)</h3>
          <p className="text-white/40 text-sm">Le total doit faire 100%. Le &quot;Direct&quot; s&apos;ajuste automatiquement.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#003580] mb-2">Booking.com</label>
              <input type="number" min="0" max="100" value={form.booking_percent} onChange={(e) => update("booking_percent", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#003580] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FF5A5F] mb-2">Airbnb</label>
              <input type="number" min="0" max="100" value={form.airbnb_percent} onChange={(e) => update("airbnb_percent", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#FF5A5F] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FFC800] mb-2">Expedia</label>
              <input type="number" min="0" max="100" value={form.expedia_percent} onChange={(e) => update("expedia_percent", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#FFC800] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-400 mb-2">Direct (site, WhatsApp)</label>
              <input type="number" value={form.direct_percent} readOnly className="w-full px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 font-bold cursor-not-allowed" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 transition font-bold text-lg">
            {loading ? "Calcul en cours..." : "Calculer mes commissions"}
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
          {/* Choc : le chiffre qui fait mal */}
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 mb-6 text-center">
            <p className="text-white/60 text-sm mb-2">Chaque année, vous payez aux plateformes :</p>
            <div className="text-5xl md:text-6xl font-bold text-red-400 mb-2">
              {result.total_commission_mad.toLocaleString()} MAD
            </div>
            <div className="text-2xl text-red-300/70">
              ≈ {result.total_commission_eur.toLocaleString()} €
            </div>
            <p className="text-white/40 text-sm mt-3">
              Soit {result.commission_percent}% de votre chiffre d&apos;affaires ({result.annual_revenue_mad.toLocaleString()} MAD)
            </p>
          </div>

          {/* Détail par plateforme */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xl font-bold">📊 Détail par plateforme</h3>
            {result.platforms.map((p) => (
              <div key={p.name} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <span className="text-sm text-white/50">{p.commission_rate}% de commission</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white/80">{p.revenue_mad.toLocaleString()}</div>
                    <div className="text-xs text-white/40">CA via {p.name}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-400">{p.commission_mad.toLocaleString()}</div>
                    <div className="text-xs text-white/40">Commission MAD</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-300">{p.commission_eur.toLocaleString()}</div>
                    <div className="text-xs text-white/40">Commission €</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Direct */}
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="font-bold text-emerald-300">Réservations directes</span>
                </div>
                <span className="text-sm text-emerald-400">0% de commission 🎉</span>
              </div>
              <div className="text-center mt-3">
                <div className="text-lg font-bold text-emerald-300">{result.direct_revenue_mad.toLocaleString()} MAD</div>
                <div className="text-xs text-white/40">CA en direct (site, WhatsApp, téléphone)</div>
              </div>
            </div>
          </div>

          {/* Coût par réservation */}
          {result.cost_per_booking_mad > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-center">
              <p className="text-white/50 text-sm mb-1">Chaque réservation Booking vous coûte en moyenne</p>
              <div className="text-3xl font-bold text-[#D4A843]">{result.cost_per_booking_mad.toLocaleString()} MAD</div>
              <p className="text-white/30 text-xs mt-1">en commission pure</p>
            </div>
          )}

          {/* Potentiel d'économie */}
          {result.potential_saving_mad > 0 && (
            <div className="bg-emerald-900/20 border-2 border-emerald-500/40 rounded-2xl p-8 mb-6 text-center">
              <h3 className="text-lg font-bold text-emerald-300 mb-2">💰 Potentiel d&apos;économie</h3>
              <p className="text-white/60 text-sm mb-4">
                En passant de {100 - form.direct_percent}% à {100 - result.potential_direct_percent}% de réservations OTA
              </p>
              <div className="text-4xl font-bold text-emerald-400 mb-1">
                +{result.potential_saving_mad.toLocaleString()} MAD/an
              </div>
              <div className="text-xl text-emerald-300/70">
                ≈ +{result.potential_saving_eur.toLocaleString()} € / an
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">🎯 Comment réduire ces commissions</h3>
            {result.recommendations.map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{r.title}</h4>
                    <DifficultyBadge difficulty={r.difficulty} />
                  </div>
                  {r.saving_mad > 0 && (
                    <span className="text-sm font-bold text-emerald-400 whitespace-nowrap ml-4">
                      +{r.saving_mad.toLocaleString()} MAD
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm">{r.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
