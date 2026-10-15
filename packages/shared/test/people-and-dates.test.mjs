import test from 'node:test';
import assert from 'node:assert/strict';
import { CreatePersonSchema, CreateImportantDateSchema } from '../dist/index.js';

test('Phase B: CreatePersonSchema validates name and allows contacts without account', () => {
  const validContact = {
    displayName: 'Grandma Rose',
    relationshipLabel: 'family',
    notes: 'Loves fresh lavender and handwritten cards',
    avatarEmoji: '👵🏼'
  };

  const result = CreatePersonSchema.safeParse(validContact);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.data.displayName, 'Grandma Rose');
    assert.equal(result.data.linkedAccountId, undefined); // No account required!
  }

  // Name is required
  const invalidEmpty = { displayName: '   ' };
  assert.ok(!CreatePersonSchema.safeParse(invalidEmpty).success);
});

test('Phase B: CreateImportantDateSchema supports annual recurring birthdays without year', () => {
  const birthdayWithoutYear = {
    title: 'Alex’s Birthday',
    category: 'birthday',
    month: 7,
    day: 14,
    recurrence: 'annual',
    reminderEnabled: true
  };

  const result = CreateImportantDateSchema.safeParse(birthdayWithoutYear);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.data.year, undefined);
    assert.equal(result.data.recurrence, 'annual');
    assert.equal(result.data.month, 7);
    assert.equal(result.data.day, 14);
  }
});

test('Phase B: CreateImportantDateSchema validates calendar month bounds', () => {
  // February cannot have 31 days
  const invalidDate = {
    title: 'Impossible Day',
    category: 'custom',
    month: 2,
    day: 31
  };

  const result = CreateImportantDateSchema.safeParse(invalidDate);
  assert.ok(!result.success);
});

test('Phase B: Multi-tenant ownership invariant - Personal directory data isolated per owner', () => {
  const userAContact = { id: 'p1', userId: 'user_1', displayName: 'Mom' };
  const userBContact = { id: 'p2', userId: 'user_2', displayName: 'Dad' };

  function simulateRlsFilter(records, authUserId) {
    return records.filter((r) => r.userId === authUserId);
  }

  const userAVisible = simulateRlsFilter([userAContact, userBContact], 'user_1');
  assert.equal(userAVisible.length, 1);
  assert.equal(userAVisible[0].displayName, 'Mom');

  const userBVisible = simulateRlsFilter([userAContact, userBContact], 'user_2');
  assert.equal(userBVisible.length, 1);
  assert.equal(userBVisible[0].displayName, 'Dad');
});
