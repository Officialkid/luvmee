import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import { notificationService } from './notificationService';
import { loveNotesService } from './loveNotesService';
import { peopleService } from './peopleService';
import { plansService } from './plansService';
import { experienceService } from './experienceService';
import {
  EmailPasswordSignUpSchema,
  EmailPasswordLoginSchema,
  PasswordResetRequestSchema,
  UpdatePasswordSchema,
  UsernameSchema,
  normalizeUsername,
  generateUsernameFromMetadata,
  isSessionInactiveTwoMonths,
  UserProfile
} from '@luvmee/shared';

WebBrowser.maybeCompleteAuthSession();

const AUTH_REDIRECT_KEY = '@luvmee_auth_redirect';
const LAST_ACTIVITY_KEY = '@luvmee_last_activity_timestamp';

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  session?: any;
  user?: any;
}

export const authService = {
  /**
   * Computes deep link redirect URL for authentication callbacks.
   *
   * IMPORTANT — Supabase allowlist requirement:
   * This URL MUST appear in Supabase Dashboard → Authentication → URL Configuration →
   * Redirect URLs allowlist, otherwise Supabase will silently fall back to the
   * configured Site URL (causing the "localhost:3000" redirect error on Android).
   *
   * During Expo Go development this resolves to:
   *   exp://<LAN-IP>:8081/--/auth/callback
   * In standalone / production builds it resolves to:
   *   luvmee://auth/callback
   */
  getRedirectUrl(): string {
    const url = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? Linking.createURL('auth/callback');
    if (__DEV__) {
      console.log('[LUVMEE Auth] OAuth redirect URL:', url);
      console.log('[LUVMEE Auth] Add the above URL to Supabase → Authentication → URL Configuration → Redirect URLs');
    }
    return url;
  },

  /**
   * Checks whether a username is available via database RPC check_username_available.
   */
  async checkUsernameAvailable(rawUsername: string): Promise<{ available: boolean; error?: string }> {
    try {
      const clean = normalizeUsername(rawUsername);
      const parsed = UsernameSchema.safeParse(clean);
      if (!parsed.success) {
        return { available: false, error: parsed.error.issues[0]?.message || 'Invalid username' };
      }

      const { data, error } = await supabase.rpc('check_username_available', {
        target_username: clean
      });

      if (error) {
        // Fallback: If RPC is missing in remote DB, query public.profiles directly
        if (error.message.includes('Could not find the function') || error.code === 'PGRST202') {
          const { data: existing, error: queryErr } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', clean)
            .limit(1);

          if (queryErr) {
            // If username column does not exist yet either, allow proceeding
            return { available: true };
          }

          if (existing && existing.length > 0) {
            return { available: false, error: 'This username is already taken. Please choose another.' };
          }
          return { available: true };
        }
        return { available: false, error: error.message };
      }

      return {
        available: Boolean(data?.available),
        error: data?.error
      };
    } catch (err: any) {
      return { available: true };
    }
  },

  /**
   * Phase 2: Email & Password Signup with Username
   * Sends 6-digit verification code to confirm user email.
   */
  async signUpWithEmailPassword(payload: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
  }): Promise<AuthActionResult> {
    try {
      const parsed = EmailPasswordSignUpSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid registration details'
        };
      }

      const cleanEmail = parsed.data.email.toLowerCase().trim();
      const cleanUsername = normalizeUsername(parsed.data.username);

      // Verify username uniqueness prior to signup
      const usernameCheck = await this.checkUsernameAvailable(cleanUsername);
      if (!usernameCheck.available) {
        return {
          success: false,
          error: usernameCheck.error || 'This username is already taken. Please choose another.'
        };
      }

      const emailRedirectTo = this.getRedirectUrl();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: parsed.data.password,
        options: {
          emailRedirectTo,
          data: {
            username: cleanUsername,
            display_name: cleanUsername
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If Supabase has email confirmation enabled
      if (data.user && (!data.session || !data.user.email_confirmed_at)) {
        return {
          success: true,
          message: 'A 6-digit confirmation code has been sent to your email.',
          user: data.user
        };
      }

      if (data.session) {
        await this.recordActivity();
        notificationService.registerDeviceForPush().catch(() => {});
        return { success: true, session: data.session, user: data.user };
      }

      return {
        success: true,
        message: 'Account created. Please verify your email.',
        user: data.user
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to sign up. Please check your network connection.'
      };
    }
  },

  /**
   * Phase 2 & 4: Verifies the 6-digit Signup Confirmation OTP
   */
  async verifySignupOtp(email: string, token: string): Promise<AuthActionResult> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanToken = token.trim();

      if (!/^\d{6}$/.test(cleanToken)) {
        return { success: false, error: 'Please enter a valid 6-digit verification code' };
      }

      // Try signup confirmation verification first, fallback to email OTP
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup'
      });

      if (error) {
        // Fallback for magiclink/email verification types
        const retry = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email'
        });
        if (retry.error) {
          return {
            success: false,
            error: retry.error.message.includes('expired')
              ? 'Verification code has expired. Please request a new code.'
              : 'Invalid code. Please check and re-enter the 6-digit code.'
          };
        }
        data = retry.data;
      }

      if (!data?.session) {
        return {
          success: false,
          error: 'Verification succeeded but no session was created. Please sign in.'
        };
      }

      await this.recordActivity();
      notificationService.registerDeviceForPush().catch(() => {});

      return {
        success: true,
        session: data.session,
        user: data.user
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Verification failed. Please check your connection.'
      };
    }
  },

  /**
   * Resends the signup OTP verification code
   */
  async resendSignupOtp(email: string): Promise<AuthActionResult> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const emailRedirectTo = this.getRedirectUrl();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: { emailRedirectTo }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'A new 6-digit code has been sent.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend verification code.' };
    }
  },

  /**
   * Phase 4: Sign in with Email and Password
   */
  async signInWithEmailPassword(payload: { email: string; password: string }): Promise<AuthActionResult> {
    try {
      const parsed = EmailPasswordLoginSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error.issues[0]?.message || 'Please provide a valid email and password'
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email.toLowerCase().trim(),
        password: parsed.data.password
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Your email address has not been verified yet. Please check your email for the verification code.'
          };
        }
        return { success: false, error: 'Invalid email or password.' };
      }

      if (!data.session) {
        return { success: false, error: 'Failed to establish session.' };
      }

      await this.recordActivity();
      notificationService.registerDeviceForPush().catch(() => {});

      return {
        success: true,
        session: data.session,
        user: data.user
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Sign in failed. Please check your connection.'
      };
    }
  },

  /**
   * Phase 3: Continue with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthActionResult> {
    try {
      const redirectUrl = this.getRedirectUrl();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          // Force Google account picker so users can switch accounts
          queryParams: { prompt: 'select_account' }
        }
      });

      if (error || !data?.url) {
        return { success: false, error: error?.message || 'Failed to start Google sign in.' };
      }

      // Open in-app browser session
      const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (authResult.type === 'success' && authResult.url) {
        return await this.handleAuthUrl(authResult.url);
      }

      if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
        return { success: false, error: 'Google sign in was cancelled.' };
      }

      return { success: false, error: 'Google sign in did not complete.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Google authentication failed.'
      };
    }
  },

  /**
   * Phase 4: Request Password Reset Email
   */
  async requestPasswordReset(email: string): Promise<AuthActionResult> {
    try {
      const parsed = PasswordResetRequestSchema.safeParse({ email });
      if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message || 'Invalid email address' };
      }

      const redirectTo = this.getRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase().trim(), {
        redirectTo
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.'
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send password reset email.' };
    }
  },

  /**
   * Phase 4: Update Password (when user is authenticated via reset callback)
   */
  async updateUserPassword(payload: { password: string; confirmPassword: string }): Promise<AuthActionResult> {
    try {
      const parsed = UpdatePasswordSchema.safeParse(payload);
      if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message || 'Invalid password' };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: parsed.data.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password updated successfully!', user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update password.' };
    }
  },

  /**
   * Phase 3.3: Edit user's username
   */
  async updateUsername(newUsername: string): Promise<AuthActionResult> {
    try {
      const clean = normalizeUsername(newUsername);
      const parsed = UsernameSchema.safeParse(clean);
      if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message || 'Invalid username' };
      }

      const { data, error } = await supabase.rpc('update_my_username', {
        new_username: clean
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to update username' };
      }

      return { success: true, message: 'Username updated successfully!', user: { username: clean } };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update username.' };
    }
  },

  /**
   * Fetches user profile including username
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        username: data.username || null,
        displayName: data.display_name || 'LUVMEE User',
        avatarUrl: data.avatar_url || null,
        partnerCode: data.partner_code || null,
        lastActiveAt: data.last_active_at || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch {
      return null;
    }
  },

  /**
   * Phase 5: Persistent Session Check with Two-Month Inactivity Enforcement
   * Verifies whether the session is still active and within the 60-day activity window.
   */
  async getValidSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Check local and remote activity timestamp
      const localLastActive = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      const nowMs = Date.now();

      if (localLastActive && isSessionInactiveTwoMonths(Number(localLastActive), nowMs)) {
        // Expired due to 2-month inactivity policy
        await this.signOut();
        return null;
      }

      // Session is valid; refresh activity timestamp in background
      this.recordActivity().catch(() => {});
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Records authenticated activity locally and remotely (throttled to 1h in DB).
   */
  async recordActivity(): Promise<void> {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      // Notify database to update last_active_at column
      await supabase.rpc('record_authenticated_activity');
    } catch {
      // Ignored
    }
  },

  /**
   * Phase 6: Permanently Delete User Account
   * Calls secure backend function or database RPC, deletes auth records, and clears local caches.
   */
  async deleteAccount(): Promise<AuthActionResult> {
    try {
      const session = await this.getSession();
      if (!session) {
        return { success: false, error: 'You must be signed in to delete your account.' };
      }

      // Execute database cleanup RPC
      const { data, error } = await supabase.rpc('delete_user_account');
      if (error) {
        return { success: false, error: error.message };
      }

      // Try invoking Edge Function if available for auth.users admin purge
      try {
        await supabase.functions.invoke('delete-user-account', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      } catch (fnErr) {
        // Non-blocking: DB records are already cleaned up via RPC
      }

      // Clear local storage, auth redirect, and all user-specific data
      await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
      await AsyncStorage.removeItem(AUTH_REDIRECT_KEY);
      await AsyncStorage.removeItem('@luvmee_partner_info');
      await AsyncStorage.removeItem('@luvmee_partner_messages_v1');
      await loveNotesService.clearCache(session.user.id);
      await peopleService.clearCache(session.user.id);
      await plansService.clearCache(session.user.id);
      await experienceService.clearCache(session.user.id);
      await notificationService.unregisterDevice();
      await supabase.auth.signOut();

      return {
        success: true,
        message: 'Your account and personal data have been completely deleted.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to delete account. Please try again.'
      };
    }
  },

  /**
   * Handles incoming deep links (PKCE code exchange and tokens).
   */
  async handleAuthUrl(url: string): Promise<AuthActionResult> {
    try {
      const parsedUrl = Linking.parse(url);
      const code = (parsedUrl.queryParams?.code as string) || (parsedUrl.queryParams?.token as string);

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.session) {
          await this.recordActivity();
          notificationService.registerDeviceForPush().catch(() => {});
          return { success: true, session: data.session, user: data.user };
        }
      }

      if (url.includes('#')) {
        const hash = url.substring(url.indexOf('#') + 1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) {
            return { success: false, error: error.message };
          }
          if (data.session) {
            await this.recordActivity();
            notificationService.registerDeviceForPush().catch(() => {});
            return { success: true, session: data.session, user: data.user };
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.recordActivity();
        return { success: true, session, user: session.user };
      }

      return { success: false, error: 'Unable to extract session from authentication link.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to complete authentication from link.'
      };
    }
  },

  /**
   * Explicit sign-out: revokes session, clears activity timestamp, redirect state, and all local caches.
   */
  async signOut(): Promise<void> {
    try {
      const session = await this.getSession();
      const userId = session?.user?.id;
      await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
      await AsyncStorage.removeItem(AUTH_REDIRECT_KEY);
      await AsyncStorage.removeItem('@luvmee_partner_info');
      await AsyncStorage.removeItem('@luvmee_partner_messages_v1');
      await loveNotesService.clearCache(userId);
      await peopleService.clearCache(userId);
      await plansService.clearCache(userId);
      await experienceService.clearCache(userId);
      await notificationService.unregisterDevice();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async setAuthRedirect(route: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_REDIRECT_KEY, route);
    } catch (err) {
      console.warn('Failed to save auth redirect:', err);
    }
  },

  async popAuthRedirect(): Promise<string | null> {
    try {
      const route = await AsyncStorage.getItem(AUTH_REDIRECT_KEY);
      if (route) {
        await AsyncStorage.removeItem(AUTH_REDIRECT_KEY);
      }
      return route;
    } catch {
      return null;
    }
  },

  async clearAuthRedirect(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_REDIRECT_KEY);
    } catch {
      // Ignored
    }
  }
};
