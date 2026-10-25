import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    number: "01",
    title: "Audit du site web",
    desc: "Analysez votre HTTPS, vitesse, responsive et stack technique en quelques secondes.",
    metric: "10s",
    metricLabel: "par audit",
  },
  {
    number: "02",
    title: "Analyse du pricing",
    desc: "Comparez vos tarifs au marché local par ville, saison et catégorie.",
    metric: "6",
    metricLabel: "villes couvertes",
  },
  {
    number: "03",
    title: "Réputation en ligne",
    desc: "Centralisez vos notes, avis non répondus et tendances principales.",
    metric: "3",
    metricLabel: "plateformes",
  },
  {
    number: "04",
    title: "Commissions OTA",
    desc: "Découvrez précisément ce que vous versez à Booking, Airbnb et Expedia.",
    metric: "18%",
    metricLabel: "commission moyenne",
  },
  {
    number: "05",
    title: "Score global",
    desc: "Obtenez une note unique sur 100 pour mesurer la performance de votre établissement.",
    metric: "/100",
    metricLabel: "score pondéré",
  },
  {
    number: "06",
    title: "Rapport PDF",
    desc: "Recevez un rapport clair avec vos pertes et un plan d’action priorisé.",
    metric: "1",
    metricLabel: "clic pour exporter",
  },
];

