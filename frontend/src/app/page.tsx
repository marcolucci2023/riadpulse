import Link from "next/link";

const features = [
  {
    icon: "📊",
    title: "Score de performance",
    desc: "Note sur 100 comparée aux riads du même quartier.",
  },
  {
    icon: "💸",
    title: "Pertes en commissions",
    desc: "Estimation précise de ce que vous payez à Booking et Airbnb.",
  },
  {
    icon: "🏷️",
    title: "Analyse des prix",
    desc: "Vos tarifs vs la concurrence locale, en temps réel.",
  },
  {
    icon: "⭐",
    title: "Réputation",
    desc: "Notes, avis non répondus, tendance sur 6 mois.",
  },
  {
    icon: "🌐",
    title: "Audit site web",
    desc: "Vitesse, HTTPS, responsive, SEO de base.",
  },
  {
    icon: "📍",
    title: "Visibilité Maps",
    desc: "Votre ranking sur les requêtes clés de votre ville.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#0F1A2E] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C2452D] rounded-lg flex items-center justify-center font-bold text-xl">
            R
          </div>
          <span className="text-2xl font-bold">
            Riad<span className="text-[#D4A843]">Pulse</span>
          </span>
        </div>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition text-sm"
          >
            Connexion
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-[#C2452D] hover:bg-[#A83A25] transition font-semibold text-sm"
          >
            Commencer
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Votre riad perd de l&apos;argent.
          <br />
          <span className="text-[#D4A843]">
            On vous montre exactement où.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Audit digital complet : commissions Booking, prix vs concurrence,
          réputation, site web, visibilité Google Maps. Score sur 100 + plan
          d&apos;action concret.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] transition font-bold text-lg"
        >
          Lancer un audit gratuit
        </Link>
      </section>

      {/* Stats */}
      <section className="bg-white/5 py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#D4A843]">15-22%</div>
            <div className="text-white/60 mt-2">
              de commission moyenne payée à Booking
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#C2452D]">30%</div>
            <div className="text-white/60 mt-2">
              plus cher chez vos concurrents directs
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#D4A843]">6 000+</div>
            <div className="text-white/60 mt-2">
              riads et hôtels au Maroc concernés
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          6 modules d&apos;audit en un seul dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Prêt à arrêter de perdre de l&apos;argent ?
        </h2>
        <p className="text-white/60 mb-8">
          L&apos;audit de base est gratuit. Résultats en moins de 5 minutes.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 rounded-xl bg-[#D4A843] hover:bg-[#E8C76A] text-[#1B2A4A] transition font-bold text-lg"
        >
          Créer mon compte gratuitement
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        © {new Date().getFullYear()} RiadPulse — Fait au Maroc 🇲🇦
      </footer>
    </main>
  );
}