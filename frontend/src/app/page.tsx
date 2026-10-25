import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "🌐",
    title: "Audit site web",
    desc: "Vitesse, HTTPS, responsive, technologies. Score sur 100 en 10 secondes.",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: "🏷️",
    title: "Analyse des prix",
    desc: "Vos tarifs vs le marché local. Découvrez si vous êtes sous-tarifé.",
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: "⭐",
    title: "Réputation en ligne",
    desc: "Booking, TripAdvisor, Google. Vos notes, vos avis non répondus.",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    icon: "💸",
    title: "Commissions OTA",
    desc: "Combien vous payez vraiment à Booking, Airbnb, Expedia chaque année.",
    color: "from-red-500/20 to-rose-500/20",
  },
  {
    icon: "🏆",
    title: "Score Global",
    desc: "Un score unique /100 qui synthétise tout. Comparez-vous à votre ville.",
    color: "from-purple-500/20 to-violet-500/20",
  },
  {
    icon: "📥",
    title: "Rapport PDF",
    desc: "Téléchargez un rapport professionnel prêt à présenter à vos clients.",
    color: "from-orange-500/20 to-amber-500/20",
  },
];

const steps = [
  { num: "01", title: "Entrez vos données", desc: "URL, prix, notes, commissions. 2 minutes max." },
  { num: "02", title: "L'audit s'exécute", desc: "4 modules analysent votre présence digitale." },
  { num: "03", title: "Recevez votre score", desc: "Score /100, manque à gagner, plan d'action." },
  { num: "04", title: "Téléchargez le PDF", desc: "Rapport pro prêt à envoyer ou imprimer." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F1A2E] text-white overflow-x-hidden">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C2452D]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-[#D4A843]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-block mb-6 px-4 py-2 rounded-full glass text-sm text-[#D4A843] font-medium animate-fade-in">
            🇲🇦 Conçu pour les riads et hôtels du Maroc
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-fade-in-up">
            Votre riad perd de
            <br />
            l&apos;argent.
            <br />
            <span className="gradient-text">
              On vous montre où.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Audit digital complet en 2 minutes : commissions, pricing, réputation,
            site web. Score sur 100 + plan d&apos;action chiffré en MAD.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Link
              href="/score"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C2452D] hover:bg-[#A83A25] transition font-bold text-lg shadow-lg shadow-[#C2452D]/25 hover:shadow-[#C2452D]/40"
            >
              🏆 Lancer le Score Global
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass hover:bg-white/10 transition font-bold text-lg"
            >
              🌐 Audit site web gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-20 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C2452D]/5 via-transparent to-[#D4A843]/5" />
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="animate-count-up">
            <div className="text-5xl md:text-6xl font-black gradient-text">18%</div>
            <div className="text-white/50 mt-3 text-sm">
              de commission moyenne<br />payée à Booking.com
            </div>
          </div>
          <div className="animate-count-up delay-200">
            <div className="text-5xl md:text-6xl font-black text-[#C2452D]">6 000+</div>
            <div className="text-white/50 mt-3 text-sm">
              riads et hôtels indépendants<br />au Maroc concernés
            </div>
          </div>
          <div className="animate-count-up delay-400">
            <div className="text-5xl md:text-6xl font-black gradient-text">2 min</div>
            <div className="text-white/50 mt-3 text-sm">
              pour un audit complet<br />avec rapport PDF
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
          Pas de carte de crédit, pas d&apos;engagement. Résultats immédiats.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className={`relative glass rounded-2xl p-6 hover:bg-white/10 transition group ${i < 3 ? "md:after:content-['→'] md:after:absolute md:after:-right-4 md:after:top-1/2 md:after:-translate-y-1/2 md:after:text-white/20 md:after:text-2xl" : ""}`}>
              <div className="text-4xl font-black text-[#C2452D]/30 group-hover:text-[#C2452D]/60 transition mb-3">
                {s.num}
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-white/50 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          6 modules. <span className="gradient-text">Un seul dashboard.</span>
        </h2>
        <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
          Chaque module analyse un aspect clé de votre présence digitale.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`relative glass rounded-2xl p-7 hover:bg-white/10 transition group overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="text-4xl mb-4 animate-float">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TÉMOIGNAGE / PREUVE SOCIALE ===== */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="glass rounded-3xl p-10 md:p-14 animate-pulse-glow">
          <div className="text-5xl mb-6">💬</div>
          <blockquote className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed mb-6">
            &ldquo;On payait 120 000 MAD de commissions par an sans le savoir.
            Grâce à l&apos;audit RiadPulse, on a mis en place un moteur de réservation
            et on a récupéré 25% de réservations en direct en 3 mois.&rdquo;
          </blockquote>
          <div className="text-white/40 text-sm">
            — Gérant d&apos;un riad 8 chambres, Marrakech
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#C2452D]/10 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Prêt à arrêter de
            <br />
            <span className="gradient-text">perdre de l&apos;argent ?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            L&apos;audit de base est gratuit. Résultats en 2 minutes.
            Rapport PDF téléchargeable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/score"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-[#D4A843] hover:bg-[#E8C76A] text-[#0F1A2E] transition font-black text-lg shadow-lg shadow-[#D4A843]/25"
            >
              🏆 Score Global Gratuit
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl glass hover:bg-white/10 transition font-bold text-lg"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
