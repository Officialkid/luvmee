import { supabase } from './supabase';
import {
  PersonalPlan,
  CreatePersonalPlanPayload,
  CreatePersonalPlanSchema
} from '@luvmee/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLANS_STORAGE_PREFIX = '@luvmee_personal_plans_v1';

export const plansService = {
  /**
   * Retrieves all personal plans for the user.
   */
  async getPlans(): Promise<PersonalPlan[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('personal_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const plans: PersonalPlan[] = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            personId: row.person_id,
            occasionId: row.occasion_id,
            title: row.title,
            plannedDate: row.planned_date,
            placeName: row.place_name,
            activity: row.activity,
            giftIdea: row.gift_idea,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_${userId}`, JSON.stringify(plans));
          return plans;
        }
      } catch (e) {
        console.warn('Network error fetching plans, reading cache:', e);
      }
    }

    const key = userId ? `${PLANS_STORAGE_PREFIX}_${userId}` : `${PLANS_STORAGE_PREFIX}_local`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [];
  },

  /**
   * Creates a new personal plan.
   */
  async createPlan(payload: CreatePersonalPlanPayload): Promise<{ success: boolean; plan?: PersonalPlan; error?: string }> {
    const validation = CreatePersonalPlanSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid plan details' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const localPlan: PersonalPlan = {
        id: `local_plan_${Date.now()}`,
        userId: 'local_guest',
        personId: payload.personId || null,
        occasionId: payload.occasionId || null,
        title: payload.title.trim(),
        plannedDate: payload.plannedDate || null,
        placeName: payload.placeName || null,
        activity: payload.activity || null,
        giftIdea: payload.giftIdea || null,
        notes: payload.notes || null,
        status: payload.status || 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existing = await this.getPlans();
      const updated = [localPlan, ...existing];
      await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_local`, JSON.stringify(updated));
      return { success: true, plan: localPlan };
    }

    try {
      const { data, error } = await supabase
        .from('personal_plans')
        .insert({
          user_id: userId,
          person_id: payload.personId || null,
          occasion_id: payload.occasionId || null,
          title: payload.title.trim(),
          planned_date: payload.plannedDate || null,
          place_name: payload.placeName || null,
          activity: payload.activity || null,
          gift_idea: payload.giftIdea || null,
          notes: payload.notes || null,
          status: payload.status || 'planned'
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      const newPlan: PersonalPlan = {
        id: data.id,
        userId: data.user_id,
        personId: data.person_id,
        occasionId: data.occasion_id,
        title: data.title,
        plannedDate: data.planned_date,
        placeName: data.place_name,
        activity: data.activity,
        giftIdea: data.gift_idea,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { success: true, plan: newPlan };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to save plan' };
    }
  },

  /**
   * Updates an existing personal plan.
   */
  async updatePlan(
    planId: string,
    payload: Partial<CreatePersonalPlanPayload>
  ): Promise<{ success: boolean; plan?: PersonalPlan; error?: string }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const existing = await this.getPlans();
      let updatedPlan: PersonalPlan | undefined;
      const updated = existing.map((p) => {
        if (p.id === planId) {
          updatedPlan = {
            ...p,
            personId: payload.personId !== undefined ? payload.personId : p.personId,
            occasionId: payload.occasionId !== undefined ? payload.occasionId : p.occasionId,
            title: payload.title !== undefined ? payload.title.trim() : p.title,
            plannedDate: payload.plannedDate !== undefined ? payload.plannedDate : p.plannedDate,
            placeName: payload.placeName !== undefined ? payload.placeName : p.placeName,
            activity: payload.activity !== undefined ? payload.activity : p.activity,
            giftIdea: payload.giftIdea !== undefined ? payload.giftIdea : p.giftIdea,
            notes: payload.notes !== undefined ? payload.notes : p.notes,
            status: payload.status !== undefined ? payload.status : p.status,
            updatedAt: new Date().toISOString()
          };
          return updatedPlan;
        }
        return p;
      });

      await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_local`, JSON.stringify(updated));
      return { success: true, plan: updatedPlan };
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.personId !== undefined) updateData.person_id = payload.personId;
      if (payload.occasionId !== undefined) updateData.occasion_id = payload.occasionId;
      if (payload.plannedDate !== undefined) updateData.planned_date = payload.plannedDate;
      if (payload.placeName !== undefined) updateData.place_name = payload.placeName;
      if (payload.activity !== undefined) updateData.activity = payload.activity;
      if (payload.giftIdea !== undefined) updateData.gift_idea = payload.giftIdea;
      if (payload.notes !== undefined) updateData.notes = payload.notes;
      if (payload.status !== undefined) updateData.status = payload.status;

      const { data, error } = await supabase
        .from('personal_plans')
        .update(updateData)
        .eq('id', planId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      const updatedPlan: PersonalPlan = {
        id: data.id,
        userId: data.user_id,
        personId: data.person_id,
        occasionId: data.occasion_id,
        title: data.title,
        plannedDate: data.planned_date,
        placeName: data.place_name,
        activity: data.activity,
        giftIdea: data.gift_idea,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      const existing = await this.getPlans();
      const updatedList = existing.map((p) => (p.id === planId ? updatedPlan : p));
      await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_${userId}`, JSON.stringify(updatedList));

      return { success: true, plan: updatedPlan };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update plan' };
    }
  },

  /**
   * Toggles completion status of a plan.
   */
  async togglePlanStatus(planId: string, currentStatus: 'planned' | 'completed'): Promise<boolean> {
    const nextStatus = currentStatus === 'planned' ? 'completed' : 'planned';
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const existing = await this.getPlans();
      const updated = existing.map((p) => (p.id === planId ? { ...p, status: nextStatus } : p));
      await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_local`, JSON.stringify(updated));
      return true;
    }

    const { error } = await supabase
      .from('personal_plans')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', userId);

    return !error;
  },

  /**
   * Deletes a plan.
   */
  async deletePlan(planId: string): Promise<boolean> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      const existing = await this.getPlans();
      const filtered = existing.filter((p) => p.id !== planId);
      await AsyncStorage.setItem(`${PLANS_STORAGE_PREFIX}_local`, JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase.from('personal_plans').delete().eq('id', planId).eq('user_id', userId);
    return !error;
  },

  /**
   * Clears cached personal plans for a given user or guest.
   */
  async clearCache(userId?: string | null): Promise<void> {
    try {
      if (userId) {
        await AsyncStorage.removeItem(`${PLANS_STORAGE_PREFIX}_${userId}`);
      }
      await AsyncStorage.removeItem(`${PLANS_STORAGE_PREFIX}_local`);
    } catch (e) {
      console.warn('Error clearing plans cache:', e);
    }
  }
};
