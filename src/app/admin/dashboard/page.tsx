import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const hariIni = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

  const hitung = { count: "exact", head: true } as const;
  const [pasien, dokter, poli, kunjungan, menunggu] = await Promise.all([
    supabase.from("pasien").select("*", hitung),
    supabase.from("dokter").select("*", hitung),
    supabase.from("poli").select("*", hitung),
    supabase.from("pendaftaran").select("*", hitung).eq("tgl_kunjungan", hariIni),
    supabase.from("pendaftaran").select("*", hitung).eq("status", "menunggu"),
  ]);

  const kartu = [
    { label: "Total Pasien", nilai: pasien.count ?? 0 },
    { label: "Total Dokter", nilai: dokter.count ?? 0 },
    { label: "Jumlah Poli", nilai: poli.count ?? 0 },
    { label: "Kunjungan Hari Ini", nilai: kunjungan.count ?? 0 },
    { label: "Menunggu Konfirmasi", nilai: menunggu.count ?? 0 },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
      <p className="mt-1 text-sm text-slate-500">Halo, {profile.nama_user}. Berikut ringkasan data poliklinik.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kartu.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{k.label}</p>
            <p className="mt-2 text-3xl font-bold text-teal-700">{k.nilai}</p>
          </div>
        ))}
      </div>

      <Link href="/admin/pendaftaran?status=menunggu" className="mt-6 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
        Lihat pendaftaran yang menunggu
      </Link>
    </>
  );
}
