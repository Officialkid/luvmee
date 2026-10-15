import { Platform } from 'react-native';
import { supabase } from './supabase';
import {
  NotificationEvent,
  NotificationPreferences,
  RegisterPushTokenPayload
} from '@luvmee/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_STORAGE_KEY = '@luvmee_push_token_v1';
const PREFERENCES_STORAGE_KEY = '@luvmee_notification_preferences_v1';

// In-memory throttling and concurrency lock for reminder processing
let isProcessingReminders = false;
let lastReminderProcessTimestamp = 0;
const REMINDER_PROCESS_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const notificationService = {
  /**
   * Requests device notification permission and registers the push token with Supabase.
   * Handles graceful fallback for simulators, Expo Go, and web.
   */
  async registerDeviceForPush(): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'User must be authenticated to register for push notifications' };
      }

      let token: string | null = null;
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

      // 1. Attempt dynamic Expo Notifications registration if runtime module is present
      try {
        // @ts-ignore
        const Notifications: any = typeof require !== 'undefined' ? require('expo-notifications') : null;
        if (Notifications) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === 'granted') {
            const tokenResponse = await Notifications.getExpoPushTokenAsync().catch(() => null);
            if (tokenResponse?.data) {
              token = tokenResponse.data;
            }
          }
        }
      } catch (expoErr) {
        // In Expo Go or simulator, native push provider is unavailable. We gracefully log and continue with fallback token.
        console.log('[LUVMEE Notifications] Native push provider unavailable in this environment, using development token');
      }

      // 2. If running in simulator/dev where APNs/FCM is unavailable, generate stable development token
      if (!token) {
        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (storedToken) {
          token = storedToken;
        } else {
          token = `ExponentPushToken[dev_${session.user.id.substring(0, 8)}_${Date.now().toString(36)}]`;
          await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
        }
      }

      // 3. Register token with backend RPC
      const { data, error } = await supabase.rpc('register_push_token', {
        p_token: token,
        p_platform: platform
      });

      if (error) {
        console.error('Failed to register push token with Supabase:', error);
        return { success: false, error: error.message };
      }

      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

      return {
        success: true,
        token
      };
    } catch (err: any) {
      console.log('[LUVMEE Notifications] Device push registration note:', err?.message || err);
      return { success: false, error: err?.message || 'Push registration failed' };
    }
  },

  /**
   * Unregisters device push token on logout or account switch.
   */
  async unregisterDevice(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (token) {
        await supabase.rpc('unregister_push_token', { p_token: token });
        await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      }
    } catch (err) {
      console.log('[LUVMEE Notifications] Note unregistering push token:', err);
    }
  },

  /**
   * Processes due occasion reminders and generates notification events.
   * Throttled to prevent repeated calls on rapid renders.
   * Safe fallback if RPC does not exist on live database.
   */
  async processDueReminders(force = false): Promise<{
    success: boolean;
    processedCount?: number;
    error?: string;
  }> {
    const now = Date.now();
    if (!force && now - lastReminderProcessTimestamp < REMINDER_PROCESS_COOLDOWN_MS) {
      return { success: true, processedCount: 0 };
    }

    if (isProcessingReminders) {
      return { success: true, processedCount: 0 };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'User must be authenticated to process reminders' };
      }

      isProcessingReminders = true;
      const { data, error } = await supabase.rpc('process_due_reminders');

      lastReminderProcessTimestamp = Date.now();

      if (error) {
        console.log('[LUVMEE Notifications] Note processing due reminders:', error.message);
        return { success: false, error: error.message };
      }

      const count = data?.processedCount ?? 0;
      return { success: true, processedCount: count };
    } catch (err: any) {
      console.log('[LUVMEE Notifications] Error processing due reminders:', err?.message || err);
      return { success: false, error: err?.message || 'Processing failed' };
    } finally {
      isProcessingReminders = false;
    }
  },

  /**
   * Fetches user's notification history (in-app inbox).
   * Automatically triggers throttled due reminder processing for authenticated users.
   */
  async getNotifications(limit = 30): Promise<NotificationEvent[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      // Safely process any due reminders before reading notifications inbox (throttled)
      await this.processDueReminders().catch(() => {});

      const { data, error } = await supabase
        .from('notification_events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          category: row.category,
          title: row.title,
          body: row.body,
          data: row.data || {},
          read: !!row.read,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.log('[LUVMEE Notifications] Note fetching notifications:', err);
    }
    return [];
  },

  /**
   * Marks a notification as read.
   */
  async markNotificationRead(id: string): Promise<void> {
    try {
      await supabase
        .from('notification_events')
        .update({ read: true })
        .eq('id', id);
    } catch (err) {
      console.log('[LUVMEE Notifications] Note marking notification read:', err);
    }
  },

  /**
   * Retrieves user notification preferences.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const defaultPrefs: NotificationPreferences = {
      userId: '',
      partnerInvitations: true,
      loveNotes: true,
      surprises: true,
      updatedAt: new Date().toISOString()
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return defaultPrefs;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        return {
          userId: data.user_id,
          partnerInvitations: !!data.partner_invitations,
          loveNotes: !!data.love_notes,
          surprises: !!data.surprises,
          updatedAt: data.updated_at
        };
      }
    } catch (err) {
      console.log('[LUVMEE Notifications] Note fetching notification preferences:', err);
    }

    return defaultPrefs;
  },

  /**
   * Updates user notification preferences.
   */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: session.user.id,
          partner_invitations: prefs.partnerInvitations ?? true,
          love_notes: prefs.loveNotes ?? true,
          surprises: prefs.surprises ?? true,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (err) {
      console.log('[LUVMEE Notifications] Note updating notification preferences:', err);
      return false;
    }
  }
};
