import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';
import { getPublishedExperienceBySlug } from '@/lib/supabase';
import ExperienceRenderer from './ExperienceRenderer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getPublishedExperienceBySlug(slug);

  if (!experience) {
    return {
      title: 'Surprise Not Found | LUVMEE'
    };
  }

  if (experience.status === 'draft') {
    return {
      title: 'Surprise in Progress | LUVMEE'
    };
  }

  if (experience.sharingMode === 'partner_exclusive') {
    return {
      title: 'Private Partner Surprise 🔒 | LUVMEE',
      description: 'A private romantic surprise for a connected partner on LUVMEE.',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return {
    title: `${experience.title} ❤️ | For ${experience.recipientName}`,
    description: `A special romantic surprise crafted for ${experience.recipientName} with LUVMEE.`,
    openGraph: {
      title: `A special surprise for you, ${experience.recipientName} 💌`,
      description: `Someone special crafted an interactive romantic surprise just for you.`,
      type: 'website'
    }
  };
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getPublishedExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  if (experience.status === 'draft') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-luvmee-rose/20 shadow-xl">
          <div className="w-16 h-16 bg-luvmee-blush rounded-full flex items-center justify-center mx-auto mb-4 text-luvmee-rose">
            <Sparkles className="w-8 h-8 text-luvmee-rose" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
            Draft In Progress
          </span>
          <h1 className="font-serif text-2xl font-bold text-luvmee-burgundy mb-2">
            Surprise Still In The Works ✨
          </h1>
          <p className="text-luvmee-burgundy-soft text-sm leading-relaxed mb-6">
            This surprise is still being prepared by its creator. Please check back once it has been officially published!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-semibold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            Explore LUVMEE
          </Link>
        </div>
      </main>
    );
  }

  if (experience.sharingMode === 'partner_exclusive') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-luvmee-blush via-white to-luvmee-ivory">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-luvmee-rose/20 shadow-2xl">
          <div className="w-16 h-16 bg-luvmee-blush rounded-full flex items-center justify-center mx-auto mb-4 text-luvmee-rose">
            <Lock className="w-8 h-8 text-luvmee-rose" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-luvmee-rose text-xs font-bold uppercase tracking-wider mb-3">
            Partner-Exclusive 🔒
          </span>
          <h1 className="font-serif text-2xl font-bold text-luvmee-burgundy mb-2">
            Private Romantic Surprise
          </h1>
          <p className="text-luvmee-burgundy-soft text-sm leading-relaxed mb-6">
            This experience was created exclusively for a connected partner on LUVMEE. To protect privacy, please open it in the LUVMEE mobile app or sign in.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`luvmee://e/${slug}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-luvmee-rose to-rose-600 text-white font-semibold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              Open in LUVMEE App
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-luvmee-rose/30 text-luvmee-rose font-medium text-sm hover:bg-luvmee-blush/30 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <ExperienceRenderer experience={experience} />;
}
