"use client";

import { useState } from "react";

export default function CTAAudit() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Bonjour, je suis ${name} de ${city}. Je souhaite recevoir mon audit gratuit. Mon tel : ${phone}`
    );
    window.open(`https://wa.me/+212694835695?text=${message}`, "_blank");
    setSent(true);
  };

  if (sent) {
    return (
      <section style={{ background: "#0a1628", padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ color: "#25D366", fontSize: 28, marginBottom: 12 }}>Merci !</h2>
        <p style={{ color: "#ccc", fontSize: 16 }}>
          Votre demande a ete envoyee. Nous vous recontacterons sous 24h.
        </p>
      </section>
    );
  }

  return (
    <section style={{ background: "#0a1628", padding: "60px 20px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#f4a261", fontSize: 28, marginBottom: 8 }}>
          Recevez votre audit gratuit
        </h2>
        <p style={{ color: "#aaa", fontSize: 14, marginBottom: 32 }}>
          En 24h, recevez un diagnostic rapide de la performance digitale de votre etablissement.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="text"
            placeholder="Nom de votre etablissement"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "14px 18px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#141e32",
              color: "#fff",
              fontSize: 15,
            }}
          />
          <input
            type="tel"
            placeholder="Telephone (ex: 06 12 34 56 78)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{
              padding: "14px 18px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#141e32",
              color: "#fff",
              fontSize: 15,
            }}
          />
          <input
            type="text"
            placeholder="Ville (ex: Marrakech)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            style={{
              padding: "14px 18px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#141e32",
              color: "#fff",
              fontSize: 15,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "16px",
              borderRadius: 8,
              border: "none",
              background: "#e76f51",
              color: "#fff",
              fontSize: 17,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Recevoir mon audit gratuit
          </button>
        </form>
        <p style={{ color: "#666", fontSize: 11, marginTop: 16 }}>
          Aucun engagement. Vos donnees restent confidentielles.
        </p>
      </div>
    </section>
  );
}