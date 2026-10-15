import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalNavProps {
  title: string;
  subtitle?: string;
}

export function LegalNav({ title, subtitle }: LegalNavProps) {
  return (
    <header className="border-b border-luvmee-rose/15 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-luvmee-burgundy hover:text-luvmee-rose transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl anim-pulse">💖</span>
          <span className="font-serif font-bold text-lg text-luvmee-burgundy tracking-tight">LUVMEE</span>
        </div>
      </div>
    </header>
  );
}
