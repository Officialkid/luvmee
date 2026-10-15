import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextOccurrence,
  generateMonthGrid,
  getDaysInMonth
} from '../dist/index.js';

test('Phase C: calculateNextOccurrence correctly handles future date this year', () => {
  // Reference date: July 1, 2026
  const refDate = new Date(2026, 6, 1); // July 1
  const result = calculateNextOccurrence(7, 10, refDate); // July 10

  assert.equal(result.daysRemaining, 9);
  assert.equal(result.isToday, false);
  assert.equal(result.formattedCountdown, 'In 9 days');
});

test('Phase C: calculateNextOccurrence rolls over to next year if date has passed', () => {
  // Reference date: October 15, 2026
  const refDate = new Date(2026, 9, 15);
  // Occasion was January 5
  const result = calculateNextOccurrence(1, 5, refDate);

  assert.equal(result.nextDate.getFullYear(), 2027);
  assert.equal(result.nextDate.getMonth(), 0); // January
  assert.equal(result.nextDate.getDate(), 5);
  assert.ok(result.daysRemaining > 0);
});

test('Phase C: calculateNextOccurrence handles today and tomorrow accurately', () => {
  const refDate = new Date(2026, 9, 13); // Oct 13

  const todayResult = calculateNextOccurrence(10, 13, refDate);
  assert.equal(todayResult.isToday, true);
  assert.equal(todayResult.daysRemaining, 0);
  assert.equal(todayResult.formattedCountdown, 'Today! 🎉');

  const tomorrowResult = calculateNextOccurrence(10, 14, refDate);
  assert.equal(tomorrowResult.isTomorrow, true);
  assert.equal(tomorrowResult.daysRemaining, 1);
  assert.equal(tomorrowResult.formattedCountdown, 'Tomorrow 💌');
});

test('Phase C: calculateNextOccurrence handles leap year Feb 29 on non-leap years safely', () => {
  // 2026 and 2027 are common years (not leap years)
  const refDate = new Date(2026, 0, 1); // Jan 1, 2026
  const result = calculateNextOccurrence(2, 29, refDate);

  // In non-leap year 2026, recurrence safely falls back to Feb 28
  assert.equal(result.nextDate.getFullYear(), 2026);
  assert.equal(result.nextDate.getMonth(), 1); // Feb
  assert.equal(result.nextDate.getDate(), 28);
});

test('Phase C: generateMonthGrid generates complete week rows divisible by 7', () => {
  // October 2026 has 31 days
  const grid = generateMonthGrid(2026, 10);
  assert.equal(grid.length % 7, 0);

  const daysInOct = grid.filter((c) => c.isCurrentMonth);
  assert.equal(daysInOct.length, 31);
});
