"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import type { FormState } from "@/app/auth/types";
import Field from "@/components/Field";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
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
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
