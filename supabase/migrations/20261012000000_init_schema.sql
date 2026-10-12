-- ==============================================================================
-- LUVMEE V1 — CORE DATABASE SCHEMA MIGRATION
-- Entities: profiles, templates, experiences, recipient_responses
-- Features: Strict Row Level Security (RLS), auto-triggers, indexes
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Templates Table (Catalogue definitions)
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Experiences Table
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
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON public.experiences(slug);
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON public.experiences(status);

-- 4. Recipient Responses Table
CREATE TABLE IF NOT EXISTS public.recipient_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
    response_type TEXT CHECK (response_type IN ('yes', 'custom_note')) NOT NULL,
    response_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_experience_id ON public.recipient_responses(experience_id);

-- ==============================================================================
-- AUTOMATED TRIGGERS
-- ==============================================================================

-- Auto create user profile when user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Luvmee Creator'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_experiences_updated ON public.experiences;
CREATE TRIGGER on_experiences_updated
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_responses ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Templates Policies
CREATE POLICY "Templates are publicly viewable by everyone"
    ON public.templates FOR SELECT
    USING (is_active = TRUE);

-- 3. Experiences Policies
CREATE POLICY "Creators can view their own experiences"
    ON public.experiences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Recipients can view published experiences"
    ON public.experiences FOR SELECT
    USING (status = 'published');

CREATE POLICY "Creators can create experiences"
    ON public.experiences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update their own experiences"
    ON public.experiences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can delete their own experiences"
    ON public.experiences FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Recipient Responses Policies
CREATE POLICY "Recipients can submit responses to published experiences"
    ON public.recipient_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.experiences
            WHERE experiences.id = recipient_responses.experience_id
            AND experiences.status = 'published'
        )
    );

CREATE POLICY "Creators can view responses to their experiences"
    ON public.recipient_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.experiences
            WHERE experiences.id = recipient_responses.experience_id
            AND experiences.user_id = auth.uid()
        )
    );
