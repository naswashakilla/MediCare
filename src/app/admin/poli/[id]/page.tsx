import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PoliForm from "@/components/PoliForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ubah Poli" };

export default async function PoliUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("poli").select("id_poli, nama_poli, keterangan").eq("id_poli", Number(id)).maybeSingle();
  if (!data) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Ubah Poli</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><PoliForm awal={data} /></div>
    </div>
  );
}
