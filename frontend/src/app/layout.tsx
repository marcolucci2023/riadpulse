import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
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
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}