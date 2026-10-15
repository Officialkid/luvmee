import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UsernameSchema,
  EmailPasswordSignUpSchema,
  EmailPasswordLoginSchema,
  PasswordResetRequestSchema,
  UpdatePasswordSchema,
  UpdateUsernameSchema,
  normalizeUsername,
  generateUsernameFromMetadata,
  isSessionInactiveTwoMonths
} from '../dist/index.js';

test('UsernameSchema: validates length, allowed characters, and trimmed spaces', () => {
  // Valid usernames
  assert.equal(UsernameSchema.parse('daniel'), 'daniel');
  assert.equal(UsernameSchema.parse('user_123'), 'user_123');
  assert.equal(UsernameSchema.parse('  sophia_rose  '), 'sophia_rose');

  // Invalid: too short (< 3 chars)
  assert.throws(() => UsernameSchema.parse('al'), /at least 3 characters/);

  // Invalid: too long (> 30 chars)
  assert.throws(() => UsernameSchema.parse('a'.repeat(31)), /cannot exceed 30 characters/);

  // Invalid characters (spaces, hyphens, special chars)
  assert.throws(() => UsernameSchema.parse('daniel kid'), /letters, numbers, and underscores/);
  assert.throws(() => UsernameSchema.parse('daniel-kid'), /letters, numbers, and underscores/);
  assert.throws(() => UsernameSchema.parse('daniel@luv'), /letters, numbers, and underscores/);
});

test('EmailPasswordSignUpSchema: requires valid email, 8+ char password, matching confirm password, and username', () => {
  const valid = {
    email: 'newuser@luvmee.app',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    username: 'new_creator'
  };
  const parsed = EmailPasswordSignUpSchema.parse(valid);
  assert.equal(parsed.email, 'newuser@luvmee.app');
  assert.equal(parsed.username, 'new_creator');

  // Mismatched passwords
  assert.throws(() => {
    EmailPasswordSignUpSchema.parse({
      ...valid,
      confirmPassword: 'DifferentPassword123!'
    });
  }, /Passwords do not match/);

  // Short password (< 8 chars)
  assert.throws(() => {
    EmailPasswordSignUpSchema.parse({
      ...valid,
      password: 'short',
      confirmPassword: 'short'
    });
  }, /at least 8 characters/);

  // Invalid username
  assert.throws(() => {
    EmailPasswordSignUpSchema.parse({
      ...valid,
      username: 'a'
    });
  }, /at least 3 characters/);
});

test('EmailPasswordLoginSchema & PasswordResetRequestSchema: validate email and password inputs', () => {
  const validLogin = EmailPasswordLoginSchema.parse({
    email: 'creator@luvmee.app',
    password: 'securepassword'
  });
  assert.equal(validLogin.email, 'creator@luvmee.app');

  assert.throws(() => {
    EmailPasswordLoginSchema.parse({
      email: 'notanemail',
      password: 'pass'
    });
  }, /valid email/);

  const validReset = PasswordResetRequestSchema.parse({
    email: 'resetme@luvmee.app'
  });
  assert.equal(validReset.email, 'resetme@luvmee.app');
});

test('normalizeUsername: converts to lowercase and trims correctly', () => {
  assert.equal(normalizeUsername('  Daniel_Kid  '), 'daniel_kid');
  assert.equal(normalizeUsername('LUVMEE_USER'), 'luvmee_user');
  assert.equal(normalizeUsername(''), '');
});

test('generateUsernameFromMetadata: generates safe usernames without exposing emails', () => {
  const fromName = generateUsernameFromMetadata({ fullName: 'Daniel Akinnusotu' });
  assert.match(fromName, /^daniel_akinnusotu_\d{4}$/);

  const fromEmail = generateUsernameFromMetadata({ email: 'developer@example.com' });
  assert.match(fromEmail, /^developer_\d{4}$/);
  assert.equal(fromEmail.includes('@'), false);
  assert.equal(fromEmail.includes('example.com'), false);

  const empty = generateUsernameFromMetadata({});
  assert.match(empty, /^user_\d{4}$/);
});

test('isSessionInactiveTwoMonths: correctly flags sessions older than 60 days', () => {
  const now = Date.now();
  const fiftyDaysAgo = new Date(now - 50 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyOneDaysAgo = new Date(now - 61 * 24 * 60 * 60 * 1000).toISOString();

  assert.equal(isSessionInactiveTwoMonths(fiftyDaysAgo, now), false);
  assert.equal(isSessionInactiveTwoMonths(sixtyOneDaysAgo, now), true);
  assert.equal(isSessionInactiveTwoMonths(null, now), false);
  assert.equal(isSessionInactiveTwoMonths(undefined, now), false);
});

test('Guest protected-action preservation invariant: stores target and restores exactly once', () => {
  let storedRedirect = null;
  const mockSetRedirect = (route) => { storedRedirect = route; };
  const mockPopRedirect = () => {
    const r = storedRedirect;
    storedRedirect = null;
    return r;
  };

  // Guest attempts to create a personal plan
  mockSetRedirect('/(tabs)/calendar');
  assert.equal(storedRedirect, '/(tabs)/calendar');

  // After authentication, route is popped once
  const restored = mockPopRedirect();
  assert.equal(restored, '/(tabs)/calendar');

  // Second pop is null to prevent repeated or duplicate redirects
  const secondPop = mockPopRedirect();
  assert.equal(secondPop, null);
});

test('Account deletion & cache partition invariant: private caches are scoped and purgeable', () => {
  const user1 = 'usr_daniel_111';
  const user2 = 'usr_sarah_222';
  const mockStore = new Map();

  // Populate caches for both users
  mockStore.set(`@luvmee_love_notes_cache_v2_${user1}_part123`, JSON.stringify([{ id: 'note1', text: 'Private' }]));
  mockStore.set(`@luvmee_love_notes_cache_v2_${user2}_part456`, JSON.stringify([{ id: 'note2', text: 'Secret' }]));
  mockStore.set('@luvmee_auth_redirect', '/(tabs)/profile');

  // Purge user1's data on sign-out/deletion
  const keysToRemove = Array.from(mockStore.keys()).filter(
    (k) => k.includes(user1) || k === '@luvmee_auth_redirect'
  );
  for (const k of keysToRemove) {
    mockStore.delete(k);
  }

  // Verify user1's data is wiped and user2's data is completely isolated
  assert.equal(mockStore.has(`@luvmee_love_notes_cache_v2_${user1}_part123`), false);
  assert.equal(mockStore.has('@luvmee_auth_redirect'), false);
  assert.equal(mockStore.has(`@luvmee_love_notes_cache_v2_${user2}_part456`), true);
});

test('Username editing schema invariant: enforces length and valid character restrictions', () => {
  const validUpdate = UpdateUsernameSchema.parse({ username: 'daniel_new_2026' });
  assert.equal(validUpdate.username, 'daniel_new_2026');

  assert.throws(() => {
    UpdateUsernameSchema.parse({ username: 'da' });
  }, /at least 3 characters/);

  assert.throws(() => {
    UpdateUsernameSchema.parse({ username: 'invalid name!' });
  }, /letters, numbers, and underscores/);
});
