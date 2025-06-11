import { createClient } from "@supabase/supabase-js";
// import { auth } from "@/lib/auth" // Removed server-side auth import
import { Database } from '@/types/database.types'

// Updated function signature and implementation
export function createSupabaseClient(supabaseAccessToken?: string | null) {
  const options = supabaseAccessToken
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        },
      }
    : {};

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
}
