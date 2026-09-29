"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./types";

const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z
  .object({
    nama: z
      .string()
      .trim()
      .min(3, "Nama minimal 3 karakter")
      .max(50, "Nama maksimal 50 karakter"),
    email: z
      .string()
      .trim()
      .email("Format email tidak valid")
      .max(100, "Email maksimal 100 karakter"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter"),
    konfirmasi: z.string(),
  })
  .refine((d) => d.password === d.konfirmasi, {
    message: "Konfirmasi password tidak sama",
    path: ["konfirmasi"],
  });

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: text(formData, "email"), password: text(formData, "password") };
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues), values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    const belumKonfirmasi = error?.code === "email_not_confirmed";
    return {
      error: belumKonfirmasi
        ? "Email belum dikonfirmasi. Cek kotak masuk emailmu."
        : "Email atau password salah.",
      values,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id_user", data.user.id)
    .single();

  revalidatePath("/", "layout");
  redirect(profile?.role === "admin" ? "/admin/dashboard" : "/pasien/dashboard");
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    nama: text(formData, "nama"),
    email: text(formData, "email"),
    password: text(formData, "password"),
    konfirmasi: text(formData, "konfirmasi"),
  };
  const values = { nama: raw.nama, email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.issues), values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { nama: parsed.data.nama } },
  });

  if (error) {
    const sudahAda = error.code === "user_already_exists";
    return {
      error: sudahAda
        ? "Email sudah terdaftar. Silakan masuk."
        : `Pendaftaran gagal: ${error.message}`,
      values,
    };
  }

  // Jika konfirmasi email dimatikan di Supabase, user langsung login.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/pasien/dashboard");
  }

  return {
    success: "Pendaftaran berhasil. Cek emailmu untuk konfirmasi, lalu masuk.",
    values: {},
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
