import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/**
 * LUVMEE Phase A4 / Phase 4C: Outbound Push Notification Dispatcher
 *
 * This Edge Function processes notification events and dispatches them
 * to the official Expo Push Notification service (https://exp.host/--/api/v2/push/send).
 *
 * Privacy Invariants:
 * 1. Notification payloads never include private love note contents or raw surprises.
 * 2. Only privacy-conscious, generic teasers are dispatched.
 * 3. Notification preferences (partner_invitations, love_notes, surprises) are strictly respected.
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data: Record<string, any>;
  badge?: number;
}

serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing service credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json().catch(() => ({}));
    const eventId = body?.record?.id || body?.eventId;

    // Fetch unhandled or targeted notification event
    let query = supabase.from('notification_events').select('*');
    if (eventId) {
      query = query.eq('id', eventId);
    } else {
      query = query.order('created_at', { ascending: false }).limit(20);
    }

    const { data: events, error: eventErr } = await query;
    if (eventErr || !events || events.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pushMessages: PushMessage[] = [];
    const processedEventIds: string[] = [];

    for (const event of events) {
      // 1. Check user notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', event.user_id)
        .maybeSingle();

      const allowInvitations = prefs ? prefs.partner_invitations !== false : true;
      const allowLoveNotes = prefs ? prefs.love_notes !== false : true;
      const allowSurprises = prefs ? prefs.surprises !== false : true;

      let allowed = true;
      if (event.category === 'partner_invitation' || event.category === 'invitation_accepted') {
        allowed = allowInvitations;
      } else if (event.category === 'love_note') {
        allowed = allowLoveNotes;
      } else if (event.category === 'partner_surprise') {
        allowed = allowSurprises;
      }

      if (!allowed) {
        continue;
      }

      // 2. Fetch device push tokens for user
      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('expo_push_token')
        .eq('user_id', event.user_id);

      if (tokens && tokens.length > 0) {
        for (const t of tokens) {
          if (t.expo_push_token && t.expo_push_token.startsWith('ExponentPushToken[')) {
            pushMessages.push({
              to: t.expo_push_token,
              sound: 'default',
              title: event.title,
              body: event.body, // Guaranteed by DB trigger to be non-leaking generic teaser
              data: event.data || {}
            });
          }
        }
      }
      processedEventIds.push(event.id);
    }

    let dispatchResult = null;
    if (pushMessages.length > 0) {
      // Dispatch in batches to Expo
      const expoRes = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(pushMessages)
      });
      dispatchResult = await expoRes.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        dispatchedCount: pushMessages.length,
        processedEvents: processedEventIds.length,
        expoResult: dispatchResult
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Internal dispatch error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
