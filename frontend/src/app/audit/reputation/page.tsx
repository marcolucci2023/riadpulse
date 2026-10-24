"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runReputationAudit, ReputationAuditResponse } from "@/lib/api";

const CITIES = ["Marrakech", "Fès", "Essaouira", "Chefchaouen", "Tanger", "Rabat"];

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-green-500 text-white",
    C: "bg-yellow-500 text-black",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  };
  return (
    <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl font-bold ${colors[grade] || colors["F"]}`}>
      {grade}
    </span>
  );
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    urgente: "bg-red-500/20 text-red-300 border-red-500/40",
    haute: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    basse: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${config[priority] || config["haute"]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

export default function ReputationAuditPage() {
  const [form, setForm] = useState({
    riad_name: "",
    city: "Marrakech",
    booking_score: 8.0,
    booking_reviews: 50,
    tripadvisor_score: 4.0,
    tripadvisor_reviews: 30,
    google_score: 4.2,
    google_reviews: 20,
    response_rate: 50,
    negative_reviews_last_6m: 2,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReputationAuditResponse | null>(null);
  const [error, setError] = useState("");

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runReputationAudit(form);
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
          Audit <span className="text-[#D4A843]">réputation</span>
        </h1>
        <p className="text-white/60">
          Analysez vos notes et avis sur Booking, TripAdvisor et Google Maps.
        </p>
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <Link href="/audit" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">🌐 Site web</Link>
          <Link href="/audit/pricing" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm">🏷️ Prix</Link>
          <span className="px-4 py-2 rounded-lg bg-[#C2452D] text-sm font-bold">⭐ Réputation</span>
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

          <h3 className="text-lg font-bold text-[#D4A843] pt-2">📋 Booking.com</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Note Booking (/10)</label>
              <input type="number" step="0.1" min="0" max="10" value={form.booking_score} onChange={(e) => update("booking_score", parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre d&apos;avis Booking</label>
              <input type="number" min="0" value={form.booking_reviews} onChange={(e) => update("booking_reviews", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#D4A843] pt-2">🦉 TripAdvisor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Note TripAdvisor (/5)</label>
              <input type="number" step="0.5" min="0" max="5" value={form.tripadvisor_score} onChange={(e) => update("tripadvisor_score", parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre d&apos;avis TripAdvisor</label>
              <input type="number" min="0" value={form.tripadvisor_reviews} onChange={(e) => update("tripadvisor_reviews", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#D4A843] pt-2">📍 Google Maps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Note Google (/5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.google_score} onChange={(e) => update("google_score", parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre d&apos;avis Google</label>
              <input type="number" min="0" value={form.google_reviews} onChange={(e) => update("google_reviews", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#D4A843] pt-2">💬 Gestion des avis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Taux de réponse aux avis (%)</label>
              <input type="number" min="0" max="100" value={form.response_rate} onChange={(e) => update("response_rate", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Avis négatifs (6 derniers mois)</label>
              <input type="number" min="0" value={form.negative_reviews_last_6m} onChange={(e) => update("negative_reviews_last_6m", parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#D4A843] transition" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 transition font-bold text-lg">
            {loading ? "Analyse en cours..." : "Analyser ma réputation"}
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
          {/* Score global */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <GradeBadge grade={result.grade} />
              <div className="text-left">
                <div className="text-5xl font-bold">{result.total_score}<span className="text-2xl text-white/40">/{result.max_total}</span></div>
                <div className="text-white/50 text-sm mt-1">Score de réputation — {result.riad_name}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-[#D4A843]">{result.avg_platform_score}/10</div>
                <div className="text-white/40 text-xs">Votre moyenne</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-emerald-400">{result.benchmark_avg}/10</div>
                <div className="text-white/40 text-xs">Moyenne {result.city}</div>
              </div>
            </div>
          </div>

          {/* Critères */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-bold">📊 Détail par critère</h3>
            {result.criteria.map((c) => (
              <div key={c.name} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{c.name}</h4>
                  <span className="text-sm font-bold text-[#D4A843]">{c.score}/{c.max_score}</span>
                </div>
                <ScoreBar score={c.score} max={c.max_score} />
                <p className="text-white/50 text-sm mt-2">{c.detail}</p>
              </div>
            ))}
          </div>

          {/* Forces / Faiblesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {result.strengths.length > 0 && (
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-5">
                <h3 className="font-bold text-emerald-300 mb-3">💪 Points forts</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => <li key={i} className="text-sm text-emerald-200/80">✅ {s}</li>)}
                </ul>
              </div>
            )}
            {result.weaknesses.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-5">
                <h3 className="font-bold text-red-300 mb-3">⚠️ Points faibles</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => <li key={i} className="text-sm text-red-200/80">❌ {w}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Recommandations */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">🎯 Recommandations</h3>
            {result.recommendations.map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{r.title}</h4>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  {r.impact_points > 0 && (
                    <span className="text-sm font-bold text-emerald-400 whitespace-nowrap ml-4">+{r.impact_points} pts</span>
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