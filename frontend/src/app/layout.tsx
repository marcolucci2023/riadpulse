import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RiadPulse — Audit Digital pour Riads & Hôtels",
  description:
    "Découvrez exactement où votre riad perd de l'argent en commissions et comment vendre plus en direct. Audit digital complet, score de performance, analyse concurrentielle.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}