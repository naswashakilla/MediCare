import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DaftarForm, { type PilihanDokter } from "@/components/DaftarForm";
import { getPasien, requireRole } from "@/lib/auth";
import { hariIniJakarta, jam } from "@/lib/jadwal";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Daftar Berobat" };

type Row = {
  id_dokter: number;
  nama_dokter: string;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  poli: { nama_poli: string } | null;
};

export default async function DaftarPage() {
  const profile = await requireRole("pasien");
  if (!(await getPasien(profile.id_user))) redirect("/pasien/profil?perlu=1");

  const supabase = await createClient();
  const { data } = await supabase
    .from("dokter")
    .select("id_dokter, nama_dokter, hari_praktik, jam_mulai, jam_selesai, poli(nama_poli)")
    .order("nama_dokter");

  const dokter: PilihanDokter[] = ((data ?? []) as unknown as Row[]).map((d) => ({
    id_dokter: d.id_dokter,
    poli: d.poli?.nama_poli ?? "Lainnya",
    label: `${d.nama_dokter}${d.hari_praktik ? ` — ${d.hari_praktik}` : ""}${d.jam_mulai && d.jam_selesai ? ` (${jam(d.jam_mulai)}-${jam(d.jam_selesai)})` : ""}`,
  }));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">Daftar Berobat</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Pilih dokter dan tanggal kunjungan sesuai jadwal praktik.</p>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <DaftarForm dokter={dokter} minTanggal={hariIniJakarta()} />
      </div>
    </div>
  );
}
