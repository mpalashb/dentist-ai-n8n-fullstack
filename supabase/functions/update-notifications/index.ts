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

    // Get the notification preferences from the request body
    const { 
      userId, 
      email_notifications, 
      sms_notifications, 
      marketing_emails,
      login_alerts 
    } = await req.json()

    // Validate that at least one notification preference is provided
    if (
      email_notifications === undefined && 
      sms_notifications === undefined && 
      marketing_emails === undefined &&
      login_alerts === undefined
    ) {
      return new Response(
        JSON.stringify({ error: 'At least one notification preference is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use the provided user ID or fall back to the authenticated user's ID
    const targetUserId = userId || user.id

    // Ensure the user can only update their own notification preferences unless they're an admin
    if (targetUserId !== user.id) {
      // Check if the user is an admin
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only update your own notification preferences' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    // Build the update object with only the provided preferences
    const updates: any = { updated_at: new Date().toISOString() }
    
    if (email_notifications !== undefined) updates.email_notifications = email_notifications
    if (sms_notifications !== undefined) updates.sms_notifications = sms_notifications
    if (marketing_emails !== undefined) updates.marketing_emails = marketing_emails
    if (login_alerts !== undefined) updates.login_alerts = login_alerts

    // Update the notification preferences
    const { data: updatedProfile, error } = await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', targetUserId)
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        profile: updatedProfile,
        message: 'Notification preferences updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})