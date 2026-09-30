import type { Metadata } from "next";
import { simpanPasien } from "@/app/admin/actions";
import PasienForm from "@/components/PasienForm";

export const metadata: Metadata = { title: "Tambah Pasien" };

export default function PasienBaruPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tambah Pasien</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <PasienForm action={simpanPasien} batalHref="/admin/pasien" />
      </div>
    </div>
  );
}
