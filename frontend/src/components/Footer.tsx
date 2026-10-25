'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Footer() {
  const [year, setYear] = useState('');
  useEffect(() => { setYear(new Date().getFullYear().toString()); }, []);

  return (
    <footer className="border-t border-white/5 bg-[#0f1d32]/50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© {year} RiadPulse — L&apos;audit digital qui fait grandir votre riad.</p>
        <div className="flex items-center gap-6">
          <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
          <Link href="/politique-confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}