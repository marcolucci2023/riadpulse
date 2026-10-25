"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runGlobalAudit, GlobalAuditResponse } from "@/lib/api";
import { generatePDF } from "@/lib/pdfGenerator";

const CITIES = ["Marrakech", "Fès", "Essaouira", "Chefchaouen", "Tanger", "Rabat"];

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-green-600",
    B: "bg-lime-600",
    C: "bg-yellow-500 text-black",
    D: "bg-orange-500",
    F: "bg-red-600",
  };
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg ${colors[grade] || "bg-gray-500"}`}>
      {grade}
    </span>
  );
}

function ScoreBar({ label, score, grade, weight }: { label: string; score: number; grade: string; weight: number }) {
  const barColor = score >= 85 ? "bg-green-500" : score >= 70 ? "bg-lime-500" : score >= 55 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">({Math.round(weight * 100)}%)</span>
          <span className="text-sm font-bold text-white">{score}/100</span>
          <GradeBadge grade={grade} />
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div className={`${barColor} h-3 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const MODULE_LABELS: Record<string, string> = {
  site_web: "🌐 Site Web",
  reputation: "⭐ Réputation",
  pricing: "💰 Pricing",
  commissions: "📊 Commissions",
};

export default function ScorePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GlobalAuditResponse | null>(null);

  // Identité
  const [riadName, setRiadName] = useState("");
  const [city, setCity] = useState("Marrakech");
  const [stars, setStars] = useState(3);
  const [url, setUrl] = useState("");

  // Finances
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("8");
  const [occupancy, setOccupancy] = useState("65");
  const [revenue, setRevenue] = useState("");

  // OTA
  const [booking, setBooking] = useState("60");
  const [airbnb, setAirbnb] = useState("15");
  const [expedia, setExpedia] = useState("5");
  const [direct, setDirect] = useState("20");

  // Réputation
  const [bookingScore, setBookingScore] = useState("");
  const [bookingReviews, setBookingReviews] = useState("");
  const [taScore, setTaScore] = useState("");
  const [taReviews, setTaReviews] = useState("");
  const [googleScore, setGoogleScore] = useState("");
  const [googleReviews, setGoogleReviews] = useState("");
  const [responseRate, setResponseRate] = useState("40");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!riadName.trim()) {
      setError("Le nom du riad est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runGlobalAudit({
        riad_name: riadName,
        city,
        stars,
        url,
        current_price_mad: parseFloat(price) || 0,
        num_rooms: parseInt(rooms) || 5,
        occupancy_rate: (parseFloat(occupancy) || 60) / 100,
        annual_revenue_mad: parseFloat(revenue) || 0,
        booking_percent: parseFloat(booking) || 0,
        airbnb_percent: parseFloat(airbnb) || 0,
        expedia_percent: parseFloat(expedia) || 0,
        direct_percent: parseFloat(direct) || 0,
        booking_score: parseFloat(bookingScore) || 0,
        booking_reviews: parseInt(bookingReviews) || 0,
        tripadvisor_score: parseFloat(taScore) || 0,
        tripadvisor_reviews: parseInt(taReviews) || 0,
        google_score: parseFloat(googleScore) || 0,
        google_reviews: parseInt(googleReviews) || 0,
        response_rate_percent: parseFloat(responseRate) || 0,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4A843]";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const sectionClass = "bg-gray-900/50 border border-gray-700 rounded-xl p-5 mb-6";

  return (
    <div className="min-h-screen bg-[#0F1A2E] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🏆 Score Global <span className="text-[#D4A843]">RiadPulse</span>
          </h1>
          <p className="text-gray-400">
            Remplissez les 4 sections pour obtenir votre score complet et votre manque à gagner annuel.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* SECTION 1 : IDENTITÉ */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-[#D4A843] mb-4">🏠 Identité du riad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du riad *</label>
                <input className={inputClass} value={riadName} onChange={e => setRiadName(e.target.value)} placeholder="Riad Dar Zen" />
              </div>
              <div>
                <label className={labelClass}>Ville</label>
                <select className={inputClass} value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Étoiles</label>
                <select className={inputClass} value={stars} onChange={e => setStars(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} ⭐</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>URL du site web</label>
                <input className={inputClass} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://monriad.com" />
              </div>
            </div>
          </div>

          {/* SECTION 2 : FINANCES */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-[#D4A843] mb-4">💰 Finances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prix moyen / nuit (MAD)</label>
                <input className={inputClass} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="400" />
              </div>
              <div>
                <label className={labelClass}>Nombre de chambres</label>
                <input className={inputClass} type="number" value={rooms} onChange={e => setRooms(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Taux d&apos;occupation (%)</label>
                <input className={inputClass} type="number" value={occupancy} onChange={e => setOccupancy(e.target.value)} placeholder="65" />
              </div>
              <div>
                <label className={labelClass}>CA annuel (MAD)</label>
                <input className={inputClass} type="number" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="800000" />
              </div>
            </div>
          </div>

          {/* SECTION 3 : OTA */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-[#D4A843] mb-4">📊 Répartition des réservations (%)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Booking</label>
                <input className={inputClass} type="number" value={booking} onChange={e => setBooking(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Airbnb</label>
                <input className={inputClass} type="number" value={airbnb} onChange={e => setAirbnb(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Expedia</label>
                <input className={inputClass} type="number" value={expedia} onChange={e => setExpedia(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Direct</label>
                <input className={inputClass} type="number" value={direct} onChange={e => setDirect(e.target.value)} />
              </div>
            </div>
          </div>

          {/* SECTION 4 : RÉPUTATION */}
          <div className={sectionClass}>
            <h2 className="text-lg font-bold text-[#D4A843] mb-4">⭐ Réputation en ligne</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Booking (note /10)</label>
                <input className={inputClass} type="number" step="0.1" value={bookingScore} onChange={e => setBookingScore(e.target.value)} placeholder="7.8" />
              </div>
              <div>
                <label className={labelClass}>Booking (nb avis)</label>
                <input className={inputClass} type="number" value={bookingReviews} onChange={e => setBookingReviews(e.target.value)} placeholder="120" />
              </div>
              <div>
                <label className={labelClass}>Taux de réponse (%)</label>
                <input className={inputClass} type="number" value={responseRate} onChange={e => setResponseRate(e.target.value)} placeholder="40" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>TripAdvisor (note /5)</label>
                <input className={inputClass} type="number" step="0.1" value={taScore} onChange={e => setTaScore(e.target.value)} placeholder="3.5" />
              </div>
              <div>
                <label className={labelClass}>TripAdvisor (nb avis)</label>
                <input className={inputClass} type="number" value={taReviews} onChange={e => setTaReviews(e.target.value)} placeholder="85" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Google (note /5)</label>
                <input className={inputClass} type="number" step="0.1" value={googleScore} onChange={e => setGoogleScore(e.target.value)} placeholder="4.0" />
              </div>
              <div>
                <label className={labelClass}>Google (nb avis)</label>
                <input className={inputClass} type="number" value={googleReviews} onChange={e => setGoogleReviews(e.target.value)} placeholder="200" />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4 text-red-300">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C2452D] hover:bg-[#a83820] text-white font-bold py-4 rounded-xl text-lg transition disabled:opacity-50"
          >
            {loading ? "⏳ Calcul en cours (audit du site web en cours)..." : "🏆 Calculer mon Score RiadPulse"}
          </button>
        </form>

        {/* RÉSULTATS */}
        {result && (
          <div className="mt-10 space-y-6">
            {/* SCORE GLOBAL */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] border-2 border-[#D4A843] rounded-2xl p-8 text-center">
              <h2 className="text-xl text-gray-400 mb-2">Score Global RiadPulse</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-7xl font-black text-[#D4A843]">{result.global_score}</span>
                <span className="text-3xl text-gray-500">/100</span>
                <GradeBadge grade={result.grade} />
              </div>
              {result.total_annual_loss_mad > 0 && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mt-4">
                  <p className="text-red-400 text-sm mb-1">💸 Manque à gagner estimé</p>
                  <p className="text-3xl font-black text-red-300">
                    {result.total_annual_loss_mad.toLocaleString("fr-FR")} MAD/an
                  </p>
                  <p className="text-red-400 text-sm">≈ {result.total_annual_loss_eur.toLocaleString("fr-FR")} €/an</p>
                </div>
              )}
              <p className="text-gray-400 text-sm mt-4">📍 {result.city_position}</p>
              <div className="mt-6">
                <button
                  onClick={() => generatePDF(result)}
                  className="bg-[#D4A843] hover:bg-[#b89135] text-[#0F1A2E] font-bold py-3 px-6 rounded-xl transition inline-flex items-center gap-2 text-base shadow-lg cursor-pointer"
                >
                  📥 Télécharger le rapport PDF
                </button>
              </div>	
            </div>

            {/* SOUS-SCORES */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">📊 Détail par module</h3>
              {Object.entries(result.sub_scores).map(([key, sub]) => (
                <ScoreBar
                  key={key}
                  label={MODULE_LABELS[key] || key}
                  score={sub.score}
                  grade={sub.grade}
                  weight={sub.weight}
                />
              ))}
            </div>

            {/* PRIORITÉS */}
            {result.top_priorities.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Top priorités</h3>
                <div className="space-y-3">
                  {result.top_priorities.map((p) => (
                    <div key={p.rank} className="bg-gray-800 rounded-lg p-4 border-l-4 border-[#D4A843]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white">
                          #{p.rank} [{p.module}] {p.title}
                        </span>
                        <span className="text-[#D4A843] font-bold text-sm whitespace-nowrap ml-3">
                          +{p.impact_mad.toLocaleString("fr-FR")} MAD
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{p.detail}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                        p.difficulty === "facile" ? "bg-green-900 text-green-300" :
                        p.difficulty === "moyenne" ? "bg-yellow-900 text-yellow-300" :
                        "bg-red-900 text-red-300"
                      }`}>
                        {p.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIENS VERS AUDITS DÉTAILLÉS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/audit" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center text-sm transition">
                🌐 Audit Site Web
              </Link>
              <Link href="/audit/pricing" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center text-sm transition">
                💰 Audit Pricing
              </Link>
              <Link href="/audit/reputation" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center text-sm transition">
                ⭐ Audit Réputation
              </Link>
              <Link href="/audit/commissions" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center text-sm transition">
                📊 Audit Commissions
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}