-- ==============================================================================
-- LUVMEE V1 — PHASE D: SCHEDULED REMINDERS MIGRATION
-- Schedules 24-hour and same-day notifications for important dates & birthdays
-- ==============================================================================

-- 1. Scheduled Reminders Queue
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

ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their scheduled reminders" ON public.scheduled_reminders;
CREATE POLICY "Users can view their scheduled reminders"
    ON public.scheduled_reminders FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Trigger Function: Automatically schedule reminders when an important date is saved or updated
CREATE OR REPLACE FUNCTION public.handle_date_reminder_scheduling()
RETURNS TRIGGER AS $$
DECLARE
    target_year INT;
    date_this_year DATE;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Only schedule if reminders are enabled
    IF (NEW.reminder_enabled = TRUE) THEN
        target_year := EXTRACT(YEAR FROM today_date)::INT;
        
        -- Handle leap year Feb 29
        IF NEW.month = 2 AND NEW.day = 29 THEN
            IF NOT ((target_year % 4 = 0 AND target_year % 100 != 0) OR target_year % 400 = 0) THEN
                date_this_year := make_date(target_year, 2, 28);
            ELSE
                date_this_year := make_date(target_year, 2, 29);
            END IF;
        ELSE
            date_this_year := make_date(target_year, NEW.month, NEW.day);
        END IF;

        -- If already passed this year, schedule for next year
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

        -- 1. Schedule 24-hour reminder (day before)
        IF (date_this_year - INTERVAL '1 day')::DATE >= today_date THEN
            INSERT INTO public.scheduled_reminders (user_id, date_id, reminder_type, scheduled_for)
            VALUES (NEW.user_id, NEW.id, 'before_24h', (date_this_year - INTERVAL '1 day')::DATE)
            ON CONFLICT (date_id, reminder_type, scheduled_for) DO NOTHING;
        END IF;

        -- 2. Schedule same-day reminder
        INSERT INTO public.scheduled_reminders (user_id, date_id, reminder_type, scheduled_for)
        VALUES (NEW.user_id, NEW.id, 'same_day', date_this_year)
        ON CONFLICT (date_id, reminder_type, scheduled_for) DO NOTHING;
    ELSE
        -- Remove unsent reminders if reminder_enabled was turned off
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

-- 3. Processor RPC: Processes due reminders and logs notification events
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

        -- Log in notification_events (will trigger outbound push via Edge Function)
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

REVOKE EXECUTE ON FUNCTION public.process_due_reminders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_due_reminders() TO authenticated, service_role;
