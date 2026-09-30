"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanPoli } from "@/app/admin/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";
import { TextareaField } from "@/components/Fields";
import SubmitButton from "@/components/SubmitButton";

export default function PoliForm({ awal }: { awal?: { id_poli: number; nama_poli: string; keterangan: string | null } }) {
  const [state, action] = useActionState(simpanPoli, {} as FormState);
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {awal && <input type="hidden" name="id" value={awal.id_poli} />}
      <Field label="Nama poli" name="nama_poli" required maxLength={30} defaultValue={v.nama_poli ?? awal?.nama_poli} error={state.fieldErrors?.nama_poli} />
      <TextareaField label="Keterangan" name="keterangan" maxLength={100} defaultValue={v.keterangan ?? awal?.keterangan ?? ""} error={state.fieldErrors?.keterangan} />
      <div className="flex gap-2">
        <SubmitButton>Simpan</SubmitButton>
        <Link href="/admin/poli" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Batal</Link>
      </div>
    </form>
  );
}
