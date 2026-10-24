"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
      © {year} RiadPulse — Fait au Maroc 🇲🇦
    </footer>
  );
}