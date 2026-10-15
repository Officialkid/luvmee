import { z } from 'zod';

export const ThemeColorsSchema = z.object({
  primary: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  background: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  surface: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  textDark: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  textMuted: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  white: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color')
});

export const ThemeConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colors: ThemeColorsSchema,
  fontHeading: z.enum(['serif', 'sans']),
  fontBody: z.enum(['sans', 'serif']),
  backgroundEffect: z.enum(['floating_hearts', 'sparkles', 'gentle_bokeh', 'none'])
});

export const SceneInteractionSchema = z.object({
  type: z.enum(['next_button', 'evasive_no', 'open_gift', 'reveal_text', 'shuffle_compliment']),
  primaryButtonText: z.string().max(60).optional(),
  secondaryButtonText: z.string().max(60).optional(),
  evasiveMessages: z.array(z.string().max(100)).max(20).optional(),
  revealDelayMs: z.number().nonnegative().max(10000).optional()
});

export const SceneConfigSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'greeting',
    'suspense',
    'question',
    'evasive_choice',
    'letter',
    'celebration',
    'gift_box',
    'compliments'
  ]),
  title: z.string().min(1).max(150),
  subtitle: z.string().max(250).optional(),
  bodyText: z.string().max(2000).optional(),
  badge: z.string().max(50).optional(),
  icon: z.string().max(10).optional(),
  mediaUrl: z.string().url().max(1000).optional().or(z.literal('')),
  interaction: SceneInteractionSchema,
  order: z.number().int().nonnegative()
});

export const MusicConfigSchema = z.object({
  enabled: z.boolean(),
  trackId: z.string().optional(),
  trackTitle: z.string().max(100).optional(),
  trackUrl: z.string().url().max(1000).optional().or(z.literal(''))
});

export const ExperienceConfigSchema = z.object({
  creatorName: z.string().trim().min(1, 'Creator name is required').max(50),
  recipientName: z.string().trim().min(1, 'Recipient name is required').max(50),
  title: z.string().trim().min(1, 'Title is required').max(100),
  theme: ThemeConfigSchema,
  music: MusicConfigSchema,
  scenes: z.array(SceneConfigSchema).min(1, 'At least one scene is required').max(15),
  complimentsList: z.array(z.string().trim().min(1).max(250)).max(30).optional()
});

export const SharingModeSchema = z.enum(['public_link', 'partner_exclusive']);

export const ExperienceCreateSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().trim().min(1).max(100),
  recipientName: z.string().trim().min(1).max(50),
  creatorName: z.string().trim().min(1).max(50),
  config: ExperienceConfigSchema,
  sharingMode: SharingModeSchema.default('public_link'),
  recipientId: z.string().uuid().optional().nullable()
});

export const PartnerExclusiveSurpriseSchema = ExperienceCreateSchema.refine(
  (data) => {
    if (data.sharingMode === 'partner_exclusive') {
      return !!data.recipientId;
    }
    return true;
  },
  {
    message: 'A connected partner recipient is required for partner-exclusive surprises',
    path: ['recipientId']
  }
);

export const ExperiencePublishSchema = z.object({
  experienceId: z.string().uuid(),
  config: ExperienceConfigSchema,
  sharingMode: SharingModeSchema.optional(),
  recipientId: z.string().uuid().optional().nullable()
});

export const ProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

export const RecipientResponseSchema = z.object({
  experienceId: z.string().uuid(),
  responseType: z.enum(['yes', 'custom_note']),
  responseValue: z.string().trim().min(1).max(500)
});

export const PartnerCodeSchema = z
  .string()
  .trim()
  .regex(/^(LUV-)?[2-9a-zA-Z]{4}$/i, 'Invalid partner code format (expected 4 characters or LUV-XXXX)');

export const SendPartnerInvitationSchema = z.object({
  target: z.string().trim().min(3, 'Partner code or email must be at least 3 characters').max(100)
});

export const RespondPartnerInvitationSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID'),
  decision: z.enum(['accept', 'decline'])
});

// ==============================================================================
// PHASE 4B: LOVE NOTES SCHEMAS
// ==============================================================================

export const SendLoveNoteSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  tag: z.string().trim().max(50).optional()
});

export const LoveNotesQuerySchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  beforeTimestamp: z.string().datetime().optional()
});

// ==============================================================================
// PHASE 4C: NOTIFICATION SCHEMAS
// ==============================================================================

export const RegisterPushTokenSchema = z.object({
  token: z.string().trim().min(10, 'Push token must be valid'),
  platform: z.enum(['ios', 'android', 'web'])
});

export const NotificationPreferencesSchema = z.object({
  partnerInvitations: z.boolean().default(true),
  loveNotes: z.boolean().default(true),
  surprises: z.boolean().default(true)
});

// ==============================================================================
// PHASE B: PEOPLE DIRECTORY & IMPORTANT DATES SCHEMAS
// ==============================================================================

export const RelationshipLabelSchema = z.enum([
  'partner',
  'friend',
  'parent',
  'sibling',
  'child',
  'mentor',
  'colleague',
  'family',
  'other'
]);

export const CreatePersonSchema = z.object({
  displayName: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  relationshipLabel: z.string().trim().max(50).default('friend'),
  notes: z.string().trim().max(1000).optional(),
  avatarEmoji: z.string().trim().max(10).default('👤'),
  linkedAccountId: z.string().uuid().optional()
});

export const OccasionCategorySchema = z.enum([
  'birthday',
  'anniversary',
  'milestone',
  'celebration',
  'custom'
]);

export const OccasionRecurrenceSchema = z.enum(['annual', 'none']);

export const CreateImportantDateSchema = z.object({
  personId: z.string().uuid().nullable().optional(),
  category: OccasionCategorySchema.default('birthday'),
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  recurrence: OccasionRecurrenceSchema.default('annual'),
  reminderEnabled: z.boolean().default(true),
  notes: z.string().trim().max(500).optional()
}).refine((data) => {
  // Validate days per month
  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][data.month - 1];
  return data.day <= maxDays;
}, {
  message: 'Invalid day for selected month',
  path: ['day']
});

// ==============================================================================
// PHASE F: LIGHTWEIGHT PERSONAL PLANS SCHEMAS
// ==============================================================================

export const PlanStatusSchema = z.enum(['planned', 'completed']);

export const CreatePersonalPlanSchema = z.object({
  personId: z.string().uuid().nullable().optional(),
  occasionId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters'),
  plannedDate: z.string().trim().max(50).nullable().optional(),
  placeName: z.string().trim().max(150).nullable().optional(),
  activity: z.string().trim().max(200).nullable().optional(),
  giftIdea: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  status: PlanStatusSchema.default('planned')
});

// ==============================================================================
// AUTH, IDENTITY & ACCOUNT SCHEMAS
// ==============================================================================

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const EmailOtpRequestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255)
});

export const EmailOtpVerifySchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  token: z.string().trim().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits')
});

export const EmailPasswordSignUpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters').max(100),
  username: UsernameSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const EmailPasswordLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z.string().min(1, 'Password is required')
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255)
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'New password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters').max(100)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const UpdateUsernameSchema = z.object({
  username: UsernameSchema
});

