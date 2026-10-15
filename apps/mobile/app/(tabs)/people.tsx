import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Users,
  UserPlus,
  Calendar,
  Gift,
  Heart,
  Plus,
  Trash2,
  ChevronRight,
  Clock,
  Cake,
  Sparkles,
  ArrowRight,
  CalendarDays
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SectionHeader, Badge, Avatar, EmptyState } from '../../components/UIPrimitives';
import { AuthGateModal } from '../../components/AuthGateModal';
import { DatePickerModal } from '../../components/DatePickerModal';
import { peopleService } from '../../services/peopleService';
import { supabase } from '../../services/supabase';
import { authService } from '../../services/authService';
import { Person, ImportantDate, OccasionCategory } from '@luvmee/shared';

const RELATIONSHIP_EMOJIS: Record<string, string> = {
  partner: '❤️',
  friend: '✨',
  parent: '🏡',
  sibling: '🌟',
  child: '🧸',
  mentor: '🎓',
  colleague: '💼',
  family: '🌿',
  other: '👤'
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PeopleScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // New Person Form
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('friend');
  const [newNotes, setNewNotes] = useState('');

  // New Date Form
  const [newDateTitle, setNewDateTitle] = useState('');
  const [newDateCategory, setNewDateCategory] = useState<OccasionCategory>('birthday');
  const [newDateMonth, setNewDateMonth] = useState('1');
  const [newDateDay, setNewDateDay] = useState('1');
  const [newDateYear, setNewDateYear] = useState('');
  const [newDatePersonId, setNewDatePersonId] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [authGateVisible, setAuthGateVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      const [peopleList, datesList] = await Promise.all([
        peopleService.getPeople(),
        peopleService.getImportantDates()
      ]);
      setPeople(peopleList);
      setDates(datesList);
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!session?.user) {
      setAuthGateVisible(true);
      return;
    }
    action();
  };

  const handleAddPerson = async () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a name for this person.');
      return;
    }

    const emoji = RELATIONSHIP_EMOJIS[newRelationship] || '👤';
    const res = await peopleService.createPerson({
      displayName: newName.trim(),
      relationshipLabel: newRelationship,
      notes: newNotes.trim() || undefined,
      avatarEmoji: emoji
    });

    if (res.success) {
      setNewName('');
      setNewNotes('');
      setNewRelationship('friend');
      setIsPersonModalOpen(false);
      await loadData();
      Alert.alert('Saved!', 'Contact added to your directory.');
    } else {
      Alert.alert('Error', res.error || 'Could not save person.');
    }
  };

  const handleDeletePerson = (person: Person) => {
    Alert.alert(
      'Remove Person',
      `Are you sure you want to remove ${person.displayName}? All associated dates will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await peopleService.deletePerson(person.id);
            await loadData();
          }
        }
      ]
    );
  };

  const handleAddDate = async () => {
    const m = parseInt(newDateMonth, 10);
    const d = parseInt(newDateDay, 10);
    const y = newDateYear.trim() ? parseInt(newDateYear.trim(), 10) : null;

    if (!newDateTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for the occasion.');
      return;
    }

    if (isNaN(m) || m < 1 || m > 12 || isNaN(d) || d < 1 || d > 31) {
      Alert.alert('Invalid Date', 'Please select a valid month (1-12) and day (1-31).');
      return;
    }

    const res = await peopleService.createImportantDate({
      personId: newDatePersonId || undefined,
      title: newDateTitle.trim(),
      category: newDateCategory,
      month: m,
      day: d,
      year: y,
      recurrence: 'annual',
      reminderEnabled: true
    });

    if (res.success) {
      setNewDateTitle('');
      setNewDateYear('');
      setIsDateModalOpen(false);
      await loadData();
      Alert.alert('Saved!', 'Important date added to your reminders.');
    } else {
      Alert.alert('Error', res.error || 'Could not save date.');
    }
  };

  const handleDeleteDate = (dateItem: ImportantDate) => {
    Alert.alert('Remove Date', `Remove "${dateItem.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await peopleService.deleteImportantDate(dateItem.id);
          await loadData();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>PEOPLE & IMPORTANT DATES</Text>
            <Text style={styles.headerTitle}>Remember & Care</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => requireAuth(() => setIsPersonModalOpen(true))}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Guest Banner if not signed in */}
        {!session && (
          <Card variant="highlight" style={styles.guestNoticeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Sparkles size={20} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guestNoticeTitle}>Guest Mode</Text>
                <Text style={styles.guestNoticeBody}>
                  Sign in to securely sync your contacts & celebration reminders across all devices.
                </Text>
              </View>
              <Button
                title="Sign In"
                size="sm"
                onPress={async () => {
                  await authService.setAuthRedirect('/(tabs)/people');
                  router.push('/(auth)/sign-in');
                }}
              />
            </View>
          </Card>
        )}

        {/* Section: People Directory */}
        <SectionHeader
          title={`People Directory (${people.length})`}
          actionLabel="+ Add Person"
          onAction={() => requireAuth(() => setIsPersonModalOpen(true))}
        />

        {loading ? (
          <ActivityIndicator color={THEME.colors.primary} style={{ marginVertical: 20 }} />
        ) : people.length === 0 ? (
          <EmptyState
            title="No People Saved Yet"
            description="Add your partner, best friends, parents, or mentors so you never miss their birthdays or anniversaries."
            actionLabel="Add First Person"
            onAction={() => requireAuth(() => setIsPersonModalOpen(true))}
            icon={<Users size={28} color={THEME.colors.primary} />}
          />
        ) : (
          people.map((person) => {
            const personDates = dates.filter((d) => d.personId === person.id);
            return (
              <Card key={person.id} variant="surface" style={styles.personCard}>
                <View style={styles.personHeader}>
                  <Avatar name={person.displayName} size="md" />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.personName}>{person.displayName}</Text>
                      <Badge label={person.relationshipLabel || 'Contact'} variant="neutral" />
                    </View>
                    {person.notes ? (
                      <Text style={styles.personNotes} numberOfLines={1}>
                        {person.notes}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePerson(person)}
                    style={styles.deleteIconBtn}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color={THEME.colors.danger} />
                  </TouchableOpacity>
                </View>

                {/* Associated Dates */}
                <View style={styles.datesList}>
                  {personDates.length === 0 ? (
                    <TouchableOpacity
                      style={styles.addDatePill}
                      activeOpacity={0.8}
                      onPress={() => requireAuth(() => {
                        setNewDatePersonId(person.id);
                        setNewDateTitle(`${person.displayName}'s Birthday`);
                        setIsDateModalOpen(true);
                      })}
                    >
                      <Plus size={12} color={THEME.colors.primary} />
                      <Text style={styles.addDatePillText}>Add Birthday / Occasion</Text>
                    </TouchableOpacity>
                  ) : (
                    personDates.map((d) => (
                      <View key={d.id} style={styles.dateRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Cake size={13} color={THEME.colors.primary} />
                          <Text style={styles.dateTitle}>{d.title}</Text>
                          <Text style={styles.dateMonthDay}>
                            ({MONTH_NAMES[d.month - 1]} {d.day}
                            {d.year ? `, ${d.year}` : ''})
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteDate(d)} activeOpacity={0.7}>
                          <Trash2 size={13} color={THEME.colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              </Card>
            );
          })
        )}

        {/* Section: All Saved Important Dates */}
        <View style={{ marginTop: 16 }}>
          <SectionHeader
            title={`Important Occasions (${dates.length})`}
            actionLabel="+ Add Date"
            onAction={() => requireAuth(() => {
              setNewDatePersonId(null);
              setNewDateTitle('');
              setIsDateModalOpen(true);
            })}
          />
        </View>

        {dates.length === 0 ? (
          <EmptyState
            title="No Dates Recorded"
            description="Add annual recurring birthdays, anniversaries, or milestones to receive automated notifications."
            actionLabel="Add Important Date"
            onAction={() => requireAuth(() => {
              setNewDatePersonId(null);
              setNewDateTitle('');
              setIsDateModalOpen(true);
            })}
            icon={<Calendar size={28} color={THEME.colors.primary} />}
          />
        ) : (
          dates.map((d) => (
            <Card key={d.id} variant="surface" style={styles.dateCard}>
              <View style={styles.dateCardLeft}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeMonth}>
                    {MONTH_NAMES[d.month - 1].substring(0, 3).toUpperCase()}
                  </Text>
                  <Text style={styles.dateBadgeDay}>{d.day}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateCardTitle}>{d.title}</Text>
                  <Text style={styles.dateCardSub}>
                    Annual Recurring • {d.reminderEnabled ? '🔔 Reminder On' : '🔕 Muted'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteDate(d)}
                style={styles.deleteIconBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={15} color={THEME.colors.danger} />
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Person Modal */}
      <Modal visible={isPersonModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Person 👤</Text>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor={THEME.colors.muted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <View style={styles.relationshipSelect}>
              {['partner', 'friend', 'parent', 'sibling', 'child', 'mentor', 'family', 'other'].map(
                (rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[
                      styles.relChoice,
                      newRelationship === rel && styles.relChoiceSelected
                    ]}
                    onPress={() => setNewRelationship(rel)}
                  >
                    <Text
                      style={[
                        styles.relChoiceText,
                        newRelationship === rel && styles.relChoiceTextSelected
                      ]}
                    >
                      {RELATIONSHIP_EMOJIS[rel]} {rel}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.inputLabel}>Personal Notes (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="e.g. Favorite flowers, coffee order, milestones..."
              placeholderTextColor={THEME.colors.muted}
              value={newNotes}
              onChangeText={setNewNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsPersonModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddPerson}>
                <Text style={styles.saveBtnText}>Save Person</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Date Modal */}
      <Modal visible={isDateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Important Occasion 🗓️</Text>

            <Text style={styles.inputLabel}>Occasion Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mom's Birthday or First Date Anniversary"
              placeholderTextColor={THEME.colors.muted}
              value={newDateTitle}
              onChangeText={setNewDateTitle}
            />

            {/* Quick Calendar Picker Trigger */}
            <Text style={styles.inputLabel}>Date Selection</Text>
            <TouchableOpacity
              style={styles.calendarPickBtn}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.8}
            >
              <CalendarDays size={18} color={THEME.colors.primary} />
              <Text style={styles.calendarPickBtnText}>
                {newDateMonth && newDateDay
                  ? `📅 ${MONTH_NAMES[parseInt(newDateMonth, 10) - 1] || newDateMonth} ${newDateDay}${newDateYear ? `, ${newDateYear}` : ''} (Tap to change)`
                  : 'Tap to pick date from calendar'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Month (1-12)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="10"
                  maxLength={2}
                  value={newDateMonth}
                  onChangeText={setNewDateMonth}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Day (1-31)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="14"
                  maxLength={2}
                  value={newDateDay}
                  onChangeText={setNewDateDay}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Year (Optional)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="1995"
                  maxLength={4}
                  value={newDateYear}
                  onChangeText={setNewDateYear}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsDateModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddDate}>
                <Text style={styles.saveBtnText}>Save Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AuthGateModal
        visible={authGateVisible}
        onClose={() => setAuthGateVisible(false)}
        title="Sign in to Save Contacts"
        description="Keep your important people and dates safely synced across all your devices."
        targetRoute="/(tabs)/people"
        actionName="Sign In with Email"
      />

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={
          newDateYear && newDateMonth && newDateDay
            ? `${newDateYear}-${String(newDateMonth).padStart(2, '0')}-${String(newDateDay).padStart(2, '0')}`
            : undefined
        }
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={(isoDate) => {
          if (isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
            const [y, m, d] = isoDate.split('-').map(Number);
            setNewDateYear(String(y));
            setNewDateMonth(String(m));
            setNewDateDay(String(d));
          }
        }}
        title="Pick Occasion Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background
  },
  guestNoticeCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: THEME.radius.lg
  },
  guestNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  guestNoticeBody: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginTop: 2
  },
  guestSignInBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radius.sm
  },
  guestSignInBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1.2
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.3
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle
  },
  personCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: THEME.radius.md
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  personNotes: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  deleteIconBtn: {
    padding: 6
  },
  datesList: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 10,
    gap: 6
  },
  addDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full
  },
  addDatePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  dateMonthDay: {
    fontSize: 12,
    color: THEME.colors.textMuted
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
    borderRadius: THEME.radius.md
  },
  dateCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateBadgeMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.primary
  },
  dateBadgeDay: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  dateCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  dateCardSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(37, 33, 42, 0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radius.lg,
    borderTopRightRadius: THEME.radius.lg,
    padding: 24,
    maxHeight: '85%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading,
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.surface
  },
  calendarPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10
  },
  calendarPickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
    flex: 1
  },
  relationshipSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4
  },
  relChoice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface
  },
  relChoiceSelected: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.primary
  },
  relChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    textTransform: 'capitalize'
  },
  relChoiceTextSelected: {
    color: THEME.colors.primary
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primary
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
