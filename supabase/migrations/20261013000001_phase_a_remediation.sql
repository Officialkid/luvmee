-- ==============================================================================
-- LUVMEE V1 — PHASE A REMEDIATION & STABILIZATION MIGRATION
-- Enhancements:
--   1. Secure public metadata function to check surprise access without leaking content
--   2. Forward-only idempotency guarantees
-- ==============================================================================

-- 1. Helper function to check experience access level safely from recipient web
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

    -- Return only structural metadata, never letter contents or private body
    RETURN jsonb_build_object(
        'exists', true,
        'status', exp_record.status,
        'sharingMode', exp_record.sharing_mode,
        'recipientName', exp_record.recipient_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Allow anonymous callers to check access state (returns no private body)
REVOKE EXECUTE ON FUNCTION public.get_experience_access_state(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_experience_access_state(TEXT) TO anon, authenticated;
