import { z } from "zod";

const tanggalOpsional = z
  .string()
  .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Format tanggal tidak valid")
  .refine((v) => v === "" || v <= new Date().toISOString().slice(0, 10), "Tanggal lahir tidak boleh di masa depan");

export const poliSchema = z.object({
  nama_poli: z.string().trim().min(3, "Nama poli minimal 3 karakter").max(30, "Nama poli maksimal 30 karakter"),
  keterangan: z.string().trim().max(100, "Keterangan maksimal 100 karakter"),
});

const jamOpsional = z.string().regex(/^(\d{2}:\d{2})?$/, "Format jam tidak valid");

export const dokterSchema = z
  .object({
    nama_dokter: z.string().trim().min(3, "Nama dokter minimal 3 karakter").max(50, "Nama dokter maksimal 50 karakter"),
    spesialis: z.string().trim().max(30, "Spesialis maksimal 30 karakter"),
    id_poli: z.coerce.number().int().positive("Pilih poli"),
    hari_praktik: z.string().trim().max(30, "Hari praktik maksimal 30 karakter"),
    jam_mulai: jamOpsional,
    jam_selesai: jamOpsional,
  })
  .refine((d) => !d.jam_mulai || !d.jam_selesai || d.jam_selesai > d.jam_mulai, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["jam_selesai"],
  });

export const pasienSchema = z.object({
  nama_pasien: z.string().trim().min(3, "Nama minimal 3 karakter").max(50, "Nama maksimal 50 karakter"),
  nik: z.string().trim().regex(/^(\d{16})?$/, "NIK harus 16 digit angka"),
  tempatlahir: z.string().trim().max(30, "Tempat lahir maksimal 30 karakter"),
  tgllahir: tanggalOpsional,
  jk: z.enum(["", "Laki-laki", "Perempuan"], { error: "Pilih jenis kelamin" }),
  alamat: z.string().trim().max(100, "Alamat maksimal 100 karakter"),
  no_hp: z.string().trim().regex(/^(\+?\d{8,14})?$/, "Nomor HP tidak valid (8-14 digit)"),
});

export const pendaftaranSchema = z.object({
  id_dokter: z.coerce.number().int().positive("Pilih dokter"),
  tgl_kunjungan: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kunjungan wajib diisi"),
  keluhan: z.string().trim().min(3, "Keluhan minimal 3 karakter").max(200, "Keluhan maksimal 200 karakter"),
});

export const STATUS = ["menunggu", "dikonfirmasi", "selesai", "dibatalkan"] as const;
export type Status = (typeof STATUS)[number];

// Pendaftaran yang diinput/diubah admin (boleh tanggal lampau, mis. pasien datang langsung).
export const pendaftaranAdminSchema = pendaftaranSchema.extend({
  id_pasien: z.coerce.number().int().positive("Pilih pasien"),
  status: z.enum(STATUS, { error: "Pilih status" }),
});
