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
      case 'POST':
        return handlePostRequest(req, supabaseClient, user, corsHeaders)
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

// Handle POST request - Upload a voice record
async function handlePostRequest(req, supabaseClient, user, corsHeaders) {
  try {
    // Check if the request is multipart/form-data for file upload
    const contentType = req.headers.get('content-type')
    
    if (contentType && contentType.includes('multipart/form-data')) {
      return handleFileUpload(req, supabaseClient, user, corsHeaders)
    } else {
      // Handle JSON request for creating a record with an existing file URL
      return handleRecordCreation(req, supabaseClient, user, corsHeaders)
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

// Handle file upload and record creation
async function handleFileUpload(req, supabaseClient, user, corsHeaders) {
  try {
    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const isPublic = formData.get('is_public') === 'true'
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `voice-records/${user.id}/${fileName}`
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('records')
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
      .from('records')
      .getPublicUrl(filePath)
    
    // Create a record in the database
    const recordData = {
      profile_id: user.id,
      title,
      description,
      file_url: publicUrlData.publicUrl,
      file_size: file.size,
      is_public: isPublic,
      is_processed: false,
      processing_status: 'pending',
      metadata: {
        original_filename: file.name,
        content_type: file.type,
        storage_path: filePath,
      }
    }
    
    const { data: record, error: recordError } = await supabaseClient
      .from('voice_records')
      .insert([recordData])
      .select()
      .single()
    
    if (recordError) {
      // If record creation fails, try to delete the uploaded file
      await supabaseClient.storage
        .from('records')
        .remove([filePath])
      
      return new Response(
        JSON.stringify({ error: recordError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get N8N webhook URL from environment secrets
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    
    if (n8nWebhookUrl) {
      try {
        // Create a new FormData to send to N8N
        const n8nFormData = new FormData()
        n8nFormData.append('file', file)
        n8nFormData.append('record_id', record.id)
        n8nFormData.append('user_id', user.id)
        n8nFormData.append('title', title)
        n8nFormData.append('file_url', publicUrlData.publicUrl)
        
        if (description) {
          n8nFormData.append('description', description)
        }
        
        // Send the data to N8N webhook
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          body: n8nFormData,
          headers: {
            // Don't set Content-Type header when using FormData, let the browser set it with the correct boundary
          }
        })
        
        if (!n8nResponse.ok) {
          console.error('N8N webhook error:', await n8nResponse.text())
        }
      } catch (n8nError) {
        console.error('Error sending data to N8N webhook:', n8nError)
        // We don't fail the whole operation if N8N webhook fails
      }
    }
    
    return new Response(
      JSON.stringify({
        record,
        file: {
          path: uploadData.path,
          publicUrl: publicUrlData.publicUrl,
          size: file.size,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

// Handle record creation with existing file URL
async function handleRecordCreation(req, supabaseClient, user, corsHeaders) {
  try {
    const { record } = await req.json()
    
    if (!record) {
      return new Response(
        JSON.stringify({ error: 'Voice record data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Validate required fields
    if (!record.title || !record.file_url) {
      return new Response(
        JSON.stringify({ error: 'Title and file_url are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Ensure the profile_id matches the authenticated user's ID
    if (record.profile_id && record.profile_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot create a voice record for another user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // Set the profile_id to the authenticated user's ID if not provided
    const recordToCreate = {
      ...record,
      profile_id: user.id,
      is_processed: record.is_processed || false,
      processing_status: record.processing_status || 'pending',
    }
    
    const { data: newRecord, error } = await supabaseClient
      .from('voice_records')
      .insert([recordToCreate])
      .select()
      .single()
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    return new Response(
      JSON.stringify({ record: newRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}