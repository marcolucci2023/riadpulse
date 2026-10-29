'use client';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#f4a261]/30 bg-[#f4a261]/5 text-[#f4a261] text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#f4a261] animate-pulse" />
          Bientot disponible
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Cette fonctionnalite arrive prochainement
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
          L'audit module par module est en cours de developpement. En attendant, lancez l'audit global complet en 2 minutes.
        </p>
        <Link href="/score" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#e76f51] hover:bg-[#d4603f] text-white font-bold text-lg transition-all">
          Lancer l'audit global
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </main>
    </div>
  );
}
