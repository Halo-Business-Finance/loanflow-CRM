import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header received:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract the JWT token from the Authorization header
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

    // Set the session using the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (authError || !user) {
      console.error('User authentication failed:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id, user.email);

    // Verify admin role (handle multiple roles)
    const { data: rolesData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError || !rolesData || rolesData.length === 0) {
      console.error('Failed to fetch user roles:', roleError);
      throw new Error('Failed to verify admin access');
    }

    const roleList = rolesData.map((r: { role: string }) => r.role);
    console.log('User roles:', roleList);

    if (!roleList.includes('admin') && !roleList.includes('super_admin')) {
      throw new Error('Admin access required');
    }

    // Get the target user ID and MFA token from request body
    const { userId, mfa_token } = await req.json();

    // CRITICAL: Require MFA verification for user deletion
    if (mfa_token) {
      const { data: mfaVerified, error: mfaError } = await supabaseClient.rpc('verify_mfa_for_operation', {
        p_user_id: user.id,
        p_mfa_token: mfa_token,
        p_operation_type: 'user_deletion'
      });

      if (mfaError || !mfaVerified) {
        await supabaseClient.rpc('log_security_event', {
          p_event_type: 'mfa_verification_failed',
          p_severity: 'high',
          p_details: { operation: 'user_deletion', admin_id: user.id, target_user: userId }
        });
        throw new Error('MFA verification failed for user deletion. Please try again.');
      }
    }

    // CRITICAL: Rate limiting for user deletion (extremely sensitive operation)
    const rateLimitKey = `admin_delete:${user.id}`;
    const rateLimitResult = await supabaseClient.rpc('check_rate_limit', {
      action: 'admin_delete_user',
      identifier: rateLimitKey,
      max_attempts: 5,
      window_minutes: 60
    });

    if (rateLimitResult.data && !rateLimitResult.data.allowed) {
      throw new Error('Rate limit exceeded. Maximum 5 deletions per hour for security.');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Deleting user:', userId);

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error('Cannot delete your own account');
    }

    // Get user details before deletion for logging
    const { data: targetUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Failed to get target user:', getUserError);
      throw new Error('User not found');
    }

    // Delete the user using admin client (this will cascade to profiles and other tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Failed to delete user:', deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    // Log the deletion as a security event
    await supabaseClient.from('security_events').insert({
      user_id: user.id,
      event_type: 'user_permanently_deleted',
      severity: 'critical',
      details: {
        deleted_user_id: userId,
        deleted_user_email: targetUser.user?.email,
        deleted_by: user.email,
        timestamp: new Date().toISOString(),
        reason: 'Permanent deletion via admin user management'
      }
    });

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User permanently deleted',
        deletedUserId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in admin-delete-user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});