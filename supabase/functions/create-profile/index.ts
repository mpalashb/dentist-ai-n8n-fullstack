import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Get the profile data from the request body
    const { profile } = await req.json()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Ensure the profile ID matches the authenticated user's ID
    if (profile.id && profile.id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot create a profile for another user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Set the ID to the authenticated user's ID if not provided
    const profileToCreate = {
      ...profile,
      id: user.id,
    }

    // Create the profile
    const { data: newProfile, error } = await supabaseClient
      .from('profiles')
      .insert([profileToCreate])
      .select()
      .single()

    if (error) {
      // If the error is a duplicate key error (profile already exists), return the existing profile
      if (error.code === '23505') {
        const { data: existingProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        return new Response(
          JSON.stringify({ profile: existingProfile, message: 'Profile already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ profile: newProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})