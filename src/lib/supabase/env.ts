export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variabel Supabase belum diisi. Salin .env.example menjadi .env.local, isi URL dan key dari dashboard Supabase, lalu jalankan ulang npm run dev."
    );
  }
  return { url, key };
}
