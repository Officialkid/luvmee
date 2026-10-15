-- ==============================================================================
-- LUVMEE V1 — PHASE F: LIGHTWEIGHT PERSONAL PLANS MIGRATION
-- Enables users to save date ideas, activities, places, and gift ideas
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

ALTER TABLE public.personal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their personal plans" ON public.personal_plans;
CREATE POLICY "Users can manage their personal plans"
    ON public.personal_plans FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_plans TO authenticated;
