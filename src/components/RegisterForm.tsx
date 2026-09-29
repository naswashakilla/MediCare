"use client";

import { useActionState } from "react";
import { register } from "@/app/auth/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div role="status" className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {state.success}
        </div>
      )}
      <Field
        label="Nama lengkap"
        name="nama"
        autoComplete="name"
        required
        defaultValue={state.values?.nama}
        error={state.fieldErrors?.nama}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password (minimal 8 karakter)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
      />
      <Field
        label="Konfirmasi password"
        name="konfirmasi"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.konfirmasi}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Daftar"}
      </button>
    </form>
  );
}
