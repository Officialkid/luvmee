import { supabase } from './supabase';
import {
  Person,
  ImportantDate,
  CreatePersonPayload,
  CreateImportantDatePayload,
  CreatePersonSchema,
  CreateImportantDateSchema
} from '@luvmee/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PEOPLE_STORAGE_PREFIX = '@luvmee_people_v1';
const DATES_STORAGE_PREFIX = '@luvmee_dates_v1';

export const peopleService = {
  /**
   * Retrieves all people saved in the user's personal directory.
   */
  async getPeople(): Promise<Person[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('people')
          .select('*')
          .eq('user_id', userId)
          .order('display_name', { ascending: true });

        if (!error && data) {
          const remotePeople: Person[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            displayName: row.display_name,
            relationshipLabel: row.relationship_label,
            notes: row.notes,
            avatarEmoji: row.avatar_emoji,
            linkedAccountId: row.linked_account_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          await AsyncStorage.setItem(`${PEOPLE_STORAGE_PREFIX}_${userId}`, JSON.stringify(remotePeople));
          return remotePeople;
        }
      } catch (e) {
        console.warn('Network error fetching people directory, reading local storage:', e);
      }
    }

    // Local storage fallback
    const key = userId ? `${PEOPLE_STORAGE_PREFIX}_${userId}` : `${PEOPLE_STORAGE_PREFIX}_local`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [];
  },

  /**
   * Creates a new person in the directory.
   */
  async createPerson(payload: CreatePersonPayload): Promise<{ success: boolean; person?: Person; error?: string }> {
    const validation = CreatePersonSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid person data' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      // Local guest mode creation
      const localPerson: Person = {
        id: `local_p_${Date.now()}`,
        userId: 'local_guest',
        displayName: payload.displayName.trim(),
        relationshipLabel: payload.relationshipLabel || 'friend',
        notes: payload.notes?.trim() || null,
        avatarEmoji: payload.avatarEmoji || '👤',
        linkedAccountId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existing = await this.getPeople();
      const updated = [...existing, localPerson];
      await AsyncStorage.setItem(`${PEOPLE_STORAGE_PREFIX}_local`, JSON.stringify(updated));
      return { success: true, person: localPerson };
    }

    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          user_id: userId,
          display_name: payload.displayName.trim(),
          relationship_label: payload.relationshipLabel || 'friend',
          notes: payload.notes?.trim() || null,
          avatar_emoji: payload.avatarEmoji || '👤',
          linked_account_id: payload.linkedAccountId || null
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      const newPerson: Person = {
        id: data.id,
        userId: data.user_id,
        displayName: data.display_name,
        relationshipLabel: data.relationship_label,
        notes: data.notes,
        avatarEmoji: data.avatar_emoji,
        linkedAccountId: data.linked_account_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { success: true, person: newPerson };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to save person' };
    }
  },

  /**
   * Deletes a person from the directory.
   */
  async deletePerson(personId: string): Promise<boolean> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const existing = await this.getPeople();
      const filtered = existing.filter((p) => p.id !== personId);
      await AsyncStorage.setItem(`${PEOPLE_STORAGE_PREFIX}_local`, JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase.from('people').delete().eq('id', personId).eq('user_id', userId);
    return !error;
  },

  /**
   * Retrieves all important dates.
   */
  async getImportantDates(): Promise<ImportantDate[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('important_dates')
          .select('*')
          .eq('user_id', userId)
          .order('month', { ascending: true })
          .order('day', { ascending: true });

        if (!error && data) {
          const remoteDates: ImportantDate[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            personId: row.person_id,
            category: row.category,
            title: row.title,
            month: row.month,
            day: row.day,
            year: row.year,
            recurrence: row.recurrence,
            reminderEnabled: !!row.reminder_enabled,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          await AsyncStorage.setItem(`${DATES_STORAGE_PREFIX}_${userId}`, JSON.stringify(remoteDates));
          return remoteDates;
        }
      } catch (e) {
        console.warn('Network error fetching dates, reading local storage:', e);
      }
    }

    const key = userId ? `${DATES_STORAGE_PREFIX}_${userId}` : `${DATES_STORAGE_PREFIX}_local`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [];
  },

  /**
   * Creates an important date (e.g. birthday, anniversary).
   */
  async createImportantDate(payload: CreateImportantDatePayload): Promise<{ success: boolean; date?: ImportantDate; error?: string }> {
    const validation = CreateImportantDateSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid date details' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const localDate: ImportantDate = {
        id: `local_d_${Date.now()}`,
        userId: 'local_guest',
        personId: payload.personId || null,
        category: payload.category || 'birthday',
        title: payload.title.trim(),
        month: payload.month,
        day: payload.day,
        year: payload.year || null,
        recurrence: payload.recurrence || 'annual',
        reminderEnabled: payload.reminderEnabled ?? true,
        notes: payload.notes?.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existing = await this.getImportantDates();
      const updated = [...existing, localDate];
      await AsyncStorage.setItem(`${DATES_STORAGE_PREFIX}_local`, JSON.stringify(updated));
      return { success: true, date: localDate };
    }

    try {
      const { data, error } = await supabase
        .from('important_dates')
        .insert({
          user_id: userId,
          person_id: payload.personId || null,
          category: payload.category || 'birthday',
          title: payload.title.trim(),
          month: payload.month,
          day: payload.day,
          year: payload.year || null,
          recurrence: payload.recurrence || 'annual',
          reminder_enabled: payload.reminderEnabled ?? true,
          notes: payload.notes?.trim() || null
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      const newDate: ImportantDate = {
        id: data.id,
        userId: data.user_id,
        personId: data.person_id,
        category: data.category,
        title: data.title,
        month: data.month,
        day: data.day,
        year: data.year,
        recurrence: data.recurrence,
        reminderEnabled: !!data.reminder_enabled,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { success: true, date: newDate };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to save date' };
    }
  },

  /**
   * Deletes an important date.
   */
  async deleteImportantDate(dateId: string): Promise<boolean> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const existing = await this.getImportantDates();
      const filtered = existing.filter((d) => d.id !== dateId);
      await AsyncStorage.setItem(`${DATES_STORAGE_PREFIX}_local`, JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase.from('important_dates').delete().eq('id', dateId).eq('user_id', userId);
    return !error;
  },

  /**
   * Clears cached people and dates for a given user or guest.
   */
  async clearCache(userId?: string | null): Promise<void> {
    try {
      if (userId) {
        await AsyncStorage.removeItem(`${PEOPLE_STORAGE_PREFIX}_${userId}`);
        await AsyncStorage.removeItem(`${DATES_STORAGE_PREFIX}_${userId}`);
      }
      await AsyncStorage.removeItem(`${PEOPLE_STORAGE_PREFIX}_local`);
      await AsyncStorage.removeItem(`${DATES_STORAGE_PREFIX}_local`);
    } catch (e) {
      console.warn('Error clearing people cache:', e);
    }
  }
};
