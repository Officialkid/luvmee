import React from 'react';
import Link from 'next/link';

export function LegalFooter() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-luvmee-rose/15 bg-white/50 mt-16 py-8 text-center text-xs text-luvmee-muted">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 font-medium text-luvmee-burgundy-soft">
          <Link href="/privacy" className="hover:text-luvmee-rose transition-colors">
            Privacy Policy
          </Link>
          <span className="text-luvmee-rose/30">•</span>
          <Link href="/terms" className="hover:text-luvmee-rose transition-colors">
            Terms of Service
          </Link>
          <span className="text-luvmee-rose/30">•</span>
          <Link href="/support" className="hover:text-luvmee-rose transition-colors">
            Help & Support
          </Link>
          <span className="text-luvmee-rose/30">•</span>
          <Link href="/delete-account" className="hover:text-luvmee-rose transition-colors">
            Delete Account
          </Link>
        </div>

        <p className="text-[11px] text-luvmee-muted mb-1">
          © {currentYear} LUVMEE. All rights reserved. Built with love for couples and relationships.
        </p>
        <p className="text-[10px] text-luvmee-muted/80">
          Mobile application developed with React Native & Expo. Recipient experiences powered by Next.js.
        </p>
      </div>
    </footer>
  );
}
