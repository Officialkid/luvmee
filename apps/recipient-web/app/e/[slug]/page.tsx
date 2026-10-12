import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedExperienceBySlug } from '@/lib/supabase';
import ExperienceRenderer from './ExperienceRenderer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const experience = await getPublishedExperienceBySlug(params.slug);

  if (!experience) {
    return {
      title: 'Surprise Not Found | LUVMEE'
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
  const experience = await getPublishedExperienceBySlug(params.slug);

  if (!experience) {
    notFound();
  }

  return <ExperienceRenderer experience={experience} />;
}
