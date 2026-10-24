"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { loginUser, saveToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      saveToken(data.access_token, data.email);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      <Header />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
            <p className="text-white/50 text-center text-sm mb-8">
              Accédez à votre dashboard d&apos;audit
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm mb-6">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@votre-riad.ma"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4A843] transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] disabled:opacity-50 transition font-bold text-lg"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="text-center text-white/50 text-sm mt-6">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-[#D4A843] hover:underline font-medium"
              >
                Créer un compte gratuit
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}