"use client";

import { useState } from "react";
import Link from "next/link";
import { runSiteAudit, AuditSiteWebResponse } from "@/lib/api";

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-green-500 text-white",
    C: "bg-yellow-500 text-black",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl font-bold ${colors[grade] || colors["F"]}`}
    >
      {grade}
    </span>
  );
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-yellow-500"
        : pct >= 40
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditSiteWebResponse | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await runSiteAudit(url.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C2452D] rounded-lg flex items-center justify-center font-bold text-xl">
            R
          </div>
          <span className="text-2xl font-bold">
            Riad<span className="text-[#D4A843]">Pulse</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="px-5 py-2 rounded-lg bg-[#C2452D] hover:bg-[#A83A25] transition font-semibold text-sm"
        >
          Connexion
        </Link>
      </header>

      {/* Titre */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Audit site web <span className="text-[#D4A843]">gratuit</span>
        </h1>
        <p className="text-white/60">
          Entrez l&apos;URL du site de votre riad et recevez un score sur 100 en
          quelques secondes.
        </p>
      </section>

      {/* Formulaire */}
      <section className="max-w-2xl mx-auto px-6 pb-8">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.votre-riad.com"
            className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
          >
            {loading ? "Audit en cours..." : "Lancer l'audit"}
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
          {/* Score global */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <GradeBadge grade={result.grade} />
              <div className="text-left">
                <div className="text-5xl font-bold">
                  {result.total_score}
                  <span className="text-2xl text-white/40">
                    /{result.max_total}
                  </span>
                </div>
                <div className="text-white/50 text-sm mt-1">{result.url}</div>
              </div>
            </div>
          </div>

          {/* Critères détaillés */}
          <div className="space-y-4">
            {result.criteria.map((c) => (
              <div
                key={c.name}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="text-sm font-bold text-[#D4A843]">
                    {c.score}/{c.max_score}
                  </span>
                </div>
                <ScoreBar score={c.score} max={c.max_score} />
                <p className="text-white/50 text-sm mt-2">{c.detail}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-white/60 mb-4">
              Vous voulez un audit complet (prix, réputation, commissions, Maps)
              ?
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 rounded-xl bg-[#D4A843] hover:bg-[#E8C76A] text-[#1B2A4A] transition font-bold"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}