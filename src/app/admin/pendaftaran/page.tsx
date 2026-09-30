import type { Metadata } from "next";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { SelectField } from "@/components/Fields";
import Notice from "@/components/Notice";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import StatusBadge from "@/components/StatusBadge";
import { tanggal, waktu } from "@/lib/jadwal";
import { bersihkanCari, buatUrl, halaman, rentang, type ListParams } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";
import { STATUS } from "@/lib/validators";
import { ubahStatus } from "../actions";

export const metadata: Metadata = { title: "Data Pendaftaran" };

type Row = {
  id_daftar: number;
  tgl_daftar: string;
  tgl_kunjungan: string;
  keluhan: string | null;
  status: string;
  pasien: { nama_pasien: string };
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null };
};

// Tombol perubahan status yang masuk akal dari status sekarang.
const LANGKAH: Record<string, { status: string; label: string; gaya: string }[]> = {
  menunggu: [
    { status: "dikonfirmasi", label: "Konfirmasi", gaya: "text-sky-700 hover:bg-sky-50" },
    { status: "dibatalkan", label: "Batalkan", gaya: "text-red-600 hover:bg-red-50" },
  ],
  dikonfirmasi: [
    { status: "selesai", label: "Selesai", gaya: "text-emerald-700 hover:bg-emerald-50" },
    { status: "dibatalkan", label: "Batalkan", gaya: "text-red-600 hover:bg-red-50" },
  ],
};

export default async function PendaftaranAdminPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams;
  const q = bersihkanCari(sp.q);
  const status = (STATUS as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  const page = halaman(sp.page);
  const { from, to } = rentang(page);

  const supabase = await createClient();
  let query = supabase
    .from("pendaftaran")
    .select(
      "id_daftar, tgl_daftar, tgl_kunjungan, keluhan, status, pasien!inner(nama_pasien), dokter!inner(nama_dokter, poli(nama_poli))",
      { count: "exact" }
    )
    .order("tgl_kunjungan", { ascending: false })
    .order("id_daftar", { ascending: false })
    .range(from, to);
  if (q) query = query.ilike("pasien.nama_pasien", `%${q}%`);
  if (status) query = query.eq("status", status);
  const { data, count } = await query;
  const rows = (data ?? []) as unknown as Row[];
  const kembali = buatUrl("/admin/pendaftaran", { q, status, page });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Data Pendaftaran</h1>
        <Link href="/admin/pendaftaran/baru" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">+ Tambah Pendaftaran</Link>
      </div>
      <Notice ok={sp.ok} error={sp.error} />
      <SearchBox placeholder="Cari nama pasien" defaultValue={q}>
        <div className="w-full sm:w-44">
          <SelectField label="" name="status" defaultValue={status ?? ""} aria-label="Filter status">
            <option value="">Semua status</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
        </div>
      </SearchBox>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Kunjungan</th><th className="px-4 py-3">Pasien</th><th className="px-4 py-3">Dokter / Poli</th>
              <th className="px-4 py-3">Keluhan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Tidak ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id_daftar} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 text-slate-700">
                  {tanggal(r.tgl_kunjungan)}
                  <span className="block text-xs text-slate-400">daftar {waktu(r.tgl_daftar)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.pasien.nama_pasien}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.dokter.nama_dokter}
                  <span className="block text-xs text-slate-400">{r.dokter.poli?.nama_poli}</span>
                </td>
                <td className="max-w-48 px-4 py-3 text-slate-600">{r.keluhan ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    {(LANGKAH[r.status] ?? []).map((l) => (
                      <form key={l.status} action={ubahStatus}>
                        <input type="hidden" name="id" value={r.id_daftar} />
                        <input type="hidden" name="status" value={l.status} />
                        <input type="hidden" name="kembali" value={kembali} />
                        <button type="submit" className={`rounded-md px-2 py-1 text-xs font-medium ${l.gaya}`}>{l.label}</button>
                      </form>
                    ))}
                    <Link href={`/admin/pendaftaran/${r.id_daftar}`} className="rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50">Ubah</Link>
                    <DeleteButton tabel="pendaftaran" id={r.id_daftar} kembali={kembali} pesan="Hapus data pendaftaran ini?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination basePath="/admin/pendaftaran" page={page} total={count ?? 0} params={{ q, status }} />
    </>
  );
}
