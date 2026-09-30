"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPasien, requireRole } from "@/lib/auth";
import { denganPesan, orNull, text, toFieldErrors } from "@/lib/form";
import { dokterPraktik, hariIniJakarta } from "@/lib/jadwal";
import { createClient } from "@/lib/supabase/server";
import { pasienSchema, pendaftaranSchema } from "@/lib/validators";
import type { FormState } from "@/app/auth/types";

const rawAll = (fd: FormData, names: string[]) => Object.fromEntries(names.map((n) => [n, text(fd, n)]));

// Pasien mengisi / mengubah data dirinya sendiri.
export async function simpanProfil(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireRole("pasien");
  const raw = rawAll(formData, ["nama_pasien", "nik", "tempatlahir", "tgllahir", "jk", "alamat", "no_hp"]);

  const parsed = pasienSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues), values: raw };

  const d = parsed.data;
  const payload = {
    nama_pasien: d.nama_pasien,
    nik: orNull(d.nik),
    tempatlahir: orNull(d.tempatlahir),
    tgllahir: orNull(d.tgllahir),
    jk: orNull(d.jk),
    alamat: orNull(d.alamat),
    no_hp: orNull(d.no_hp),
  };

  const supabase = await createClient();
  const sudahAda = await getPasien(profile.id_user);
  // id_user diambil dari sesi login, bukan dari form, jadi tidak bisa dipalsukan.
  const { error } = sudahAda
    ? await supabase.from("pasien").update(payload).eq("id_pasien", sudahAda.id_pasien)
    : await supabase.from("pasien").insert({ ...payload, id_user: profile.id_user });

  if (error) {
    return {
      error: error.code === "23505" ? "NIK sudah terdaftar. Hubungi admin jika ini NIK kamu." : `Gagal menyimpan: ${error.message}`,
      values: raw,
    };
  }
  revalidatePath("/pasien", "layout");
  redirect(denganPesan("/pasien/dashboard", "ok", "Data diri berhasil disimpan."));
}

// Pasien mendaftar berobat.
export async function daftarBerobat(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireRole("pasien");
  const raw = rawAll(formData, ["id_dokter", "tgl_kunjungan", "keluhan"]);

  const parsed = pendaftaranSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues), values: raw };
  const { id_dokter, tgl_kunjungan, keluhan } = parsed.data;

  if (tgl_kunjungan < hariIniJakarta()) {
    return { fieldErrors: { tgl_kunjungan: "Tanggal kunjungan tidak boleh sebelum hari ini" }, values: raw };
  }

  const pasien = await getPasien(profile.id_user);
  if (!pasien) return { error: "Lengkapi data diri dulu sebelum mendaftar berobat.", values: raw };

  const supabase = await createClient();
  const { data: dokter } = await supabase.from("dokter").select("hari_praktik").eq("id_dokter", id_dokter).maybeSingle();
  if (!dokter) return { fieldErrors: { id_dokter: "Dokter tidak ditemukan" }, values: raw };

  if (!dokterPraktik(dokter.hari_praktik, tgl_kunjungan)) {
    return {
      fieldErrors: { tgl_kunjungan: `Dokter ini hanya praktik ${dokter.hari_praktik}. Pilih tanggal lain.` },
      values: raw,
    };
  }

  // Cegah pendaftaran ganda: pasien + dokter + tanggal yang sama.
  const { count } = await supabase
    .from("pendaftaran")
    .select("*", { count: "exact", head: true })
    .eq("id_pasien", pasien.id_pasien)
    .eq("id_dokter", id_dokter)
    .eq("tgl_kunjungan", tgl_kunjungan)
    .neq("status", "dibatalkan");
  if (count) return { error: "Kamu sudah mendaftar ke dokter ini pada tanggal tersebut.", values: raw };

  const { error } = await supabase
    .from("pendaftaran")
    .insert({ id_pasien: pasien.id_pasien, id_dokter, tgl_kunjungan, keluhan, status: "menunggu" });
  if (error) return { error: `Pendaftaran gagal: ${error.message}`, values: raw };

  revalidatePath("/pasien", "layout");
  redirect(denganPesan("/pasien/riwayat", "ok", "Pendaftaran berhasil dikirim. Tunggu konfirmasi dari admin."));
}

// Pasien membatalkan pendaftarannya (lewat fungsi database yang aman).
export async function batalkan(formData: FormData) {
  await requireRole("pasien");
  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id)) redirect(denganPesan("/pasien/riwayat", "error", "Permintaan tidak valid."));

  const supabase = await createClient();
  const { error } = await supabase.rpc("batalkan_pendaftaran", { p_id: id });
  if (error) redirect(denganPesan("/pasien/riwayat", "error", "Pendaftaran tidak bisa dibatalkan (mungkin sudah dikonfirmasi)."));

  revalidatePath("/pasien", "layout");
  redirect(denganPesan("/pasien/riwayat", "ok", "Pendaftaran dibatalkan."));
}
