# Supabase Service Role Key Instructions

## What is the Service Role Key?

The Supabase Service Role Key is a special key that bypasses Row Level Security (RLS) policies. It's intended for server-side operations and administrative tasks.

## Why do we need it?

In your application, you're encountering the error:
```
{statusCode: "403", error: "Unauthorized", message: "new row violates row-level security policy"}
```

This happens because the regular Supabase client respects RLS policies, which are designed to restrict what data users can access or modify. For file uploads to storage, we need to use the Service Role Key to bypass these restrictions.

## How to get your Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Under the "Project API keys" section, you'll find the `service_role` key
5. Copy this key

## How to add it to your project

1. Open your `.env` file
2. Replace the placeholder value for `VITE_SUPABASE_SERVICE_ROLE_KEY` with your actual service role key:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key-here"
```

## Security Note

⚠️ **Important**: The Service Role Key should be treated as a secret and should not be exposed to client-side code in a production environment. In a real production application, you would typically:

1. Create a server-side API endpoint that handles file uploads
2. Use the Service Role Key only on the server side
3. Have your client-side code call this API endpoint instead of directly accessing Supabase storage

For this development project, we're using the Service Role Key directly in the client code for simplicity, but this should be refactored for production use.