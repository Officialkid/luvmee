import { supabase } from './supabase';
import { LoveNote, SendLoveNotePayload } from '@luvmee/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_CACHE_PREFIX = '@luvmee_love_notes_cache_v2';

function getPartitionedCacheKey(userId?: string, partnershipId?: string): string {
  if (userId && partnershipId) {
    return `${BASE_CACHE_PREFIX}_${userId}_${partnershipId}`;
  }
  if (userId) {
    return `${BASE_CACHE_PREFIX}_${userId}`;
  }
  return `${BASE_CACHE_PREFIX}_anonymous`;
}

export const loveNotesService = {
  /**
   * Clears the private love notes cache on sign out or partnership change.
   */
  async clearCache(userId?: string): Promise<void> {
    try {
      if (userId) {
        const keys = await AsyncStorage.getAllKeys();
        const userKeys = keys.filter(
          (k) => k.startsWith(`${BASE_CACHE_PREFIX}_${userId}`) || k === '@luvmee_love_notes_cache_v1'
        );
        if (userKeys.length > 0) {
          await AsyncStorage.multiRemove(userKeys);
        }
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const allNoteKeys = keys.filter(
          (k) => k.startsWith(BASE_CACHE_PREFIX) || k === '@luvmee_love_notes_cache_v1'
        );
        if (allNoteKeys.length > 0) {
          await AsyncStorage.multiRemove(allNoteKeys);
        }
      }
    } catch (e) {
      console.warn('Failed to clear love notes cache:', e);
    }
  },

  /**
   * Fetches persisted love notes for the caller's active partnership.
   * Falls back gracefully to local cache when offline.
   */
  async getLoveNotes(limit = 50, beforeTimestamp?: string): Promise<{
    connected: boolean;
    partnershipId?: string;
    notes: LoveNote[];
  }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    try {
      const { data, error } = await supabase.rpc('get_love_notes', {
        p_limit: limit,
        p_before: beforeTimestamp || null
      });

      if (!error && data?.success) {
        const remoteNotes: LoveNote[] = (data.notes || []).map((n: any) => ({
          id: n.id,
          partnershipId: n.partnershipId,
          senderId: n.senderId,
          recipientId: n.recipientId,
          content: n.content,
          tag: n.tag,
          readAt: n.readAt,
          createdAt: n.createdAt
        }));

        if (!beforeTimestamp && currentUserId) {
          // Cache latest notes partitioned by user & partnership
          const key = getPartitionedCacheKey(currentUserId, data.partnershipId);
          await AsyncStorage.setItem(key, JSON.stringify(remoteNotes));
        }

        return {
          connected: !!data.connected,
          partnershipId: data.partnershipId,
          notes: remoteNotes
        };
      }
    } catch (err) {
      console.warn('Network fetch for love notes failed, reading cache:', err);
    }

    // Offline cache fallback with strictly partitioned key
    if (currentUserId) {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const userKey = keys.find((k) => k.startsWith(`${BASE_CACHE_PREFIX}_${currentUserId}`));
        if (userKey) {
          const cached = await AsyncStorage.getItem(userKey);
          if (cached) {
            return {
              connected: true,
              notes: JSON.parse(cached)
            };
          }
        }
      } catch {
        // Ignore cache parse error
      }
    }

    return {
      connected: false,
      notes: []
    };
  },

  /**
   * Sends a private love note to the connected partner atomically.
   */
  async sendLoveNote(payload: SendLoveNotePayload): Promise<{
    success: boolean;
    note?: LoveNote;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('send_love_note', {
        p_content: payload.content.trim(),
        p_tag: payload.tag || null
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to send love note' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      const newNote: LoveNote = {
        id: data.noteId,
        partnershipId: data.partnershipId,
        senderId: session?.user?.id || '',
        recipientId: '',
        content: payload.content.trim(),
        tag: payload.tag || null,
        createdAt: data.createdAt || new Date().toISOString()
      };

      return {
        success: true,
        note: newNote
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error sending love note' };
    }
  },

  /**
   * Marks unread love notes as read for the current user.
   */
  async markRead(): Promise<void> {
    try {
      await supabase.rpc('mark_love_notes_read');
    } catch (err) {
      console.warn('Failed to mark love notes read:', err);
    }
  },

  /**
   * Subscribes to Supabase Realtime channel for live incoming love notes.
   */
  subscribeToNotes(
    partnershipId: string,
    onNoteReceived: (note: LoveNote) => void
  ) {
    if (!partnershipId) return () => {};

    const channel = supabase
      .channel(`love_notes_${partnershipId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'love_notes',
          filter: `partnership_id=eq.${partnershipId}`
        },
        (payload: any) => {
          if (payload?.new) {
            const row = payload.new;
            const incomingNote: LoveNote = {
              id: row.id,
              partnershipId: row.partnership_id,
              senderId: row.sender_id,
              recipientId: row.recipient_id,
              content: row.content,
              tag: row.tag,
              readAt: row.read_at,
              createdAt: row.created_at
            };
            onNoteReceived(incomingNote);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
