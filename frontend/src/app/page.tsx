import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ============ ICÔNES SVG PROFESSIONNELLES ============

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-[#e76f51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

// Icônes du process
function ClipboardIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

// ============ DATA ============

const features = [
  { number: "01", title: "Audit du site web", desc: "Analysez votre HTTPS, vitesse, responsive et stack technique en quelques secondes.", metric: "10s", metricLabel: "par audit", Icon: GlobeIcon },
  { number: "02", title: "Analyse du pricing", desc: "Comparez vos tarifs au marché local par ville, saison et catégorie.", metric: "6", metricLabel: "villes couvertes", Icon: TagIcon },
  { number: "03", title: "Réputation en ligne", desc: "Centralisez vos notes, avis non répondus et tendances principales.", metric: "3", metricLabel: "plateformes", Icon: StarIcon },
  { number: "04", title: "Commissions OTA", desc: "Découvrez précisément ce que vous versez à Booking, Airbnb et Expedia.", metric: "18%", metricLabel: "commission moyenne", Icon: TrendingDownIcon },
  { number: "05", title: "Score global", desc: "Obtenez une note unique sur 100 pour mesurer la performance de votre établissement.", metric: "/100", metricLabel: "score pondéré", Icon: ChartBarIcon },
  { number: "06", title: "Rapport PDF", desc: "Recevez un rapport clair avec vos pertes et un plan d'action priorisé.", metric: "1", metricLabel: "clic pour exporter", Icon: DocumentIcon },
];

const steps = [
  { number: "01", title: "Renseignez vos données", description: "URL, prix moyens, notes et commissions dans un formulaire simple.", Icon: ClipboardIcon },
  { number: "02", title: "Laissez l'analyse travailler", description: "Nos quatre modules analysent votre établissement simultanément.", Icon: CpuIcon },
  { number: "03", title: "Comprenez votre score", description: "Visualisez votre score, votre manque à gagner et votre benchmark local.", Icon: GaugeIcon },
  { number: "04", title: "Passez à l'action", description: "Téléchargez votre rapport et appliquez les recommandations prioritaires.", Icon: DownloadIcon },
];

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
              <Link href="/score" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#e76f51] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(231,111,81,0.2)] transition hover:bg-[#f07c5d] hover:shadow-[0_14px_50px_rgba(231,111,81,0.3)]">
                Lancer mon audit
                <ArrowIcon />
              </Link>

              <Link href="/audit" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.07]">
                Audit site web gratuit
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/40">
              <span className="flex items-center gap-2"><CheckIcon />Résultats en moins de 2 minutes</span>
              <span className="flex items-center gap-2"><CheckIcon />Sans carte bancaire</span>
            </div>
          </div>

          {/* SCORE PREVIEW */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#e76f51]/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-[#111416]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Aperçu du diagnostic</p>
                  <p className="mt-1 text-sm text-white/70">Riad Dar Atlas</p>
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
                      72<span className="ml-1 text-xl text-white/25">/100</span>
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
                    <WarningIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">Priorité détectée</p>
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
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">15–22%</p>
            <p className="mt-2 text-sm text-white/40">de commission Booking moyenne</p>
          </div>
          <div className="py-5 text-center md:px-10 md:py-2">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">6 000+</p>
            <p className="mt-2 text-sm text-white/40">riads et hôtels au Maroc</p>
          </div>
          <div className="py-5 text-center md:px-10 md:py-2">
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">&lt; 2 min</p>
            <p className="mt-2 text-sm text-white/40">pour obtenir votre diagnostic</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">Une vision complète</p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Chaque détail compte dans la performance de votre riad.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/40">
              Un diagnostic construit pour transformer vos données en décisions concrètes.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.Icon;
              return (
                <div
                  key={feature.title}
                  className={`group relative border-white/10 p-7 transition duration-300 hover:bg-white/[0.045] ${
                    index < 3 ? "border-b" : "border-b lg:border-b-0"
                  } ${
                    index % 2 === 0 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
                  } ${
                    index === 2 || index === 5 ? "lg:border-r-0" : ""
                  }`}
                >
                  <div className="mb-12 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e76f51]/25 bg-[#e76f51]/[0.08] text-[#f4a261] transition group-hover:border-[#e76f51]/40 group-hover:bg-[#e76f51]/[0.12]">
                        <Icon />
                      </div>
                      <span className="text-xs font-medium tracking-[0.2em] text-[#e76f51]">
                        {feature.number}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-white/90">{feature.metric}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/30">
                        {feature.metricLabel}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-white/90">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/40">{feature.desc}</p>

                  <div className="mt-7 h-px w-8 bg-[#e76f51]/60 transition-all duration-300 group-hover:w-16" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-y border-white/[0.08] bg-[#101315] px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">Comment ça marche</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              De vos données à un plan d&apos;action clair.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.Icon;
              return (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-5 hidden h-px w-[calc(100%-2rem)] bg-white/10 md:block" />
                  )}

                  <div className="relative mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#e76f51]/40 bg-[#101315] text-[#f4a261]">
                    <Icon />
                  </div>

                  <div className="mb-2 text-xs font-medium tracking-[0.2em] text-[#e76f51]">
                    {step.number}
                  </div>

                  <h3 className="text-base font-medium text-white/90">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/40">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESULT */}
      <section className="px-6 py-28 lg:py-36">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-8 text-center sm:p-14">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">Exemple de résultat</p>

            <div className="mt-7 text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
              112 400 <span className="text-2xl text-white/30 sm:text-3xl">MAD</span>
            </div>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
              de commissions récupérables par an pour un riad de 8 chambres à Marrakech.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Booking</span>
                <span className="mt-1 block font-medium text-white/80">86 400 MAD</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Airbnb</span>
                <span className="mt-1 block font-medium text-white/80">18 000 MAD</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-white/55">
                <span className="block text-xs text-white/30">Expedia</span>
                <span className="mt-1 block font-medium text-white/80">8 000 MAD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.08] px-6 py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e76f51]/[0.08] blur-[130px]" />

        <div className="relative mx-auto max-w-2xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#f4a261]">Passez à l&apos;action</p>

          <h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Votre prochain gain commence ici.
          </h2>

          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-white/45">
            Lancez votre audit gratuitement et découvrez les opportunités cachées de votre établissement.
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
