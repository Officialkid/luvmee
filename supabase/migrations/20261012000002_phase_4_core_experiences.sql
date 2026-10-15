-- ==============================================================================
-- LUVMEE V1 — PHASE 4: CORE RELATIONSHIP EXPERIENCES MIGRATION
-- Workstreams:
--   4A: Partner-Aware Surprises (targeting, database authorization, RLS)
--   4B: Private Love Notes & Messaging (persistence, realtime, RLS, RPCs)
--   4C: Push Notification Infrastructure (tokens, event logging, preferences)
-- ==============================================================================

-- ==============================================================================
-- WORKSTREAM 4A: PARTNER-AWARE SURPRISES
-- ==============================================================================

-- 1. Extend experiences table with recipient targeting and sharing mode
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS sharing_mode TEXT NOT NULL DEFAULT 'public_link'
    CHECK (sharing_mode IN ('public_link', 'partner_exclusive'));

ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_experiences_sharing_mode ON public.experiences(sharing_mode);
CREATE INDEX IF NOT EXISTS idx_experiences_recipient_id ON public.experiences(recipient_id);

-- Enforce: if sharing_mode is partner_exclusive, recipient_id cannot be the creator themselves
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_partner_exclusive_recipient'
    ) THEN
        ALTER TABLE public.experiences ADD CONSTRAINT check_partner_exclusive_recipient
            CHECK (sharing_mode != 'partner_exclusive' OR (recipient_id IS NOT NULL AND recipient_id != user_id));
    END IF;
END $$;

-- Update RLS on experiences:
-- - Drafts remain strictly visible only to creator (auth.uid() = user_id)
-- - Published public_link surprises are visible to anyone
-- - Published partner_exclusive surprises are visible ONLY to the designated recipient and the creator
DROP POLICY IF EXISTS "Recipients can view published experiences" ON public.experiences;
CREATE POLICY "Recipients can view published experiences"
    ON public.experiences FOR SELECT
    USING (
        status = 'published' AND (
            sharing_mode = 'public_link'
            OR auth.uid() = recipient_id
            OR auth.uid() = user_id
        )
    );

-- ==============================================================================
-- WORKSTREAM 4B: PRIVATE LOVE NOTES & MESSAGING
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

-- Enable RLS
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view their conversation love notes" ON public.love_notes;
CREATE POLICY "Partners can view their conversation love notes"
    ON public.love_notes FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Partners can send love notes to their partner" ON public.love_notes;
CREATE POLICY "Partners can send love notes to their partner"
    ON public.love_notes FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.user_active_partners
            WHERE user_id = auth.uid() AND partner_id = recipient_id AND partnership_id = love_notes.partnership_id
        )
    );

-- Enable Supabase Realtime for live updates between connected partners
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'love_notes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.love_notes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If supabase_realtime publication is managed by supabase dashboard, do not abort
        NULL;
END $$;

-- ==============================================================================
-- WORKSTREAM 4C: PUSH NOTIFICATION INFRASTRUCTURE
-- ==============================================================================

-- 1. Push Tokens Table
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
END $$;

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.user_push_tokens(user_id);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage their own push tokens"
    ON public.user_push_tokens FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Notification Events Table (audit log & in-app inbox)
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

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notification_events;
CREATE POLICY "Users can view their notifications"
    ON public.notification_events FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notification_events;
CREATE POLICY "Users can update their notifications"
    ON public.notification_events FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_invitations BOOLEAN DEFAULT TRUE NOT NULL,
    love_notes BOOLEAN DEFAULT TRUE NOT NULL,
    surprises BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage their notification preferences"
    ON public.notification_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- ATOMIC SECURITY DEFINER RPC FUNCTIONS
-- ==============================================================================

-- 1. Send Love Note (with automatic notification event logging)
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

    -- Look up active partner
    SELECT * INTO active_row
    FROM public.user_active_partners
    WHERE user_id = caller_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must have an active connected partner to send love notes.');
    END IF;

    -- Insert love note
    INSERT INTO public.love_notes (partnership_id, sender_id, recipient_id, content, tag)
    VALUES (active_row.partnership_id, caller_id, active_row.partner_id, clean_content, clean_tag)
    RETURNING id INTO new_note_id;

    -- Check recipient preferences
    SELECT love_notes INTO pref_enabled
    FROM public.notification_preferences
    WHERE user_id = active_row.partner_id;

    IF pref_enabled IS NULL OR pref_enabled = TRUE THEN
        -- Get sender name
        SELECT display_name INTO caller_name
        FROM public.profiles
        WHERE id = caller_id;

        -- Create notification event (non-leaking body: teaser only)
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

-- 2. Fetch Love Notes History
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

-- 3. Mark Love Notes Read
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

-- 4. Register Device Push Token
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

-- 5. Unregister Device Push Token (on logout)
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

-- 6. Trigger: Dispatch Notification on Partner Invitation Event
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

-- 7. Trigger: Dispatch Notification on Partner-Exclusive Surprise Published
CREATE OR REPLACE FUNCTION public.handle_partner_surprise_notification()
RETURNS TRIGGER AS $$
DECLARE
    creator_name TEXT;
    pref_enabled BOOLEAN := TRUE;
BEGIN
    IF (NEW.status = 'published' AND NEW.sharing_mode = 'partner_exclusive' AND NEW.recipient_id IS NOT NULL) THEN
        -- Only fire if newly published or updated to published
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
-- EXPLICIT FUNCTION EXECUTION PERMISSIONS
-- ==============================================================================

REVOKE EXECUTE ON FUNCTION public.send_love_note(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_love_note(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_love_notes(INT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_love_notes(INT, TIMESTAMPTZ) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_love_notes_read() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_love_notes_read() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.register_push_token(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_push_token(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.unregister_push_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unregister_push_token(TEXT) TO authenticated;
