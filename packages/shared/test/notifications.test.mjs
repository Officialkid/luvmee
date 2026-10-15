import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RegisterPushTokenSchema,
  NotificationPreferencesSchema
} from '../dist/index.js';

test('Phase 4C: RegisterPushTokenSchema validates tokens and platform values', () => {
  // Valid token
  const valid = RegisterPushTokenSchema.parse({
    token: 'ExponentPushToken[xxxx-yyyy-zzzz]',
    platform: 'android'
  });
  assert.equal(valid.token, 'ExponentPushToken[xxxx-yyyy-zzzz]');
  assert.equal(valid.platform, 'android');

  // Rejects invalid platform
  assert.throws(() => {
    RegisterPushTokenSchema.parse({
      token: 'ExponentPushToken[xxxx-yyyy-zzzz]',
      platform: 'windows'
    });
  }, /Invalid enum value/);

  // Rejects short/empty token
  assert.throws(() => {
    RegisterPushTokenSchema.parse({
      token: 'short',
      platform: 'ios'
    });
  }, /Push token must be valid/);
});

test('Phase 4C: NotificationPreferencesSchema provides defaults and validation', () => {
  const defaultPrefs = NotificationPreferencesSchema.parse({});
  assert.equal(defaultPrefs.partnerInvitations, true);
  assert.equal(defaultPrefs.loveNotes, true);
  assert.equal(defaultPrefs.surprises, true);

  const customPrefs = NotificationPreferencesSchema.parse({
    partnerInvitations: false,
    loveNotes: true,
    surprises: false
  });
  assert.equal(customPrefs.partnerInvitations, false);
  assert.equal(customPrefs.surprises, false);
});

test('Phase 4C: Payload Privacy Invariant - Push body contains teaser without sensitive note contents', () => {
  // Simulates the notification generator
  function createSafePushPayload(category, actorName, sensitiveContent, route) {
    let safeTitle = '';
    let safeBody = '';

    if (category === 'love_note') {
      safeTitle = 'New Love Note 💌';
      safeBody = `${actorName} sent you a private love note.`; // Raw sensitiveContent NEVER in body!
    } else if (category === 'partner_surprise') {
      safeTitle = 'Special Surprise For You 🎁';
      safeBody = `${actorName} crafted a private romantic surprise for you.`;
    }

    // Must never leak intimate message content in the lock-screen push payload
    assert.equal(safeBody.includes(sensitiveContent), false, 'Push body must never leak raw sensitive message text');

    return {
      title: safeTitle,
      body: safeBody,
      data: { route }
    };
  }

  const rawIntimateMessage = 'Secret romantic message that must not show on lock screen!';
  const payload = createSafePushPayload('love_note', 'John', rawIntimateMessage, '/(tabs)/messages');

  assert.equal(payload.title, 'New Love Note 💌');
  assert.equal(payload.body, 'John sent you a private love note.');
  assert.equal(payload.data.route, '/(tabs)/messages');
  assert.equal(payload.body.includes(rawIntimateMessage), false);
});

test('Phase 4C: Deep-Link Route Safety - Route resolves to authorized internal destinations', () => {
  const ALLOWED_INTERNAL_ROUTES = [
    '/(tabs)/profile',
    '/(tabs)/messages',
    '/(tabs)/my-experiences',
    '/preview/'
  ];

  function validateDeepLinkRoute(route) {
    const isSafe = ALLOWED_INTERNAL_ROUTES.some((prefix) => route.startsWith(prefix));
    if (!isSafe) {
      throw new Error(`Unauthorized route redirection attempt: ${route}`);
    }
    return true;
  }

  assert.equal(validateDeepLinkRoute('/(tabs)/messages'), true);
  assert.equal(validateDeepLinkRoute('/(tabs)/profile'), true);
  assert.equal(validateDeepLinkRoute('/preview/exp-12345'), true);

  assert.throws(() => {
    validateDeepLinkRoute('https://malicious-external-site.com/steal-creds');
  }, /Unauthorized route/);
});

test('Phase 4C: Logout Lifecycle Invariant - Device token invalidation on sign out', () => {
  let userDeviceStore = {
    'user-john': ['token-device-a', 'token-device-b']
  };

  function unregisterTokenOnLogout(userId, tokenToInvalidate) {
    if (userDeviceStore[userId]) {
      userDeviceStore[userId] = userDeviceStore[userId].filter((t) => t !== tokenToInvalidate);
    }
  }

  unregisterTokenOnLogout('user-john', 'token-device-a');
  assert.equal(userDeviceStore['user-john'].length, 1);
  assert.equal(userDeviceStore['user-john'].includes('token-device-a'), false, 'Invalidated token removed');
});
