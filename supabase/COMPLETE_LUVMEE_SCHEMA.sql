-- ==============================================================================
-- LUVMEE V1.0 — BULLETPROOF CONSOLIDATED DATABASE SCHEMA & RPC SUITE
-- Safe to run repeatedly in Supabase SQL Editor.
-- Zero REVOKE errors (guaranteed to execute cleanly without ERROR 42883).
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    partner_code TEXT,
    username TEXT,
    last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
    ON public.profiles (LOWER(TRIM(username))) 
    WHERE username IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_partner_code'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT unique_partner_code UNIQUE (partner_code);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 2. TEMPLATES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    occasion TEXT,
    preview_color TEXT DEFAULT '#E85D75',
    preview_emoji TEXT DEFAULT '💌',
    default_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.templates (id, name, category, description, occasion, preview_color, preview_emoji, default_config, is_active)
VALUES 
(
    'playful-yes-no',
    'The Playful Yes-or-No',
    'Interactive Romance',
    'A lighthearted card with a running No button that makes saying yes unavoidable.',
    'Valentine, Date Proposal, Just Because',
    '#E85D75',
    '💖',
    '{"scenes": [{"type": "greeting", "badge": "Special Surprise", "title": "A Question for Cynthia...", "subtitle": "From John with all his heart", "interaction": {"type": "button_advance", "primaryButtonText": "Open Card ✨"}}, {"type": "letter", "badge": "From the Heart", "title": "Will you be my Valentine?", "bodyText": "Every moment with you feels like home. Let us create a thousand more beautiful memories together.", "interaction": {"type": "evasive_no", "primaryButtonText": "YES OF COURSE ❤️"}}]}'::jsonb,
    TRUE
),
(
    'digital-love-letter',
    'The Digital Love Letter',
    'Stationery & Romance',
    'An elegant, heartfelt stationery letter delivered with soft music and warm memories.',
    'Anniversary, Just Because, Romance',
    '#542838',
    '💌',
    '{"scenes": [{"type": "greeting", "badge": "Love Letter", "title": "To My Dearest Cynthia...", "subtitle": "A letter crafted just for you", "interaction": {"type": "button_advance", "primaryButtonText": "Read Letter 💌"}}, {"type": "letter", "badge": "Written With Love", "title": "Always You", "bodyText": "From the first day we met, my world became softer, brighter, and full of joy. You are my favorite thought every single day.", "interaction": {"type": "button_advance", "primaryButtonText": "Open Cynthia''s Gift 🎁"}}, {"type": "gift_box", "badge": "Keepsake", "title": "A Little Something For You", "subtitle": "Tap the parcel to reveal", "interaction": {"type": "gift_reveal"}}]}'::jsonb,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. PEOPLE DIRECTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0 AND length(display_name) <= 100),
    relationship_label TEXT DEFAULT 'friend' NOT NULL CHECK (length(relationship_label) <= 50),
    notes TEXT CHECK (notes IS NULL OR length(notes) <= 1000),
    avatar_emoji TEXT DEFAULT '👤' NOT NULL CHECK (length(avatar_emoji) <= 10),
    linked_account_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_people_user_id ON public.people(user_id);

-- ==============================================================================
-- 4. IMPORTANT DATES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.important_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    person_id UUID REFERENCES public.people(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'birthday' NOT NULL CHECK (category IN ('birthday', 'anniversary', 'milestone', 'celebration', 'custom')),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 100),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    day INT NOT NULL CHECK (day >= 1 AND day <= 31),
    year INT CHECK (year IS NULL OR (year >= 1900 AND year <= 2100)),
    recurrence TEXT DEFAULT 'annual' NOT NULL CHECK (recurrence IN ('annual', 'none')),
    reminder_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    notes TEXT CHECK (notes IS NULL OR length(notes) <= 500),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON public.important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_person_id ON public.important_dates(person_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_calendar ON public.important_dates(user_id, month, day);

-- ==============================================================================
-- 5. SCHEDULED REMINDERS QUEUE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date_id UUID REFERENCES public.important_dates(id) ON DELETE CASCADE NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('before_24h', 'same_day')),
    scheduled_for DATE NOT NULL,
    dispatched BOOLEAN DEFAULT FALSE NOT NULL,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_reminder_per_occasion UNIQUE (date_id, reminder_type, scheduled_for)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_due ON public.scheduled_reminders(scheduled_for, dispatched);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_user ON public.scheduled_reminders(user_id);

