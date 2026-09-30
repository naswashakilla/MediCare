import type { Metadata } from "next";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import Notice from "@/components/Notice";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import { jam } from "@/lib/jadwal";
import { bersihkanCari, buatUrl, halaman, rentang, type ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Data Dokter" };

type Row = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  poli: { nama_poli: string } | null;
};

export default async function DokterPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const q = bersihkanCari(sp.q);
  const page = halaman(sp.page);
  const { from, to } = rentang(page);

  const supabase = await createClient();
  let query = supabase
    .from("dokter")
    .select("id_dokter, nama_dokter, spesialis, hari_praktik, jam_mulai, jam_selesai, poli(nama_poli)", { count: "exact" })
    .order("id_dokter")
    .range(from, to);
  if (q) query = query.or(`nama_dokter.ilike.%${q}%,spesialis.ilike.%${q}%`);
  const { data, count } = await query;
  const rows = (data ?? []) as unknown as Row[];
  const kembali = buatUrl("/admin/dokter", { q, page });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Data Dokter</h1>
        <Link href="/admin/dokter/baru" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">+ Tambah Dokter</Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />
      <SearchBox placeholder="Cari nama / spesialis dokter" defaultValue={q} />

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th><th className="px-4 py-3">Spesialis</th><th className="px-4 py-3">Poli</th>
              <th className="px-4 py-3">Jadwal</th><th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Tidak ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id_dokter} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{r.nama_dokter}</td>
                <td className="px-4 py-3 text-slate-600">{r.spesialis ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{r.poli?.nama_poli ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.hari_praktik ?? "-"}
                  {r.jam_mulai && r.jam_selesai && <span className="block text-xs text-slate-400">{jam(r.jam_mulai)} - {jam(r.jam_selesai)}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/dokter/${r.id_dokter}`} className="rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Ubah</Link>
                    <DeleteButton tabel="dokter" id={r.id_dokter} kembali={kembali} pesan={`Hapus ${r.nama_dokter}?`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/admin/dokter" page={page} total={count ?? 0} params={{ q }} />
    </>
  );
}
