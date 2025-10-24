import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the user is authenticated and get their session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has admin privileges
    const { data: roleData, error: roleError } = await supabaseAdmin.rpc('get_user_role', {
      p_user_id: user.id
    })

    if (roleError || !['admin', 'super_admin'].includes(roleData)) {
      return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { user_id, new_password } = await req.json()

    if (!user_id || !new_password) {
      return new Response(JSON.stringify({ error: 'Missing user_id or new_password' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ENHANCED: Validate password strength (military-grade requirements)
    if (new_password.length < 12) {
      return new Response(JSON.stringify({ error: 'Password must be at least 12 characters long for security' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(new_password);
    const hasLowerCase = /[a-z]/.test(new_password);
    const hasNumbers = /\d/.test(new_password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(new_password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return new Response(JSON.stringify({ 
        error: 'Password must contain uppercase, lowercase, numbers, and special characters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rate limiting for password resets
    const rateLimitKey = `admin_reset_password:${user.id}`;
    const rateLimitResult = await supabaseAdmin.rpc('check_rate_limit', {
      action: 'admin_reset_password',
      identifier: rateLimitKey,
      max_attempts: 10,
      window_minutes: 60
    });

    if (rateLimitResult.data && !rateLimitResult.data.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 password resets per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update user password using admin privileges
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password
    })

    if (updateError) {
      throw updateError
    }

    // Log the password reset action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'admin_password_reset',
      table_name: 'auth.users',
      record_id: user_id,
      new_values: { admin_reset: true, reset_by: user.id }
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    console.error('Error resetting password:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})