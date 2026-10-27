import Link from "next/link";

const plans = [
  {
    name: "Audit Flash",
    price: "500",
    unit: "MAD",
    desc: "Diagnostic rapide de votre presence en ligne.",
    features: [
      "Score global sur 100",
      "3 recommandations cles",
      "Benchmark local",
      "Rapport PDF 5 pages",
    ],
    cta: "Commander",
    highlight: false,
  },
  {
    name: "Audit Complet + Video",
    price: "1 500",
    unit: "MAD",
    desc: "Analyse approfondie avec plan d'action detaille.",
    features: [
      "Score global + 4 modules detailles",
      "Rapport PDF 10 pages",
      "Video 15 min commentee",
      "Plan d'action 90 jours",
      "Calculateur de commissions",
      "Benchmark local complet",
    ],
    cta: "Commander",
    highlight: true,
  },
  {
    name: "Suivi Mensuel",
    price: "700",
    unit: "MAD/mois",
    desc: "Accompagnement continu pour maximiser vos revenus.",
    features: [
      "Suivi mensuel des KPIs",
      "Ajustement strategie tarifaire",
      "Optimisation distribution",
      "Reporting mensuel",
      "Support WhatsApp prioritaire",
    ],
    cta: "Demander un devis",
    highlight: false,
  },
];

export default function TarifsPage() {
  return (
    <main style={{ background: "#0a1628", minHeight: "100vh", padding: "60px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#f4a261", fontSize: 36, textAlign: "center", marginBottom: 8 }}>
          Nos Tarifs
        </h1>
        <p style={{ color: "#aaa", textAlign: "center", fontSize: 16, marginBottom: 48 }}>
          Des formules adaptees a chaque besoin. Paiement par virement ou en especes.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? "#1a2a44" : "#141e32",
                border: plan.highlight ? "2px solid #e76f51" : "1px solid #222",
                borderRadius: 12,
                padding: 32,
                position: "relative",
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
              <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>{plan.name}</h2>
              <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ color: "#f4a261", fontSize: 36, fontWeight: "bold" }}>{plan.price}</span>
                <span style={{ color: "#888", fontSize: 14, marginLeft: 6 }}>{plan.unit}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      color: "#ccc",
                      fontSize: 14,
                      padding: "6px 0",
                      borderBottom: "1px solid #1a2a44",
                    }}
                  >
                    <span style={{ color: "#25D366", marginRight: 8 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/score"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  borderRadius: 8,
                  background: plan.highlight ? "#e76f51" : "transparent",
                  border: plan.highlight ? "none" : "1px solid #e76f51",
                  color: "#fff",
                  fontSize: 15,
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