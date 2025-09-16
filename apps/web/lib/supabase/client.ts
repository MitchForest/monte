"use client";

import { createClient } from "@supabase/supabase-js";

// These are safe to expose to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if we're actually using Supabase for client-side operations
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Note: Since you're using better-auth, you might not need this at all
// All auth should go through your Hono API
