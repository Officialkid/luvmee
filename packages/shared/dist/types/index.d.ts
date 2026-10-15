export type ExperienceStatus = 'draft' | 'published' | 'archived';
export type TemplateCategory = 'love_letters' | 'playful_questions' | 'confessions' | 'anniversaries' | 'birthday_surprises' | 'appreciation';
export type SceneType = 'greeting' | 'suspense' | 'question' | 'evasive_choice' | 'letter' | 'celebration' | 'gift_box' | 'compliments';
export interface ThemeColors {
    primary: string;
    background: string;
    surface: string;
    textDark: string;
    textMuted: string;
    white: string;
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
export type SharingMode = 'public_link' | 'partner_exclusive';
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
    sharingMode: SharingMode;
    recipientId?: string | null;
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
    username?: string | null;
    displayName: string;
    avatarUrl?: string | null;
    partnerCode?: string | null;
    lastActiveAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export type PartnerConnectionState = 'not_connected' | 'outgoing_pending' | 'incoming_pending' | 'connected';
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
export type LoveNoteTag = 'Welcome ✨' | 'Sweet Kiss 💋' | 'Thinking of You 🌹' | 'Date Night ☕' | 'Surprise Reveal 🎁' | 'Deep Love 💌' | string;
export interface LoveNote {
    id: string;
    partnershipId: string;
    senderId: string;
    recipientId: string;
    content: string;
    tag?: string | null;
    readAt?: string | null;
    createdAt: string;
}
export interface SendLoveNotePayload {
    content: string;
    tag?: string;
}
export type NotificationCategory = 'partner_invitation' | 'invitation_accepted' | 'love_note' | 'partner_surprise';
export interface NotificationEvent {
    id: string;
    userId: string;
    category: NotificationCategory;
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    createdAt: string;
}
export interface NotificationPreferences {
    userId: string;
    partnerInvitations: boolean;
    loveNotes: boolean;
    surprises: boolean;
    updatedAt: string;
}
export interface RegisterPushTokenPayload {
    token: string;
    platform: 'ios' | 'android' | 'web';
}
export type RelationshipLabel = 'partner' | 'friend' | 'parent' | 'sibling' | 'child' | 'mentor' | 'colleague' | 'family' | 'other';
export interface Person {
    id: string;
    userId: string;
    displayName: string;
    relationshipLabel?: RelationshipLabel | string;
    notes?: string | null;
    avatarEmoji?: string | null;
    linkedAccountId?: string | null;
    createdAt: string;
    updatedAt: string;
}
export type OccasionCategory = 'birthday' | 'anniversary' | 'milestone' | 'celebration' | 'custom';
export type OccasionRecurrence = 'annual' | 'none';
export interface ImportantDate {
    id: string;
    userId: string;
    personId?: string | null;
    category: OccasionCategory;
    title: string;
    month: number;
    day: number;
    year?: number | null;
    recurrence: OccasionRecurrence;
    reminderEnabled: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePersonPayload {
    displayName: string;
    relationshipLabel?: string;
    notes?: string;
    avatarEmoji?: string;
    linkedAccountId?: string;
}
export interface CreateImportantDatePayload {
    personId?: string | null;
    category: OccasionCategory;
    title: string;
    month: number;
    day: number;
    year?: number | null;
    recurrence?: OccasionRecurrence;
    reminderEnabled?: boolean;
    notes?: string;
}
export type PlanStatus = 'planned' | 'completed';
export interface PersonalPlan {
    id: string;
    userId: string;
    personId?: string | null;
    occasionId?: string | null;
    title: string;
    plannedDate?: string | null;
    placeName?: string | null;
    activity?: string | null;
    giftIdea?: string | null;
    notes?: string | null;
    status: PlanStatus;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePersonalPlanPayload {
    personId?: string | null;
    occasionId?: string | null;
    title: string;
    plannedDate?: string | null;
    placeName?: string | null;
    activity?: string | null;
    giftIdea?: string | null;
    notes?: string | null;
    status?: PlanStatus;
}
export interface EmailOtpRequestPayload {
    email: string;
}
export interface EmailOtpVerifyPayload {
    email: string;
    token: string;
}
export interface EmailPasswordSignUpPayload {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
}
export interface EmailPasswordLoginPayload {
    email: string;
    password: string;
}
export interface PasswordResetRequestPayload {
    email: string;
}
export interface UpdatePasswordPayload {
    password: string;
    confirmPassword: string;
}
export interface UpdateUsernamePayload {
    username: string;
}
//# sourceMappingURL=index.d.ts.map