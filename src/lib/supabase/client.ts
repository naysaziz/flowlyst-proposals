import { createBrowserClient } from "@supabase/ssr";

// Placeholder URL used at build time — replaced by real env vars at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
