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

    // Check if the request is multipart/form-data for file upload
    const contentType = req.headers.get('content-type')
    let avatarUrl = null

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData()
      const file = formData.get('avatar') as File

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        return new Response(
          JSON.stringify({ error: uploadError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabaseClient.storage
        .from('profiles')
        .getPublicUrl(filePath)

      avatarUrl = publicUrlData.publicUrl
    } else {
      // Handle URL update
      const { avatarUrl: newAvatarUrl } = await req.json()

      if (!newAvatarUrl) {
        return new Response(
          JSON.stringify({ error: 'Avatar URL is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      avatarUrl = newAvatarUrl
    }

    // Update the user's profile with the new avatar URL
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatarUrl,
        profile: updatedProfile
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