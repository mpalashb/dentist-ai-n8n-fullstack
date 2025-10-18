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
      case 'POST':
        return handleGetRequest(req, supabaseClient, user, corsHeaders)
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
    const status = url.searchParams.get('status')
    const query = url.searchParams.get('query')
    
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

    let dbQuery = supabaseClient.from('voice_records').select('*')

    // If a specific record ID is provided, fetch that record
    if (recordId) {
      dbQuery = dbQuery.eq('id', recordId)
      
      const { data: record, error } = await dbQuery.single()
      
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
      
      dbQuery = dbQuery.eq('profile_id', profileId)
    } else {
      // If no profileId is provided, fetch records for the authenticated user
      dbQuery = dbQuery.eq('profile_id', user.id)
    }
    
    // Filter by public status if specified
    if (isPublic) {
      dbQuery = dbQuery.eq('is_public', true)
    }
    
    // Filter by status if specified
    if (status) {
      dbQuery = dbQuery.eq('processing_status', status)
    }
    
    // Search by title or transcript if query is provided
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,transcript.ilike.%${query}%`)
    }
    
    // Apply pagination
    dbQuery = dbQuery.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
    
    const { data: records, error } = await dbQuery
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get total count for pagination
    let countQuery = supabaseClient
      .from('voice_records')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId || user.id)
    
    // Apply the same filters to the count query
    if (isPublic) {
      countQuery = countQuery.eq('is_public', true)
    }
    
    if (status) {
      countQuery = countQuery.eq('processing_status', status)
    }
    
    if (query) {
      countQuery = countQuery.or(`title.ilike.%${query}%,transcript.ilike.%${query}%`)
    }
    
    const { count, error: countError } = await countQuery
    
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