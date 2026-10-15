import assert from 'node:assert/strict';
import { EmailOtpRequestSchema, EmailOtpVerifySchema } from '../dist/index.js';

console.log('--- RUNNING AUTH EMAIL OTP TESTS ---');

// 1. Email OTP Request Schema Validations
{
  // Valid email passes
  const valid = EmailOtpRequestSchema.safeParse({ email: 'partner@example.com' });
  assert.equal(valid.success, true, 'Valid email should pass OTP request schema');
  assert.equal(valid.data.email, 'partner@example.com');

  // Trimming email whitespace
  const trimmed = EmailOtpRequestSchema.safeParse({ email: '   partner@example.com   ' });
  assert.equal(trimmed.success, true);
  assert.equal(trimmed.data.email, 'partner@example.com', 'Whitespace in email should be trimmed');

  // Invalid email formats fail
  const empty = EmailOtpRequestSchema.safeParse({ email: '' });
  assert.equal(empty.success, false, 'Empty email should fail');

  const invalidFormat = EmailOtpRequestSchema.safeParse({ email: 'not-an-email' });
  assert.equal(invalidFormat.success, false, 'Malformed email should fail');

  const missing = EmailOtpRequestSchema.safeParse({});
  assert.equal(missing.success, false, 'Missing email should fail');
}

// 2. Email OTP Verify Schema Validations
{
  // Valid email and 6-digit token passes
  const valid = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: '123456'
  });
  assert.equal(valid.success, true, 'Valid email and 6-digit token should pass');
  assert.equal(valid.data.token, '123456');

  // Token trimming
  const trimmedToken = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: ' 654321 '
  });
  assert.equal(trimmedToken.success, true);
  assert.equal(trimmedToken.data.token, '654321', 'Whitespace in token should be trimmed');

  // Invalid tokens fail
  const shortToken = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: '12345'
  });
  assert.equal(shortToken.success, false, '5-digit token must fail');

  const longToken = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: '1234567'
  });
  assert.equal(longToken.success, false, '7-digit token must fail');

  const alphaToken = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: '12a456'
  });
  assert.equal(alphaToken.success, false, 'Alphanumeric token must fail');

  const emptyToken = EmailOtpVerifySchema.safeParse({
    email: 'user@luvmee.app',
    token: ''
  });
  assert.equal(emptyToken.success, false, 'Empty token must fail');
}

console.log('✓ All 10 Auth Email OTP tests passed successfully');
