import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Cake,
  Heart,
  Sparkles,
  Gift,
  Plus,
  Send,
  Bookmark
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SectionHeader, Badge, EmptyState } from '../../components/UIPrimitives';
import { AuthGateModal } from '../../components/AuthGateModal';
import { peopleService } from '../../services/peopleService';
import { supabase } from '../../services/supabase';
import { authService } from '../../services/authService';
import {
  ImportantDate,
  Person,
  calculateNextOccurrence,
  generateMonthGrid,
  getDaysInMonth
} from '@luvmee/shared';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1 - 12
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
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
      const [datesList, peopleList] = await Promise.all([
        peopleService.getImportantDates(),
        peopleService.getPeople()
      ]);
      setDates(datesList);
      setPeople(peopleList);
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

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const monthGrid = generateMonthGrid(currentYear, currentMonth);

  // Filter dates that occur in the current month
  const datesThisMonth = dates.filter((d) => d.month === currentMonth);

  // Dates for the currently selected day
  const datesSelectedDay = datesThisMonth.filter((d) => d.day === selectedDay);

  // Upcoming upcoming dates sorted by countdown
  const upcomingOccasions = dates
    .map((d) => {
      const occurrence = calculateNextOccurrence(d.month, d.day, today);
      const person = people.find((p) => p.id === d.personId);
      return {
        ...d,
        personName: person?.displayName,
        occurrence
      };
    })
    .sort((a, b) => a.occurrence.daysRemaining - b.occurrence.daysRemaining)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>OCCASIONS & MILESTONES</Text>
            <Text style={styles.headerTitle}>Celebration Calendar</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.plansHeaderBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/plans')}
            >
              <Bookmark size={15} color={THEME.colors.primary} />
              <Text style={styles.plansHeaderBtnText}>Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.8}
              onPress={() => requireAuth(() => router.push('/(tabs)/people' as any))}
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Banner if not signed in */}
        {!session && (
          <Card variant="highlight" style={styles.guestNoticeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Sparkles size={20} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guestNoticeTitle}>Guest Mode</Text>
                <Text style={styles.guestNoticeBody}>
                  Sign in to keep your milestone dates and automated reminders synced.
                </Text>
              </View>
              <Button
                title="Sign In"
                size="sm"
                onPress={async () => {
                  await authService.setAuthRedirect('/(tabs)/calendar');
                  router.push('/(auth)/sign-in');
                }}
              />
            </View>
          </Card>
        )}

        {/* Month Selector Card */}
        <Card variant="surface" style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <ChevronLeft size={18} color={THEME.colors.textHeading} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
              <ChevronRight size={18} color={THEME.colors.textHeading} />
            </TouchableOpacity>
          </View>

          {/* Weekday Row */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={styles.weekdayText}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.gridContainer}>
            {monthGrid.map((cell, idx) => {
              if (cell.day === null) {
                return <View key={`empty_${idx}`} style={styles.dayCellEmpty} />;
              }

              const isSelected = cell.day === selectedDay;
              const isTodayCell =
                cell.day === today.getDate() &&
                currentMonth === today.getMonth() + 1 &&
                currentYear === today.getFullYear();
              const hasOccasion = datesThisMonth.some((d) => d.day === cell.day);

              return (
                <TouchableOpacity
                  key={`day_${cell.day}`}
                  activeOpacity={0.8}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isTodayCell && !isSelected && styles.dayCellToday
                  ]}
                  onPress={() => setSelectedDay(cell.day!)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.dayNumberSelected,
                      isTodayCell && !isSelected && styles.dayNumberToday
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {hasOccasion ? (
                    <View
                      style={[
                        styles.occasionDot,
                        isSelected && { backgroundColor: '#FFFFFF' }
                      ]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Date Occasions List */}
        <SectionHeader
          title={`${MONTH_NAMES[currentMonth - 1]} ${selectedDay} Occasions (${datesSelectedDay.length})`}
        />

        {datesSelectedDay.length === 0 ? (
          <EmptyState
            title="No Occasions on this Day"
            description="Add a birthday, anniversary, or special milestone for this date."
            actionLabel="Add Occasion"
            onAction={() => requireAuth(() => router.push('/(tabs)/people' as any))}
            icon={<CalendarIcon size={26} color={THEME.colors.primary} />}
          />
        ) : (
          datesSelectedDay.map((d) => {
            const person = people.find((p) => p.id === d.personId);
            return (
              <Card key={d.id} variant="surface" style={styles.eventCard}>
                <View style={styles.eventLeft}>
                  <View style={styles.eventIcon}>
                    <Cake size={18} color={THEME.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{d.title}</Text>
                    <Text style={styles.eventSub}>
                      {person ? `For ${person.displayName} • ` : ''}Annual Occasion
                    </Text>
                  </View>
                </View>
                <Button
                  title="Send Card"
                  size="sm"
                  variant="outline"
                  icon={<Send size={13} color={THEME.colors.primary} />}
                  onPress={() => router.push('/(tabs)/templates')}
                />
              </Card>
            );
          })
        )}

        {/* Upcoming Countdowns */}
        <View style={{ marginTop: 16 }}>
          <SectionHeader title="Upcoming Celebrations" />
        </View>

        {upcomingOccasions.length === 0 ? (
          <EmptyState
            title="No Upcoming Dates"
            description="Save upcoming birthdays and anniversaries in People to see their countdowns here."
            icon={<Sparkles size={26} color={THEME.colors.primary} />}
          />
        ) : (
          upcomingOccasions.map((item) => (
            <Card key={item.id} variant="surface" style={styles.upcomingCard}>
              <View style={styles.upcomingLeft}>
                <Badge
                  label={item.occurrence.formattedCountdown}
                  variant="primary"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingSub}>
                    {MONTH_NAMES[item.month - 1]} {item.day}
                    {item.personName ? ` • ${item.personName}` : ''}
                  </Text>
                </View>
              </View>
              <Button
                title="Prepare Card"
                variant="outline"
                size="sm"
                onPress={() => router.push('/(tabs)/templates')}
              />
            </Card>
          ))
        )}

        {/* Personal Plans Quick Access Banner */}
        <Card variant="highlight" style={styles.plansBannerCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.plansBannerIcon}>
              <Bookmark size={20} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.plansBannerTitle}>Personal Plans & Wishlist</Text>
              <Text style={styles.plansBannerBody}>
                Save date spots, activities, and gift ideas for your upcoming occasions.
              </Text>
            </View>
            <Button
              title="View Plans"
              size="sm"
              onPress={() => router.push('/(tabs)/plans')}
            />
          </View>
        </Card>
      </ScrollView>

      <AuthGateModal
        visible={authGateVisible}
        onClose={() => setAuthGateVisible(false)}
        title="Sign in for Calendar Sync"
        description="Save your calendar occasions and push reminders securely in your LUVMEE account."
        targetRoute="/(tabs)/calendar"
        actionName="Sign In with Email"
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  plansHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  plansHeaderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary
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
  calendarCard: {
    padding: 14,
    marginBottom: 16,
    borderRadius: THEME.radius.lg
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceHighlight
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    width: 38,
    textAlign: 'center'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  dayCellEmpty: {
    width: 38,
    height: 38,
    marginVertical: 3
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
    position: 'relative'
  },
  dayCellSelected: {
    backgroundColor: THEME.colors.primary
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: THEME.colors.primary
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  dayNumberToday: {
    color: THEME.colors.primary,
    fontWeight: '700'
  },
  occasionDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
    borderRadius: THEME.radius.md
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  eventIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  eventSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 12,
    borderRadius: THEME.radius.md
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  upcomingSub: {
    fontSize: 11,
    color: THEME.colors.textMuted
  },
  plansBannerCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: THEME.radius.lg
  },
  plansBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plansBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  plansBannerBody: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginTop: 2
  }
});
