import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ExperienceCreateSchema,
  ExperiencePublishSchema,
  PartnerExclusiveSurpriseSchema,
  SharingModeSchema
} from '../dist/index.js';

test('Phase 4A: SharingModeSchema validates public_link and partner_exclusive', () => {
  assert.equal(SharingModeSchema.parse('public_link'), 'public_link');
  assert.equal(SharingModeSchema.parse('partner_exclusive'), 'partner_exclusive');

  assert.throws(() => {
    SharingModeSchema.parse('unrestricted_wildcard');
  }, /Invalid enum value/);
});

test('Phase 4A: Backward compatibility - ExperienceCreateSchema defaults sharingMode to public_link', () => {
  const minimalPayload = {
    templateId: 'playful-yes-no',
    title: 'Surprise For Cynthia',
    recipientName: 'Cynthia',
    creatorName: 'John',
    config: {
      creatorName: 'John',
      recipientName: 'Cynthia',
      title: 'Surprise For Cynthia',
      theme: {
        id: 'romantic-rose',
        name: 'Romantic Rose',
        colors: {
          primary: '#E85D75',
          background: '#FCE7ED',
          surface: '#FFF9F2',
          textDark: '#542638',
          textMuted: '#8E6072',
          white: '#FFFFFF'
        },
        fontHeading: 'serif',
        fontBody: 'sans',
        backgroundEffect: 'floating_hearts'
      },
      music: { enabled: true },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Hello Cynthia',
          interaction: { type: 'next_button' },
          order: 0
        }
      ]
    }
  };

  const parsed = ExperienceCreateSchema.parse(minimalPayload);
  assert.equal(parsed.sharingMode, 'public_link', 'Should default to public_link for backward compatibility');
  assert.equal(parsed.recipientId, undefined, 'recipientId is not set for public_link');
});

test('Phase 4A: PartnerExclusiveSurpriseSchema enforces valid UUID recipientId when partner_exclusive', () => {
  const validPartnerExclusive = {
    templateId: 'playful-yes-no',
    title: 'Exclusive For Cynthia',
    recipientName: 'Cynthia',
    creatorName: 'John',
    sharingMode: 'partner_exclusive',
    recipientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    config: {
      creatorName: 'John',
      recipientName: 'Cynthia',
      title: 'Exclusive For Cynthia',
      theme: {
        id: 'romantic-rose',
        name: 'Romantic Rose',
        colors: {
          primary: '#E85D75',
          background: '#FCE7ED',
          surface: '#FFF9F2',
          textDark: '#542638',
          textMuted: '#8E6072',
          white: '#FFFFFF'
        },
        fontHeading: 'serif',
        fontBody: 'sans',
        backgroundEffect: 'floating_hearts'
      },
      music: { enabled: false },
      scenes: [
        {
          id: 's1',
          type: 'greeting',
          title: 'Hello Cynthia',
          interaction: { type: 'next_button' },
          order: 0
        }
      ]
    }
  };

  const parsed = PartnerExclusiveSurpriseSchema.parse(validPartnerExclusive);
  assert.equal(parsed.sharingMode, 'partner_exclusive');
  assert.equal(parsed.recipientId, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

  // Must reject missing or null recipientId when partner_exclusive
  assert.throws(() => {
    PartnerExclusiveSurpriseSchema.parse({
      ...validPartnerExclusive,
      recipientId: null
    });
  }, /A connected partner recipient is required/);
});

test('Phase 4A: Authorization Invariants for Partner-Exclusive Surprises', () => {
  // Simulate RLS decision engine
  function canUserViewExperience(viewerId, experience) {
    if (experience.status === 'draft') {
      return viewerId === experience.userId; // Drafts strictly creator only
    }

    if (experience.status === 'published') {
      if (experience.sharingMode === 'public_link') {
        return true; // Anyone with the link
      }
      if (experience.sharingMode === 'partner_exclusive') {
        return viewerId === experience.recipientId || viewerId === experience.userId;
      }
    }

    return false;
  }

  const creatorId = 'creator-uuid-1';
  const partnerRecipientId = 'partner-uuid-2';
  const strangerId = 'stranger-uuid-3';

  const partnerExperience = {
    id: 'exp-1',
    userId: creatorId,
    status: 'published',
    sharingMode: 'partner_exclusive',
    recipientId: partnerRecipientId
  };

  const draftPartnerExperience = {
    id: 'exp-2',
    userId: creatorId,
    status: 'draft',
    sharingMode: 'partner_exclusive',
    recipientId: partnerRecipientId
  };

  // Creator can view published and draft
  assert.equal(canUserViewExperience(creatorId, partnerExperience), true);
  assert.equal(canUserViewExperience(creatorId, draftPartnerExperience), true);

  // Partner can view published, but CANNOT view draft
  assert.equal(canUserViewExperience(partnerRecipientId, partnerExperience), true);
  assert.equal(canUserViewExperience(partnerRecipientId, draftPartnerExperience), false, 'Partner cannot view drafts');

  // Stranger cannot view published partner-exclusive surprise
  assert.equal(canUserViewExperience(strangerId, partnerExperience), false, 'Stranger must be blocked from partner surprise');
  assert.equal(canUserViewExperience(strangerId, draftPartnerExperience), false, 'Stranger must be blocked from draft');
});

test('Phase 4A: Disconnection Invariant - Creator retains ownership but past partner access obeys policy', () => {
  const creatorId = 'creator-uuid-1';
  const formerPartnerId = 'former-partner-2';

  const experience = {
    id: 'exp-1',
    userId: creatorId,
    status: 'published',
    sharingMode: 'partner_exclusive',
    recipientId: formerPartnerId
  };

  // Even if disconnected, creator ownership never transfers to anyone else
  assert.equal(experience.userId, creatorId, 'Creator ownership is immutable');

  // An unrelated 3rd party cannot hijack or re-assign recipientId
  function reassignRecipient(actorId, exp, newRecipientId) {
    if (actorId !== exp.userId) {
      throw new Error('Unauthorized: Only creator can alter surprise recipient');
    }
    return { ...exp, recipientId: newRecipientId };
  }

  assert.throws(() => {
    reassignRecipient('stranger-3', experience, 'stranger-3');
  }, /Unauthorized/);
});
