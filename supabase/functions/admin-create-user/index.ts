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

    console.log('Admin access verified, proceeding with user creation...');

    // Get the user data from request body
    const { email, password, firstName, lastName, phone, city, state, role, isActive } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Creating user:', email);

    // Create the user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || ''
      }
    });

    if (createError) {
      console.error('Failed to create user:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    console.log('User created successfully:', newUser.user.id);

    // Update profile with additional information and mark email as verified
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
          city: city || null,
          state: state || null,
          is_active: isActive !== false,
          email_verified_at: new Date().toISOString() // Auto-verify for admin-created users
        })
        .eq('id', newUser.user.id);

      if (profileError) {
        console.error('Failed to update profile:', profileError);
      }

      // Assign user role
      const { error: roleAssignError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role || 'agent' })
        .eq('user_id', newUser.user.id);

      if (roleAssignError) {
        console.error('Failed to assign role:', roleAssignError);
      }
    }

    // Log the creation as a security event
    await supabaseClient.from('security_events').insert({
      user_id: user.id,
      event_type: 'user_created_by_admin',
      severity: 'medium',
      details: {
        new_user_id: newUser.user.id,
        new_user_email: email,
        created_by: user.email,
        role: role || 'agent',
        email_auto_confirmed: true,
        email_auto_verified: true,
        created_by_admin: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log('User created and configured successfully:', newUser.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        userId: newUser.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in admin-create-user:', error);
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
