"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { denganPesan, orNull, text, toFieldErrors, urlAman } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { STATUS, dokterSchema, pasienSchema, pendaftaranAdminSchema, poliSchema } from "@/lib/validators";
import type { FormState } from "@/app/auth/types";

const rawAll = (fd: FormData, names: string[]) => Object.fromEntries(names.map((n) => [n, text(fd, n)]));

/* ------------------------------ POLI ------------------------------ */
export async function simpanPoli(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const raw = rawAll(formData, ["nama_poli", "keterangan"]);
  const id = text(formData, "id");

  const parsed = poliSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues), values: raw };

  const supabase = await createClient();
  const payload = { nama_poli: parsed.data.nama_poli, keterangan: orNull(parsed.data.keterangan) };
  const { error } = id
    ? await supabase.from("poli").update(payload).eq("id_poli", Number(id))
    : await supabase.from("poli").insert(payload);

  if (error) {
    return {
      error: error.code === "23505" ? "Nama poli sudah dipakai." : `Gagal menyimpan: ${error.message}`,
      values: raw,
    };
  }
  revalidatePath("/admin/poli");
  revalidatePath("/");
  redirect(denganPesan("/admin/poli", "ok", id ? "Poli berhasil diubah." : "Poli berhasil ditambahkan."));
}

/* ----------------------------- DOKTER ----------------------------- */
export async function simpanDokter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const raw = rawAll(formData, ["nama_dokter", "spesialis", "id_poli", "hari_praktik", "jam_mulai", "jam_selesai"]);
  const id = text(formData, "id");

  const parsed = dokterSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues), values: raw };

  const d = parsed.data;
  const payload = {
    nama_dokter: d.nama_dokter,
    spesialis: orNull(d.spesialis),
    id_poli: d.id_poli,
    hari_praktik: orNull(d.hari_praktik),
    jam_mulai: orNull(d.jam_mulai),
    jam_selesai: orNull(d.jam_selesai),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("dokter").update(payload).eq("id_dokter", Number(id))
    : await supabase.from("dokter").insert(payload);

  if (error) return { error: `Gagal menyimpan: ${error.message}`, values: raw };

  revalidatePath("/admin/dokter");
  revalidatePath("/");
  redirect(denganPesan("/admin/dokter", "ok", id ? "Dokter berhasil diubah." : "Dokter berhasil ditambahkan."));
}

/* ----------------------------- PASIEN ----------------------------- */
export async function simpanPasien(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const raw = rawAll(formData, ["nama_pasien", "nik", "tempatlahir", "tgllahir", "jk", "alamat", "no_hp"]);
  const id = text(formData, "id");

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
  const { error } = id
    ? await supabase.from("pasien").update(payload).eq("id_pasien", Number(id))
    : await supabase.from("pasien").insert(payload);

  if (error) {
    return {
      error: error.code === "23505" ? "NIK sudah terdaftar pada pasien lain." : `Gagal menyimpan: ${error.message}`,
      values: raw,
    };
  }
  revalidatePath("/admin/pasien");
  redirect(denganPesan("/admin/pasien", "ok", id ? "Data pasien berhasil diubah." : "Pasien berhasil ditambahkan."));
}

/* --------------------------- PENDAFTARAN --------------------------- */
export async function simpanPendaftaran(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");
  const raw = rawAll(formData, ["id_pasien", "id_dokter", "tgl_kunjungan", "keluhan", "status"]);
  const id = text(formData, "id");

  const parsed = pendaftaranAdminSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.issues), values: raw };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("pendaftaran").update(parsed.data).eq("id_daftar", Number(id))
    : await supabase.from("pendaftaran").insert(parsed.data);

  if (error) return { error: `Gagal menyimpan: ${error.message}`, values: raw };

  revalidatePath("/admin", "layout");
  redirect(denganPesan("/admin/pendaftaran", "ok", id ? "Pendaftaran berhasil diubah." : "Pendaftaran berhasil ditambahkan."));
}

/* ------------------------ HAPUS (semua tabel) ------------------------ */
const TABEL = {
  poli: { kolom: "id_poli", nama: "Poli", terpakai: "Poli masih dipakai oleh dokter. Pindahkan atau hapus dokternya dulu." },
  dokter: { kolom: "id_dokter", nama: "Dokter", terpakai: "Dokter masih punya data pendaftaran, jadi tidak bisa dihapus." },
  pasien: { kolom: "id_pasien", nama: "Pasien", terpakai: "Pasien masih dipakai data lain." },
  pendaftaran: { kolom: "id_daftar", nama: "Pendaftaran", terpakai: "Data masih dipakai data lain." },
} as const;

export async function hapusData(formData: FormData) {
  await requireRole("admin");
  const tabel = text(formData, "tabel") as keyof typeof TABEL;
  const id = Number(text(formData, "id"));
  const kembali = urlAman(text(formData, "kembali"), "/admin/", "/admin/dashboard");

  const cfg = TABEL[tabel];
  if (!cfg || !Number.isInteger(id)) redirect(denganPesan(kembali, "error", "Permintaan tidak valid."));

  const supabase = await createClient();
  const { error, count } = await supabase.from(tabel).delete({ count: "exact" }).eq(cfg.kolom, id);

  if (error) {
    redirect(denganPesan(kembali, "error", error.code === "23503" ? cfg.terpakai : `Gagal menghapus: ${error.message}`));
  }
  if (!count) redirect(denganPesan(kembali, "error", "Data tidak ditemukan."));

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(denganPesan(kembali, "ok", `${cfg.nama} berhasil dihapus.`));
}

/* --------------------- UBAH STATUS PENDAFTARAN --------------------- */
export async function ubahStatus(formData: FormData) {
  await requireRole("admin");
  const id = Number(text(formData, "id"));
  const status = text(formData, "status");
  const kembali = urlAman(text(formData, "kembali"), "/admin/", "/admin/pendaftaran");

  if (!Number.isInteger(id) || !(STATUS as readonly string[]).includes(status)) {
    redirect(denganPesan(kembali, "error", "Permintaan tidak valid."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pendaftaran").update({ status }).eq("id_daftar", id);
  if (error) redirect(denganPesan(kembali, "error", `Gagal mengubah status: ${error.message}`));

  revalidatePath("/admin", "layout");
  redirect(denganPesan(kembali, "ok", `Status diubah menjadi "${status}".`));
}
