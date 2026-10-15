import React, { Suspense } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Gift, Download } from 'lucide-react';
import { PartnerInviteBanner } from '../components/PartnerInviteBanner';

const apkDownloadUrl =
  'https://expo.dev/accounts/dan.mwaili/projects/luvmee/builds/8a24c374-7809-4544-9153-3164deaf71a0';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl anim-pulse">💖</span>
          <span className="font-serif font-bold text-xl text-luvmee-burgundy tracking-tight">LUVMEE</span>
        </div>
        <a
          href={apkDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-3 py-1 bg-white/80 rounded-full border border-luvmee-rose/30 text-luvmee-rose hover:bg-rose-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3 h-3" />
          <span>Get App</span>
        </a>
      </header>

      {/* Hero & Content */}
      <section className="my-auto py-6 text-center">
        {/* Dynamic Partner Invitation Banner (reads ?code=... from URL) */}
        <Suspense fallback={null}>
          <PartnerInviteBanner />
        </Suspense>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-luvmee-rose/25 text-luvmee-rose text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Romantic Digital Experiences</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-luvmee-burgundy leading-tight mb-4 tracking-tight">
          Surprises crafted <br />
          <span className="text-luvmee-rose italic">just for them.</span>
        </h1>

        <p className="text-luvmee-burgundy-soft text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-8">
          Personalized interactive love letters, playful questions with escaping buttons, and gift unboxing experiences designed to make someone smile.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/e/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-bold text-base shadow-lg shadow-luvmee-rose/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <span>Preview A Surprise</span>
            <Gift className="w-4 h-4" />
          </Link>
          <a
            href={apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-luvmee-rose/30 text-luvmee-burgundy font-bold text-base shadow hover:bg-rose-50 transition-colors"
          >
            <Download className="w-4 h-4 text-luvmee-rose" />
            <span>Download APK</span>
          </a>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="py-8 text-center text-xs text-luvmee-muted border-t border-luvmee-rose/15 mt-8">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3 font-medium text-luvmee-burgundy-soft text-xs">
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
        <p className="text-[11px] text-luvmee-muted">Built with love. Mobile app created with React Native & Expo.</p>
      </footer>
    </main>
  );
}
