import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Experience, generateSlug } from '@luvmee/shared';

const EXPERIENCES_STORAGE_PREFIX = '@luvmee_experiences_v1';

export const experienceService = {
  /**
   * Clears cached experiences for a given user or local guest.
   */
  async clearCache(userId?: string | null): Promise<void> {
    try {
      if (userId) {
        await AsyncStorage.removeItem(`${EXPERIENCES_STORAGE_PREFIX}_${userId}`);
      }
      await AsyncStorage.removeItem(`${EXPERIENCES_STORAGE_PREFIX}_local`);
      await AsyncStorage.removeItem(EXPERIENCES_STORAGE_PREFIX);
    } catch (e) {
      console.warn('Error clearing experiences cache:', e);
    }
  },

  /**
   * Retrieves all experiences belonging to the active user (or local guest drafts).
   * Synchronizes with Supabase cloud when authenticated.
   */
  async getExperiences(): Promise<Experience[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const cacheKey = userId ? `${EXPERIENCES_STORAGE_PREFIX}_${userId}` : `${EXPERIENCES_STORAGE_PREFIX}_local`;

      // 1. Read local storage cache
      const stored = await AsyncStorage.getItem(cacheKey);
      let localList: Experience[] = stored ? JSON.parse(stored) : [];

      // 2. If authenticated with Supabase, query cloud experiences
      try {
        if (userId) {
          const { data, error } = await supabase
            .from('experiences')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

          if (!error && data) {
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
              sharingMode: item.sharing_mode || 'public_link',
              recipientId: item.recipient_id || null,
              publishedAt: item.published_at,
              createdAt: item.created_at,
              updatedAt: item.updated_at
            }));

            // Sync remote list back into local cache
            await AsyncStorage.setItem(cacheKey, JSON.stringify(remoteList));
            return remoteList;
          }
        }
      } catch (err) {
        // Fallback gracefully to local cache when offline
        console.warn('Network sync skipped, using local cache:', err);
      }

      return localList;
    } catch (error) {
      console.warn('Error fetching experiences:', error);
      return [];
    }
  },

  /**
   * Finds a specific experience by ID.
   */
  async getExperienceById(id: string): Promise<Experience | null> {
    const all = await this.getExperiences();
    return all.find((exp) => exp.id === id) || null;
  },

  /**
   * Saves an experience.
   * If published or requireCloudSync=true, requires Supabase authentication and verifies cloud persistence.
   */
  async saveExperience(experience: Experience, requireCloudSync = false): Promise<Experience> {
    try {
      // Resolve active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const authenticatedUserId = session?.user?.id;

      // Ensure experience user ID reflects active session
      const preparedExperience: Experience = {
        ...experience,
        userId: authenticatedUserId || experience.userId || 'local-guest',
        sharingMode: experience.sharingMode || 'public_link',
        recipientId: experience.recipientId || null,
        updatedAt: new Date().toISOString()
      };

      // If publishing, require authentication to guarantee cloud reachability
      if (preparedExperience.status === 'published' || requireCloudSync) {
        if (!authenticatedUserId) {
          throw new Error('Authentication is required to publish live surprises to the web. Please sign in or register.');
        }

        // Perform Supabase upsert
        const { error: dbError } = await supabase.from('experiences').upsert({
          id: preparedExperience.id,
          user_id: authenticatedUserId,
          template_id: preparedExperience.templateId,
          title: preparedExperience.title,
          creator_name: preparedExperience.creatorName,
          recipient_name: preparedExperience.recipientName,
          slug: preparedExperience.slug,
          config: preparedExperience.config,
          status: preparedExperience.status,
          sharing_mode: preparedExperience.sharingMode,
          recipient_id: preparedExperience.recipientId,
          published_at: preparedExperience.publishedAt
        });

        if (dbError) {
          console.error('Supabase write error:', dbError);
          throw new Error(`Cloud publishing failed: ${dbError.message}`);
        }
      } else if (authenticatedUserId) {
        // Saving draft while logged in: attempt background cloud sync
        try {
          await supabase.from('experiences').upsert({
            id: preparedExperience.id,
            user_id: authenticatedUserId,
            template_id: preparedExperience.templateId,
            title: preparedExperience.title,
            creator_name: preparedExperience.creatorName,
            recipient_name: preparedExperience.recipientName,
            slug: preparedExperience.slug,
            config: preparedExperience.config,
            status: preparedExperience.status,
            sharing_mode: preparedExperience.sharingMode,
            recipient_id: preparedExperience.recipientId,
            published_at: preparedExperience.publishedAt
          });
        } catch (syncErr) {
          console.warn('Draft background cloud sync deferred:', syncErr);
        }
      }

      // Persist to user-scoped local cache
      const cacheKey = authenticatedUserId
        ? `${EXPERIENCES_STORAGE_PREFIX}_${authenticatedUserId}`
        : `${EXPERIENCES_STORAGE_PREFIX}_local`;

      const stored = await AsyncStorage.getItem(cacheKey);
      let list: Experience[] = stored ? JSON.parse(stored) : [];

      const existingIndex = list.findIndex((e) => e.id === preparedExperience.id);
      if (existingIndex >= 0) {
        list[existingIndex] = preparedExperience;
      } else {
        list.unshift(preparedExperience);
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(list));

      return preparedExperience;
    } catch (error) {
      console.error('Error saving experience:', error);
      throw error;
    }
  },

  /**
   * Deletes an experience locally and remotely.
   */
  async deleteExperience(id: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const cacheKey = userId
        ? `${EXPERIENCES_STORAGE_PREFIX}_${userId}`
        : `${EXPERIENCES_STORAGE_PREFIX}_local`;

      const stored = await AsyncStorage.getItem(cacheKey);
      if (stored) {
        const list: Experience[] = JSON.parse(stored);
        const filtered = list.filter((e) => e.id !== id);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered));
      }

      try {
        if (userId) {
          await supabase.from('experiences').delete().eq('id', id).eq('user_id', userId);
        }
      } catch (err) {
        console.warn('Remote deletion error (local deleted):', err);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  },

  /**
   * Toggles an experience between draft and published.
   */
  async togglePublish(id: string): Promise<Experience | null> {
    const exp = await this.getExperienceById(id);
    if (!exp) return null;

    const willPublish = exp.status !== 'published';
    const updated: Experience = {
      ...exp,
      status: willPublish ? 'published' : 'draft',
      publishedAt: willPublish ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    return await this.saveExperience(updated, willPublish);
  },

  /**
   * Duplicates an existing experience as a new draft.
   */
  async duplicateExperience(id: string): Promise<Experience | null> {
    const original = await this.getExperienceById(id);
    if (!original) return null;

    const newSlug = generateSlug(original.recipientName || 'surprise');
    const duplicated: Experience = {
      ...original,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
      sharingMode: original.sharingMode || 'public_link',
      recipientId: original.recipientId || null,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await this.saveExperience(duplicated, false);
  }
};
