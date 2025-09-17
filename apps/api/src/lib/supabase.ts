import { loadServerEnv, requireServerEnv } from "@monte/shared";
import { createClient } from "@supabase/supabase-js";

const env = loadServerEnv();
const supabaseUrl = env.SUPABASE_URL ?? requireServerEnv("SUPABASE_URL");
const serviceRoleKey =
  env.SUPABASE_SERVICE_ROLE ??
  env.SUPABASE_SERVICE_ROLE_KEY ??
  requireServerEnv("SUPABASE_SERVICE_ROLE");

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
