import Link from 'next/link';
import { Heart, Sparkles, Send, Gift } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl anim-pulse">💖</span>
          <span className="font-serif font-bold text-xl text-luvmee-burgundy tracking-tight">LUVMEE</span>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-white/80 rounded-full border border-luvmee-rose/20 text-luvmee-rose">
          V1 Release
        </span>
      </header>

      {/* Hero Section */}
      <section className="my-auto py-12 text-center">
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
        </div>
      </section>

      {/* Footer Info */}
      <footer className="py-6 text-center text-xs text-luvmee-muted border-t border-luvmee-rose/10">
        <p>Built with love. Mobile app created with React Native & Expo.</p>
      </footer>
    </main>
  );
}