-- ==============================================================================
-- 6. PERSONAL PLANS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.personal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
    occasion_id UUID REFERENCES public.important_dates(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 120),
    planned_date TEXT CHECK (planned_date IS NULL OR length(planned_date) <= 50),
    place_name TEXT CHECK (place_name IS NULL OR length(place_name) <= 150),
    activity TEXT CHECK (activity IS NULL OR length(activity) <= 200),
    gift_idea TEXT CHECK (gift_idea IS NULL OR length(gift_idea) <= 200),
    notes TEXT CHECK (notes IS NULL OR length(notes) <= 1000),
    status TEXT DEFAULT 'planned' NOT NULL CHECK (status IN ('planned', 'completed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_personal_plans_user_id ON public.personal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_plans_person_id ON public.personal_plans(person_id);
CREATE INDEX IF NOT EXISTS idx_personal_plans_occasion_id ON public.personal_plans(occasion_id);

-- ==============================================================================
-- 7. EXPERIENCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id TEXT REFERENCES public.templates(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    config JSONB NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
    sharing_mode TEXT NOT NULL DEFAULT 'public_link' CHECK (sharing_mode IN ('public_link', 'partner_exclusive')),
    recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS sharing_mode TEXT NOT NULL DEFAULT 'public_link';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_experiences_slug ON public.experiences(slug);
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON public.experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_sharing_mode ON public.experiences(sharing_mode);
CREATE INDEX IF NOT EXISTS idx_experiences_recipient_id ON public.experiences(recipient_id);

-- ==============================================================================
-- 8. RECIPIENT RESPONSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recipient_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
    response_type TEXT CHECK (response_type IN ('yes', 'custom_note')) NOT NULL,
    response_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_experience_id ON public.recipient_responses(experience_id);

-- ==============================================================================
-- 9. PARTNERSHIPS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected')) DEFAULT 'connected',
    connected_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    disconnected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT canonical_partnership_ordering CHECK (user_a < user_b)
);

CREATE INDEX IF NOT EXISTS idx_partnerships_user_a ON public.partnerships(user_a);
CREATE INDEX IF NOT EXISTS idx_partnerships_user_b ON public.partnerships(user_b);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);

-- ==============================================================================
-- 10. PARTNER INVITATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.partner_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_partner_invitation CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_sender ON public.partner_invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_recipient ON public.partner_invitations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.partner_invitations(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_invitation 
    ON public.partner_invitations (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)) 
    WHERE status = 'pending';

-- ==============================================================================
-- 11. USER ACTIVE PARTNERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_active_partners (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_active_partner CHECK (user_id != partner_id)
);

CREATE INDEX IF NOT EXISTS idx_user_active_partners_partner ON public.user_active_partners(partner_id);

-- ==============================================================================
-- 12. LOVE NOTES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.love_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
    tag TEXT CHECK (tag IS NULL OR length(tag) <= 50),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_love_notes CHECK (sender_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_love_notes_partnership ON public.love_notes(partnership_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_love_notes_recipient_unread ON public.love_notes(recipient_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_love_notes_sender ON public.love_notes(sender_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'love_notes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.love_notes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 13. USER PUSH TOKENS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expo_push_token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_push_token'
    ) THEN
        ALTER TABLE public.user_push_tokens ADD CONSTRAINT unique_user_push_token UNIQUE (user_id, expo_push_token);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.user_push_tokens(user_id);

-- ==============================================================================
-- 14. NOTIFICATION EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('partner_invitation', 'invitation_accepted', 'love_note', 'partner_surprise')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notification_events(user_id, read, created_at DESC);

-- ==============================================================================
-- 15. NOTIFICATION PREFERENCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_invitations BOOLEAN DEFAULT TRUE NOT NULL,
    love_notes BOOLEAN DEFAULT TRUE NOT NULL,
    surprises BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their active partner's profile" ON public.profiles;
CREATE POLICY "Users can view their active partner's profile" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = auth.uid() AND partner_id = profiles.id)
);

DROP POLICY IF EXISTS "Users can view counterpart profiles for pending invitations" ON public.profiles;
CREATE POLICY "Users can view counterpart profiles for pending invitations" ON public.profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.partner_invitations
        WHERE status = 'pending' AND (
            (sender_id = auth.uid() AND recipient_id = profiles.id) OR
            (recipient_id = auth.uid() AND sender_id = profiles.id)
        )
    )
);

-- Templates RLS
DROP POLICY IF EXISTS "Templates are publicly viewable by everyone" ON public.templates;
CREATE POLICY "Templates are publicly viewable by everyone" ON public.templates FOR SELECT USING (is_active = TRUE);

-- People RLS
DROP POLICY IF EXISTS "Users can manage their own people directory" ON public.people;
CREATE POLICY "Users can manage their own people directory" ON public.people FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Important Dates RLS
DROP POLICY IF EXISTS "Users can manage their own important dates" ON public.important_dates;
CREATE POLICY "Users can manage their own important dates" ON public.important_dates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Scheduled Reminders RLS
DROP POLICY IF EXISTS "Users can view their scheduled reminders" ON public.scheduled_reminders;
CREATE POLICY "Users can view their scheduled reminders" ON public.scheduled_reminders FOR SELECT USING (auth.uid() = user_id);

