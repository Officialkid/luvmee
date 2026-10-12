import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Experience, STARTER_TEMPLATES, generateSlug } from '@luvmee/shared';

const STORAGE_KEY = '@luvmee_experiences_v1';

// Initial sample experiences if user has not created any yet
const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: 'exp-alikah-sample-1',
    userId: 'user-demo',
    templateId: 'playful-yes-no',
    title: "Alikah's Surprise 💖",
    creatorName: 'Daniel',
    recipientName: 'Alikah',
    slug: 'for-alikah-love',
    config: {
      ...STARTER_TEMPLATES[0].defaultConfig,
      creatorName: 'Daniel',
      recipientName: 'Alikah',
      title: "Hii Alikah! How is your day going? ✨"
    },
    status: 'published',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'exp-draft-sample-2',
    userId: 'user-demo',
    templateId: 'digital-love-letter',
    title: 'A Little Note For You',
    creatorName: 'Daniel',
    recipientName: 'Alikah',
    slug: 'a-little-note-draft',
    config: {
      ...STARTER_TEMPLATES[1].defaultConfig,
      creatorName: 'Daniel',
      recipientName: 'Alikah',
      title: 'A Little Note For You'
    },
    status: 'draft',
    publishedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const experienceService = {
  async getExperiences(): Promise<Experience[]> {
    try {
      // 1. Check local storage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let localList: Experience[] = [];

      if (stored) {
        localList = JSON.parse(stored);
      } else {
        // Initialize with default sample experiences
        localList = INITIAL_EXPERIENCES;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localList));
      }

      // 2. If authenticated with Supabase, attempt remote sync
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('experiences')
            .select('*')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false });

          if (!error && data && data.length > 0) {
            // Map db snake_case to Experience camelCase
            const remoteList: Experience[] = data.map((item: any) => ({
              id: item.id,
              userId: item.user_id,
              templateId: item.template_id,
              title: item.title,
              creatorName: item.creator_name,
              recipientName: item.recipient_name,
              slug: item.slug,
              config: item.config,
              status: item.status,
              publishedAt: item.published_at,
              createdAt: item.created_at,
              updatedAt: item.updated_at
            }));
            return remoteList;
          }
        }
      } catch (err) {
        // Fallback gracefully to local storage
      }

      return localList;
    } catch (error) {
      console.warn('Error fetching experiences:', error);
      return INITIAL_EXPERIENCES;
    }
  },

  async getExperienceById(id: string): Promise<Experience | null> {
    const all = await this.getExperiences();
    return all.find((exp) => exp.id === id) || null;
  },

  async saveExperience(experience: Experience): Promise<Experience> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let list: Experience[] = stored ? JSON.parse(stored) : INITIAL_EXPERIENCES;

      const existingIndex = list.findIndex((e) => e.id === experience.id);
      if (existingIndex >= 0) {
        list[existingIndex] = { ...experience, updatedAt: new Date().toISOString() };
      } else {
        list.unshift(experience);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Attempt Supabase save
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('experiences').upsert({
            id: experience.id,
            user_id: session.user.id,
            template_id: experience.templateId,
            title: experience.title,
            creator_name: experience.creatorName,
            recipient_name: experience.recipientName,
            slug: experience.slug,
            config: experience.config,
            status: experience.status,
            published_at: experience.publishedAt
          });
        }
      } catch (err) {
        // Non-blocking fallback
      }

      return experience;
    } catch (error) {
      console.error('Error saving experience:', error);
      throw error;
    }
  },

  async deleteExperience(id: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: Experience[] = JSON.parse(stored);
        const filtered = list.filter((e) => e.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('experiences').delete().eq('id', id).eq('user_id', session.user.id);
        }
      } catch (err) {
        // Non-blocking fallback
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  },

  async togglePublish(id: string): Promise<Experience | null> {
    const exp = await this.getExperienceById(id);
    if (!exp) return null;

    const newStatus = exp.status === 'published' ? 'draft' : 'published';
    const updated: Experience = {
      ...exp,
      status: newStatus,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    return await this.saveExperience(updated);
  },

  async duplicateExperience(id: string): Promise<Experience | null> {
    const original = await this.getExperienceById(id);
    if (!original) return null;

    const newSlug = generateSlug(original.recipientName);
    const duplicated: Experience = {
      ...original,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.saveExperience(duplicated);
  }
};
