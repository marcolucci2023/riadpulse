"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getEmail, logout, getMyAudits, AuditSiteWebResponse } from "@/lib/api";

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "bg-emerald-500 text-white",
    B: "bg-green-500 text-white",
    C: "bg-yellow-500 text-black",
    D: "bg-orange-500 text-white",
    F: "bg-red-500 text-white",
  };
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${colors[grade] || colors["F"]}`}>
      {grade}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [audits, setAudits] = useState<AuditSiteWebResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const storedEmail = getEmail();
    if (storedEmail) setEmail(storedEmail);

    getMyAudits()
      .then((data) => setAudits(data))
      .catch(() => setAudits([]))
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C2452D] rounded-lg flex items-center justify-center font-bold text-xl">
            R
          </div>
          <span className="text-2xl font-bold">
            Riad<span className="text-[#D4A843]">Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Stats rapides */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#D4A843]">{audits.length}</div>
            <div className="text-white/50 text-sm">Audits réalisés</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#C2452D]">
              {audits.length > 0
                ? Math.round(audits.reduce((sum, a) => sum + a.total_score, 0) / audits.length)
                : "—"}
            </div>
            <div className="text-white/50 text-sm">Score moyen</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-emerald-400">
              {audits.filter((a) => a.grade === "A" || a.grade === "B").length}
            </div>
            <div className="text-white/50 text-sm">Sites performants (A/B)</div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="max-w-5xl mx-auto px-6 pb-6">
        <Link
          href="/audit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] transition font-bold"
        >
          🔍 Lancer un nouvel audit
        </Link>
      </section>

      {/* Historique */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-4">Historique des audits</h2>

        {loading ? (
          <div className="text-white/50 py-8 text-center">Chargement...</div>
        ) : audits.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-white/60">
              Aucun audit pour le moment. Lancez votre premier audit !
            </p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="text-left px-5 py-3 font-medium">Site</th>
                  <th className="text-center px-5 py-3 font-medium">Score</th>
                  <th className="text-center px-5 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium truncate max-w-xs">{a.url}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-[#D4A843]">
                        {a.total_score}/{a.max_total}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <GradeBadge grade={a.grade} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}