-- Personal Plans RLS
DROP POLICY IF EXISTS "Users can manage their personal plans" ON public.personal_plans;
CREATE POLICY "Users can manage their personal plans" ON public.personal_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Experiences RLS
DROP POLICY IF EXISTS "Creators can view their own experiences" ON public.experiences;
CREATE POLICY "Creators can view their own experiences" ON public.experiences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recipients can view published experiences" ON public.experiences;
CREATE POLICY "Recipients can view published experiences" ON public.experiences FOR SELECT USING (
    status = 'published' AND (sharing_mode = 'public_link' OR auth.uid() = recipient_id OR auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Creators can create experiences" ON public.experiences;
CREATE POLICY "Creators can create experiences" ON public.experiences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can update their own experiences" ON public.experiences;
CREATE POLICY "Creators can update their own experiences" ON public.experiences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can delete their own experiences" ON public.experiences;
CREATE POLICY "Creators can delete their own experiences" ON public.experiences FOR DELETE USING (auth.uid() = user_id);

-- Recipient Responses RLS
DROP POLICY IF EXISTS "Recipients can submit responses to published experiences" ON public.recipient_responses;
CREATE POLICY "Recipients can submit responses to published experiences" ON public.recipient_responses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.experiences WHERE experiences.id = recipient_responses.experience_id AND experiences.status = 'published')
);

DROP POLICY IF EXISTS "Creators can view responses to their experiences" ON public.recipient_responses;
CREATE POLICY "Creators can view responses to their experiences" ON public.recipient_responses FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.experiences WHERE experiences.id = recipient_responses.experience_id AND experiences.user_id = auth.uid())
);

-- Partner Invitations RLS
DROP POLICY IF EXISTS "Users can view their own sent or received invitations" ON public.partner_invitations;
CREATE POLICY "Users can view their own sent or received invitations" ON public.partner_invitations FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Partnerships RLS
DROP POLICY IF EXISTS "Users can view their own partnerships" ON public.partnerships;
CREATE POLICY "Users can view their own partnerships" ON public.partnerships FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- User Active Partners RLS
DROP POLICY IF EXISTS "Users can view active partner pairings involving them" ON public.user_active_partners;
CREATE POLICY "Users can view active partner pairings involving them" ON public.user_active_partners FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Love Notes RLS
DROP POLICY IF EXISTS "Partners can view their conversation love notes" ON public.love_notes;
CREATE POLICY "Partners can view their conversation love notes" ON public.love_notes FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Partners can send love notes to their partner" ON public.love_notes;
CREATE POLICY "Partners can send love notes to their partner" ON public.love_notes FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
        SELECT 1 FROM public.user_active_partners WHERE user_id = auth.uid() AND partner_id = recipient_id AND partnership_id = love_notes.partnership_id
    )
);

-- Push Tokens RLS
DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage their own push tokens" ON public.user_push_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notification Events RLS
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notification_events;
CREATE POLICY "Users can view their notifications" ON public.notification_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notification_events;
CREATE POLICY "Users can update their notifications" ON public.notification_events FOR UPDATE USING (auth.uid() = user_id);

-- Notification Preferences RLS
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Table Permissions Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.templates TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.important_dates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT ON public.recipient_responses TO authenticated, anon;
GRANT SELECT ON public.partnerships TO authenticated;
GRANT SELECT ON public.partner_invitations TO authenticated;
GRANT SELECT ON public.user_active_partners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.love_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_push_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN DEFAULT FALSE;
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    idx INTEGER;
BEGIN
    WHILE NOT done LOOP
        new_code := 'LUV-';
        FOR i IN 1..4 LOOP
            idx := floor(random() * length(chars) + 1)::INTEGER;
            new_code := new_code || substr(chars, idx, 1);
        END LOOP;
        
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE partner_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.validate_username(raw_username TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_username TEXT;
BEGIN
    clean_username := LOWER(TRIM(raw_username));
    IF clean_username IS NULL OR length(clean_username) < 3 OR length(clean_username) > 30 THEN
        RETURN NULL;
    END IF;
    IF clean_username !~ '^[a-z0-9_]+$' THEN
        RETURN NULL;
    END IF;
    RETURN clean_username;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned_base TEXT;
    candidate TEXT;
    done BOOLEAN DEFAULT FALSE;
    attempts INT := 0;
    rand_suffix INT;
BEGIN
    cleaned_base := LOWER(TRIM(base_name));
    cleaned_base := regexp_replace(cleaned_base, '[^a-z0-9_]', '_', 'g');
    cleaned_base := regexp_replace(cleaned_base, '_+', '_', 'g');
    cleaned_base := regexp_replace(cleaned_base, '^_+|_+$', '', 'g');

    IF cleaned_base IS NULL OR length(cleaned_base) < 3 THEN
        cleaned_base := 'user';
    END IF;

    IF length(cleaned_base) > 20 THEN
        cleaned_base := substr(cleaned_base, 1, 20);
    END IF;

    WHILE NOT done AND attempts < 50 LOOP
        rand_suffix := floor(random() * 9000 + 1000)::INT;
        candidate := cleaned_base || '_' || rand_suffix::TEXT;

        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE LOWER(TRIM(username)) = candidate
        ) THEN
            done := TRUE;
        END IF;
        attempts := attempts + 1;
    END LOOP;

    IF NOT done THEN
        candidate := 'user_' || substr(md5(random()::text), 1, 8);
    END IF;

    RETURN candidate;
