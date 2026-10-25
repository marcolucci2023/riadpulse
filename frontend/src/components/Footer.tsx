"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span>© {year} RiadPulse — Fait au Maroc 🇲🇦</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-[#D4A843] transition">
              Mentions légales
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/politique-confidentialite" className="hover:text-[#D4A843] transition">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}