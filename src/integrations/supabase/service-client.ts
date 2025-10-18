// Service client for Supabase operations that bypass RLS policies
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env
  .VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a Supabase client with the service role key
// This client bypasses Row Level Security (RLS) policies
export const supabaseService = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
