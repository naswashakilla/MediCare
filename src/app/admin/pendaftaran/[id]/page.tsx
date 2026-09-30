import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PendaftaranAdminForm from "@/components/PendaftaranAdminForm";
import { createClient } from "@/lib/supabase/server";
import { ambilPilihan } from "../data";

export const metadata: Metadata = { title: "Ubah Pendaftaran" };

export default async function PendaftaranUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("pendaftaran")
    .select("id_daftar, id_pasien, id_dokter, tgl_kunjungan, keluhan, status")
    .eq("id_daftar", Number(id))
    .maybeSingle();
  if (!data) notFound();

  const { pasien, dokter } = await ambilPilihan();
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Ubah Pendaftaran</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <PendaftaranAdminForm pasien={pasien} dokter={dokter} awal={data} />
      </div>
    </div>
  );
}
