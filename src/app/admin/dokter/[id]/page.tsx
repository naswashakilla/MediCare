import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DokterForm from "@/components/DokterForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ubah Dokter" };

export default async function DokterUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const [dokter, poli] = await Promise.all([
    supabase.from("dokter").select("id_dokter, nama_dokter, spesialis, id_poli, hari_praktik, jam_mulai, jam_selesai").eq("id_dokter", Number(id)).maybeSingle(),
    supabase.from("poli").select("id_poli, nama_poli").order("nama_poli"),
  ]);
  if (!dokter.data) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Ubah Dokter</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><DokterForm daftarPoli={poli.data ?? []} awal={dokter.data} /></div>
    </div>
  );
}
