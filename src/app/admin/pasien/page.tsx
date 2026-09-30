import type { Metadata } from "next";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import Notice from "@/components/Notice";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import { tanggal } from "@/lib/jadwal";
import { bersihkanCari, buatUrl, halaman, rentang, type ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Data Pasien" };

type Row = {
  id_pasien: number;
  nama_pasien: string;
  nik: string | null;
  tgllahir: string | null;
  jk: string | null;
  no_hp: string | null;
  id_user: string | null;
};

export default async function PasienAdminPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const q = bersihkanCari(sp.q);
  const page = halaman(sp.page);
  const { from, to } = rentang(page);

  const supabase = await createClient();
  let query = supabase
    .from("pasien")
    .select("id_pasien, nama_pasien, nik, tgllahir, jk, no_hp, id_user", { count: "exact" })
    .order("id_pasien")
    .range(from, to);
  if (q) query = query.or(`nama_pasien.ilike.%${q}%,nik.ilike.%${q}%,no_hp.ilike.%${q}%`);
  const { data, count } = await query;
  const rows = (data ?? []) as Row[];
  const kembali = buatUrl("/admin/pasien", { q, page });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Data Pasien</h1>
        <Link href="/admin/pasien/baru" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">+ Tambah Pasien</Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />
      <SearchBox placeholder="Cari nama / NIK / No. HP" defaultValue={q} />

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th><th className="px-4 py-3">NIK</th><th className="px-4 py-3">Tgl Lahir</th>
              <th className="px-4 py-3">JK</th><th className="px-4 py-3">No. HP</th><th className="px-4 py-3">Akun</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Tidak ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id_pasien} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{r.nama_pasien}</td>
                <td className="px-4 py-3 text-slate-600">{r.nik ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{tanggal(r.tgllahir)}</td>
                <td className="px-4 py-3 text-slate-600">{r.jk ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{r.no_hp ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{r.id_user ? "Ya" : "Tidak"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/pasien/${r.id_pasien}`} className="rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Ubah</Link>
                    <DeleteButton tabel="pasien" id={r.id_pasien} kembali={kembali} pesan={`Hapus ${r.nama_pasien}? Riwayat pendaftarannya ikut terhapus.`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/admin/pasien" page={page} total={count ?? 0} params={{ q }} />
    </>
  );
}
