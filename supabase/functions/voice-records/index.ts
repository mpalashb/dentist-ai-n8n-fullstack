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
      case 'GET':
        return handleGetRequest(req, supabaseClient, user, corsHeaders)
      case 'POST':
        return handlePostRequest(req, supabaseClient, user, corsHeaders)
      case 'PUT':
        return handlePutRequest(req, supabaseClient, user, corsHeaders)
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

// Handle GET request - Retrieve voice records
async function handleGetRequest(req, supabaseClient, user, corsHeaders) {
  try {
    const url = new URL(req.url)
    const recordId = url.searchParams.get('id')
    const profileId = url.searchParams.get('profileId')
    let limit = parseInt(url.searchParams.get('limit') || '10')
    let offset = parseInt(url.searchParams.get('offset') || '0')
    const isPublic = url.searchParams.get('public') === 'true'
    
    // If this is a GET request with a body (for limit and offset parameters)
    if (req.method === 'GET' && req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json()
        if (body.limit) limit = parseInt(body.limit)
        if (body.offset) offset = parseInt(body.offset)
      } catch (e) {
        // If body parsing fails, use the query parameters
        console.log('Could not parse request body, using query parameters')
      }
    }

    let query = supabaseClient.from('voice_records').select('*')

    // If a specific record ID is provided, fetch that record
    if (recordId) {
      query = query.eq('id', recordId)
      
      const { data: record, error } = await query.single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Voice record not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Check if user has permission to view this record
      if (record.profile_id !== user.id && !record.is_public) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only access your own records or public records' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
      
      return new Response(
        JSON.stringify({ record }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // If profileId is provided, fetch records for that profile
    if (profileId) {
      // Check if user has permission to view this profile's records
      if (profileId !== user.id) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          
        if (profileError || !profile || profile.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You can only access your own records' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }
      }
      
      query = query.eq('profile_id', profileId)
    } else {
      // If no profileId is provided, fetch records for the authenticated user
      query = query.eq('profile_id', user.id)
    }
    
    // Filter by public status if specified
    if (isPublic) {
      query = query.eq('is_public', true)
    }
    
    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
    
    const { data: records, error } = await query
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get total count for pagination
    const { count, error: countError } = await supabaseClient
      .from('voice_records')
      .select('*', { count: 'exact', head: true })
      .eq(profileId ? 'profile_id' : 'profile_id', profileId || user.id)
      .eq(isPublic ? 'is_public' : 'is_public', isPublic ? true : undefined)
    
    if (countError) {
      return new Response(
        JSON.stringify({ error: countError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        records, 
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: offset + limit < count
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

// Handle POST request - Create a new voice record
async function handlePostRequest(req, supabaseClient, user, corsHeaders) {
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

// Handle PUT request - Update an existing voice record
async function handlePutRequest(req, supabaseClient, user, corsHeaders) {
  try {
    const { id, updates } = await req.json()
    
    if (!id || !updates) {
      return new Response(
        JSON.stringify({ error: 'Record ID and updates are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // First, check if the record exists and if the user has permission to update it
    const { data: existingRecord, error: fetchError } = await supabaseClient
      .from('voice_records')
      .select('profile_id')
      .eq('id', id)
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
    
    // Check if user has permission to update this record
    if (existingRecord.profile_id !== user.id) {
      // Check if user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only update your own records' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }
    
    // Update the record
    const { data: updatedRecord, error } = await supabaseClient
      .from('voice_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    return new Response(
      JSON.stringify({ record: updatedRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

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
      .select('profile_id')
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
    
    // Delete the record
    const { error } = await supabaseClient
      .from('voice_records')
      .delete()
      .eq('id', recordId)
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
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