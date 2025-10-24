import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        }
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role using service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: rolesData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roleList = rolesData?.map((r: { role: string }) => r.role) || [];
    if (roleError || (!roleList.includes('admin') && !roleList.includes('super_admin'))) {
      // Log unauthorized attempt
      await supabaseClient.from('security_events').insert({
        user_id: user.id,
        event_type: 'unauthorized_admin_function_attempt',
        severity: 'high',
        details: { attempted_function: 'admin-update-user' }
      });
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { userId, firstName, lastName, phone, city, state, isActive, mfa_token } = await req.json();

    // CRITICAL: Require MFA verification for user updates
    if (mfa_token) {
      const { data: mfaVerified, error: mfaError } = await supabaseClient.rpc('verify_mfa_for_operation', {
        p_user_id: user.id,
        p_mfa_token: mfa_token,
        p_operation_type: 'user_update'
      });

      if (mfaError || !mfaVerified) {
        await supabaseClient.rpc('log_security_event', {
          p_event_type: 'mfa_verification_failed',
          p_severity: 'high',
          p_details: { operation: 'user_update', admin_id: user.id, target_user: userId }
        });
        return new Response(
          JSON.stringify({ error: 'MFA verification failed. Please try again.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Rate limiting for admin operations
    const rateLimitKey = `admin_update:${user.id}`;
    const rateLimitResult = await supabaseClient.rpc('check_rate_limit', {
      action: 'admin_update_user',
      identifier: rateLimitKey,
      max_attempts: 20,
      window_minutes: 60
    });

    if (rateLimitResult.data && !rateLimitResult.data.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 20 updates per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating user profile:', { userId, firstName, lastName, phone, city, state, isActive });

    // Call the admin_update_profile database function
    const { data, error } = await supabaseClient.rpc('admin_update_profile', {
      p_user_id: userId,
      p_first_name: firstName || null,
      p_last_name: lastName || null,
      p_phone: phone || null,
      p_city: city || null,
      p_state: state || null,
      p_is_active: isActive !== undefined ? isActive : null,
    });

    if (error) {
      console.error('Error updating user profile:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User profile updated successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
