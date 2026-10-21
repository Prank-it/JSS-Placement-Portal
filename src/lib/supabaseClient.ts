// src/lib/supabaseClient.ts
// Read-only Supabase client — anon key only, no service role, no auth.
import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!rawSupabaseUrl || rawSupabaseUrl.trim() === "") {
  console.error(
    "[supabaseClient] VITE_SUPABASE_URL is missing or empty. " +
      "Add it to your .env file and restart the dev server."
  );
}
if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  console.error(
    "[supabaseClient] VITE_SUPABASE_ANON_KEY is missing or empty. " +
      "Add it to your .env file and restart the dev server."
  );
}

// Ensure only the project root URL is used (e.g. https://xyz.supabase.co)
// Strips accidental /rest/v1 paths or trailing slashes
function sanitizeSupabaseUrl(url?: string): string {
  if (!url || !url.trim()) return "https://placeholder.supabase.co";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, "");
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, "");
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned || "https://placeholder.supabase.co";
}

const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);

// createClient requires non-empty strings — fall back to placeholder so the
// module loads even before the user fills .env (queries will simply fail with
// a network error, not a crash at import time).
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      // Disable all auth features — this is a fully public, read-only portal.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Explicitly request read-only operations only.
        "x-client-info": "jss-placement-portal/phase2",
      },
    },
  }
);
