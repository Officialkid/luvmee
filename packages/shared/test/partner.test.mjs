import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizePartnerCode,
  calculateDaysInLove,
  PartnerCodeSchema,
  SendPartnerInvitationSchema,
  RespondPartnerInvitationSchema
} from '../dist/index.js';

test('normalizePartnerCode handles lowercase, prefixes, and whitespaces', () => {
  assert.strictEqual(normalizePartnerCode('4b92'), 'LUV-4B92');
  assert.strictEqual(normalizePartnerCode(' 4B92 '), 'LUV-4B92');
  assert.strictEqual(normalizePartnerCode('luv-4b92'), 'LUV-4B92');
  assert.strictEqual(normalizePartnerCode('LUV-9X2M'), 'LUV-9X2M');
  assert.strictEqual(normalizePartnerCode(''), '');
});

test('calculateDaysInLove computes accurate day offsets and guards against future dates', () => {
  const now = new Date();
  assert.strictEqual(calculateDaysInLove(now.toISOString()), 0);

  // 10 days ago
  const tenDaysAgo = new Date(Date.now() - 10 * 86400 * 1000);
  assert.strictEqual(calculateDaysInLove(tenDaysAgo.toISOString()), 10);

  // Future date should clamp to 0
  const futureDate = new Date(Date.now() + 5 * 86400 * 1000);
  assert.strictEqual(calculateDaysInLove(futureDate.toISOString()), 0);

  // Invalid / null
  assert.strictEqual(calculateDaysInLove(null), 0);
  assert.strictEqual(calculateDaysInLove(undefined), 0);
  assert.strictEqual(calculateDaysInLove('invalid-date'), 0);
});

test('PartnerCodeSchema validates 4-char code and LUV-XXXX format', () => {
  assert.strictEqual(PartnerCodeSchema.safeParse('4B92').success, true);
  assert.strictEqual(PartnerCodeSchema.safeParse('LUV-4B92').success, true);
  assert.strictEqual(PartnerCodeSchema.safeParse('luv-4b92').success, true);

  // Invalid
  assert.strictEqual(PartnerCodeSchema.safeParse('12').success, false);
  assert.strictEqual(PartnerCodeSchema.safeParse('TOOLONGBYFAR').success, false);
  assert.strictEqual(PartnerCodeSchema.safeParse('').success, false);
});

test('SendPartnerInvitationSchema validates code or email targets', () => {
  // Valid code or email
  assert.strictEqual(SendPartnerInvitationSchema.safeParse({ target: 'LUV-4B92' }).success, true);
  assert.strictEqual(SendPartnerInvitationSchema.safeParse({ target: 'cynthia@example.com' }).success, true);
  assert.strictEqual(SendPartnerInvitationSchema.safeParse({ target: '4B92' }).success, true);

  // Invalid targets
  assert.strictEqual(SendPartnerInvitationSchema.safeParse({ target: '' }).success, false);
  assert.strictEqual(SendPartnerInvitationSchema.safeParse({ target: 'ab' }).success, false);
});

test('RespondPartnerInvitationSchema validates decision and UUID', () => {
  const validUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const acceptRes = RespondPartnerInvitationSchema.safeParse({
    invitationId: validUUID,
    decision: 'accept'
  });
  assert.strictEqual(acceptRes.success, true);

  const declineRes = RespondPartnerInvitationSchema.safeParse({
    invitationId: validUUID,
    decision: 'decline'
  });
  assert.strictEqual(declineRes.success, true);

  // Invalid decision
  const invalidDecision = RespondPartnerInvitationSchema.safeParse({
    invitationId: validUUID,
    decision: 'maybe'
  });
  assert.strictEqual(invalidDecision.success, false);

  // Invalid UUID
  const invalidUUID = RespondPartnerInvitationSchema.safeParse({
    invitationId: 'not-a-uuid',
    decision: 'accept'
  });
  assert.strictEqual(invalidUUID.success, false);
});
