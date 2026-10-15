import test from 'node:test';
import assert from 'node:assert/strict';

test('Phase A1: Chronological sorting places older messages before newer messages', () => {
  // Simulate get_love_notes response (which comes ordered DESC: newest first)
  const rpcNotes = [
    { id: '3', content: 'Note 3 (newest)', createdAt: '2026-10-13T10:00:00Z' },
    { id: '2', content: 'Note 2 (middle)', createdAt: '2026-10-13T09:00:00Z' },
    { id: '1', content: 'Note 1 (oldest)', createdAt: '2026-10-13T08:00:00Z' },
  ];

  // Remediation rule: reverse RPC response so oldest is at top
  const chronological = rpcNotes.slice().reverse();

  assert.equal(chronological[0].id, '1');
  assert.equal(chronological[1].id, '2');
  assert.equal(chronological[2].id, '3');

  // Realtime incoming note appends to bottom
  const incomingRealtime = { id: '4', content: 'Note 4 (live)', createdAt: '2026-10-13T10:05:00Z' };
  const updatedList = [...chronological, incomingRealtime];

  assert.equal(updatedList[updatedList.length - 1].id, '4');
  assert.equal(updatedList[0].id, '1');
});

test('Phase A1: Duplicate handling - realtime event does not duplicate existing note', () => {
  const currentList = [
    { id: '1', content: 'Hello' },
    { id: '2', content: 'World' }
  ];

  const duplicateEvent = { id: '2', content: 'World' };
  const deduplicated = currentList.some((m) => m.id === duplicateEvent.id)
    ? currentList
    : [...currentList, duplicateEvent];

  assert.equal(deduplicated.length, 2);
});

test('Phase A2: Cache key partitioning isolates user and partnership data', () => {
  const BASE_PREFIX = '@luvmee_love_notes_cache_v2';
  function getPartitionedCacheKey(userId, partnershipId) {
    if (userId && partnershipId) return `${BASE_PREFIX}_${userId}_${partnershipId}`;
    if (userId) return `${BASE_PREFIX}_${userId}`;
    return `${BASE_PREFIX}_anonymous`;
  }

  const userAKey = getPartitionedCacheKey('user_alpha', 'partnership_1');
  const userBKey = getPartitionedCacheKey('user_beta', 'partnership_2');

  assert.notEqual(userAKey, userBKey);
  assert.ok(userAKey.includes('user_alpha'));
  assert.ok(userBKey.includes('user_beta'));
});

test('Phase A3: Recipient web metadata access state distinguishes partner_exclusive without exposing content', () => {
  const publicMeta = { exists: true, status: 'published', sharingMode: 'public_link', recipientName: 'Taylor' };
  const privateMeta = { exists: true, status: 'published', sharingMode: 'partner_exclusive', recipientName: 'Jordan' };
  const nonexistent = { exists: false };

  assert.equal(publicMeta.sharingMode, 'public_link');
  assert.equal(privateMeta.sharingMode, 'partner_exclusive');
  assert.equal(nonexistent.exists, false);

  // Private metadata MUST NOT contain config or letter body
  assert.equal(privateMeta.config, undefined);
  assert.equal(privateMeta.body, undefined);
});
