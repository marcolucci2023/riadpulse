'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getToken } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    window.location.href = '/login';
  };

  const navLinks = loggedIn
    ? [
        { href: '/dashboard', label: 'Tableau de bord' },
        { href: '/audit', label: 'Nouvel audit' },
        { href: '/score', label: 'Score global' },
      ]
    : [
        { href: '/login', label: 'Connexion' },
        { href: '/register', label: 'Inscription' },
      ];

  const isActive = (href: string) =>
    pathname === href ? 'text-[#e76f51]' : 'text-gray-400 hover:text-white';

  return (
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
          {loggedIn && (
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
              Déconnexion
            </button>
          )}
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
          {loggedIn && (
            <button onClick={handleLogout} className="block text-gray-500 hover:text-red-400 transition-colors">
              Déconnexion
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;