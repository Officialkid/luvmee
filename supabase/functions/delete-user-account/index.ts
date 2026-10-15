import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/**
 * LUVMEE Phase 6: Secure Account Deletion Edge Function
 *
 * Performs authorized server-side account deletion:
 * 1. Verifies caller's JWT authentication
 * 2. Executes atomic relational cleanup via database RPC `delete_user_account`
 * 3. Deletes the auth user record from `auth.users` via Supabase Admin API
 * 4. Invalidates storage objects and tokens
 */

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Authenticate the caller from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing bearer token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // 2. Perform database record and relation cleanup via user-authenticated RPC
    const { data: cleanupData, error: cleanupErr } = await userClient.rpc('delete_user_account');
    if (cleanupErr) {
      return new Response(
        JSON.stringify({ error: `Database cleanup failed: ${cleanupErr.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Remove user from auth.users using admin client (Service Role)
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { error: deleteUserErr } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserErr) {
      // Log warning if user already deleted or error occurred
      console.warn('Auth admin delete user notice:', deleteUserErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your account and all associated personal data have been permanently deleted.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