const steps = [
  {
    number: "01",
    title: "Renseignez vos données",
    description: "URL, prix moyens, notes et commissions dans un formulaire simple.",
  },
  {
    number: "02",
    title: "Laissez l’analyse travailler",
    description: "Nos quatre modules analysent votre établissement simultanément.",
  },
  {
    number: "03",
    title: "Comprenez votre score",
    description: "Visualisez votre score, votre manque à gagner et votre benchmark local.",
  },
  {
    number: "04",
    title: "Passez à l’action",
    description: "Téléchargez votre rapport et appliquez les recommandations prioritaires.",
  },
];

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-[#e76f51]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d0f] text-white">
      <Header />

      {/* HERO */}
      <section className="relative px-6 pb-24 pt-28 sm:pt-36 lg:pb-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-180px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#e76f51]/[0.10] blur-[150px]" />
          <div className="absolute bottom-0 left-[-200px] h-[300px] w-[300px] rounded-full bg-[#f4a261]/[0.05] blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e76f51]/25 bg-[#e76f51]/[0.08] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#f4a261]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e76f51]" />
              Audit digital pour riads au Maroc
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Identifiez ce qui
              <br />
              <span className="text-white/45">réduit vos revenus.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
              Une analyse claire de votre site web, de votre pricing, de votre
              réputation et de vos commissions OTA.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/score"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#e76f51] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(231,111,81,0.2)] transition hover:bg-[#f07c5d] hover:shadow-[0_14px_50px_rgba(231,111,81,0.3)]"
              >
                Lancer mon audit
                <ArrowIcon />
              </Link>

              <Link
                href="/audit"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                Audit site web gratuit
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/40">
              <span className="flex items-center gap-2">
                <CheckIcon />
                Résultats en moins de 2 minutes
              </span>
              <span className="flex items-center gap-2">
                <CheckIcon />
                Sans carte bancaire
              </span>
            </div>
          </div>

          {/* SCORE PREVIEW */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#e76f51]/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-[#111416]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                    Aperçu du diagnostic
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Riad Dar Atlas
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                  <span className="h-2 w-2 rounded-full bg-green-400/70" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-white/40">Score global</p>
                    <p className="mt-2 text-6xl font-semibold tracking-[-0.06em]">
                      72
                      <span className="ml-1 text-xl text-white/25">/100</span>
                    </p>
                  </div>

                  <div className="rounded-full bg-[#e76f51]/10 px-3 py-1.5 text-xs font-medium text-[#f4a261]">
                    Bon potentiel
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#e76f51] to-[#f4a261]" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-white/35">Manque à gagner</p>
                  <p className="mt-2 text-lg font-semibold">112 400 MAD</p>
                  <p className="mt-1 text-xs text-[#e76f51]">par an estimé</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-xs text-white/35">Benchmark local</p>
                  <p className="mt-2 text-lg font-semibold">Top 28%</p>
                  <p className="mt-1 text-xs text-green-400/80">à Marrakech</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#e76f51]/20 bg-[#e76f51]/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e76f51]/15 text-[#f4a261]">
                    !
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">
                      Priorité détectée
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Votre dépendance aux OTA réduit votre marge annuelle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/[0.08] bg-white/[0.015] px-6 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="py-5 text-center md:px-10 md:py-2">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              15–22%
            </p>
            <p className="mt-2 text-sm text-white/40">
              de commission Booking moyenne
            </p>
          </div>

          <div className="py-5 text-center md:px-10 md:py-2">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              6 000+
            </p>
            <p className="mt-2 text-sm text-white/40">
              riads et hôtels au Maroc
            </p>
          </div>

          <div className="py-5 text-center md:px-10 md:py-2">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              &lt; 2 min
            </p>
            <p className="mt-2 text-sm text-white/40">
              pour obtenir votre diagnostic
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">
                Une vision complète
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Chaque détail compte dans la performance de votre riad.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/40">
              Un diagnostic construit pour transformer vos données en décisions
              concrètes.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative border-white/10 p-7 transition duration-300 hover:bg-white/[0.045] ${
                  index < 3 ? "border-b" : "border-b lg:border-b-0"
                } ${
                  index % 2 === 0
                    ? "md:border-r lg:border-r"
                    : "md:border-r-0 lg:border-r"
                } ${
                  index === 2 || index === 5 ? "lg:border-r-0" : ""
                }`}
              >
                <div className="mb-12 flex items-start justify-between">
                  <span className="text-xs font-medium tracking-[0.2em] text-[#e76f51]">
                    {feature.number}
                  </span>

                  <div className="text-right">
                    <p className="text-xl font-semibold text-white/90">
                      {feature.metric}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/30">
                      {feature.metricLabel}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-white/90">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {feature.desc}
                </p>

                <div className="mt-7 h-px w-8 bg-[#e76f51]/60 transition-all duration-300 group-hover:w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-y border-white/[0.08] bg-[#101315] px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">
              Comment ça marche
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              De vos données à un plan d’action clair.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-10 top-5 hidden h-px w-[calc(100%-2rem)] bg-white/10 md:block" />
                )}

                <div className="relative mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#e76f51]/40 bg-[#101315] text-xs font-semibold text-[#f4a261]">
                  {step.number}
                </div>

                <h3 className="text-base font-medium text-white/90">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULT */}
      <section className="px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-8 text-center sm:p-14">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">
              Exemple de résultat
            </p>

            <div className="mt-7 text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
              112 400{" "}
              <span className="text-2xl text-white/30 sm:text-3xl">MAD</span>
            </div>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
              de commissions récupérables par an pour un riad de 8 chambres à
              Marrakech.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Booking</span>
                <span className="mt-1 block font-medium text-white/80">
                  86 400 MAD
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Airbnb</span>
                <span className="mt-1 block font-medium text-white/80">
                  18 000 MAD
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Expedia</span>
                <span className="mt-1 block font-medium text-white/80">
                  8 000 MAD
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.08] px-6 py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e76f51]/[0.08] blur-[130px]" />

        <div className="relative mx-auto max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">
            Passez à l’action
          </p>

          <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Votre prochain gain commence ici.
          </h2>

          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-white/45">
            Lancez votre audit gratuitement et découvrez les opportunités
            cachées de votre établissement.
          </p>

          <Link
            href="/score"
            className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-[#e76f51] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(231,111,81,0.2)] transition hover:bg-[#f07c5d] hover:shadow-[0_14px_50px_rgba(231,111,81,0.3)]"
          >
            Lancer mon audit
            <ArrowIcon />
          </Link>

          <p className="mt-5 text-xs text-white/30">
            Gratuit · Sans carte bancaire · Résultats immédiats
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
