import type { Metadata } from "next";
import PoliForm from "@/components/PoliForm";

export const metadata: Metadata = { title: "Tambah Poli" };

export default function PoliBaruPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tambah Poli</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><PoliForm /></div>
    </div>
  );
}
