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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id, user.email);

    // Verify admin role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRoles) {
      console.error('Failed to fetch user role:', roleError);
      throw new Error('Failed to verify admin access');
    }

    console.log('User role:', userRoles.role);

    if (!['admin', 'super_admin'].includes(userRoles.role)) {
      throw new Error('Admin access required');
    }

    console.log('Admin access verified, proceeding with deletion...');

    // Get the target user ID from request body
    const { userId } = await req.json();

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