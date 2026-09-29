import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Untuk Client Component (kode yang berjalan di browser).
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
