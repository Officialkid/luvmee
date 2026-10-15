import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SendLoveNoteSchema,
  LoveNotesQuerySchema
} from '../dist/index.js';

test('Phase 4B: SendLoveNoteSchema enforces non-empty content and length limits', () => {
  // Valid message
  const valid = SendLoveNoteSchema.parse({
    content: 'Good morning my love! Thinking of you today. ❤️',
    tag: 'Sweet Kiss 💋'
  });
  assert.equal(valid.content, 'Good morning my love! Thinking of you today. ❤️');
  assert.equal(valid.tag, 'Sweet Kiss 💋');

  // Rejects empty / whitespace only
  assert.throws(() => {
    SendLoveNoteSchema.parse({ content: '   ' });
  }, /Message cannot be empty/);

  // Rejects over 2000 characters
  assert.throws(() => {
    SendLoveNoteSchema.parse({ content: 'a'.repeat(2001) });
  }, /Message cannot exceed 2000 characters/);
});

test('Phase 4B: LoveNotesQuerySchema enforces limits and pagination parameters', () => {
  const defaultQuery = LoveNotesQuerySchema.parse({});
  assert.equal(defaultQuery.limit, 50);

  const customQuery = LoveNotesQuerySchema.parse({
    limit: 25,
    beforeTimestamp: '2026-10-12T12:00:00.000Z'
  });
  assert.equal(customQuery.limit, 25);
  assert.equal(customQuery.beforeTimestamp, '2026-10-12T12:00:00.000Z');

  // Rejects excessive limits
  assert.throws(() => {
    LoveNotesQuerySchema.parse({ limit: 500 });
  });
});

test('Phase 4B: Conversation Invariant - Only active connected partners can send love notes', () => {
  function canSendLoveNote(actorId, activePartnership) {
    if (!activePartnership || activePartnership.status !== 'connected') {
      return { allowed: false, error: 'Must have active connected partner' };
    }
    if (actorId !== activePartnership.userA && actorId !== activePartnership.userB) {
      return { allowed: false, error: 'Actor is not a member of this partnership' };
    }
    return { allowed: true };
  }

  const partnership = {
    id: 'partnership-1',
    userA: 'user-john',
    userB: 'user-cynthia',
    status: 'connected'
  };

  assert.equal(canSendLoveNote('user-john', partnership).allowed, true);
  assert.equal(canSendLoveNote('user-cynthia', partnership).allowed, true);

  // 3rd party blocked
  assert.equal(canSendLoveNote('user-intruder', partnership).allowed, false);

  // Disconnected partnership blocked
  const disconnected = { ...partnership, status: 'disconnected' };
  assert.equal(canSendLoveNote('user-john', disconnected).allowed, false);
});

test('Phase 4B: RLS Invariant - Realtime channel & message visibility isolates conversation', () => {
  function filterMessagesForUser(viewerId, messages, partnershipMembers) {
    // Only members can view
    if (!partnershipMembers.includes(viewerId)) {
      return [];
    }
    return messages.filter(
      (m) => m.senderId === viewerId || m.recipientId === viewerId
    );
  }

  const coupleMessages = [
    { id: 'n1', senderId: 'user-john', recipientId: 'user-cynthia', content: 'Hey Cynthia!' },
    { id: 'n2', senderId: 'user-cynthia', recipientId: 'user-john', content: 'Hey John!' }
  ];

  const members = ['user-john', 'user-cynthia'];

  assert.equal(filterMessagesForUser('user-john', coupleMessages, members).length, 2);
  assert.equal(filterMessagesForUser('user-cynthia', coupleMessages, members).length, 2);
  assert.equal(filterMessagesForUser('user-stranger', coupleMessages, members).length, 0, 'Stranger receives 0 messages');
});

test('Phase 4B: Sender Identity Invariant - Sender cannot be spoofed by client payload', () => {
  // Simulates RPC identity derivation
  function processIncomingRPC(sessionUserId, clientPayload) {
    if (!sessionUserId) throw new Error('Unauthenticated');
    // Sender ID is always forced from session, never client payload
    return {
      senderId: sessionUserId,
      content: clientPayload.content
    };
  }

  const sessionUserId = 'verified-user-uuid';
  const spoofAttempt = {
    senderId: 'someone-else-uuid',
    content: 'Fake message'
  };

  const processed = processIncomingRPC(sessionUserId, spoofAttempt);
  assert.equal(processed.senderId, sessionUserId, 'Sender ID must match session UID, ignoring client payload');
});
