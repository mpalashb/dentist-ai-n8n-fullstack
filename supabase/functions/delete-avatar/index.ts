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

    // Get the avatar URL from the request body
    const { avatarUrl } = await req.json()

    if (!avatarUrl) {
      return new Response(
        JSON.stringify({ error: 'Avatar URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Extract the file path from the URL
    let filePath
    if (avatarUrl.includes('/profiles/')) {
      filePath = avatarUrl.split('/profiles/')[1]
    } else if (avatarUrl.includes('/profiles/')) {
      // For backward compatibility with old URLs
      filePath = avatarUrl.split('/profiles/')[1]
    } else {
      filePath = avatarUrl
    }

    // Delete the file from Supabase Storage
    const { error: deleteError } = await supabaseClient.storage
      .from('profiles')
      .remove([filePath])

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update the user's profile to remove the avatar URL
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Avatar deleted successfully'
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