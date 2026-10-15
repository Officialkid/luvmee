-- ==============================================================================
-- LUVMEE V1 — PHASE B: PEOPLE DIRECTORY & IMPORTANT DATES MIGRATION
-- Enables personal contact directory and recurring occasions (birthdays, etc.)
-- Strict multi-tenant isolation via RLS policies.
-- ==============================================================================

-- 1. People Directory Table
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

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own people directory" ON public.people;
CREATE POLICY "Users can manage their own people directory"
    ON public.people FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Important Dates Table
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

ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own important dates" ON public.important_dates;
CREATE POLICY "Users can manage their own important dates"
    ON public.important_dates FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Grants for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.important_dates TO authenticated;
