"use client";

import Link from "next/link";
import { getToken, getEmail, logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    const storedEmail = getEmail();
    if (storedEmail) setEmail(storedEmail);
  }, []);

  function handleLogout() {
    logout();
    setIsLoggedIn(false);
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#C2452D] rounded-lg flex items-center justify-center font-bold text-xl">
          R
        </div>
        <span className="text-2xl font-bold">
          Riad<span className="text-[#D4A843]">Pulse</span>
        </span>
      </Link>

      <nav className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <Link
              href="/audit"
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
            >
              🔍 Audit
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
            >
              📊 Dashboard
            </Link>
            <span className="text-white/40 text-sm hidden md:block">
              {email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-[#C2452D] hover:bg-[#A83A25] transition font-semibold text-sm"
            >
              Commencer
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}