-- ==============================================================================
-- LUVMEE V1 — PHASE 3: PARTNER CONNECTION SYSTEM MIGRATION
-- Entities: partner_invitations, partnerships, user_active_partners
-- Features:
--   - Strict 1-active-partner-at-a-time enforcement via PRIMARY KEY constraint
--   - Canonical user ordering (user_a < user_b)
--   - Unique pending invitation constraint
--   - Unique 6-character partner codes (e.g. LUV-XXXX)
--   - Privacy-preserving invitation lookup (code / normalized email)
--   - Atomic transactional RPCs with SECURITY DEFINER and hardened search_path
--   - Comprehensive Row Level Security (RLS) driven by auth.uid()
--   - Explicit execution grants restricted to authenticated role
-- ==============================================================================

-- 1. Extend Profiles Table with Unique Partner Code
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_code TEXT;

-- Function to generate unique 6-character alphanumeric partner codes (e.g. LUV-4B92)
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN DEFAULT FALSE;
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- excludes confusing chars 0, 1, I, O
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

-- Backfill existing profiles without a partner_code
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles WHERE partner_code IS NULL LOOP
        UPDATE public.profiles
        SET partner_code = public.generate_partner_code()
        WHERE id = r.id;
    END LOOP;
END $$;

-- Enforce UNIQUE NOT NULL on partner_code
ALTER TABLE public.profiles ALTER COLUMN partner_code SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_partner_code'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT unique_partner_code UNIQUE (partner_code);
    END IF;
END $$;

-- Update handle_new_user trigger to assign partner_code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, partner_code)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Luvmee Creator'),
        NEW.raw_user_meta_data->>'avatar_url',
        public.generate_partner_code()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 2. Partner Invitations Table
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

-- Database-level constraint: exactly one active pending invitation between any two users
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_invitation 
    ON public.partner_invitations (LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)) 
    WHERE status = 'pending';

-- 3. Partnerships Table (Historical & Canonical record)
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

-- 4. User Active Partners Table
-- ENFORCES THE "ONE ACTIVE PARTNER AT A TIME" RULE AT THE DATABASE ENGINE LEVEL:
-- user_id is PRIMARY KEY, so a user can physically appear at most ONCE as an active partner.
CREATE TABLE IF NOT EXISTS public.user_active_partners (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_active_partner CHECK (user_id != partner_id)
);

CREATE INDEX IF NOT EXISTS idx_user_active_partners_partner ON public.user_active_partners(partner_id);

-- Updated_at triggers
DROP TRIGGER IF EXISTS on_partner_invitations_updated ON public.partner_invitations;
CREATE TRIGGER on_partner_invitations_updated
    BEFORE UPDATE ON public.partner_invitations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_partnerships_updated ON public.partnerships;
CREATE TRIGGER on_partnerships_updated
    BEFORE UPDATE ON public.partnerships
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_partners ENABLE ROW LEVEL SECURITY;

-- 1. Partner Invitations RLS
DROP POLICY IF EXISTS "Users can view their own sent or received invitations" ON public.partner_invitations;
CREATE POLICY "Users can view their own sent or received invitations"
    ON public.partner_invitations FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 2. Partnerships RLS
DROP POLICY IF EXISTS "Users can view their own partnerships" ON public.partnerships;
CREATE POLICY "Users can view their own partnerships"
    ON public.partnerships FOR SELECT
    USING (auth.uid() = user_a OR auth.uid() = user_b);

-- 3. User Active Partners RLS
DROP POLICY IF EXISTS "Users can view active partner pairings involving them" ON public.user_active_partners;
CREATE POLICY "Users can view active partner pairings involving them"
    ON public.user_active_partners FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- 4. Profiles RLS Extensions:
-- Allow users to view the profile of their active partner
DROP POLICY IF EXISTS "Users can view their active partner's profile" ON public.profiles;
CREATE POLICY "Users can view their active partner's profile"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_active_partners
            WHERE user_id = auth.uid() AND partner_id = profiles.id
        )
    );

-- Allow users to view the profile of a pending invitation counterpart
DROP POLICY IF EXISTS "Users can view counterpart profiles for pending invitations" ON public.profiles;
CREATE POLICY "Users can view counterpart profiles for pending invitations"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.partner_invitations
            WHERE status = 'pending'
            AND (
                (sender_id = auth.uid() AND recipient_id = profiles.id)
                OR (recipient_id = auth.uid() AND sender_id = profiles.id)
            )
        )
    );

-- ==============================================================================
-- ATOMIC SECURITY DEFINER RPC FUNCTIONS
-- ==============================================================================

