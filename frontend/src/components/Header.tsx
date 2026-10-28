'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/tarifs', label: 'Tarifs' },
  ];

  const isActive = (href: string) =>
    pathname === href ? 'text-[#e76f51]' : 'text-gray-400 hover:text-white';

  return (
    <>
      {/* ── Bannière confiance ── */}
      <div className="bg-[#e76f51]/10 border-b border-[#e76f51]/20 py-2 px-4 text-center text-xs sm:text-sm text-[#f4a261]">
        <span className="font-medium">Gratuit</span>
        <span className="mx-2 text-white/20">|</span>
        <span className="font-medium">Sans inscription</span>
        <span className="mx-2 text-white/20">|</span>
        <span className="font-medium">100% confidentiel</span>
        <span className="mx-2 text-white/20">|</span>
        <span className="text-white/50">par Omar, RiadPulse</span>
      </div>

      {/* ── Navigation ── */}
      <header className="border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Riad<span className="text-[#e76f51]">Pulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`${isActive(l.href)} transition-colors`}>
                {l.label}
              </Link>
            ))}
            <Link href="/score" className="px-4 py-2 rounded-lg bg-[#e76f51] hover:bg-[#d4603f] text-white font-semibold text-sm transition-colors">
              Commencer l'audit
            </Link>
          </nav>
          <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a1628] px-6 py-4 space-y-3 text-sm">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`block ${isActive(l.href)} transition-colors`} onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/score" className="block px-4 py-2 rounded-lg bg-[#e76f51] text-white font-semibold text-center" onClick={() => setMobileOpen(false)}>
              Commencer l'audit
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;