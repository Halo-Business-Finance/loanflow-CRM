import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  role?: string
  user_number?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    console.log('Authorization header received:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create client with user token to verify their identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the user exists and get their info
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: userError?.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User authenticated:', user.id, user.email)

    // Check user role using admin client (bypasses RLS)
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)

    console.log('User roles query result:', userRoles, roleError)

    const hasAdminRole = userRoles?.some(r => r.role === 'admin' || r.role === 'super_admin')
    if (!hasAdminRole) {
      console.error('User does not have admin role:', user.email, 'roles:', userRoles)
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin access verified, fetching users...')

    // Fetch all profiles using admin client (bypasses RLS)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw profilesError
    }

    console.log(`Fetched ${profiles?.length || 0} profiles`)

    // Fetch all user roles using admin client
    const { data: allUserRoles, error: allRolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role, is_active')

    if (allRolesError) {
      console.error('Error fetching user roles:', allRolesError)
    }

    // Create a map of user roles with priority for highest role
    const rolesMap = new Map<string, string>()
    const rolePriority: Record<string, number> = {
      'super_admin': 5,
      'admin': 4,
      'manager': 3,
      'loan_processor': 2,
      'underwriter': 2,
      'funder': 2,
      'closer': 2,
      'loan_originator': 2,
      'agent': 1,
      'viewer': 0
    }
    
    if (allUserRoles) {
      allUserRoles.forEach((ur: any) => {
        if (ur.is_active && ur.role) {
          const currentRole = rolesMap.get(ur.user_id)
          const currentPriority = currentRole ? (rolePriority[currentRole] || 0) : -1
          const newPriority = rolePriority[ur.role as string] || 0
          
          // Only update if this role has higher priority or no role exists yet
          if (!currentRole || newPriority > currentPriority) {
            rolesMap.set(ur.user_id, ur.role as string)
          }
        }
      })
    }

    // Transform the data to include role information
    const transformedUsers: UserProfile[] = profiles?.map((profile: any) => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone_number: profile.phone_number,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      role: rolesMap.get(profile.id) || 'agent',
      user_number: profile.user_number
    })) || []

    console.log(`Returning ${transformedUsers.length} transformed users with roles`)
    
    // Log each user's role for debugging
    transformedUsers.forEach(user => {
      console.log(`User ${user.email}: role=${user.role}, is_active=${user.is_active}`)
    })
    
    // Log role distribution for debugging
    const roleDistribution: Record<string, number> = {}
    transformedUsers.forEach(user => {
      if (user.role) {
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1
      }
    })
    console.log('Role distribution:', roleDistribution)

    return new Response(
      JSON.stringify({ users: transformedUsers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    console.error('Edge function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})