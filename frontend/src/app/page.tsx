'use client';
import CTAAudit from "@/components/CTAAudit";
import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ──────────────────────────────────────────────
   ICONS — Heroicons outline, strokeWidth 1.5
   ────────────────────────────────────────────── */

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.727-3.558" />
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.749-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.251 2.251 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
  </svg>
);

const GaugeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const features = [
  {
    icon: GlobeIcon,
    num: '01',
    metric: '25%',
    title: 'Audit Site Web',
    desc: 'Vitesse, mobile, SEO, sécurité. Les 4 piliers qui font fuir ou rester vos visiteurs.',
  },
  {
    icon: TagIcon,
    num: '02',
    metric: '20%',
    title: 'Analyse Pricing',
    desc: 'Comparez vos tarifs à la concurrence locale et identifiez les nuits sous-valorisées.',
  },
  {
    icon: StarIcon,
    num: '03',
    metric: '35%',
    title: 'E-Réputation',
    desc: 'Booking, TripAdvisor, Google. Un score unifié et les actions pour monter en classement.',
  },
  {
    icon: TrendingDownIcon,
    num: '04',
    metric: '20%',
    title: 'Commissions OTA',
    desc: 'Calculez exactement ce que vous perdez chaque année et comment récupérer en direct.',
  },
  {
    icon: ChartBarIcon,
    num: '05',
    metric: '100',
    title: 'Score Global',
    desc: 'Un score sur 100 qui synthétise tout. Simple, clair, comparable dans le temps.',
  },
  {
    icon: DocumentIcon,
    num: '06',
    metric: 'PDF',
    title: 'Rapport Complet',
    desc: 'Un document professionnel à partager avec votre équipe ou vos investisseurs.',
  },
];

const steps = [
  { icon: ClipboardIcon, num: '1', title: 'Entrez vos données', desc: 'URL de votre site, tarifs, notes OTA. 2 minutes suffisent.' },
  { icon: CpuIcon, num: '2', title: 'Analyse instantanée', desc: 'Nos algorithmes croisent vos données avec les benchmarks du marché marocain.' },
  { icon: GaugeIcon, num: '3', title: 'Score & Priorités', desc: 'Recevez votre score global et la liste classée des actions à fort impact.' },
  { icon: DownloadIcon, num: '4', title: 'Rapport PDF', desc: 'Téléchargez un rapport complet, prêt à être partagé avec votre équipe.' },
];

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */

