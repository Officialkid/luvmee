import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  Calendar,
  MapPin,
  Gift,
  Sparkles,
  ArrowLeft,
  X,
  User,
  Heart,
  Pencil,
  CalendarDays
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge, EmptyState } from '../../components/UIPrimitives';
import { PersonalPlan, CreatePersonalPlanPayload, Person } from '@luvmee/shared';
import { plansService } from '../../services/plansService';
import { peopleService } from '../../services/peopleService';
import { supabase } from '../../services/supabase';
import { AuthGateModal } from '../../components/AuthGateModal';
import { DatePickerModal } from '../../components/DatePickerModal';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'planned' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'activity' | 'place' | 'gift'>('all');

  // Create/Edit Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PersonalPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [activity, setActivity] = useState('');
  const [giftIdea, setGiftIdea] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [authGateVisible, setAuthGateVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);

      const [plansList, peopleList] = await Promise.all([
        plansService.getPlans(),
        peopleService.getPeople().catch(() => [])
      ]);

      setPlans(plansList);
      setPeople(peopleList);
    } catch (err) {
      console.warn('[LUVMEE Plans] Error loading plans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleToggleStatus = async (plan: PersonalPlan) => {
    const nextStatus = plan.status === 'planned' ? 'completed' : 'planned';

    // Optimistic UI update
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
    );

    const success = await plansService.togglePlanStatus(plan.id, plan.status);
    if (!success) {
      // Revert optimistic update
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: plan.status } : p))
      );
      Alert.alert('Update Failed', 'Could not update plan status. Please try again.');
    }
  };

  const handleDelete = (plan: PersonalPlan) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to remove "${plan.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic deletion
            setPlans((prev) => prev.filter((p) => p.id !== plan.id));
            const success = await plansService.deletePlan(plan.id);
            if (!success) {
              await loadData();
              Alert.alert('Delete Failed', 'Could not delete plan. Please retry.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setSelectedPersonId(null);
    setPlaceName('');
    setActivity('');
    setGiftIdea('');
    setPlannedDate('');
    setNotes('');
    setEditingPlan(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const openEditModal = (plan: PersonalPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setSelectedPersonId(plan.personId || null);
    setPlaceName(plan.placeName || '');
    setActivity(plan.activity || '');
    setGiftIdea(plan.giftIdea || '');
    setPlannedDate(plan.plannedDate || '');
    setNotes(plan.notes || '');
    setCreateModalVisible(true);
  };

  const handleSavePlan = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Title Required', 'Please enter a title for your plan.');
      return;
    }
    if (trimmedTitle.length > 120) {
      Alert.alert('Title Too Long', 'Title cannot exceed 120 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePersonalPlanPayload = {
        title: trimmedTitle,
        personId: selectedPersonId || null,
        placeName: placeName.trim() || null,
        activity: activity.trim() || null,
        giftIdea: giftIdea.trim() || null,
        plannedDate: plannedDate.trim() || null,
        notes: notes.trim() || null,
        status: 'planned'
      };

      if (editingPlan) {
        // Edit mode
        const res = await plansService.updatePlan(editingPlan.id, payload);
        if (res.success && res.plan) {
          setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? res.plan! : p)));
          setCreateModalVisible(false);
          resetForm();
        } else {
          Alert.alert('Update Failed', res.error || 'Could not update your plan.');
        }
      } else {
        // Create mode
        const res = await plansService.createPlan(payload);
        if (res.success && res.plan) {
          setPlans((prev) => [res.plan!, ...prev]);
          setCreateModalVisible(false);
          resetForm();
        } else {
          Alert.alert('Save Failed', res.error || 'Could not save your plan.');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter plans based on status and category
  const filteredPlans = plans.filter((p) => {
    // 1. Status Filter
    if (filterStatus === 'planned' && p.status !== 'planned') return false;
    if (filterStatus === 'completed' && p.status !== 'completed') return false;

    // 2. Category Filter
    if (filterCategory === 'activity' && !p.activity) return false;
    if (filterCategory === 'place' && !p.placeName) return false;
    if (filterCategory === 'gift' && !p.giftIdea) return false;

    return true;
  });

  const plannedCount = plans.filter((p) => p.status === 'planned').length;
  const completedCount = plans.filter((p) => p.status === 'completed').length;

  const getPersonName = (personId?: string | null): string | null => {
    if (!personId) return null;
    const found = people.find((p) => p.id === personId);
    return found ? found.displayName : null;
  };

  const renderPlanItem = ({ item }: { item: PersonalPlan }) => {
    const isCompleted = item.status === 'completed';
    const associatedPerson = getPersonName(item.personId);

    return (
      <Card
        variant="surface"
        style={StyleSheet.flatten([styles.planCard, isCompleted && styles.planCardCompleted])}
      >
        <View style={styles.planCardHeader}>
          {/* Status Toggle Checkbox */}
          <TouchableOpacity
            style={styles.statusToggleBtn}
            activeOpacity={0.7}
            onPress={() => handleToggleStatus(item)}
            accessibilityLabel={isCompleted ? 'Mark plan as planned' : 'Mark plan as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} color={THEME.colors.primary} />
            ) : (
              <Circle size={22} color={THEME.colors.borderHighlight} />
            )}
          </TouchableOpacity>

          {/* Title & Metadata */}
          <View style={styles.planTitleContainer}>
            <Text
              style={[
                styles.planTitle,
                isCompleted && styles.planTitleCompleted
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {associatedPerson && (
              <View style={styles.associatedPersonRow}>
                <User size={11} color={THEME.colors.primary} />
                <Text style={styles.associatedPersonText}>For {associatedPerson}</Text>
              </View>
            )}
          </View>

          {/* Edit + Delete Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => openEditModal(item)}
              accessibilityLabel="Edit plan"
            >
              <Pencil size={14} color={THEME.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.7}
              onPress={() => handleDelete(item)}
              accessibilityLabel="Delete plan"
            >
              <Trash2 size={14} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Specific Details */}
        <View style={styles.planDetailsGrid}>
          {item.activity ? (
            <View style={styles.detailRow}>
              <Heart size={13} color={THEME.colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>
                {item.activity}
              </Text>
            </View>
          ) : null}

          {item.placeName ? (
            <View style={styles.detailRow}>
              <MapPin size={13} color={THEME.colors.primary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.placeName}
              </Text>
            </View>
          ) : null}

          {item.giftIdea ? (
            <View style={styles.detailRow}>
              <Gift size={13} color={THEME.colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>
                Gift: {item.giftIdea}
              </Text>
            </View>
          ) : null}

          {item.plannedDate ? (
            <View style={styles.detailRow}>
              <Calendar size={13} color={THEME.colors.textMuted} />
              <Text style={styles.detailText}>{item.plannedDate}</Text>
            </View>
          ) : null}

          {item.notes ? (
            <Text style={styles.planNotes} numberOfLines={3}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={THEME.colors.textHeading} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSubtitle}>PRODUCT PILLAR 4 • PLAN</Text>
            <Text style={styles.headerTitle}>Personal Plans</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newPlanButton}
          activeOpacity={0.85}
          onPress={openCreateModal}
          accessibilityLabel="Create New Plan"
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newPlanButtonText}>New Plan</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Status Segment Tabs */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, filterStatus === 'all' && styles.segmentBtnActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.segmentText, filterStatus === 'all' && styles.segmentTextActive]}>
            All ({plans.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, filterStatus === 'planned' && styles.segmentBtnActive]}
          onPress={() => setFilterStatus('planned')}
        >
          <Text style={[styles.segmentText, filterStatus === 'planned' && styles.segmentTextActive]}>
            Planned ({plannedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, filterStatus === 'completed' && styles.segmentBtnActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text style={[styles.segmentText, filterStatus === 'completed' && styles.segmentTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Category Filter Chips */}
      <View style={styles.categoryChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsContent}>
          <TouchableOpacity
            style={[styles.categoryChip, filterCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[styles.categoryChipText, filterCategory === 'all' && styles.categoryChipTextActive]}>
              All Ideas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, filterCategory === 'activity' && styles.categoryChipActive]}
            onPress={() => setFilterCategory('activity')}
          >
            <Text style={[styles.categoryChipText, filterCategory === 'activity' && styles.categoryChipTextActive]}>
              🌹 Dates & Activities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, filterCategory === 'place' && styles.categoryChipActive]}
            onPress={() => setFilterCategory('place')}
          >
            <Text style={[styles.categoryChipText, filterCategory === 'place' && styles.categoryChipTextActive]}>
              📍 Places to Go
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, filterCategory === 'gift' && styles.categoryChipActive]}
            onPress={() => setFilterCategory('gift')}
          >
            <Text style={[styles.categoryChipText, filterCategory === 'gift' && styles.categoryChipTextActive]}>
              🎁 Gift Wishlist
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. Plans List or Empty State */}
      {loading && !refreshing ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading your personal plans...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          contentContainerStyle={[
            styles.listContent,
            filteredPlans.length === 0 && { flex: 1 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Sparkles size={36} color={THEME.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {filterStatus === 'completed'
                  ? 'No Completed Plans'
                  : filterCategory !== 'all'
                  ? 'No Matching Plans'
                  : 'No Plans Saved Yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filterStatus === 'completed'
                  ? 'Plans you mark completed will appear here as cherished memories.'
                  : 'Capture date night ideas, secret gifts, and romantic places to visit with loved ones.'}
              </Text>
              <Button
                title="+ Create Your First Plan"
                size="md"
                onPress={() => setCreateModalVisible(true)}
              />
            </View>
          }
        />
      )}

      {/* 5. Create / Edit Plan Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setCreateModalVisible(false); resetForm(); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>
                  {editingPlan ? 'EDITING PLAN' : 'CAPTURE A THOUGHTFUL PLAN'}
                </Text>
                <Text style={styles.modalTitle}>
                  {editingPlan ? 'Edit Plan' : 'New Personal Plan'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => { setCreateModalVisible(false); resetForm(); }}
                accessibilityLabel="Close form"
              >
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {/* Title (Required) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Plan Title <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sunset dinner at waterfront bistro"
                  placeholderTextColor={THEME.colors.textMutedSubtle}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={120}
                />
              </View>

              {/* Associate with Person (Optional) */}
              {people.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>For Whom (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personSelectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.personChip,
                        selectedPersonId === null && styles.personChipActive
                      ]}
                      onPress={() => setSelectedPersonId(null)}
                    >
                      <Text style={[styles.personChipText, selectedPersonId === null && styles.personChipTextActive]}>
                        General / Partner
                      </Text>
                    </TouchableOpacity>

                    {people.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.personChip,
                          selectedPersonId === p.id && styles.personChipActive
                        ]}
                        onPress={() => setSelectedPersonId(p.id)}
                      >
                        <Text style={[styles.personChipText, selectedPersonId === p.id && styles.personChipTextActive]}>
                          {p.displayName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Activity / Date Idea (Optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Activity or Date Idea</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Wine tasting & jazz concert"
                  placeholderTextColor={THEME.colors.textMutedSubtle}
                  value={activity}
                  onChangeText={setActivity}
                  maxLength={200}
                />
              </View>

              {/* Place Name (Optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Place or Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. The River Cafe, Brooklyn"
                  placeholderTextColor={THEME.colors.textMutedSubtle}
                  value={placeName}
                  onChangeText={setPlaceName}
                  maxLength={150}
                />
              </View>

              {/* Gift Idea (Optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gift Idea</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. First edition poetry book"
                  placeholderTextColor={THEME.colors.textMutedSubtle}
                  value={giftIdea}
                  onChangeText={setGiftIdea}
                  maxLength={200}
                />
              </View>

              {/* Planned Date (Optional) - Calendar Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Date</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <CalendarDays size={16} color={plannedDate ? THEME.colors.primary : THEME.colors.textMuted} />
                  <Text
                    style={[
                      styles.datePickerText,
                      !plannedDate && styles.datePickerPlaceholder
                    ]}
                  >
                    {plannedDate ? (() => {
                      if (/^\d{4}-\d{2}-\d{2}$/.test(plannedDate)) {
                        const [y, m, d] = plannedDate.split('-').map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                      }
                      return plannedDate;
                    })() : 'Tap to choose a date'}
                  </Text>
                  {plannedDate ? (
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); setPlannedDate(''); }}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <X size={14} color={THEME.colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              </View>

              {/* Notes (Optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Private Notes & Details</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Reserve table 2 weeks early; they love the terrace seating."
                  placeholderTextColor={THEME.colors.textMutedSubtle}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  maxLength={1000}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => { setCreateModalVisible(false); resetForm(); }}
                />
                <Button
                  title={isSubmitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Save Plan'}
                  variant="primary"
                  style={{ flex: 1 }}
                  disabled={!title.trim() || isSubmitting}
                  onPress={handleSavePlan}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Auth Gate Modal */}
      <AuthGateModal
        visible={authGateVisible}
        onClose={() => setAuthGateVisible(false)}
        title="Sign in for Cloud Sync"
        description="Sync your personal date ideas, places to visit, and gift lists safely across devices."
        targetRoute="/(tabs)/plans"
        actionName="Sign In with Email"
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        initialDate={plannedDate}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={(date) => setPlannedDate(date)}
        title="Pick Target Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1.1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.3
  },
  newPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.radius.full,
    ...THEME.shadows.subtle
  },
  newPlanButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Segment Row
  segmentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  // Category Filter Chips
  categoryChipsContainer: {
    paddingVertical: 6
  },
  categoryChipsContent: {
    paddingHorizontal: 16,
    gap: 6
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.primary
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  categoryChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700'
  },

  // List & Cards
  listContent: {
    padding: 16,
    gap: 12
  },
  planCard: {
    padding: 14,
    borderRadius: THEME.radius.md
  },
  planCardCompleted: {
    opacity: 0.65,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  statusToggleBtn: {
    marginTop: 2
  },
  planTitleContainer: {
    flex: 1
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    lineHeight: 20
  },
  planTitleCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted
  },
  associatedPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3
  },
  associatedPersonText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceHighlight
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceHighlight
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  planDetailsGrid: {
    marginTop: 10,
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    flex: 1
  },
  planNotes: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 2
  },

  // Empty & Loading States
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: THEME.colors.textMuted
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280
  },

  // Modal Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(37, 33, 42, 0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1.1
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  closeBtn: {
    padding: 6
  },
  formScroll: {
    paddingBottom: 20,
    gap: 14
  },
  formGroup: {
    gap: 5
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  requiredAsterisk: {
    color: THEME.colors.primary
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top'
  },
  personSelectorRow: {
    gap: 8,
    paddingVertical: 4
  },
  personChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  personChipActive: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.primary
  },
  personChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  personChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  datePickerText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    fontWeight: '500'
  },
  datePickerPlaceholder: {
    color: THEME.colors.textMuted,
    fontWeight: '400'
  }
});
