"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanDokter } from "@/app/admin/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";
import { SelectField } from "@/components/Fields";
import SubmitButton from "@/components/SubmitButton";

type Awal = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  id_poli: number;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
};

export default function DokterForm({
  daftarPoli,
  awal,
}: {
  daftarPoli: { id_poli: number; nama_poli: string }[];
  awal?: Awal;
}) {
  const [state, action] = useActionState(simpanDokter, {} as FormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {awal && <input type="hidden" name="id" value={awal.id_dokter} />}
      <Field label="Nama dokter" name="nama_dokter" required maxLength={50} defaultValue={v.nama_dokter ?? awal?.nama_dokter} error={e.nama_dokter} />
      <Field label="Spesialis" name="spesialis" maxLength={30} defaultValue={v.spesialis ?? awal?.spesialis ?? ""} error={e.spesialis} />
      <SelectField label="Poli" name="id_poli" required defaultValue={v.id_poli ?? String(awal?.id_poli ?? "")} error={e.id_poli}>
        <option value="">-- Pilih poli --</option>
        {daftarPoli.map((p) => (
          <option key={p.id_poli} value={p.id_poli}>{p.nama_poli}</option>
        ))}
      </SelectField>
      <Field label="Hari praktik (contoh: Senin - Jumat)" name="hari_praktik" maxLength={30} defaultValue={v.hari_praktik ?? awal?.hari_praktik ?? ""} error={e.hari_praktik} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Jam mulai" name="jam_mulai" type="time" defaultValue={v.jam_mulai ?? awal?.jam_mulai?.slice(0, 5) ?? ""} error={e.jam_mulai} />
        <Field label="Jam selesai" name="jam_selesai" type="time" defaultValue={v.jam_selesai ?? awal?.jam_selesai?.slice(0, 5) ?? ""} error={e.jam_selesai} />
      </div>
      <div className="flex gap-2">
        <SubmitButton>Simpan</SubmitButton>
        <Link href="/admin/dokter" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</Link>
      </div>
    </form>
  );
}