export default function Home() {
  const [year, setYear] = useState('');
  useEffect(() => { setYear(new Date().getFullYear().toString()); }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white font-sans antialiased">

      {/* ── NAV ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#e76f51]/10 border-b border-[#e76f51]/20 py-2 px-4 text-center text-xs sm:text-sm text-[#f4a261]"><span className="font-medium">Gratuit</span><span className="mx-2 text-white/20">|</span><span className="font-medium">Sans inscription</span><span className="mx-2 text-white/20">|</span><span className="font-medium">100% confidentiel</span><span className="mx-2 text-white/20">|</span><span className="text-white/50">par Omar, RiadPulse</span></div>
      <nav className="fixed top-10 left-0 right-0 z-50 border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Riad<span className="text-[#e76f51]">Pulse</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#process" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#result" className="hover:text-white transition-colors">Résultat</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/score"
              className="text-sm px-4 py-2 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-medium transition-colors"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e76f51]/20 bg-[#e76f51]/5 text-[#f4a261] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e76f51] animate-pulse" />
              Audit digital pour riads & hôtels indépendants
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] tracking-tight">
              Identifiez ce qui{' '}
              <span className="bg-gradient-to-r from-[#e76f51] to-[#f4a261] bg-clip-text text-transparent">
                réduit vos revenus.
              </span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              En moins de 2 minutes, obtenez un diagnostic complet de votre présence digitale,
              de vos tarifs et de vos commissions. Avec des priorités chiffrées en MAD.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/score"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-semibold transition-all hover:shadow-lg hover:shadow-[#e76f51]/20"
              >
                Lancer mon audit gratuit
                <ArrowRightIcon />
              </Link>
              <Link
                href="/score"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-all"
              >
                Voir un exemple
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#f4a261]/30 hover:border-[#f4a261]/60 text-[#f4a261] hover:text-white font-medium transition-all"
              >
                Voir les tarifs
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-[#e76f51]"><CheckIcon /></span>
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#e76f51]"><CheckIcon /></span>
                Résultats immédiats
              </span>
            </div>
          </div>

          {/* Right — Preview Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#e76f51]/10 to-[#f4a261]/10 rounded-2xl blur-2xl" />
            <div className="relative bg-[#0f1d32] border border-white/[0.06] rounded-2xl p-6 space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Aperçu du diagnostic</p>
                  <p className="text-lg font-semibold mt-1">Riad Dar Atlas</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#f4a261]">72<span className="text-lg text-gray-500">/100</span></p>
                  <p className="text-xs text-[#e76f51] font-medium">Bon potentiel</p>
                </div>
              </div>

              {/* Progress */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-gradient-to-r from-[#e76f51] to-[#f4a261] rounded-full" />
              </div>

              {/* Mini cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Manque à gagner</p>
                  <p className="text-xl font-bold text-[#e76f51] mt-1">112 400 <span className="text-sm font-normal text-gray-500">MAD</span></p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Benchmark local</p>
                  <p className="text-xl font-bold text-[#f4a261] mt-1">Top 28<span className="text-sm font-normal text-gray-500">%</span></p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-[#e76f51]/5 border border-[#e76f51]/10 rounded-xl p-4">
                <span className="text-[#e76f51] mt-0.5 shrink-0"><ExclamationIcon /></span>
                <div>
                  <p className="text-sm font-medium text-[#f4a261]">Priorité détectée</p>
                  <p className="text-xs text-gray-400 mt-0.5">38% de vos réservations passent par Booking.com. Un site optimisé pourrait réduire ce taux de 15 points.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-[#0f1d32]/50">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '15-22%', label: 'de commissions économisables' },
            { value: '6 000+', label: 'établissements au Maroc' },
            { value: '<2 min', label: 'pour un diagnostic complet' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#e76f51] to-[#f4a261] bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-[#e76f51] font-semibold mb-3">Modules d&apos;audit</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              6 analyses. Un seul score.
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Chaque module est pondéré selon son impact réel sur votre chiffre d&apos;affaires.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.num}
                className="group relative bg-[#0f1d32] border border-white/[0.06] rounded-xl p-6 hover:border-[#e76f51]/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#e76f51]/10 flex items-center justify-center text-[#e76f51] group-hover:bg-[#e76f51]/20 transition-colors">
                    <f.icon />
                  </div>
                  <span className="text-xs font-mono text-gray-600">{f.num}</span>
                </div>
                <p className="text-2xl font-bold text-[#f4a261] mb-1">{f.metric}</p>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#e76f51]/0 to-transparent group-hover:via-[#e76f51]/40 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="py-24 px-6 bg-[#0f1d32]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-[#e76f51] font-semibold mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              4 étapes. Zéro complexité.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#e76f51]/10 border border-[#e76f51]/10 flex items-center justify-center text-[#e76f51]">
                    <s.icon />
                  </div>
                  <p className="text-xs font-mono text-gray-600">Étape {s.num}</p>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULT EXAMPLE ── */}
      <section id="result" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#e76f51] font-semibold mb-3">Exemple réel</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ce que révèle un audit RiadPulse.
            </h2>
          </div>

          <div className="bg-[#0f1d32] border border-white/[0.06] rounded-2xl p-8 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Riad fictif — Marrakech Médina</p>
                <p className="text-2xl font-bold mt-1">112 400 MAD</p>
                <p className="text-[#e76f51] text-sm font-medium">de commissions récupérables par an</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-[#f4a261]">73.6</p>
                <p className="text-sm text-gray-500">Score Global — Grade B</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { ota: 'Booking.com', pct: '38%', loss: '68 400 MAD' },
                { ota: 'Airbnb', pct: '12%', loss: '21 600 MAD' },
                { ota: 'Expedia', pct: '8%', loss: '22 400 MAD' },
              ].map((o) => (
                <div key={o.ota} className="bg-white/[0.03] rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">{o.ota}</p>
                  <p className="text-lg font-bold mt-1">{o.pct}</p>
                  <p className="text-xs text-[#e76f51] mt-0.5">-{o.loss}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/score"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-semibold transition-all"
              >
                Obtenir mon diagnostic
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>
   

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-[#e76f51] font-semibold mb-3">Tarifs</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Des formules simples, sans surprise.
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Paiement par virement bancaire ou en especes. Aucun abonnement cache.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Flash */}
            <div className="bg-[#0f1d32] border border-white/[0.06] rounded-2xl p-8 flex flex-col">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Audit Flash</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">490</span>
                <span className="text-gray-500 ml-2">MAD</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Diagnostic rapide de votre presence en ligne.</p>
              <ul className="space-y-3 text-sm text-gray-300 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Score global sur 100</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>3 recommandations cles</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Benchmark local</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Rapport PDF 5 pages</li>
              </ul>
              <Link href="/score" className="mt-8 block text-center py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-all">
                Commander
              </Link>
            </div>

            {/* Complet */}
            <div className="bg-[#1a2a44] border-2 border-[#e76f51] rounded-2xl p-8 flex flex-col relative">
              <span className="absolute -top-3 right-6 bg-[#e76f51] text-white text-xs font-bold px-4 py-1 rounded-full">RECOMMANDE</span>
              <p className="text-sm text-[#f4a261] uppercase tracking-wider">Audit Complet + Plan d'Action</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">1 500</span>
                <span className="text-gray-500 ml-2">MAD</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Analyse approfondie avec plan d'action detaille.</p>
              <ul className="space-y-3 text-sm text-gray-300 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Score global + 4 modules</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Rapport PDF 10 pages</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Appel de restitution 30 min</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Plan d'action 90 jours</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Calculateur commissions</li>
              </ul>
              <Link href="/score" className="mt-8 block text-center py-3 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-semibold transition-all">
                Commander
              </Link>
            </div>

            {/* Suivi */}
            <div className="bg-[#0f1d32] border border-white/[0.06] rounded-2xl p-8 flex flex-col">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Suivi Mensuel</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">700</span>
                <span className="text-gray-500 ml-2">MAD/mois</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Accompagnement continu pour maximiser vos revenus.</p>
              <ul className="space-y-3 text-sm text-gray-300 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Suivi mensuel des KPIs</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Strategie tarifaire</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Optimisation distribution</li>
                <li className="flex items-start gap-2"><span className="text-[#25D366] mt-0.5">&#10003;</span>Support WhatsApp prioritaire</li>
              </ul>
              <Link href="/score" className="mt-8 block text-center py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-all">
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Prêt à voir ce que vous perdez ?
          </h2>
          <p className="text-gray-400 text-lg">
            Rejoignez les riads et hôtels qui ont déjà identifié leurs leviers de croissance.
          </p>
          <Link
            href="/score"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#e76f51] to-[#f4a261] hover:shadow-xl hover:shadow-[#e76f51]/20 text-white font-bold text-lg transition-all"
          >
            Commencer gratuitement
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {year} RiadPulse. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
      <CTAAudit />	
    </div>
  );
}
