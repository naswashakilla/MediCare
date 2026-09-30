import type { Metadata } from "next";
import DokterForm from "@/components/DokterForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tambah Dokter" };

export default async function DokterBaruPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("poli").select("id_poli, nama_poli").order("nama_poli");
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tambah Dokter</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><DokterForm daftarPoli={data ?? []} /></div>
    </div>
  );
}
