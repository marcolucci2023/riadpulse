"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { runGlobalAudit, GlobalAuditResponse } from "@/lib/api";
import { generatePDF } from "@/lib/pdfGenerator";
import { recalcScore } from "@/lib/scoring";

const CITIES = ["Marrakech", "Fès", "Essaouira", "Chefchaouen", "Tanger", "Rabat"];

/* ── SVG Icons (Heroicons outline, strokeWidth 1.5) ── */
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const Icons = {
  trophy: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-2.77.672 6.003 6.003 0 01-2.77-.672",
  building: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  currency: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  chart: "M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z",
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.749-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  globe: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
  mappin: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  arrow: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182",
  check: "M4.5 12.75l6 6 9-13.5",
  bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  tag: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z",
  arrowRight: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
};

function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    B: "bg-lime-500/15 text-lime-400 border-lime-500/30",
    C: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    D: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    F: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-bold ${styles[grade] || "bg-white/5 text-white/40 border-white/10"}`}>
      {grade}
    </span>
  );
}

function ScoreBar({ label, score, grade, weight, icon }: { label: string; score: number; grade: string; weight: number; icon: string }) {
  const color = score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-lime-500" : score >= 55 ? "bg-amber-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-white/40"><Icon d={icon} size={16} /></span>
          <span className="text-sm font-medium text-white/70">{label}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-white/30">{Math.round(weight * 100)}%</span>
          <span className="text-sm font-semibold text-white">{score}<span className="text-white/30">/100</span></span>
          <GradeBadge grade={grade} />
        </div>
      </div>
      <div className="w-full bg-white/[0.04] rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const MODULE_META: Record<string, { label: string; icon: string }> = {
  site_web: { label: "Visibilité", icon: Icons.globe },
  reputation: { label: "Réputation", icon: Icons.star },
  pricing: { label: "Prix", icon: Icons.tag },
  commissions: { label: "Réservations directes", icon: Icons.chart },
};

export default function ScorePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GlobalAuditResponse | null>(null);

  const [riadName, setRiadName] = useState("");
  const [city, setCity] = useState("Marrakech");
  const [stars, setStars] = useState(3);
  const [url, setUrl] = useState("");

  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("8");
  const [occupancy, setOccupancy] = useState("65");
  const [revenue, setRevenue] = useState("");

  const [booking, setBooking] = useState("60");
  const [airbnb, setAirbnb] = useState("15");
  const [expedia, setExpedia] = useState("5");
  const [direct, setDirect] = useState("20");

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
        current_price_mad: Number(price) || 0,
        num_rooms: Number(rooms) || 5,
        occupancy_rate: (Number(occupancy) || 60) / 100,
        annual_revenue_mad: Number(revenue) || 0,
        booking_percent: Number(booking) || 0,
        airbnb_percent: Number(airbnb) || 0,
        expedia_percent: Number(expedia) || 0,
        direct_percent: Number(direct) || 0,
        booking_score: Number(bookingScore) || 0,
        booking_reviews: Number(bookingReviews) || 0,
        tripadvisor_score: Number(taScore) || 0,
        tripadvisor_reviews: Number(taReviews) || 0,
        google_score: Number(googleScore) || 0,
        google_reviews: Number(googleReviews) || 0,
        response_rate_percent: Number(responseRate) || 0,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur serveur";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-[#0a1628] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e76f51]/50 focus:ring-1 focus:ring-[#e76f51]/20 transition";
  const labelClass = "block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wide";
  const sectionClass = "bg-[#0f1d32] border border-white/[0.06] rounded-xl p-6 mb-5";

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-3">
            <Icon d={Icons.trophy} size={14} />
            Audit Digital
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Score Global <span className="text-[#f4a261]">RiadPulse</span>
          </h1>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Remplissez les 4 sections pour obtenir votre score complet et estimer votre manque a gagner annuel.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* IDENTITÉ */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#e76f51]/10 flex items-center justify-center text-[#e76f51]">
                <Icon d={Icons.building} size={16} />
              </div>
              <h2 className="text-sm font-semibold text-white/80">Identite du riad</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du riad</label>
                <input className={inputClass} value={riadName} onChange={e => setRiadName(e.target.value)} placeholder="Riad Dar Zen" />
              </div>
              <div>
                <label className={labelClass}>Ville</label>
                <select className={inputClass} value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Etoiles</label>
                <select className={inputClass} value={stars} onChange={e => setStars(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} etoiles</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>URL du site web</label>
                <input className={inputClass} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://monriad.com" />
              </div>
            </div>
          </div>

          {/* FINANCES */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#f4a261]/10 flex items-center justify-center text-[#f4a261]">
                <Icon d={Icons.currency} size={16} />
              </div>
              <h2 className="text-sm font-semibold text-white/80">Finances</h2>
            </div>
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

          {/* OTA */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Icon d={Icons.chart} size={16} />
              </div>
              <h2 className="text-sm font-semibold text-white/80">Repartition des reservations (%)</h2>
            </div>
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

          {/* RÉPUTATION */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Icon d={Icons.star} size={16} />
              </div>
              <h2 className="text-sm font-semibold text-white/80">Reputation en ligne</h2>
            </div>
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
                <label className={labelClass}>Taux de reponse (%)</label>
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5 text-red-400 text-sm flex items-center gap-2">
              <Icon d={Icons.warning} size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e76f51] hover:bg-[#d45a3c] text-white font-semibold py-3.5 rounded-xl text-sm transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Audit en cours...
              </>
            ) : (
              <>
                <Icon d={Icons.bolt} size={16} />
                Calculer mon Score RiadPulse
              </>
            )}
          </button>
        </form>

        {/* ── RÉSULTATS ── */}
        {result && (() => {
            const recalc = recalcScore({ city, stars: Number(stars) || 3, adr: Number(price) || 0, directPct: Number(direct) || 0, responseRate: Number(responseRate) || 0, bookingScore: Number(bookingScore) || 0, taScore: Number(taScore) || 0, googleScore: Number(googleScore) || 0, totalReviews: (Number(bookingReviews) || 0) + (Number(taReviews) || 0) + (Number(googleReviews) || 0), occupancyRate: (Number(occupancy) || 60) / 100, ca: Number(revenue) || 0, bookingReviews: Number(bookingReviews) || 0, taReviews: Number(taReviews) || 0, googleReviews: Number(googleReviews) || 0 });
            // Aligner avec le PDF : utiliser scores backend pour pricing/distribution/revenue
            const bMods = result.modules || {};
            Object.entries(bMods).forEach(([k, v]: [string, any]) => {
              const kl = k.toLowerCase();
              if (kl.includes('pric') || kl.includes('tarif') || kl.includes('adr')) recalc.modules.pricing = v.score;
              if (kl.includes('distrib') || kl.includes('channel') || kl.includes('canal')) recalc.modules.distribution = v.score;
              if (kl.includes('revenue') || kl.includes('rev') || kl.includes('occup') || kl.includes('income')) recalc.modules.revenue = v.score;
            });
            recalc.score = Math.round((recalc.modules.pricing + recalc.modules.distribution + recalc.modules.reputation + recalc.modules.revenue) / 4 * 10) / 10;
            recalc.perteTheo = Math.round((Number(revenue) || 0) * (1 - recalc.score / 100));
            recalc.central = Math.round(recalc.perteTheo * 0.8);
            return (
          <div className="mt-14 space-y-6">

            {/* SCORE GLOBAL */}
            <div className="bg-[#0f1d32] border border-white/[0.06] rounded-2xl p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Score Global RiadPulse</p>
              <div className="flex items-center justify-center gap-4 mb-5">
                <span className="text-6xl font-bold tracking-tight text-[#f4a261]">{recalc.score}</span>
                <div className="text-left">
                  <span className="text-xl text-white/20">/100</span>
                  <div className="mt-1"><GradeBadge grade={recalc.grade} /></div>
                </div>
              </div>

              {recalc.central > 0 && (
                <div className="bg-red-500/[0.06] border border-red-500/10 rounded-xl p-4 mt-5 inline-block">
                  <div className="flex items-center gap-2 text-red-400/70 text-xs mb-1">
                    <Icon d={Icons.warning} size={14} />
                    Manque a gagner estime
                  </div>
                  <p className="text-2xl font-bold text-red-400">
                    {recalc.central.toLocaleString("fr-FR")} MAD
                    <span className="text-sm font-normal text-red-400/50 ml-1">/an</span>
                  </p>
                  <p className="text-red-400/40 text-xs mt-0.5">
                    environ {result.total_annual_loss_eur.toLocaleString("fr-FR")} EUR/an
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs mt-5">
                <Icon d={Icons.mappin} size={12} />
                {result.city_position}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => generatePDF(result, { riad_name: riadName, city, stars, url, current_price_mad: Number(price) || 0, num_rooms: Number(rooms) || 5, occupancy_rate: (Number(occupancy) || 60) / 100, annual_revenue_mad: Number(revenue) || 0, booking_percent: Number(booking) || 0, airbnb_percent: Number(airbnb) || 0, expedia_percent: Number(expedia) || 0, direct_percent: Number(direct) || 0, booking_score: Number(bookingScore) || 0, booking_reviews: Number(bookingReviews) || 0, tripadvisor_score: Number(taScore) || 0, tripadvisor_reviews: Number(taReviews) || 0, google_score: Number(googleScore) || 0, google_reviews: Number(googleReviews) || 0, response_rate_percent: Number(responseRate) || 0 })}
                  className="bg-[#f4a261] hover:bg-[#e0934f] text-[#0a1628] font-semibold py-2.5 px-5 rounded-lg transition inline-flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Icon d={Icons.download} size={16} />
                  Telecharger le rapport PDF
                </button>
              </div>
            </div>

            {/* SOUS-SCORES */}
            <div className="bg-[#0f1d32] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-xs uppercase tracking-widest text-white/30 mb-5">Detail par module</h3>
              {[
                { key: "pricing", label: "Prix & Tarifs", score: recalc.modules.pricing, weight: 0.25, icon: Icons.tag },
                { key: "reputation", label: "Reputation", score: recalc.modules.reputation, weight: 0.25, icon: Icons.star },
                { key: "revenue", label: "Revenus", score: recalc.modules.revenue, weight: 0.25, icon: Icons.chart },
                { key: "distribution", label: "Distribution", score: recalc.modules.distribution, weight: 0.25, icon: Icons.globe },
              ].map((m) => {
                return (
                <ScoreBar
                  key={m.key}
                  label={m.label}
                  score={m.score}
                  grade={m.score >= 85 ? "A" : m.score >= 70 ? "B" : m.score >= 55 ? "C" : m.score >= 40 ? "D" : "F"}
                  weight={m.weight}
                  icon={m.icon}
                />
              );
            })}
            </div>

            {/* PRIORITÉS */}
            {result.top_priorities.length > 0 && (
              <div className="bg-[#0f1d32] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-xs uppercase tracking-widest text-white/30 mb-5">Top priorites</h3>
                <div className="space-y-3">
                  {result.top_priorities.map((p) => (
                    <div key={p.rank} className="bg-white/[0.02] rounded-lg p-4 border-l-2 border-[#e76f51]/60 hover:bg-white/[0.04] transition">
                      <div className="flex justify-between items-start gap-3 mb-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-[#e76f51] text-xs font-bold mt-0.5 shrink-0">#{p.rank}</span>
                          <span className="text-sm font-medium text-white/80">{p.title}</span>
                        </div>
                        <span className="text-[#f4a261] font-semibold text-sm whitespace-nowrap shrink-0">
                          +{p.impact_mad.toLocaleString("fr-FR")} MAD
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${
                          p.difficulty === "facile" ? "bg-emerald-500/10 text-emerald-400/70" :
                          p.difficulty === "moyenne" ? "bg-amber-500/10 text-amber-400/70" :
                          "bg-red-500/10 text-red-400/70"
                        }`}>
                          {p.difficulty}
                        </span>
                        <span className="text-[10px] text-white/20 uppercase tracking-wide">{p.module}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDITS DÉTAILLÉS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: "/audit", label: "Site Web", icon: Icons.globe },
                { href: "/audit/pricing", label: "Pricing", icon: Icons.tag },
                { href: "/audit/reputation", label: "Reputation", icon: Icons.star },
                { href: "/audit/commissions", label: "Commissions", icon: Icons.chart },
              ].map(link => (
                <Link key={link.href} href={link.href} className="bg-[#0f1d32] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-4 text-center transition group">
                  <div className="text-white/30 group-hover:text-[#e76f51] transition flex justify-center mb-2">
                    <Icon d={link.icon} size={18} />
                  </div>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
            );
          })()}
      </main>
    </div>
  );
}