import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-luvmee-rose/20 shadow-xl">
        <div className="w-16 h-16 bg-luvmee-blush rounded-full flex items-center justify-center mx-auto mb-4 text-luvmee-rose anim-pulse">
          <Heart className="w-8 h-8 fill-luvmee-rose" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-luvmee-blush text-luvmee-rose text-xs font-bold uppercase tracking-wider mb-3">
          Surprise Not Found
        </span>
        <h1 className="font-serif text-2xl font-bold text-luvmee-burgundy mb-2">
          This surprise is unavailable
        </h1>
        <p className="text-luvmee-burgundy-soft text-sm leading-relaxed mb-6">
          The link might have expired, been set back to a draft, or moved to a new secret location.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-semibold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          Return to LUVMEE
        </Link>
      </div>
    </main>
  );
}
