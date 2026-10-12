export type ExperienceStatus = 'draft' | 'published' | 'archived';

export type TemplateCategory =
  | 'love_letters'
  | 'playful_questions'
  | 'confessions'
  | 'anniversaries'
  | 'birthday_surprises'
  | 'appreciation';

export type SceneType =
  | 'greeting'
  | 'suspense'
  | 'question'
  | 'evasive_choice'
  | 'letter'
  | 'celebration'
  | 'gift_box'
  | 'compliments';

export interface ThemeColors {
  primary: string;       // e.g. Rose #E85D75
  background: string;    // e.g. Blush #FCE7ED
  surface: string;       // e.g. Ivory #FFF9F2
  textDark: string;      // e.g. Burgundy #542638
  textMuted: string;     // e.g. Soft Rose #8E6072
  white: string;         // #FFFFFF
}

export type BackgroundAnimation = 'floating_hearts' | 'sparkles' | 'gentle_bokeh' | 'none';

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fontHeading: 'serif' | 'sans';
  fontBody: 'sans' | 'serif';
  backgroundEffect: BackgroundAnimation;
}

export interface SceneInteraction {
  type: 'next_button' | 'evasive_no' | 'open_gift' | 'reveal_text' | 'shuffle_compliment';
  primaryButtonText?: string;
  secondaryButtonText?: string;
  evasiveMessages?: string[];
  revealDelayMs?: number;
}

export interface SceneConfig {
  id: string;
  type: SceneType;
  title: string;
  subtitle?: string;
  bodyText?: string;
  badge?: string;
  icon?: string;
  mediaUrl?: string;
  interaction: SceneInteraction;
  order: number;
}

export interface MusicConfig {
  enabled: boolean;
  trackId?: string;
  trackTitle?: string;
  trackUrl?: string;
}

export interface ExperienceConfig {
  creatorName: string;
  recipientName: string;
  title: string;
  theme: ThemeConfig;
  music: MusicConfig;
  scenes: SceneConfig[];
  complimentsList?: string[];
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  occasion: string;
  previewColor: string;
  previewEmoji: string;
  defaultConfig: ExperienceConfig;
  isActive: boolean;
}

export interface Experience {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  creatorName: string;
  recipientName: string;
  slug: string;
  config: ExperienceConfig;
  status: ExperienceStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientResponse {
  id: string;
  experienceId: string;
  responseType: 'yes' | 'custom_note';
  responseValue: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  partnerCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnerConnectionState =
  | 'not_connected'
  | 'outgoing_pending'
  | 'incoming_pending'
  | 'connected';

export interface PartnerSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
  partnerCode?: string;
}

export interface PartnerState {
  state: PartnerConnectionState;
  partnershipId?: string;
  partnerId?: string;
  partnerName?: string;
  partnerAvatar?: string;
  partnerCode?: string;
  connectedAt?: string;
  daysInLove?: number;
  invitationId?: string;
  createdAt?: string;
  myPartnerCode?: string | null;
}

export interface PartnerInvitation {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
