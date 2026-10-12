import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
  PartnerState,
  SendPartnerInvitationSchema,
  RespondPartnerInvitationSchema,
  normalizePartnerCode
} from '@luvmee/shared';

const PARTNER_STATE_KEY = '@luvmee_partner_state_v1';
const LEGACY_PARTNER_INFO_KEY = '@luvmee_partner_info';

export const partnerService = {
  /**
   * Retrieves the current user's partner connection state.
   * Connects to Supabase RPC `get_partner_state` when authenticated,
   * with local storage fallback when offline or in guest mode.
   */
  async getPartnerState(): Promise<PartnerState> {
    try {
      // 1. Check local cache first
      const cached = await AsyncStorage.getItem(PARTNER_STATE_KEY);
      let localState: PartnerState = cached
        ? JSON.parse(cached)
        : { state: 'not_connected', myPartnerCode: null };

      // 2. Check if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return localState;
      }

      // 3. Fetch live state from Supabase RPC
      const { data, error } = await supabase.rpc('get_partner_state');
      if (error) {
        console.warn('get_partner_state RPC error:', error.message);
        return localState;
      }

      if (data) {
        const liveState: PartnerState = {
          state: data.state || 'not_connected',
          partnershipId: data.partnershipId,
          partnerId: data.partnerId,
          partnerName: data.partnerName,
          partnerAvatar: data.partnerAvatar,
          partnerCode: data.partnerCode,
          connectedAt: data.connectedAt,
          daysInLove: data.daysInLove,
          invitationId: data.invitationId,
          createdAt: data.createdAt,
          myPartnerCode: data.myPartnerCode
        };

        // Cache live state
        await AsyncStorage.setItem(PARTNER_STATE_KEY, JSON.stringify(liveState));

        // Maintain backward compatibility with @luvmee_partner_info
        if (liveState.state === 'connected' && liveState.partnerName) {
          await AsyncStorage.setItem(
            LEGACY_PARTNER_INFO_KEY,
            JSON.stringify({
              name: liveState.partnerName,
              days: liveState.daysInLove,
              partnerId: liveState.partnerId
            })
          );
        } else if (liveState.state === 'not_connected') {
          await AsyncStorage.removeItem(LEGACY_PARTNER_INFO_KEY);
        }

        return liveState;
      }

      return localState;
    } catch (err) {
      console.warn('Error in getPartnerState:', err);
      return { state: 'not_connected', myPartnerCode: null };
    }
  },

  /**
   * Sends an invitation to a partner by partner code or email.
   */
  async sendInvitation(
    targetInput: string
  ): Promise<{ success: boolean; error?: string; partnerName?: string; invitationId?: string }> {
    try {
      const validation = SendPartnerInvitationSchema.safeParse({ target: targetInput });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0]?.message || 'Invalid target input' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return {
          success: false,
          error: 'Sign in is required to connect with a partner. Please sign in or register.'
        };
      }

      // If target does not contain @, normalize as partner code
      const formattedTarget = targetInput.includes('@')
        ? targetInput.trim().toLowerCase()
        : normalizePartnerCode(targetInput);

      const { data, error } = await supabase.rpc('send_partner_invitation', {
        target_input: formattedTarget
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to send partner invitation.' };
      }

      // Refresh cached partner state
      await this.getPartnerState();

      return {
        success: true,
        partnerName: data.partnerName,
        invitationId: data.invitationId
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Responds to an incoming partner invitation (accept or decline).
   */
  async respondToInvitation(
    invitationId: string,
    decision: 'accept' | 'decline'
  ): Promise<{ success: boolean; error?: string; status?: string }> {
    try {
      const validation = RespondPartnerInvitationSchema.safeParse({ invitationId, decision });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0]?.message || 'Invalid request' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Sign in is required.' };
      }

      const { data, error } = await supabase.rpc('respond_to_partner_invitation', {
        invitation_id: invitationId,
        decision
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to respond to invitation.' };
      }

      // Refresh state
      await this.getPartnerState();

      return { success: true, status: data.status };
    } catch (err: any) {
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Cancels an outgoing pending partner invitation.
   */
  async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Sign in is required.' };
      }

      const { data, error } = await supabase.rpc('cancel_partner_invitation', {
        invitation_id: invitationId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to cancel invitation.' };
      }

      // Refresh state
      await this.getPartnerState();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  },

  /**
   * Disconnects the active partner connection.
   */
  async disconnectPartner(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Sign in is required.' };
      }

      const { data, error } = await supabase.rpc('disconnect_partner');
      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to disconnect partner.' };
      }

      // Clear local caches
      await AsyncStorage.removeItem(PARTNER_STATE_KEY);
      await AsyncStorage.removeItem(LEGACY_PARTNER_INFO_KEY);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'An unexpected error occurred.' };
    }
  }
};
