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

    // Handle different HTTP methods
    switch (req.method) {
      case 'DELETE':
        return handleDeleteRequest(req, supabaseClient, user, corsHeaders)
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Handle DELETE request - Delete a voice record
async function handleDeleteRequest(req, supabaseClient, user, corsHeaders) {
  try {
    const url = new URL(req.url)
    const recordId = url.searchParams.get('id') || (await req.json()).id
    
    if (!recordId) {
      return new Response(
        JSON.stringify({ error: 'Record ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // First, check if the record exists and if the user has permission to delete it
    const { data: existingRecord, error: fetchError } = await supabaseClient
      .from('voice_records')
      .select('profile_id, metadata')
      .eq('id', recordId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Voice record not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Check if user has permission to delete this record
    if (existingRecord.profile_id !== user.id) {
      // Check if user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only delete your own records' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }
    
    // Extract the file path from metadata if it exists
    const filePath = existingRecord.metadata?.storage_path
    
    // Delete the record from the database
    const { error: deleteError } = await supabaseClient
      .from('voice_records')
      .delete()
      .eq('id', recordId)
    
    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // If the record had a file path in metadata, try to delete the file from storage
    if (filePath) {
      try {
        const { error: storageError } = await supabaseClient.storage
          .from('records')
          .remove([filePath])
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError.message)
          // We don't return an error here because the record was successfully deleted from the database
        }
      } catch (storageError) {
        console.error('Exception when deleting file from storage:', storageError.message)
        // We don't return an error here because the record was successfully deleted from the database
      }
    }
    
    return new Response(
      JSON.stringify({ message: 'Voice record deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}