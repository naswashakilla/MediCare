"use client";

import Link from "next/link";
import { useActionState } from "react";
import { daftarBerobat } from "@/app/pasien/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";
import { SelectField, TextareaField } from "@/components/Fields";
import SubmitButton from "@/components/SubmitButton";

export type PilihanDokter = { id_dokter: number; label: string; poli: string };

export default function DaftarForm({ dokter, minTanggal }: { dokter: PilihanDokter[]; minTanggal: string }) {
  const [state, action] = useActionState(daftarBerobat, {} as FormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const kelompok = Array.from(new Set(dokter.map((d) => d.poli)));

  return (
    <form action={action} className="space-y-4">
      {state.error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      <SelectField label="Dokter" name="id_dokter" required defaultValue={v.id_dokter ?? ""} error={e.id_dokter}>
        <option value="">-- Pilih dokter --</option>
        {kelompok.map((poli) => (
          <optgroup key={poli} label={poli}>
            {dokter.filter((d) => d.poli === poli).map((d) => (
              <option key={d.id_dokter} value={d.id_dokter}>{d.label}</option>
            ))}
          </optgroup>
        ))}
      </SelectField>
      <Field label="Tanggal kunjungan" name="tgl_kunjungan" type="date" required min={minTanggal} defaultValue={v.tgl_kunjungan} error={e.tgl_kunjungan} />
      <TextareaField label="Keluhan" name="keluhan" required maxLength={200} defaultValue={v.keluhan} error={e.keluhan} />
      <div className="flex gap-2">
        <SubmitButton pendingText="Mengirim...">Daftar</SubmitButton>
        <Link href="/pasien/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</Link>
      </div>
    </form>
  );
}
