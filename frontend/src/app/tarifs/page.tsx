import Link from "next/link";

const plans = [
  {
    name: "Mini-Audit Gratuit",
    price: "0",
    unit: "MAD",
    desc: "Decouvrez votre score en 2 minutes.",
    features: [
      "Score global sur 100",
      "1 recommandation cle",
      "Apercu du benchmark local",
    ],
    missing: [
      "Rapport PDF complet",
      "Analyse des 4 modules",
      "Plan d'action personnalise",
      "Calcul des pertes de revenus",
    ],
    cta: "Essayer gratuitement",
    highlight: false,
    free: true,
  },
  {
    name: "Audit Flash",
    price: "490",
    unit: "MAD",
    desc: "Diagnostic complet de votre presence en ligne avec rapport PDF detaille.",
    features: [
      "Score global sur 100 + grade A-F",
      "4 modules detailles (Pricing, Reputation, Distribution, Revenus)",
      "Rapport PDF 10 pages personnalise",
      "Benchmark local par ville et etoiles",
      "Calcul du manque a gagner en MAD",
      "Plan d'action 30/60/90 jours",
      "Analyse des commissions OTA",
      "Niveau de confiance du diagnostic",
    ],
    missing: [],
    cta: "Commander l'Audit Flash",
    highlight: true,
    free: false,
  },
  {
    name: "Audit Complet + Plan d'Action",
    price: "1 500",
    unit: "MAD",
    desc: "Analyse approfondie avec appel de restitution et strategie sur mesure.",
    features: [
      "Tout l'Audit Flash inclus",
      "Rapport PDF 20 pages approfondi",
      "Appel de restitution 30 min avec Omar",
      "Strategie tarifaire personnalisee",
      "Optimisation distribution OTA",
      "Plan d'action 90 jours detaille",
      "Calculateur de commissions avance",
      "Benchmark concurrentiel complet",
    ],
    missing: [],
    cta: "Commander",
    highlight: false,
    free: false,
  },
  {
    name: "Suivi Mensuel",
    price: "700",
    unit: "MAD/mois",
    desc: "Votre Revenue Manager personnel. Accompagnement continu.",
    features: [
      "Suivi mensuel des KPIs",
      "Ajustement strategie tarifaire",
      "Optimisation distribution",
      "Reporting mensuel",
      "Support WhatsApp prioritaire",
    ],
    missing: [],
    cta: "Demander un devis",
    highlight: false,
    free: false,
  },
];

export default function TarifsPage() {
  return (
    <main style={{ background: "#0a1628", minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ color: "#f4a261", fontSize: 36, textAlign: "center", marginBottom: 8 }}>
          Nos Tarifs
        </h1>
        <p style={{ color: "#aaa", textAlign: "center", fontSize: 16, marginBottom: 48 }}>
          Des formules adaptees a chaque besoin. Paiement par virement ou en especes.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? "#1a2a44" : plan.free ? "#0d1520" : "#141e32",
                border: plan.highlight ? "2px solid #e76f51" : plan.free ? "1px dashed #333" : "1px solid #222",
                borderRadius: 12,
                padding: 28,
                position: "relative",
                opacity: plan.free ? 0.75 : 1,
              }}
            >
              {plan.highlight && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    background: "#e76f51",
                    color: "#fff",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  RECOMMANDE
                </span>
              )}
              {plan.free && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    background: "#333",
                    color: "#888",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  GRATUIT
                </span>
              )}
              <h2 style={{ color: plan.free ? "#666" : "#fff", fontSize: 20, marginBottom: 8 }}>{plan.name}</h2>
              <p style={{ color: plan.free ? "#555" : "#aaa", fontSize: 13, marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ color: plan.free ? "#555" : "#f4a261", fontSize: 36, fontWeight: "bold" }}>{plan.price}</span>
                <span style={{ color: "#888", fontSize: 14, marginLeft: 6 }}>{plan.unit}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      color: plan.free ? "#666" : "#ccc",
                      fontSize: 13,
                      padding: "5px 0",
                      borderBottom: "1px solid #1a2a44",
                    }}
                  >
                    <span style={{ color: plan.free ? "#444" : "#25D366", marginRight: 8 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.missing.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
                  {plan.missing.map((f) => (
                    <li
                      key={f}
                      style={{
                        color: "#444",
                        fontSize: 12,
                        padding: "4px 0",
                      }}
                    >
                      <span style={{ color: "#333", marginRight: 8 }}>&#10007;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/score"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 8,
                  background: plan.highlight ? "#e76f51" : plan.free ? "#222" : "transparent",
                  border: plan.highlight ? "none" : plan.free ? "1px solid #333" : "1px solid #e76f51",
                  color: plan.free ? "#666" : "#fff",
                  fontSize: 14,
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p style={{ color: "#666", textAlign: "center", fontSize: 12, marginTop: 40 }}>
          Tous les prix sont en MAD (Dirhams Marocains). Aucun abonnement cache.
        </p>
      </div>
    </main>
  );
}