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

export const ExperienceCreateSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().trim().min(1).max(100),
  recipientName: z.string().trim().min(1).max(50),
  creatorName: z.string().trim().min(1).max(50),
  config: ExperienceConfigSchema
});

export const ExperiencePublishSchema = z.object({
  experienceId: z.string().uuid(),
  config: ExperienceConfigSchema
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
