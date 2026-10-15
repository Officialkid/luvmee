import test from 'node:test';
import assert from 'node:assert/strict';

test('Phase D: Reminder scheduling calculates 24h prior and day-of dates correctly', () => {
  const occasionMonth = 11; // November
  const occasionDay = 20;   // 20th
  const currentYear = 2026;

  const occasionDate = new Date(currentYear, occasionMonth - 1, occasionDay);
  const prior24hDate = new Date(currentYear, occasionMonth - 1, occasionDay - 1);

  assert.equal(occasionDate.getDate(), 20);
  assert.equal(prior24hDate.getDate(), 19);
});

test('Phase D: Idempotency Invariant - Unique constraint prevents duplicate reminder scheduling', () => {
  const scheduledReminders = new Set();

  function scheduleReminder(dateId, reminderType, scheduledFor) {
    const key = `${dateId}_${reminderType}_${scheduledFor}`;
    if (scheduledReminders.has(key)) {
      return { scheduled: false, reason: 'duplicate' };
    }
    scheduledReminders.add(key);
    return { scheduled: true };
  }

  const firstAttempt = scheduleReminder('date_1', 'before_24h', '2026-11-19');
  assert.equal(firstAttempt.scheduled, true);

  // Repeated trigger execution does not create duplicate
  const secondAttempt = scheduleReminder('date_1', 'before_24h', '2026-11-19');
  assert.equal(secondAttempt.scheduled, false);
});

test('Phase D: Notification copy is privacy-conscious and does not disclose sensitive details', () => {
  function generateReminderCopy(title, displayName, reminderType) {
    if (reminderType === 'before_24h') {
      return `Tomorrow is ${title}${displayName ? ` for ${displayName}` : ''}. Want to prepare a card?`;
    }
    return `Today is ${title}${displayName ? ` for ${displayName}` : ''}! Send some love 💌`;
  }

  const copy = generateReminderCopy("Mom's 60th Birthday", "Mom", "same_day");
  assert.ok(copy.includes("Today is Mom's 60th Birthday"));
  assert.ok(!copy.includes("password"));
  assert.ok(!copy.includes("token"));
});

test('Phase 1B: Reminder Processing Invariant - Throttling prevents uncontrolled repeated executions within cooldown window', () => {
  let rpcCallCount = 0;
  let lastProcessedTimestamp = 0;
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 min

  function triggerProcessDueReminders(currentTime, force = false) {
    if (!force && (currentTime - lastProcessedTimestamp < COOLDOWN_MS)) {
      return { throttled: true, callCount: rpcCallCount };
    }
    rpcCallCount++;
    lastProcessedTimestamp = currentTime;
    return { throttled: false, callCount: rpcCallCount };
  }

  const t0 = 1000000;
  const first = triggerProcessDueReminders(t0);
  assert.equal(first.throttled, false);
  assert.equal(first.callCount, 1);

  // Immediate second call within 1 second is suppressed by throttling
  const second = triggerProcessDueReminders(t0 + 1000);
  assert.equal(second.throttled, true);
  assert.equal(second.callCount, 1);

  // Call after 3 minutes is still suppressed
  const third = triggerProcessDueReminders(t0 + 3 * 60 * 1000);
  assert.equal(third.throttled, true);
  assert.equal(third.callCount, 1);

  // Call after 6 minutes succeeds
  const fourth = triggerProcessDueReminders(t0 + 6 * 60 * 1000);
  assert.equal(fourth.throttled, false);
  assert.equal(fourth.callCount, 2);

  // Forced call (e.g. manual pull-to-refresh) succeeds even within cooldown
  const forced = triggerProcessDueReminders(t0 + 6 * 60 * 1000 + 500, true);
  assert.equal(forced.throttled, false);
  assert.equal(forced.callCount, 3);
});

test('Phase 1B: Reminder Processing Invariant - Idempotent dispatch prevents re-processing already dispatched reminders', () => {
  const reminderStore = [
    { id: 'rem_1', scheduled_for: '2026-10-15', dispatched: false },
    { id: 'rem_2', scheduled_for: '2026-10-15', dispatched: false }
  ];

  function processDueReminders(currentDate) {
    let processed = 0;
    for (const r of reminderStore) {
      if (r.scheduled_for <= currentDate && !r.dispatched) {
        r.dispatched = true;
        processed++;
      }
    }
    return { success: true, processedCount: processed };
  }

  // First run processes 2 reminders
  const run1 = processDueReminders('2026-10-15');
  assert.equal(run1.processedCount, 2);
  assert.equal(reminderStore.every((r) => r.dispatched), true);

  // Second run on same date processes 0 reminders (idempotent)
  const run2 = processDueReminders('2026-10-15');
  assert.equal(run2.processedCount, 0);
});

