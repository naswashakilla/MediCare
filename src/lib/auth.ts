import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "pasien";

export type Profile = {
  id_user: string;
  nama_user: string;
  email: string | null;
  role: Role;
};

export function dashboardFor(role: Role) {
  return role === "admin" ? "/admin/dashboard" : "/pasien/dashboard";
}

// Data profil user yang sedang login (null jika belum login).
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id_user, nama_user, email, role")
    .eq("id_user", user.id)
    .single();

  return (data as Profile | null) ?? null;
});

// Pakai di setiap halaman yang khusus untuk satu peran.
export async function requireRole(role: Role) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(dashboardFor(profile.role));
  return profile;
}
