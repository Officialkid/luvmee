-- ==============================================================================
-- LUVMEE V1 — PHASE 5: AUTHENTICATION, USERNAME & ACCOUNT LIFECYCLE MIGRATION
-- Entities: profiles (extended with username, last_active_at)
-- Features:
--   - Case-insensitive, unique username constraint
--   - Atomic username check & reserve functions
--   - Automatic username generation for Google / OAuth users
--   - Server-side account activity recording (for 2-month inactivity policy)
--   - Comprehensive atomic account deletion RPC (delete_user_account)
-- ==============================================================================

-- 1. Extend profiles table with username and last_active_at
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create unique case-insensitive index on username (ignoring nulls until backfilled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
    ON public.profiles (LOWER(TRIM(username))) 
    WHERE username IS NOT NULL;

-- 2. Helper function to validate and normalize a username
CREATE OR REPLACE FUNCTION public.validate_username(raw_username TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_username TEXT;
BEGIN
    clean_username := LOWER(TRIM(raw_username));
    IF clean_username IS NULL OR length(clean_username) < 3 OR length(clean_username) > 30 THEN
        RETURN NULL;
    END IF;
    -- Only letters, numbers, and underscores allowed
    IF clean_username !~ '^[a-z0-9_]+$' THEN
        RETURN NULL;
    END IF;
    RETURN clean_username;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp;

-- 3. Function to generate unique fallback username (e.g. for Google OAuth)
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
    -- Strip unsupported chars
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

-- 4. Backfill existing profiles without a username
DO $$
DECLARE
    r RECORD;
    initial_seed TEXT;
BEGIN
    FOR r IN SELECT id, display_name FROM public.profiles WHERE username IS NULL LOOP
        initial_seed := COALESCE(r.display_name, 'user');
        UPDATE public.profiles
        SET username = public.generate_unique_username(initial_seed)
        WHERE id = r.id;
    END LOOP;
END $$;

-- 5. RPC: Check username availability
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

-- 6. RPC: Update own username
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

    -- Check if username is already claimed by someone else
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

    RETURN jsonb_build_object(
        'success', true,
        'username', clean_username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 7. RPC: Record activity timestamp (for 2-month inactivity tracking)
CREATE OR REPLACE FUNCTION public.record_authenticated_activity()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthenticated');
    END IF;

    -- Throttled update: only update if last_active_at was more than 1 hour ago
    UPDATE public.profiles
    SET last_active_at = timezone('utc'::text, now())
    WHERE id = caller_id
      AND last_active_at < (timezone('utc'::text, now()) - INTERVAL '1 hour');

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 8. RPC: Delete user account (atomic server-side cleanup of personal & relational data)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS JSONB AS $$
DECLARE
    caller_id UUID := auth.uid();
    active_partnership RECORD;
BEGIN
    IF caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication is required.');
    END IF;

    -- Step A: Disconnect any active partner connection safely
    SELECT * INTO active_partnership
    FROM public.user_active_partners
    WHERE user_id = caller_id
    FOR UPDATE;

    IF FOUND THEN
        -- Remove active partner rows
        DELETE FROM public.user_active_partners
        WHERE partnership_id = active_partnership.partnership_id;

        -- Mark historical partnership as disconnected
        UPDATE public.partnerships
        SET status = 'disconnected',
            disconnected_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = active_partnership.partnership_id;
    END IF;

    -- Step B: Cancel any pending invitations (sent or received)
    UPDATE public.partner_invitations
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE (sender_id = caller_id OR recipient_id = caller_id) AND status = 'pending';

    -- Step C: Remove push tokens and device registrations
    DELETE FROM public.user_push_tokens WHERE user_id = caller_id;

    -- Step D: Remove notification events directed to this user
    DELETE FROM public.notification_events WHERE user_id = caller_id;

    -- Step E: Remove notification preferences
    DELETE FROM public.notification_preferences WHERE user_id = caller_id;

    -- Step F: Clean up personal plans and calendar reminders
    DELETE FROM public.personal_plans WHERE user_id = caller_id;
    DELETE FROM public.scheduled_reminders WHERE user_id = caller_id;
    DELETE FROM public.important_dates WHERE user_id = caller_id;
    DELETE FROM public.people WHERE user_id = caller_id;

    -- Step G: Private love notes cleanup
    -- Remove love notes authored by the deleted user
    DELETE FROM public.love_notes WHERE sender_id = caller_id;

    -- Step H: Experiences cleanup
    -- Experiences created by this user are deleted (cascades to responses)
    DELETE FROM public.experiences WHERE user_id = caller_id;

    -- Step I: Delete application profile
    DELETE FROM public.profiles WHERE id = caller_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User account and personal data have been completely removed.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9. Update handle_new_user() trigger to automatically assign username on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    desired_username TEXT;
    assigned_username TEXT;
    user_display_name TEXT;
BEGIN
    user_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Luvmee User'
    );

    desired_username := public.validate_username(NEW.raw_user_meta_data->>'username');

    -- If no valid desired username was passed, or it is already taken, generate one
    IF desired_username IS NULL OR EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(TRIM(username)) = desired_username
    ) THEN
        assigned_username := public.generate_unique_username(user_display_name);
    ELSE
        assigned_username := desired_username;
    END IF;

    INSERT INTO public.profiles (id, display_name, avatar_url, partner_code, username, last_active_at)
    VALUES (
        NEW.id,
        user_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        public.generate_partner_code(),
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

-- 10. Explicit Function Grants
REVOKE EXECUTE ON FUNCTION public.check_username_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated, anon;

REVOKE EXECUTE ON FUNCTION public.update_my_username(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_my_username(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_authenticated_activity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_authenticated_activity() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
