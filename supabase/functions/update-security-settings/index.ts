import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the auth context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get the security settings from the request body
    const { 
      userId, 
      two_factor_auth,
      current_password,
      new_password
    } = await req.json()

    // Validate that at least one security setting is provided
    if (
      two_factor_auth === undefined && 
      !current_password && 
      !new_password
    ) {
      return new Response(
        JSON.stringify({ error: 'At least one security setting is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use the provided user ID or fall back to the authenticated user's ID
    const targetUserId = userId || user.id

    // Ensure the user can only update their own security settings unless they're an admin
    if (targetUserId !== user.id) {
      // Check if the user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only update your own security settings' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    // Build the update object with only the provided settings
    const updates: any = { updated_at: new Date().toISOString() }
    
    if (two_factor_auth !== undefined) updates.two_factor_auth = two_factor_auth

    // Update the security settings in the profile
    if (Object.keys(updates).length > 1) { // More than just updated_at
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId)
        .select()
        .single()

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // Handle password change if provided
    if (current_password && new_password) {
      // Verify the current password
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: user.email!,
        password: current_password,
      })

      if (signInError) {
        return new Response(
          JSON.stringify({ error: 'Current password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Update the password
      const { error: updatePasswordError } = await supabaseClient.auth.updateUser({
        password: new_password,
      })

      if (updatePasswordError) {
        return new Response(
          JSON.stringify({ error: updatePasswordError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // Get the updated profile
    const { data: finalProfile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        profile: finalProfile,
        message: 'Security settings updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})