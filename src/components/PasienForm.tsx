"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";
import { SelectField } from "@/components/Fields";
import SubmitButton from "@/components/SubmitButton";
import type { Pasien } from "@/lib/auth";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export default function PasienForm({
  action,
  batalHref,
  awal,
}: {
  action: Action;
  batalHref: string;
  awal?: Pasien | null;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {awal && awal.id_pasien > 0 && <input type="hidden" name="id" value={awal.id_pasien} />}
      <Field label="Nama lengkap" name="nama_pasien" required maxLength={50} defaultValue={v.nama_pasien ?? awal?.nama_pasien} error={e.nama_pasien} />
      <Field label="NIK (16 digit)" name="nik" inputMode="numeric" maxLength={16} defaultValue={v.nik ?? awal?.nik ?? ""} error={e.nik} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tempat lahir" name="tempatlahir" maxLength={30} defaultValue={v.tempatlahir ?? awal?.tempatlahir ?? ""} error={e.tempatlahir} />
        <Field label="Tanggal lahir" name="tgllahir" type="date" defaultValue={v.tgllahir ?? awal?.tgllahir ?? ""} error={e.tgllahir} />
      </div>
      <SelectField label="Jenis kelamin" name="jk" defaultValue={v.jk ?? awal?.jk ?? ""} error={e.jk}>
        <option value="">-- Pilih --</option>
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
      </SelectField>
      <Field label="Alamat" name="alamat" maxLength={100} defaultValue={v.alamat ?? awal?.alamat ?? ""} error={e.alamat} />
      <Field label="No. HP" name="no_hp" type="tel" maxLength={15} defaultValue={v.no_hp ?? awal?.no_hp ?? ""} error={e.no_hp} />
      <div className="flex gap-2">
        <SubmitButton>Simpan</SubmitButton>
        <Link href={batalHref} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</Link>
      </div>
    </form>
  );
}
