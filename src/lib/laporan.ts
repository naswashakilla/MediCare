import type { SupabaseClient } from "@supabase/supabase-js";
import { hariIniJakarta } from "@/lib/jadwal";
import { STATUS } from "@/lib/validators";

export const BATAS_BARIS = 5000;

export type FilterLaporan = { dari: string; sampai: string; poli?: number; status?: string };

export type BarisLaporan = {
  id_daftar: number;
  tgl_kunjungan: string;
  tgl_daftar: string;
  keluhan: string | null;
  status: string;
  pasien: { nama_pasien: string; nik: string | null };
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null };
};

const TGL = /^\d{4}-\d{2}-\d{2}$/;

// Baca filter dari query string; default = 1 bulan berjalan sampai hari ini.
export function bacaFilter(sp: Record<string, string | undefined>): FilterLaporan {
  const hariIni = hariIniJakarta();
  let dari = TGL.test(sp.dari ?? "") ? sp.dari! : hariIni.slice(0, 8) + "01";
  let sampai = TGL.test(sp.sampai ?? "") ? sp.sampai! : hariIni;
  if (dari > sampai) [dari, sampai] = [sampai, dari];
  const poli = /^\d+$/.test(sp.poli ?? "") ? Number(sp.poli) : undefined;
  const status = (STATUS as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  return { dari, sampai, poli, status };
}

export async function ambilLaporan(supabase: SupabaseClient, f: FilterLaporan, batas = BATAS_BARIS) {
  let query = supabase
    .from("pendaftaran")
    .select(
      "id_daftar, tgl_kunjungan, tgl_daftar, keluhan, status, pasien!inner(nama_pasien, nik), dokter!inner(nama_dokter, id_poli, poli(nama_poli))",
      { count: "exact" }
    )
    .gte("tgl_kunjungan", f.dari)
    .lte("tgl_kunjungan", f.sampai)
    .order("tgl_kunjungan")
    .order("id_daftar")
    .limit(batas);
  if (f.poli) query = query.eq("dokter.id_poli", f.poli);
  if (f.status) query = query.eq("status", f.status);

  const { data, count, error } = await query;
  return { rows: (data ?? []) as unknown as BarisLaporan[], total: count ?? 0, error };
}

export function ringkas(rows: BarisLaporan[]) {
  const perStatus: Record<string, number> = Object.fromEntries(STATUS.map((s) => [s, 0]));
  const perPoli: Record<string, number> = {};
  for (const r of rows) {
    perStatus[r.status] = (perStatus[r.status] ?? 0) + 1;
    const p = r.dokter.poli?.nama_poli ?? "-";
    perPoli[p] = (perPoli[p] ?? 0) + 1;
  }
  return { total: rows.length, perStatus, perPoli };
}

export function queryFilter(f: FilterLaporan) {
  return { dari: f.dari, sampai: f.sampai, poli: f.poli ? String(f.poli) : undefined, status: f.status };
}

export async function namaPoli(supabase: SupabaseClient, id?: number) {
  if (!id) return "Semua poli";
  const { data } = await supabase.from("poli").select("nama_poli").eq("id_poli", id).maybeSingle();
  return data?.nama_poli ?? "Semua poli";
}
