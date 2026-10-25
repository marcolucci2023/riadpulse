"use client";

import { useState, useEffect } from "react";
import { checkHealth } from "@/lib/api";

export default function BackendStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkHealth()
      .then((data: { status: string }) => {
        if (data.status === "ok") {
          setStatus("ok");
          setMessage("API RiadPulse connectée");
        } else {
          setStatus("error");
          setMessage("Réponse inattendue");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("API non joignable (backend lancé ?)");
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4">
      <div
        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
          status === "ok"
            ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-300"
            : status === "error"
              ? "bg-red-900/30 border-red-500/30 text-red-300"
              : "bg-amber-900/30 border-amber-500/30 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {status === "ok" ? "✅" : status === "error" ? "❌" : "⏳"}
          </span>
          <span>
            {status === "loading" ? "Connexion au backend..." : message}
          </span>
          <span className="ml-auto text-xs opacity-60">
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
          </span>
        </div>
      </div>
    </div>
  );
}