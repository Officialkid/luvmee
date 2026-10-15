import { createClient } from '@supabase/supabase-js';
import { Experience, getTemplateById } from '@luvmee/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetches a published experience by its public URL slug.
 * Falls back to built-in templates if Supabase is not yet connected or for testing.
 */
export async function getPublishedExperienceBySlug(slug: string): Promise<Experience | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        userId: data.user_id,
        templateId: data.template_id,
        title: data.title,
        creatorName: data.creator_name,
        recipientName: data.recipient_name,
        slug: data.slug,
        config: data.config,
        status: data.status,
        sharingMode: data.sharing_mode || 'public_link',
        recipientId: data.recipient_id || null,
        publishedAt: data.published_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
  }

  // If experience is not returned by normal SELECT (e.g. anonymous visitor on partner_exclusive),
  // check public access state RPC to determine if this is a private surprise
  if (supabase) {
    try {
      const { data: accessState } = await supabase.rpc('get_experience_access_state', {
        p_slug: slug
      });

      if (accessState?.exists && accessState?.sharingMode === 'partner_exclusive') {
        const defaultTemplate = getTemplateById('playful-yes-no')!;
        return {
          id: '00000000-0000-0000-0000-000000000000',
          userId: '00000000-0000-0000-0000-000000000000',
          templateId: 'playful-yes-no',
          title: 'Private Partner Surprise',
          creatorName: 'A Connected Partner',
          recipientName: accessState.recipientName || 'Partner',
          slug: slug,
          config: defaultTemplate.defaultConfig,
          status: 'published',
          sharingMode: 'partner_exclusive',
          recipientId: null,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch {
      // Fall through to null
    }
  }

  return null;
}

/**
 * Submits recipient response (e.g., YES answer or sweet response note).
 */
export async function submitRecipientResponse(
  experienceId: string,
  responseType: 'yes' | 'custom_note',
  responseValue: string
): Promise<boolean> {
  if (!supabase) return true; // Graceful simulation

  const { error } = await supabase.from('recipient_responses').insert({
    experience_id: experienceId,
    response_type: responseType,
    response_value: responseValue
  });

  return !error;
}
