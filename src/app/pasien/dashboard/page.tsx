import type { Metadata } from "next";
import Link from "next/link";
import Notice from "@/components/Notice";
import StatusBadge from "@/components/StatusBadge";
import { getPasien, requireRole } from "@/lib/auth";
import { hariIniJakarta, tanggal } from "@/lib/jadwal";
import type { ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard Pasien" };

type Akan = {
  id_daftar: number;
  tgl_kunjungan: string;
  status: string;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null };
};

export default async function PasienDashboardPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const profile = await requireRole("pasien");
  const pasien = await getPasien(profile.id_user);

  let akan: Akan[] = [];
  if (pasien) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pendaftaran")
      .select("id_daftar, tgl_kunjungan, status, dokter(nama_dokter, poli(nama_poli))")
      .eq("id_pasien", pasien.id_pasien)
      .in("status", ["menunggu", "dikonfirmasi"])
      .gte("tgl_kunjungan", hariIniJakarta())
      .order("tgl_kunjungan")
      .limit(5);
    akan = (data ?? []) as unknown as Akan[];
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Halo, {profile.nama_user}</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Selamat datang di dashboard pasien.</p>
      <Notice ok={sp.ok} error={sp.error} />

      {!pasien && (
        <div className="mb-6 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <p className="font-semibold text-amber-900">Data diri belum lengkap</p>
          <p className="mt-1 text-sm text-amber-800">Lengkapi data diri agar kamu bisa mendaftar berobat.</p>
          <Link href="/pasien/profil" className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
            Lengkapi Sekarang
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Kunjungan mendatang</h2>
            <Link href="/pasien/daftar" className="text-sm font-medium text-teal-700 hover:underline">+ Daftar</Link>
          </div>
          <ul className="mt-3 space-y-3">
            {akan.length === 0 && <li className="text-sm text-slate-400">Belum ada kunjungan terjadwal.</li>}
            {akan.map((a) => (
              <li key={a.id_daftar} className="flex items-start justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{a.dokter.nama_dokter}</p>
                  <p className="text-slate-500">{a.dokter.poli?.nama_poli} · {tanggal(a.tgl_kunjungan)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-800">Akun kamu</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Nama</dt><dd className="font-medium text-slate-800">{profile.nama_user}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-800">{profile.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">NIK</dt><dd className="font-medium text-slate-800">{pasien?.nik ?? "-"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">No. HP</dt><dd className="font-medium text-slate-800">{pasien?.no_hp ?? "-"}</dd></div>
          </dl>
          <Link href="/pasien/profil" className="mt-4 inline-block text-sm font-medium text-teal-700 hover:underline">Ubah data diri</Link>
        </section>
      </div>
    </>
  );
}
