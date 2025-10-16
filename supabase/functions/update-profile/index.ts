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
    const { userId, updates } = await req.json()

    if (!updates) {
      return new Response(
        JSON.stringify({ error: 'Profile updates are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use the provided user ID or fall back to the authenticated user's ID
    const targetUserId = userId || user.id

    // Ensure the user can only update their own profile unless they're an admin
    if (targetUserId !== user.id) {
      // Check if the user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only update your own profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    // Update the profile
    const { data: updatedProfile, error } = await supabaseClient
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)
      .select()
      .single()

    if (error) {
      // If the error is PGRST116 (no rows returned), create the profile first
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: targetUserId,
          username: null,
          full_name: null,
          avatar_url: null,
          website: null,
          phone: null,
          bio: null,
          location: null,
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: true,
          two_factor_auth: false,
          login_alerts: true,
          ...updates,
        };
        
        const { data: createdProfile, error: createError } = await supabaseClient
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        return new Response(
          JSON.stringify({ profile: createdProfile, message: 'Profile created and updated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
        )
      }
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ profile: updatedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})