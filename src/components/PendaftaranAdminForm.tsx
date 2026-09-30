"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanPendaftaran } from "@/app/admin/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";
import { SelectField, TextareaField } from "@/components/Fields";
import SubmitButton from "@/components/SubmitButton";
import { STATUS } from "@/lib/validators";

type Awal = { id_daftar: number; id_pasien: number; id_dokter: number; tgl_kunjungan: string; keluhan: string | null; status: string };

export default function PendaftaranAdminForm({
  pasien,
  dokter,
  awal,
}: {
  pasien: { id_pasien: number; nama_pasien: string; nik: string | null }[];
  dokter: { id_dokter: number; nama_dokter: string; poli: string }[];
  awal?: Awal;
}) {
  const [state, action] = useActionState(simpanPendaftaran, {} as FormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {awal && <input type="hidden" name="id" value={awal.id_daftar} />}
      <SelectField label="Pasien" name="id_pasien" required defaultValue={v.id_pasien ?? String(awal?.id_pasien ?? "")} error={e.id_pasien}>
        <option value="">-- Pilih pasien --</option>
        {pasien.map((p) => (
          <option key={p.id_pasien} value={p.id_pasien}>{p.nama_pasien}{p.nik ? ` (${p.nik})` : ""}</option>
        ))}
      </SelectField>
      <SelectField label="Dokter" name="id_dokter" required defaultValue={v.id_dokter ?? String(awal?.id_dokter ?? "")} error={e.id_dokter}>
        <option value="">-- Pilih dokter --</option>
        {dokter.map((d) => (
          <option key={d.id_dokter} value={d.id_dokter}>{d.nama_dokter} — {d.poli}</option>
        ))}
      </SelectField>
      <Field label="Tanggal kunjungan" name="tgl_kunjungan" type="date" required defaultValue={v.tgl_kunjungan ?? awal?.tgl_kunjungan} error={e.tgl_kunjungan} />
      <TextareaField label="Keluhan" name="keluhan" required maxLength={200} defaultValue={v.keluhan ?? awal?.keluhan ?? ""} error={e.keluhan} />
      <SelectField label="Status" name="status" required defaultValue={v.status ?? awal?.status ?? "menunggu"} error={e.status}>
        {STATUS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </SelectField>
      <div className="flex gap-2">
        <SubmitButton>Simpan</SubmitButton>
        <Link href="/admin/pendaftaran" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</Link>
      </div>
    </form>
  );
}
