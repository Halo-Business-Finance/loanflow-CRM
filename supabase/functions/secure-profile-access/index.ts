import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== Secure profile access request started ===')
    console.log('Method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    const body = await req.json().catch(e => {
      console.error('Failed to parse JSON body:', e)
      throw new Error('Invalid JSON in request body')
    })
    
    console.log('Request body:', JSON.stringify(body, null, 2))
    const { action, profile_id, updates, profile_ids } = body
    
    // Get the authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      throw new Error('Missing authorization header')
    }

    // Extract the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')
    console.log('Attempting to authenticate user with token...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      throw new Error('Authentication failed: ' + (userError?.message || 'No user found'))
    }
    
    console.log('User authenticated successfully:', user.id, user.email)

    console.log(`Processing action: ${action}`)

    switch (action) {
      case 'get_masked_profile':
        return await getMaskedProfile(profile_id, user.id)
      case 'get_multiple_profiles':
        return await getMultipleProfiles(profile_ids, user.id)
      case 'update_profile_secure':
        return await updateProfileSecure(profile_id, updates, user.id)
      case 'migrate_existing_data':
        return await migrateExistingData(user.id)
      default:
        console.error('Invalid action:', action)
        return new Response(
          JSON.stringify({ error: 'Invalid action: ' + action }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('=== ERROR in secure profile access ===')
    console.error('Error:', error)
    const stack = error instanceof Error ? error.stack : 'No stack trace'
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Stack:', stack)
    return new Response(
      JSON.stringify({ 
        error: message,
        details: 'Check function logs for more information'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function getMaskedProfile(profileId: string, requestingUserId: string) {
  try {
    console.log('Getting masked profile:', profileId, 'for user:', requestingUserId)
    
    const { data, error } = await supabase.rpc('get_masked_profile_data', {
      p_profile_id: profileId,
      p_requesting_user_id: requestingUserId
    })

    if (error) {
      console.error('RPC error in get_masked_profile_data:', error)
      throw error
    }

    console.log('Profile data retrieved successfully')

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting masked profile:', error)
    throw error
  }
}

async function getMultipleProfiles(profileIds: string[], requestingUserId: string) {
  try {
    console.log('Getting multiple profiles:', profileIds, 'for user:', requestingUserId)
    
    if (!Array.isArray(profileIds)) {
      throw new Error('profile_ids must be an array')
    }

    // Get masked data for each profile
    const profilePromises = profileIds.map(async (profileId: string) => {
      const { data, error } = await supabase.rpc('get_masked_profile_data', {
        p_profile_id: profileId,
        p_requesting_user_id: requestingUserId
      })
      
      if (error) {
        console.error(`Error getting profile ${profileId}:`, error)
        return null
      }
      
      return data
    })

    const profiles = await Promise.all(profilePromises)
    const validProfiles = profiles.filter(p => p !== null)

    console.log(`Multiple profiles accessed: ${profileIds.length} requested, ${validProfiles.length} returned`)

    return new Response(
      JSON.stringify({ data: validProfiles }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting multiple profiles:', error)
    throw error
  }
}

async function updateProfileSecure(profileId: string, updates: any, requestingUserId: string) {
  try {
    console.log('Updating profile securely:', profileId, 'by user:', requestingUserId)
    
    // Validate that user can update this profile
    if (profileId !== requestingUserId) {
      // Check if user has admin permissions
      const { data: role, error: roleError } = await supabase.rpc('get_user_role', {
        p_user_id: requestingUserId
      })
      
      if (roleError) {
        console.error('Error getting user role:', roleError)
        throw new Error('Failed to verify permissions')
      }
      
      if (!role || !['admin', 'super_admin'].includes(role)) {
        throw new Error('Unauthorized to update this profile')
      }
    }

    const { data, error } = await supabase.rpc('update_profile_secure', {
      p_profile_id: profileId,
      p_updates: updates
    })

    if (error) {
      console.error('RPC error in update_profile_secure:', error)
      throw error
    }

    console.log(`Profile ${profileId} updated securely by ${requestingUserId}`)

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

async function migrateExistingData(requestingUserId: string) {
  try {
    console.log('=== Starting data migration ===')
    console.log('Requested by user:', requestingUserId)
    
    // Check if user has admin permissions for migration
    const { data: role, error: roleError } = await supabase.rpc('get_user_role', {
      p_user_id: requestingUserId
    })
    
    if (roleError) {
      console.error('Error getting user role:', roleError)
      throw new Error('Failed to verify permissions: ' + roleError.message)
    }
    
    console.log('User role:', role)
    
    if (!role || !['admin', 'super_admin'].includes(role)) {
      throw new Error('Unauthorized to perform data migration. Required role: admin or super_admin. Your role: ' + (role || 'none'))
    }

    // Get all profiles with sensitive data that haven't been encrypted yet
    console.log('Fetching profiles to migrate...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, phone_number')
      .not('email', 'is', null)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw new Error('Failed to fetch profiles: ' + profilesError.message)
    }

    console.log(`Found ${profiles?.length || 0} profiles to potentially migrate`)

    let migratedCount = 0
    
    // Encrypt existing sensitive data
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        console.log(`Processing profile ${profile.id}...`)
        
        try {
          if (profile.email) {
            await supabase.rpc('encrypt_profile_field', {
              p_profile_id: profile.id,
              p_field_name: 'email',
              p_field_value: profile.email
            })
            console.log(`Encrypted email for profile ${profile.id}`)
          }
          
          if (profile.phone_number) {
            await supabase.rpc('encrypt_profile_field', {
              p_profile_id: profile.id,
              p_field_name: 'phone_number',
              p_field_value: profile.phone_number
            })
            console.log(`Encrypted phone for profile ${profile.id}`)
          }
          
          migratedCount++
        } catch (encryptError) {
          console.error(`Error encrypting data for profile ${profile.id}:`, encryptError)
          // Continue with other profiles even if one fails
        }
      }
    }

    console.log(`Data migration completed: ${migratedCount} profiles migrated`)

    // Log the migration completion event
    try {
      await supabase.from('security_events').insert({
        user_id: requestingUserId,
        event_type: 'profile_data_migration_completed',
        severity: 'low',
        details: {
          migrated_profiles: migratedCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('Failed to log migration completion:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        migrated_profiles: migratedCount,
        message: `Successfully migrated ${migratedCount} profiles with encryption`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('=== ERROR during data migration ===')
    console.error('Error:', error)
    throw error
  }
}