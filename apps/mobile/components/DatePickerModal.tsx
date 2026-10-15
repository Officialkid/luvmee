import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Button } from './Button';
import { generateMonthGrid, getDaysInMonth } from '@luvmee/shared';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string | null;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  title?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onClose,
  onSelectDate,
  title = 'Pick a Date'
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Initialize selected date from initialDate if valid YYYY-MM-DD
  useEffect(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const parts = initialDate.split('-').map(Number);
      setSelectedYear(parts[0]);
      setSelectedMonth(parts[1]);
      setSelectedDay(parts[2]);
      setCurrentYear(parts[0]);
      setCurrentMonth(parts[1]);
    } else {
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth() + 1);
      setSelectedDay(today.getDate());
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth() + 1);
    }
  }, [visible, initialDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setSelectedDay(day);
  };

  // Quick shortcut helpers
  const handleQuickPick = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth() + 1);
    setSelectedYear(target.getFullYear());
    setSelectedMonth(target.getMonth() + 1);
    setSelectedDay(target.getDate());
  };

  const handleThisWeekend = () => {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
    handleQuickPick(daysUntilSaturday === 0 ? 7 : daysUntilSaturday);
  };

  const handleConfirm = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const monthStr = String(selectedMonth).padStart(2, '0');
      const dayStr = String(selectedDay).padStart(2, '0');
      const isoDate = `${selectedYear}-${monthStr}-${dayStr}`;
      onSelectDate(isoDate);
    }
    onClose();
  };

  const monthGrid = generateMonthGrid(currentYear, currentMonth);

  const formatSelectedPreview = () => {
    if (!selectedYear || !selectedMonth || !selectedDay) return 'No date selected';
    const dateObj = new Date(selectedYear, selectedMonth - 1, selectedDay);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CalendarIcon size={18} color={THEME.colors.primary} />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Shortcuts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcutsRow}
          >
            <TouchableOpacity
              style={styles.shortcutChip}
              onPress={() => handleQuickPick(0)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutChipText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutChip}
              onPress={() => handleQuickPick(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutChipText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutChip}
              onPress={handleThisWeekend}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutChipText}>This Weekend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutChip}
              onPress={() => handleQuickPick(7)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutChipText}>Next Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutChip}
              onPress={() => handleQuickPick(30)}
              activeOpacity={0.7}
            >
              <Text style={styles.shortcutChipText}>Next Month</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Month Navigation */}
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

          {/* Weekdays */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={styles.weekdayText}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.gridContainer}>
            {monthGrid.map((cell, idx) => {
              if (cell.day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
              }

              const isSelected =
                selectedYear === currentYear &&
                selectedMonth === currentMonth &&
                selectedDay === cell.day;

              const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() + 1 === currentMonth &&
                today.getDate() === cell.day;

              return (
                <TouchableOpacity
                  key={`day-${cell.day}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday
                  ]}
                  onPress={() => handleSelectDay(cell.day!)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday
                    ]}
                  >
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Preview */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Selected Target:</Text>
            <Text style={styles.previewValue}>{formatSelectedPreview()}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onPress={onClose}
            />
            <Button
              title="Set Date"
              variant="primary"
              size="sm"
              style={{ flex: 1 }}
              icon={<Check size={14} color="#FFFFFF" />}
              onPress={handleConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceHighlight
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10
  },
  shortcutChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  shortcutChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
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
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textHeading
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6
  },
  weekdayText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    width: 36,
    textAlign: 'center'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
    marginVertical: 2
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2
  },
  dayCellSelected: {
    backgroundColor: THEME.colors.primary
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: THEME.colors.primary
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textHeading
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  dayTextToday: {
    color: THEME.colors.primary,
    fontWeight: '700'
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    marginTop: 10,
    marginBottom: 12
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted
  },
  previewValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8
  }
});
