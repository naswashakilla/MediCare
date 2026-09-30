import type { Metadata } from "next";
import { SelectField } from "@/components/Fields";
import Field from "@/components/Field";
import StatusBadge from "@/components/StatusBadge";
import { tanggal } from "@/lib/jadwal";
import { ambilLaporan, bacaFilter, BATAS_BARIS, queryFilter, ringkas } from "@/lib/laporan";
import { buatUrl } from "@/lib/query";
import { createClient } from "@/lib/supabase/server";
import { STATUS } from "@/lib/validators";

export const metadata: Metadata = { title: "Laporan" };

const PRATINJAU = 50;

export default async function LaporanPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const f = bacaFilter(await searchParams);
  const supabase = await createClient();

  const [{ rows, total, error }, poli] = await Promise.all([
    ambilLaporan(supabase, f),
    supabase.from("poli").select("id_poli, nama_poli").order("nama_poli"),
  ]);
  const r = ringkas(rows);
  const qs = queryFilter(f);

  const tombol = "rounded-lg px-4 py-2 text-sm font-semibold text-white";

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Laporan Pendaftaran</h1>
      <p className="mb-4 mt-1 text-sm text-slate-500">Pilih periode kunjungan, lalu unduh sebagai PDF (untuk dicetak) atau Excel.</p>

      <form method="get" className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <Field label="Dari tanggal" name="dari" type="date" defaultValue={f.dari} />
        <Field label="Sampai tanggal" name="sampai" type="date" defaultValue={f.sampai} />
        <SelectField label="Poli" name="poli" defaultValue={f.poli ? String(f.poli) : ""}>
          <option value="">Semua poli</option>
          {(poli.data ?? []).map((p) => (
            <option key={p.id_poli} value={p.id_poli}>{p.nama_poli}</option>
          ))}
        </SelectField>
        <SelectField label="Status" name="status" defaultValue={f.status ?? ""}>
          <option value="">Semua status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </SelectField>
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Tampilkan</button>
      </form>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Gagal mengambil data laporan.</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a href={buatUrl("/admin/laporan/pdf", qs)} className={`${tombol} bg-red-600 hover:bg-red-700`}>Unduh PDF</a>
        <a href={buatUrl("/admin/laporan/excel", qs)} className={`${tombol} bg-emerald-600 hover:bg-emerald-700`}>Unduh Excel</a>
        <span className="text-sm text-slate-500">{tanggal(f.dari)} s/d {tanggal(f.sampai)}</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{total}</p>
        </div>
        {STATUS.map((s) => (
          <div key={s} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm capitalize text-slate-500">{s}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{r.perStatus[s] ?? 0}</p>
          </div>
        ))}
      </div>
      {total > BATAS_BARIS && (
        <p className="mt-3 text-sm text-amber-700">Data melebihi {BATAS_BARIS} baris; laporan hanya memuat {BATAS_BARIS} baris pertama. Persempit periodenya.</p>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Kunjungan</th><th className="px-4 py-3">Pasien</th><th className="px-4 py-3">Dokter</th>
              <th className="px-4 py-3">Poli</th><th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Tidak ada data pada periode ini.</td></tr>}
            {rows.slice(0, PRATINJAU).map((x) => (
              <tr key={x.id_daftar} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-700">{tanggal(x.tgl_kunjungan)}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{x.pasien.nama_pasien}</td>
                <td className="px-4 py-3 text-slate-600">{x.dokter.nama_dokter}</td>
                <td className="px-4 py-3 text-slate-600">{x.dokter.poli?.nama_poli ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={x.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > PRATINJAU && (
        <p className="mt-3 text-sm text-slate-500">Menampilkan {PRATINJAU} dari {rows.length} baris. Seluruhnya ada di file PDF/Excel.</p>
      )}
    </>
  );
}
