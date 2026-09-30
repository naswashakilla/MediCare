import type { Metadata } from "next";
import Link from "next/link";
import Notice from "@/components/Notice";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";
import { getPasien, requireRole } from "@/lib/auth";
import { tanggal, waktu } from "@/lib/jadwal";
import { halaman, rentang, type ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";
import { batalkan } from "../actions";

export const metadata: Metadata = { title: "Riwayat Pendaftaran" };

type Row = {
  id_daftar: number;
  tgl_daftar: string;
  tgl_kunjungan: string;
  keluhan: string | null;
  status: string;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null };
};

export default async function RiwayatPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const profile = await requireRole("pasien");
  const pasien = await getPasien(profile.id_user);
  const page = halaman(sp.page);
  const { from, to } = rentang(page);

  let rows: Row[] = [];
  let total = 0;
  if (pasien) {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from("pendaftaran")
      .select("id_daftar, tgl_daftar, tgl_kunjungan, keluhan, status, dokter(nama_dokter, poli(nama_poli))", { count: "exact" })
      .eq("id_pasien", pasien.id_pasien)
      .order("tgl_kunjungan", { ascending: false })
      .order("id_daftar", { ascending: false })
      .range(from, to);
    rows = (data ?? []) as unknown as Row[];
    total = count ?? 0;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Pendaftaran</h1>
        <Link href="/pasien/daftar" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">+ Daftar Berobat</Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Kunjungan</th><th className="px-4 py-3">Dokter / Poli</th>
              <th className="px-4 py-3">Keluhan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Belum ada pendaftaran.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id_daftar} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 text-slate-700">
                  {tanggal(r.tgl_kunjungan)}
                  <span className="block text-xs text-slate-400">daftar {waktu(r.tgl_daftar)}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {r.dokter.nama_dokter}
                  <span className="block text-xs text-slate-400">{r.dokter.poli?.nama_poli}</span>
                </td>
                <td className="max-w-48 px-4 py-3 text-slate-600">{r.keluhan ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  {r.status === "menunggu" && (
                    <form action={batalkan}>
                      <input type="hidden" name="id" value={r.id_daftar} />
                      <button type="submit" className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Batalkan</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/pasien/riwayat" page={page} total={total} />
    </>
  );
}