END;
$$ LANGUAGE plpgsql SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    desired_username TEXT;
    assigned_username TEXT;
    user_display_name TEXT;
    new_code TEXT;
BEGIN
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Luvmee User'
    );

    desired_username := public.validate_username(NEW.raw_user_meta_data->>'username');

    IF desired_username IS NULL OR EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(TRIM(username)) = desired_username
    ) THEN
        assigned_username := public.generate_unique_username(user_display_name);
    ELSE
        assigned_username := desired_username;
    END IF;

    new_code := public.generate_partner_code();

    INSERT INTO public.profiles (id, display_name, avatar_url, partner_code, username, last_active_at)
    VALUES (
        NEW.id,
        user_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        new_code,
        assigned_username,
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        display_name = EXCLUDED.display_name,
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        last_active_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for important date reminders scheduling
CREATE OR REPLACE FUNCTION public.handle_date_reminder_scheduling()
RETURNS TRIGGER AS $$
DECLARE
    target_year INT;
    date_this_year DATE;
    today_date DATE := CURRENT_DATE;
BEGIN
    IF (NEW.reminder_enabled = TRUE) THEN
        target_year := EXTRACT(YEAR FROM today_date)::INT;
        
        IF NEW.month = 2 AND NEW.day = 29 THEN
            IF NOT ((target_year % 4 = 0 AND target_year % 100 != 0) OR target_year % 400 = 0) THEN
                date_this_year := make_date(target_year, 2, 28);
            ELSE
                date_this_year := make_date(target_year, 2, 29);
            END IF;
        ELSE
            date_this_year := make_date(target_year, NEW.month, NEW.day);
        END IF;

        IF date_this_year < today_date THEN
            target_year := target_year + 1;
            IF NEW.month = 2 AND NEW.day = 29 THEN
                IF NOT ((target_year % 4 = 0 AND target_year % 100 != 0) OR target_year % 400 = 0) THEN
                    date_this_year := make_date(target_year, 2, 28);
                ELSE
                    date_this_year := make_date(target_year, 2, 29);
                END IF;
            ELSE
                date_this_year := make_date(target_year, NEW.month, NEW.day);
            END IF;
        END IF;

        IF (date_this_year - INTERVAL '1 day')::DATE >= today_date THEN
            INSERT INTO public.scheduled_reminders (user_id, date_id, reminder_type, scheduled_for)
            VALUES (NEW.user_id, NEW.id, 'before_24h', (date_this_year - INTERVAL '1 day')::DATE)
            ON CONFLICT (date_id, reminder_type, scheduled_for) DO NOTHING;
        END IF;

        INSERT INTO public.scheduled_reminders (user_id, date_id, reminder_type, scheduled_for)
        VALUES (NEW.user_id, NEW.id, 'same_day', date_this_year)
        ON CONFLICT (date_id, reminder_type, scheduled_for) DO NOTHING;
    ELSE
        DELETE FROM public.scheduled_reminders
        WHERE date_id = NEW.id AND dispatched = FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_important_date_schedule_reminders ON public.important_dates;
CREATE TRIGGER on_important_date_schedule_reminders
    AFTER INSERT OR UPDATE ON public.important_dates
    FOR EACH ROW EXECUTE FUNCTION public.handle_date_reminder_scheduling();

-- Partner Invitation Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_partner_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') THEN
        SELECT display_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
        INSERT INTO public.notification_events (user_id, category, title, body, data)
        VALUES (
            NEW.recipient_id,
            'partner_invitation',
            'Partner Invitation 💌',
            COALESCE(sender_name, 'Someone') || ' invited you to connect on LUVMEE!',
            jsonb_build_object('invitationId', NEW.id, 'route', '/(tabs)/profile')
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted') THEN
        SELECT display_name INTO sender_name FROM public.profiles WHERE id = NEW.recipient_id;
        INSERT INTO public.notification_events (user_id, category, title, body, data)
        VALUES (
            NEW.sender_id,
            'invitation_accepted',
            'Connection Accepted 💕',
            COALESCE(sender_name, 'Your partner') || ' accepted your partner connection!',
            jsonb_build_object('invitationId', NEW.id, 'route', '/(tabs)/profile')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_partner_invitation_notify ON public.partner_invitations;
CREATE TRIGGER on_partner_invitation_notify
    AFTER INSERT OR UPDATE ON public.partner_invitations
    FOR EACH ROW EXECUTE FUNCTION public.handle_partner_invitation_notification();

-- Partner Surprise Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_partner_surprise_notification()
RETURNS TRIGGER AS $$
DECLARE
    creator_name TEXT;
    pref_enabled BOOLEAN := TRUE;
BEGIN
    IF (NEW.status = 'published' AND NEW.sharing_mode = 'partner_exclusive' AND NEW.recipient_id IS NOT NULL) THEN
        IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.status != 'published' OR OLD.sharing_mode != 'partner_exclusive'))) THEN
            SELECT surprises INTO pref_enabled
            FROM public.notification_preferences
            WHERE user_id = NEW.recipient_id;

            IF pref_enabled IS NULL OR pref_enabled = TRUE THEN
                SELECT display_name INTO creator_name FROM public.profiles WHERE id = NEW.user_id;
                INSERT INTO public.notification_events (user_id, category, title, body, data)
                VALUES (
                    NEW.recipient_id,
                    'partner_surprise',
                    'Special Surprise For You 🎁',
                    COALESCE(creator_name, 'Your partner') || ' crafted a private romantic surprise for you.',
                    jsonb_build_object(
                        'experienceId', NEW.id,
                        'slug', NEW.slug,
                        'route', '/preview/' || NEW.id
                    )
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DROP TRIGGER IF EXISTS on_partner_surprise_notify ON public.experiences;
CREATE TRIGGER on_partner_surprise_notify
    AFTER INSERT OR UPDATE ON public.experiences
    FOR EACH ROW EXECUTE FUNCTION public.handle_partner_surprise_notification();

-- ==============================================================================
-- APPLICATION RPC FUNCTIONS
-- ==============================================================================

-- 1. Check Username Availability
CREATE OR REPLACE FUNCTION public.check_username_available(target_username TEXT)
RETURNS JSONB AS $$
DECLARE
    clean_username TEXT;
    is_taken BOOLEAN;
BEGIN
    clean_username := public.validate_username(target_username);
    IF clean_username IS NULL THEN
        RETURN jsonb_build_object(
            'available', false,
            'error', 'Username must be 3-30 characters and contain only letters, numbers, and underscores.'
        );
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE LOWER(TRIM(username)) = clean_username
          AND (auth.uid() IS NULL OR id != auth.uid())
    ) INTO is_taken;

    RETURN jsonb_build_object(
        'available', NOT is_taken,
        'normalized', clean_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 2. Update Username
CREATE OR REPLACE FUNCTION public.update_my_username(new_username TEXT)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    clean_username TEXT;
    is_taken BOOLEAN;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    clean_username := public.validate_username(new_username);
    IF clean_username IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Username must be 3-30 characters and contain only letters, numbers, and underscores.');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE LOWER(TRIM(username)) = clean_username AND id != caller_id
    ) INTO is_taken;

    IF is_taken THEN
        RETURN jsonb_build_object('success', false, 'error', 'This username is already taken. Please choose another.');
    END IF;

    UPDATE public.profiles
    SET username = clean_username,
        updated_at = timezone('utc'::text, now())
    WHERE id = caller_id;

    RETURN jsonb_build_object('success', true, 'username', clean_username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 3. Record Authenticated Activity
CREATE OR REPLACE FUNCTION public.record_authenticated_activity()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
    END IF;

    UPDATE public.profiles
    SET last_active_at = timezone('utc'::text, now())
    WHERE id = caller_id
      AND last_active_at < (timezone('utc'::text, now()) - INTERVAL '1 hour');

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 4. Delete Account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    active_partnership RECORD;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    SELECT * INTO active_partnership
    FROM public.user_active_partners
    WHERE user_id = caller_id
    FOR UPDATE;

    IF FOUND THEN
        DELETE FROM public.user_active_partners
        WHERE partnership_id = active_partnership.partnership_id;

        UPDATE public.partnerships
        SET status = 'disconnected',
            disconnected_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = active_partnership.partnership_id;
    END IF;

    UPDATE public.partner_invitations
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE (sender_id = caller_id OR recipient_id = caller_id) AND status = 'pending';

    DELETE FROM public.user_push_tokens WHERE user_id = caller_id;
    DELETE FROM public.notification_events WHERE user_id = caller_id;
    DELETE FROM public.notification_preferences WHERE user_id = caller_id;
    DELETE FROM public.personal_plans WHERE user_id = caller_id;
    DELETE FROM public.scheduled_reminders WHERE user_id = caller_id;
    DELETE FROM public.important_dates WHERE user_id = caller_id;
    DELETE FROM public.people WHERE user_id = caller_id;
    DELETE FROM public.love_notes WHERE sender_id = caller_id;
    DELETE FROM public.experiences WHERE user_id = caller_id;
    DELETE FROM public.profiles WHERE id = caller_id;

    RETURN jsonb_build_object('success', true, 'message', 'User account and personal data have been completely removed.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5. Partner Connection State
CREATE OR REPLACE FUNCTION public.get_partner_state()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    my_code TEXT;
    active_row RECORD;
    partner_prof RECORD;
    inv_row RECORD;
    cpart_prof RECORD;
    days_count INTEGER;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('state', 'not_connected', 'myPartnerCode', null);
    END IF;

    SELECT partner_code INTO my_code FROM public.profiles WHERE id = caller_id;
    IF my_code IS NULL THEN
        my_code := public.generate_partner_code();
        UPDATE public.profiles SET partner_code = my_code WHERE id = caller_id;
    END IF;

    SELECT uap.*, p.status as partnership_status, p.connected_at as rel_connected_at
    INTO active_row
    FROM public.user_active_partners uap
    JOIN public.partnerships p ON p.id = uap.partnership_id
    WHERE uap.user_id = caller_id;

    IF FOUND THEN
        SELECT id, display_name, avatar_url, partner_code
        INTO partner_prof
        FROM public.profiles
        WHERE id = active_row.partner_id;

        days_count := GREATEST(0, floor(EXTRACT(EPOCH FROM (now() - active_row.rel_connected_at)) / 86400)::INTEGER);

        RETURN jsonb_build_object(
            'state', 'connected',
            'partnershipId', active_row.partnership_id,
            'partnerId', active_row.partner_id,
            'partnerName', COALESCE(partner_prof.display_name, 'Partner'),
            'partnerAvatar', partner_prof.avatar_url,
            'partnerCode', partner_prof.partner_code,
            'connectedAt', active_row.rel_connected_at,
            'daysInLove', days_count,
            'myPartnerCode', my_code
        );
    END IF;

    SELECT * INTO inv_row
    FROM public.partner_invitations
    WHERE recipient_id = caller_id AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        SELECT id, display_name, avatar_url, partner_code
        INTO cpart_prof
        FROM public.profiles
        WHERE id = inv_row.sender_id;

        RETURN jsonb_build_object(
            'state', 'incoming_pending',
            'invitationId', inv_row.id,
            'partnerId', inv_row.sender_id,
            'partnerName', COALESCE(cpart_prof.display_name, 'Partner'),
            'partnerAvatar', cpart_prof.avatar_url,
            'partnerCode', cpart_prof.partner_code,
            'createdAt', inv_row.created_at,
            'myPartnerCode', my_code
        );
    END IF;

    SELECT * INTO inv_row
    FROM public.partner_invitations
    WHERE sender_id = caller_id AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        SELECT id, display_name, avatar_url, partner_code
        INTO cpart_prof
        FROM public.profiles
        WHERE id = inv_row.recipient_id;

        RETURN jsonb_build_object(
            'state', 'outgoing_pending',
            'invitationId', inv_row.id,
            'partnerId', inv_row.recipient_id,
            'partnerName', COALESCE(cpart_prof.display_name, 'Partner'),
            'partnerAvatar', cpart_prof.avatar_url,
            'partnerCode', cpart_prof.partner_code,
            'createdAt', inv_row.created_at,
            'myPartnerCode', my_code
        );
    END IF;

    RETURN jsonb_build_object('state', 'not_connected', 'myPartnerCode', my_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 6. Send Partner Invitation
CREATE OR REPLACE FUNCTION public.send_partner_invitation(target_input TEXT)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    clean_target TEXT := trim(target_input);
    target_user_id UUID;
    target_prof RECORD;
    new_inv_id UUID;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    IF clean_target IS NULL OR length(clean_target) < 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please provide a valid partner code or email.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = caller_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active partner. Please disconnect first.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.partner_invitations WHERE sender_id = caller_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an outgoing invitation pending. Please cancel it before sending a new one.');
    END IF;

    SELECT id, display_name INTO target_prof
    FROM public.profiles
    WHERE UPPER(partner_code) = UPPER(clean_target)
       OR UPPER(partner_code) = 'LUV-' || UPPER(clean_target);

    IF target_prof.id IS NOT NULL THEN
        target_user_id := target_prof.id;
    ELSIF clean_target LIKE '%@%' THEN
        SELECT id INTO target_user_id
        FROM auth.users
        WHERE lower(email) = lower(clean_target)
        LIMIT 1;

        IF target_user_id IS NOT NULL THEN
            SELECT id, display_name INTO target_prof
            FROM public.profiles
            WHERE id = target_user_id;
        END IF;
    END IF;

    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No partner found with this code or email. Please check and try again.');
    END IF;

    IF target_user_id = caller_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You cannot connect with yourself.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = target_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This user already has an active partner.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.partner_invitations WHERE sender_id = target_user_id AND recipient_id = caller_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'This user has already sent you a partner invitation. Please accept their invitation.');
    END IF;

    INSERT INTO public.partner_invitations (sender_id, recipient_id, status)
    VALUES (caller_id, target_user_id, 'pending')
    RETURNING id INTO new_inv_id;

    RETURN jsonb_build_object(
        'success', true,
        'invitationId', new_inv_id,
        'partnerName', COALESCE(target_prof.display_name, 'Partner')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 7. Respond to Partner Invitation
CREATE OR REPLACE FUNCTION public.respond_to_partner_invitation(invitation_id UUID, decision TEXT)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    inv RECORD;
    u_a UUID;
    u_b UUID;
    new_partnership_id UUID;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    IF decision NOT IN ('accept', 'decline') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid decision. Must be "accept" or "decline".');
    END IF;

    SELECT * INTO inv
    FROM public.partner_invitations
    WHERE id = invitation_id AND recipient_id = caller_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found or no longer pending.');
    END IF;

    IF decision = 'decline' THEN
        UPDATE public.partner_invitations
        SET status = 'declined', updated_at = timezone('utc'::text, now())
        WHERE id = invitation_id;

        RETURN jsonb_build_object('success', true, 'status', 'declined');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = caller_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active partner.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = inv.sender_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'The sender is already connected with another partner.');
    END IF;

    UPDATE public.partner_invitations
    SET status = 'accepted', updated_at = timezone('utc'::text, now())
    WHERE id = invitation_id;

    UPDATE public.partner_invitations
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE status = 'pending'
      AND id != invitation_id
      AND (sender_id IN (caller_id, inv.sender_id) OR recipient_id IN (caller_id, inv.sender_id));

    IF caller_id < inv.sender_id THEN
        u_a := caller_id;
        u_b := inv.sender_id;
    ELSE
        u_a := inv.sender_id;
        u_b := caller_id;
    END IF;

    INSERT INTO public.partnerships (user_a, user_b, status, connected_at)
    VALUES (u_a, u_b, 'connected', timezone('utc'::text, now()))
    RETURNING id INTO new_partnership_id;

    INSERT INTO public.user_active_partners (user_id, partner_id, partnership_id, connected_at)
    VALUES 
        (caller_id, inv.sender_id, new_partnership_id, timezone('utc'::text, now())),
        (inv.sender_id, caller_id, new_partnership_id, timezone('utc'::text, now()));

    RETURN jsonb_build_object('success', true, 'status', 'connected', 'partnershipId', new_partnership_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 8. Cancel Partner Invitation
CREATE OR REPLACE FUNCTION public.cancel_partner_invitation(invitation_id UUID)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    UPDATE public.partner_invitations
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE id = invitation_id AND sender_id = caller_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found or cannot be cancelled.');
    END IF;

    RETURN jsonb_build_object('success', true, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9. Disconnect Partner
CREATE OR REPLACE FUNCTION public.disconnect_partner()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    active_row RECORD;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    SELECT * INTO active_row
    FROM public.user_active_partners
    WHERE user_id = caller_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active partner connection found.');
    END IF;

    DELETE FROM public.user_active_partners
    WHERE partnership_id = active_row.partnership_id;

    UPDATE public.partnerships
    SET status = 'disconnected',
        disconnected_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = active_row.partnership_id;

    RETURN jsonb_build_object('success', true, 'status', 'disconnected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 10. Send Love Note
CREATE OR REPLACE FUNCTION public.send_love_note(p_content TEXT, p_tag TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    clean_content TEXT := trim(p_content);
    clean_tag TEXT := trim(p_tag);
    active_row RECORD;
    new_note_id UUID;
    pref_enabled BOOLEAN := TRUE;
    caller_name TEXT;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    IF clean_content IS NULL OR length(clean_content) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Message cannot be empty.');
    END IF;

    IF length(clean_content) > 2000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Message cannot exceed 2000 characters.');
    END IF;

    SELECT * INTO active_row
    FROM public.user_active_partners
    WHERE user_id = caller_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must have an active connected partner to send love notes.');
    END IF;

    INSERT INTO public.love_notes (partnership_id, sender_id, recipient_id, content, tag)
    VALUES (active_row.partnership_id, caller_id, active_row.partner_id, clean_content, clean_tag)
    RETURNING id INTO new_note_id;

    SELECT love_notes INTO pref_enabled
    FROM public.notification_preferences
    WHERE user_id = active_row.partner_id;

    IF pref_enabled IS NULL OR pref_enabled = TRUE THEN
        SELECT display_name INTO caller_name
        FROM public.profiles
        WHERE id = caller_id;

        INSERT INTO public.notification_events (user_id, category, title, body, data)
        VALUES (
            active_row.partner_id,
            'love_note',
            'New Love Note 💌',
            COALESCE(caller_name, 'Your partner') || ' sent you a private love note.',
            jsonb_build_object(
                'partnershipId', active_row.partnership_id,
                'noteId', new_note_id,
                'route', '/(tabs)/messages'
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'noteId', new_note_id,
        'partnershipId', active_row.partnership_id,
        'createdAt', timezone('utc'::text, now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 11. Get Love Notes
CREATE OR REPLACE FUNCTION public.get_love_notes(p_limit INT DEFAULT 50, p_before TIMESTAMPTZ DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    active_row RECORD;
    notes_list JSONB;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    SELECT * INTO active_row
    FROM public.user_active_partners
    WHERE user_id = caller_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', true, 'connected', false, 'notes', '[]'::jsonb);
    END IF;

    SELECT jsonb_agg(sub) INTO notes_list
    FROM (
        SELECT 
            id,
            partnership_id AS "partnershipId",
            sender_id AS "senderId",
            recipient_id AS "recipientId",
            content,
            tag,
            read_at AS "readAt",
            created_at AS "createdAt"
        FROM public.love_notes
        WHERE partnership_id = active_row.partnership_id
          AND (p_before IS NULL OR created_at < p_before)
        ORDER BY created_at DESC
        LIMIT LEAST(GREATEST(p_limit, 1), 100)
    ) sub;

    RETURN jsonb_build_object(
        'success', true,
        'connected', true,
        'partnershipId', active_row.partnership_id,
        'notes', COALESCE(notes_list, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 12. Mark Love Notes Read
CREATE OR REPLACE FUNCTION public.mark_love_notes_read()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    updated_count INT;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    UPDATE public.love_notes
    SET read_at = timezone('utc'::text, now())
    WHERE recipient_id = caller_id AND read_at IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    RETURN jsonb_build_object('success', true, 'count', updated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 13. Register Device Push Token
CREATE OR REPLACE FUNCTION public.register_push_token(p_token TEXT, p_platform TEXT)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    clean_token TEXT := trim(p_token);
    clean_plat TEXT := lower(trim(p_platform));
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    IF clean_token IS NULL OR length(clean_token) < 10 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid push token.');
    END IF;

    IF clean_plat NOT IN ('ios', 'android', 'web') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Platform must be ios, android, or web.');
    END IF;

    INSERT INTO public.user_push_tokens (user_id, expo_push_token, platform, updated_at)
    VALUES (caller_id, clean_token, clean_plat, timezone('utc'::text, now()))
    ON CONFLICT (user_id, expo_push_token)
    DO UPDATE SET platform = clean_plat, updated_at = timezone('utc'::text, now());

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 14. Unregister Push Token
CREATE OR REPLACE FUNCTION public.unregister_push_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    clean_token TEXT := trim(p_token);
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    DELETE FROM public.user_push_tokens
    WHERE user_id = caller_id AND expo_push_token = clean_token;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 15. Process Due Reminders
CREATE OR REPLACE FUNCTION public.process_due_reminders()
RETURNS JSONB AS $$
DECLARE
    r RECORD;
    processed_count INT := 0;
    event_title TEXT;
    event_body TEXT;
BEGIN
    FOR r IN
        SELECT sr.id AS reminder_id, sr.user_id, sr.reminder_type, id.title, p.display_name
        FROM public.scheduled_reminders sr
        JOIN public.important_dates id ON id.id = sr.date_id
        LEFT JOIN public.people p ON p.id = id.person_id
        WHERE sr.scheduled_for <= CURRENT_DATE AND sr.dispatched = FALSE
    LOOP
        IF r.reminder_type = 'before_24h' THEN
            event_title := 'Upcoming Occasion Tomorrow 🗓️';
            event_body := 'Tomorrow is ' || r.title || COALESCE(' for ' || r.display_name, '') || '. Want to prepare a card?';
        ELSE
            event_title := 'Celebration Today! 🎉';
            event_body := 'Today is ' || r.title || COALESCE(' for ' || r.display_name, '') || '! Send some love 💌';
        END IF;

        INSERT INTO public.notification_events (user_id, category, title, body, data)
        VALUES (
            r.user_id,
            'partner_surprise',
            event_title,
            event_body,
            jsonb_build_object('route', '/(tabs)/calendar')
        );

        UPDATE public.scheduled_reminders
        SET dispatched = TRUE, dispatched_at = timezone('utc'::text, now())
        WHERE id = r.reminder_id;

        processed_count := processed_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'processedCount', processed_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 16. Experience Access State Check
CREATE OR REPLACE FUNCTION public.get_experience_access_state(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
    clean_slug TEXT := lower(trim(p_slug));
    exp_record RECORD;
BEGIN
    IF clean_slug IS NULL OR length(clean_slug) = 0 THEN
        RETURN jsonb_build_object('exists', false);
    END IF;

    SELECT id, status, sharing_mode, recipient_name INTO exp_record
    FROM public.experiences
    WHERE slug = clean_slug;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('exists', false);
    END IF;

    RETURN jsonb_build_object(
        'exists', true,
        'status', exp_record.status,
        'sharingMode', exp_record.sharing_mode,
        'recipientName', exp_record.recipient_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- RPC FUNCTION GRANTS (NO FRAGILE REVOKES)
-- ==============================================================================
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_my_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_authenticated_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_partner_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_partner_invitation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_partner_invitation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_partner_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.disconnect_partner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_love_note(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_love_notes(INT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_love_notes_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_push_token(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unregister_push_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_due_reminders() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_experience_access_state(TEXT) TO anon, authenticated;
