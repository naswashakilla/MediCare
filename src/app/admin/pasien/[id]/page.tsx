import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { simpanPasien } from "@/app/admin/actions";
import PasienForm from "@/components/PasienForm";
import type { Pasien } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ubah Pasien" };

export default async function PasienUbahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("pasien")
    .select("id_pasien, nama_pasien, nik, tempatlahir, tgllahir, jk, alamat, no_hp")
    .eq("id_pasien", Number(id))
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Ubah Pasien</h1>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <PasienForm action={simpanPasien} batalHref="/admin/pasien" awal={data as Pasien} />
      </div>
    </div>
  );
}
