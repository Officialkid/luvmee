import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateSlug,
  sanitizeText,
  interpolatePlaceholders,
  formatExperienceDate,
  STARTER_TEMPLATES,
  getTemplateById,
  ExperienceConfigSchema,
  buildRecipientExperienceUrl
} from '../dist/index.js';

test('generateSlug generates valid URL-friendly slugs', () => {
  const slug = generateSlug('Alikah Joy');
  assert.match(slug, /^for-alikah-joy-[a-z0-9]+$/);
  assert.ok(slug.length >= 10);
});

test('sanitizeText neutralizes malicious tags', () => {
  const dirty = '<script>alert("xss")</script>';
  const clean = sanitizeText(dirty);
  assert.strictEqual(clean.includes('<script>'), false);
  assert.strictEqual(clean.includes('&lt;script&gt;'), true);
});

test('interpolatePlaceholders replaces {recipientName} and {creatorName}', () => {
  const template = 'Hii {recipientName}, this is from {creatorName} ❤️';
  const result = interpolatePlaceholders(template, 'Daniel', 'Alikah');
  assert.strictEqual(result, 'Hii Alikah, this is from Daniel ❤️');
});

test('Starter templates catalogue contains complete templates including greeting cards', () => {
  assert.ok(STARTER_TEMPLATES.length >= 8);
  const playful = getTemplateById('playful-yes-no');
  assert.ok(playful);
  assert.strictEqual(playful.name, 'The Playful Yes-or-No');
  assert.ok(playful.defaultConfig.scenes.length >= 4);

  const bdayCard = getTemplateById('birthday-celebration-card');
  assert.ok(bdayCard);
  assert.strictEqual(bdayCard.name, 'Birthday Celebration Card');
});

test('All starter templates conform to ExperienceConfigSchema', () => {
  for (const t of STARTER_TEMPLATES) {
    const parsed = ExperienceConfigSchema.safeParse(t.defaultConfig);
    assert.strictEqual(parsed.success, true, `Template ${t.id} failed schema validation`);
  }
});

test('interpolatePlaceholders handles missing creator or recipient gracefully', () => {
  const template = 'For {recipientName} from {creatorName}';
  const result = interpolatePlaceholders(template, '', '');
  assert.strictEqual(result, 'For Someone Special from Someone Special');

  const undefinedResult = interpolatePlaceholders(template, undefined, undefined);
  assert.strictEqual(undefinedResult, 'For Someone Special from Someone Special');
});

test('generateSlug handles empty, special characters, and numeric inputs safely', () => {
  const slugEmpty = generateSlug('');
  assert.match(slugEmpty, /^for-special-one-[a-z0-9]+$/);

  const slugSpecial = generateSlug('!@#$%^&*()_+');
  assert.match(slugSpecial, /^for-special-one-[a-z0-9]+$/);

  const slugNormal = generateSlug('Alex');
  assert.match(slugNormal, /^for-alex-[a-z0-9]+$/);
});

test('buildRecipientExperienceUrl creates clean, valid URLs and handles malformed base or empty slug', () => {
  const urlDefault = buildRecipientExperienceUrl('my-anniversary-card');
  assert.strictEqual(urlDefault, 'https://luvmee.vercel.app/e/my-anniversary-card');

  const urlTrailing = buildRecipientExperienceUrl('my-anniversary-card', 'https://luvmee.app///');
  assert.strictEqual(urlTrailing, 'https://luvmee.app/e/my-anniversary-card');

  const urlNoProto = buildRecipientExperienceUrl('my-card', 'luvmee.staging.dev');
  assert.strictEqual(urlNoProto, 'https://luvmee.staging.dev/e/my-card');

  assert.throws(() => buildRecipientExperienceUrl(''), /Slug is required/);
  assert.throws(() => buildRecipientExperienceUrl('   '), /Slug is required/);
});

