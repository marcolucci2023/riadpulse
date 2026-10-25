import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    title: "Audit site web",
    desc: "HTTPS, vitesse, responsive, stack technique. Score sur 100 en 10 secondes.",
    metric: "10s",
    metricLabel: "par audit",
  },
  {
    title: "Analyse pricing",
    desc: "Vos tarifs comparés au marché local par ville et catégorie. Écart en MAD.",
    metric: "6",
    metricLabel: "villes couvertes",
  },
  {
    title: "Réputation",
    desc: "Booking, TripAdvisor, Google. Notes, avis non répondus, tendances.",
    metric: "3",
    metricLabel: "plateformes",
  },
  {
    title: "Commissions OTA",
    desc: "Calcul précis de ce que vous versez à Booking, Airbnb, Expedia chaque année.",
    metric: "18%",
    metricLabel: "commission moy.",
  },
  {
    title: "Score Global",
    desc: "Un score unique sur 100 qui synthétise les 4 modules. Benchmark par ville.",
    metric: "/100",
    metricLabel: "score pondéré",
  },
  {
    title: "Rapport PDF",
    desc: "Document professionnel avec score, pertes, et plan d'action priorisé.",
    metric: "1",
    metricLabel: "clic pour exporter",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C2452D]/[0.07] rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/50 mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2452D] animate-pulse" />
            Audit digital pour riads au Maroc
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
            Trouvez où votre
            <br />
            riad perd de
            <br />
            <span className="text-white/30">l&apos;argent.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-12 leading-relaxed">
            Commissions, pricing, réputation, site web.
            Score sur 100 et plan d&apos;action chiffré en 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/score"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition"
            >
              Lancer un audit
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/10 text-white/70 font-medium text-sm hover:bg-white/5 transition"
            >
              Audit site web gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-white/[0.06] py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          <div className="py-6 md:py-0 md:px-10 text-center">
            <div className="text-3xl md:text-4xl font-bold tracking-tight">15-22%</div>
            <div className="text-white/30 text-sm mt-2">de commission Booking moyenne</div>
          </div>
          <div className="py-6 md:py-0 md:px-10 text-center">
            <div className="text-3xl md:text-4xl font-bold tracking-tight">6 000+</div>
            <div className="text-white/30 text-sm mt-2">riads et hôtels au Maroc</div>
          </div>
          <div className="py-6 md:py-0 md:px-10 text-center">
            <div className="text-3xl md:text-4xl font-bold tracking-tight">&lt; 2 min</div>
            <div className="text-white/30 text-sm mt-2">pour un audit complet</div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Modules</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tout ce qu&apos;il faut pour
            <br />
            <span className="text-white/30">auditer un établissement.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#09090B] p-8 hover:bg-white/[0.02] transition-colors duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 group-hover:border-white/20 group-hover:text-white/60 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white/80">{f.metric}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/20">{f.metricLabel}</div>
                </div>
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-t border-white/[0.06] py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Processus</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Quatre étapes.
              <br />
              <span className="text-white/30">Zéro friction.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Entrez vos données", desc: "URL, prix, notes, commissions. Formulaire unique." },
              { num: "02", title: "Analyse automatique", desc: "4 modules tournent en parallèle sur votre établissement." },
              { num: "03", title: "Score et diagnostic", desc: "Score /100, manque à gagner en MAD, benchmark ville." },
              { num: "04", title: "Rapport PDF", desc: "Document professionnel avec plan d'action priorisé." },
            ].map((s) => (
              <div key={s.num} className="relative">
                <div className="text-5xl font-bold text-white/[0.04] mb-4">{s.num}</div>
                <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="border-t border-white/[0.06] py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-8">Résultat type</p>
          <div className="border border-white/[0.06] rounded-2xl p-10 md:p-14">
            <div className="text-6xl md:text-7xl font-bold tracking-tight mb-2">
              112 400 <span className="text-white/20 text-3xl">MAD</span>
            </div>
            <p className="text-white/30 text-lg mb-8">
              de commissions récupérables par an pour un riad de 8 chambres à Marrakech.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/20">
              <span>Booking: 86 400 MAD</span>
              <span className="text-white/10">|</span>
              <span>Airbnb: 18 000 MAD</span>
              <span className="text-white/10">|</span>
              <span>Expedia: 8 000 MAD</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="border-t border-white/[0.06] py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Commencez gratuitement.
          </h2>
          <p className="text-white/30 text-lg mb-10 max-w-md mx-auto">
            Pas de carte de crédit. Pas d&apos;engagement.
            Résultats immédiats.
          </p>
          <Link
            href="/score"
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition"
          >
            Lancer mon audit
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
