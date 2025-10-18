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

    // Get the user ID from the request body or query parameters
    const { userId } = await req.json().catch(() => ({}))
    const url = new URL(req.url)
    const queryUserId = url.searchParams.get('userId')
    
    // Use the provided user ID or fall back to the authenticated user's ID
    const targetUserId = userId || queryUserId || user.id

    // Ensure the user can only delete their own profile unless they're an admin
    if (targetUserId !== user.id) {
      // Check if the user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only delete your own profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    // Delete the profile
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', targetUserId)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // If the user is deleting their own profile, also delete their auth account
    if (targetUserId === user.id) {
      const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user.id)
      
      if (deleteAuthError) {
        return new Response(
          JSON.stringify({ error: deleteAuthError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Profile deleted successfully' }),
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