-- 1. Get Current Partner & Invitation State
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

    -- Ensure caller has a partner code
    SELECT partner_code INTO my_code FROM public.profiles WHERE id = caller_id;
    IF my_code IS NULL THEN
        my_code := public.generate_partner_code();
        UPDATE public.profiles SET partner_code = my_code WHERE id = caller_id;
    END IF;

    -- A. Check if user has an active partner
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

    -- B. Check for incoming pending invitation
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

    -- C. Check for outgoing pending invitation
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

    -- D. Otherwise not connected
    RETURN jsonb_build_object(
        'state', 'not_connected',
        'myPartnerCode', my_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 2. Send Partner Invitation
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

    -- Caller must not have an active partner
    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = caller_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active partner. Please disconnect first.');
    END IF;

    -- Caller must not have an active outgoing pending invitation
    IF EXISTS (SELECT 1 FROM public.partner_invitations WHERE sender_id = caller_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an outgoing invitation pending. Please cancel it before sending a new one.');
    END IF;

    -- Lookup target user by partner_code (handling both 'LUV-XXXX' and 'XXXX')
    SELECT id, display_name INTO target_prof
    FROM public.profiles
    WHERE UPPER(partner_code) = UPPER(clean_target)
       OR UPPER(partner_code) = 'LUV-' || UPPER(clean_target);

    IF target_prof.id IS NOT NULL THEN
        target_user_id := target_prof.id;
    ELSIF clean_target LIKE '%@%' THEN
        -- Lookup target user by normalized email in auth.users
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

    -- Check if target user already has an active partner
    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = target_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This user already has an active partner.');
    END IF;

    -- Check if target user already sent a pending invitation to caller
    IF EXISTS (SELECT 1 FROM public.partner_invitations WHERE sender_id = target_user_id AND recipient_id = caller_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'This user has already sent you a partner invitation. Please accept their invitation.');
    END IF;

    -- Insert pending invitation
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

-- 3. Respond to Partner Invitation (Accept or Decline)
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

    -- Find the invitation for caller with row-level lock
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

    -- Decision is ACCEPT:
    -- Verify neither user has an active partner
    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = caller_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active partner.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_active_partners WHERE user_id = inv.sender_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'The sender is already connected with another partner.');
    END IF;

    -- Mark invitation as accepted
    UPDATE public.partner_invitations
    SET status = 'accepted', updated_at = timezone('utc'::text, now())
    WHERE id = invitation_id;

    -- Cancel all other pending invitations involving either caller or sender
    UPDATE public.partner_invitations
    SET status = 'cancelled', updated_at = timezone('utc'::text, now())
    WHERE status = 'pending'
      AND id != invitation_id
      AND (sender_id IN (caller_id, inv.sender_id) OR recipient_id IN (caller_id, inv.sender_id));

    -- Determine canonical ordering for partnerships table (user_a < user_b)
    IF caller_id < inv.sender_id THEN
        u_a := caller_id;
        u_b := inv.sender_id;
    ELSE
        u_a := inv.sender_id;
        u_b := caller_id;
    END IF;

    -- Create partnership row
    INSERT INTO public.partnerships (user_a, user_b, status, connected_at)
    VALUES (u_a, u_b, 'connected', timezone('utc'::text, now()))
    RETURNING id INTO new_partnership_id;

    -- Insert active partner records for both users
    INSERT INTO public.user_active_partners (user_id, partner_id, partnership_id, connected_at)
    VALUES 
        (caller_id, inv.sender_id, new_partnership_id, timezone('utc'::text, now())),
        (inv.sender_id, caller_id, new_partnership_id, timezone('utc'::text, now()));

    RETURN jsonb_build_object(
        'success', true,
        'status', 'connected',
        'partnershipId', new_partnership_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 4. Cancel Partner Invitation (Sender cancels outgoing invite)
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

-- 5. Disconnect Partner
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

    -- Remove both active partner rows atomically
    DELETE FROM public.user_active_partners
    WHERE partnership_id = active_row.partnership_id;

    -- Update partnership status to disconnected
    UPDATE public.partnerships
    SET status = 'disconnected',
        disconnected_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = active_row.partnership_id;

    RETURN jsonb_build_object('success', true, 'status', 'disconnected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- ==============================================================================
-- EXPLICIT FUNCTION EXECUTION PERMISSIONS
-- ==============================================================================

REVOKE EXECUTE ON FUNCTION public.get_partner_state() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_partner_state() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.send_partner_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_partner_invitation(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.respond_to_partner_invitation(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_partner_invitation(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancel_partner_invitation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_partner_invitation(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.disconnect_partner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.disconnect_partner() TO authenticated;
