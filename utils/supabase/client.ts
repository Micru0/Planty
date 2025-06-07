import { createClient } from "@supabase/supabase-js";
// import { auth } from "@/lib/auth" // Removed server-side auth import
import { Database } from '@/types/database.types'

// Updated function signature and implementation
export function createSupabaseClient(supabaseAccessToken: string) {
  if (!supabaseAccessToken) {
    // It's better to handle this check before calling, but as a safeguard:
    throw new Error("Supabase access token is required to create a client instance.");
  }
  // console.log("Attempting to create Supabase client with token"); // For client-side debugging if needed

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      }
    },
  );
}
