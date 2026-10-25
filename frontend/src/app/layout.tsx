import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RiadPulse — Audit Digital pour Riads & Hôtels',
  description: 'Score global, audit site web, pricing, e-réputation, commissions OTA. Le diagnostic digital complet pour riads et hôtels indépendants au Maroc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-[#0a1628] text-gray-100">
        {/* ── HEADER ── */}
        <header className="border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Riad<span className="text-[#e76f51]">Pulse</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Tableau de bord</Link>
              <Link href="/audit" className="hover:text-white transition-colors">Nouvel audit</Link>
              <Link href="/score" className="hover:text-white transition-colors">Score global</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Connexion</Link>
              <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-medium transition-colors">Inscription</Link>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="flex-1">{children}</main>

        {/* ── FOOTER ── */}
        <Footer />
      </body>
    </html>
  );
}