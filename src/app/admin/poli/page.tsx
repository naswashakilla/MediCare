import type { Metadata } from "next";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import Notice from "@/components/Notice";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import { bersihkanCari, buatUrl, halaman, rentang, type ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Data Poli" };

type Row = { id_poli: number; nama_poli: string; keterangan: string | null };

export default async function PoliPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const q = bersihkanCari(sp.q);
  const page = halaman(sp.page);
  const { from, to } = rentang(page);

  const supabase = await createClient();
  let query = supabase.from("poli").select("id_poli, nama_poli, keterangan", { count: "exact" }).order("id_poli").range(from, to);
  if (q) query = query.or(`nama_poli.ilike.%${q}%,keterangan.ilike.%${q}%`);
  const { data, count } = await query;
  const rows = (data ?? []) as Row[];
  const kembali = buatUrl("/admin/poli", { q, page });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Data Poli</h1>
        <Link href="/admin/poli/baru" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">+ Tambah Poli</Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />
      <SearchBox placeholder="Cari nama / keterangan poli" defaultValue={q} />

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Nama Poli</th><th className="px-4 py-3">Keterangan</th><th className="px-4 py-3 text-right">Aksi</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Tidak ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id_poli} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{r.id_poli}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.nama_poli}</td>
                <td className="px-4 py-3 text-slate-600">{r.keterangan ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/poli/${r.id_poli}`} className="rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Ubah</Link>
                    <DeleteButton tabel="poli" id={r.id_poli} kembali={kembali} pesan={`Hapus ${r.nama_poli}?`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/admin/poli" page={page} total={count ?? 0} params={{ q }} />
    </>
  );
}
