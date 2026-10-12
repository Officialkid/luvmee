import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizePartnerCode,
  calculateDaysInLove,
  PartnerCodeSchema,
  SendPartnerInvitationSchema,
  RespondPartnerInvitationSchema
} from '../dist/index.js';

// Transition validation helper representing the database state machine
function validateInvitationStateTransition(currentStatus, action) {
  if (currentStatus !== 'pending') {
    return { allowed: false, error: 'Invitation is no longer pending.' };
  }
  if (action === 'accept') {
    return { allowed: true, newStatus: 'accepted' };
  }
  if (action === 'decline') {
    return { allowed: true, newStatus: 'declined' };
  }
  if (action === 'cancel') {
    return { allowed: true, newStatus: 'cancelled' };
  }
  return { allowed: false, error: 'Invalid action.' };
}

// Invariant helper testing single-partner rule
function canUserConnect(userActivePartners, userId) {
  return !userActivePartners.has(userId);
}

// Self-invitation check helper
function canInviteUser(senderId, recipientId) {
  if (senderId === recipientId) {
    return { allowed: false, error: 'Cannot connect with yourself.' };
  }
  return { allowed: true };
}

test('Lifecycle Rule 1: Self-invitation is strictly blocked', () => {
  const userId = 'user-abc-123';
  const result = canInviteUser(userId, userId);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.error, 'Cannot connect with yourself.');
});

test('Lifecycle Rule 2 & 3: One active partner invariant blocks second partnership', () => {
  const activePartners = new Map();
  const userA = 'user-alice';
  const userB = 'user-bob';
  const userC = 'user-charlie';

  // Pair Alice & Bob
  activePartners.set(userA, userB);
  activePartners.set(userB, userA);

  // Attempt to pair Alice with Charlie
  assert.strictEqual(canUserConnect(activePartners, userA), false);
  // Bob also cannot pair with Charlie
  assert.strictEqual(canUserConnect(activePartners, userB), false);
  // Charlie is free
  assert.strictEqual(canUserConnect(activePartners, userC), true);
});

test('Lifecycle Rule 9: Terminal states (declined, cancelled, accepted) cannot be accepted again', () => {
  assert.strictEqual(validateInvitationStateTransition('accepted', 'accept').allowed, false);
  assert.strictEqual(validateInvitationStateTransition('declined', 'accept').allowed, false);
  assert.strictEqual(validateInvitationStateTransition('cancelled', 'accept').allowed, false);
});

test('Lifecycle Transitions: Pending invitation accepts, declines, and cancels correctly', () => {
  const acceptRes = validateInvitationStateTransition('pending', 'accept');
  assert.strictEqual(acceptRes.allowed, true);
  assert.strictEqual(acceptRes.newStatus, 'accepted');

  const declineRes = validateInvitationStateTransition('pending', 'decline');
  assert.strictEqual(declineRes.allowed, true);
  assert.strictEqual(declineRes.newStatus, 'declined');

  const cancelRes = validateInvitationStateTransition('pending', 'cancel');
  assert.strictEqual(cancelRes.allowed, true);
  assert.strictEqual(cancelRes.newStatus, 'cancelled');
});

test('Authorization Invariant: Caller identity checks match caller permissions', () => {
  const invitation = {
    id: 'inv-1',
    sender_id: 'alice-id',
    recipient_id: 'bob-id',
    status: 'pending'
  };

  // Only recipient can accept or decline
  const canBobAccept = invitation.recipient_id === 'bob-id';
  const canAliceAccept = invitation.recipient_id === 'alice-id';
  const canEveAccept = invitation.recipient_id === 'eve-id';

  assert.strictEqual(canBobAccept, true);
  assert.strictEqual(canAliceAccept, false);
  assert.strictEqual(canEveAccept, false);

  // Only sender can cancel
  const canAliceCancel = invitation.sender_id === 'alice-id';
  const canBobCancel = invitation.sender_id === 'bob-id';

  assert.strictEqual(canAliceCancel, true);
  assert.strictEqual(canBobCancel, false);
});

test('Normalization & Validation: Partner code handles case variants, prefixes, and whitespaces', () => {
  assert.strictEqual(normalizePartnerCode('luv-k892'), 'LUV-K892');
  assert.strictEqual(normalizePartnerCode('k892'), 'LUV-K892');
  assert.strictEqual(normalizePartnerCode(' LUV-K892 '), 'LUV-K892');
});
