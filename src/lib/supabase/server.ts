import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Untuk Server Component, Server Action, dan Route Handler.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component: aman diabaikan karena
          // proxy.ts yang menyegarkan sesi login.
        }
      },
    },
  });
}
