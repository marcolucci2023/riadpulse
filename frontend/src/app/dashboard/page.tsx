"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getEmail, logout } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const storedEmail = getEmail();
    if (storedEmail) setEmail(storedEmail);
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

      {/* Contenu */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenue sur votre dashboard 👋
        </h1>
        <p className="text-white/60 mb-8">
          Votre compte est actif. Le dashboard complet avec vos audits arrivera
          dans la prochaine étape.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/audit"
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition text-left"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold mb-1">Lancer un audit</h3>
            <p className="text-white/50 text-sm">
              Analysez le site web de n&apos;importe quel riad.
            </p>
          </Link>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left opacity-50">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Mes audits (bientôt)</h3>
            <p className="text-white/50 text-sm">
              Historique de vos audits et suivi des scores.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}